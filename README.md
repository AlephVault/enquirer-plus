# enquirer-plus
Extensions over the enquirer library with some extended "maybe-interactive" prompts and new interaction types as well.

# Installation
Run this command to install it from NPM:

```shell
npm install enquirer-plus@^1.2.2
```

# Usage
Import it like this:

```javascript
const Enquirer = require("enquirer-plus");
```

And use it right like Enquirer is used:

```javascript
let result = await Enquirer.prompt([
    {"type": "plus:press-any-key", "name": "anykey1", "message": "Press any key to start..."},
    {"type": "plus:given-or-valid-input", "name": "foo", "message": "Give an hexadecimal number", "makeInvalidInputMessage": (v) => `Invalid hex number: ${v}`, "validate": /^0x[a-fA-F0-9]+$/},
    {"type": "plus:given-or-select", "message": "Pick an option", "choices": ["A", "B", "C"]}
]);
```

But also the prompts are available as classes:

```javascript
const pakPrompt = new Enquirer.PressAnyKey({
    message: "Press any key to continue..."
});
console.log(await pakPrompt.run());
const gsPrompt = new Enquirer.GivenOrSelect({
    given: "foo",
    nonInteractive: false,
    onInvalidGiven: (v) => console.error(`Invalid input: ${v}`),
    // ... regular Select prompt options here ...
});
console.log(await gsPrompt.run());
const gviPrompt = new Enquirer.GivenOrValidInput({
    given: 1,
    validate: (v) => /^\d+$/.test(v) && parseInt(v) % 2 === 0, // This sample validates odd numbers
    nonInteractive: False,
    makeInvalidInputMessage: (v) => `Invalid number: ${v}`,
    onInvalidGiven: (v) => console.error(`Invalid input: ${v}`),
    // ... regular Input prompt options here ...
});
console.log(await gviPrompt.run());
```

Considering the explanation here:

## PressAnyKey
Registered as `plus:press-any-key`, it renders a message and waits for a key to be pressed. No further
interaction will be executed.

## GivenOrSelect
Registered as `plus:given-or-select`, it allows users to perform the following flow with the options:

1. If `given` is set, then it'll be validated against the given Select options.
   1. If it is among them, then it returns directly and does not render the select prompt.
   2. Otherwise, if `onInvalidGiven` is set, then it executes it and continues to the next step.
      1. It can be an `async` (promise-returning) function. 
2. If `nonInteractive` is set and true-like, then an error is raised telling that the action became interactive.
3. Finally, executes the regular `Select` prompt.
   1. The options that are passed come from the same `options` object given to this prompt, so use the same options
      you use for `Select`.

## GivenOrValidInput
Registered as `plus:given-or-valid-input`, it allows users to perform the following flow with the options:

1. `validate` must be set as a `(v:string) => boolean` function that tells whether the input is valid, or a regular
   expression for the same purpose.
   1. It can be an `async` (promise-returning) function.
2. `given` is optional. If a value is defined there, then it will be checked against the `validate` criterion. If
   it passes the validation, then the same given value is returned with no further interaction. Otherwise, if the
   `onInvalidGiven` key is sey, then it will be expected as a function and invoked and the execution will continue.
   1. `onInvalidGiven` can be an `async` (promise-returning) function.
3. If `nonInteractive` is set and true-like, then an error is raised telling that the action became interactive.
4. Finally, executes the regular `Input` prompt in a loop until the input value passes the `validate` criterion.
   1. The options that are passed come from the same `options` object given to this prompt, so use the same options
      you use for `Input`.

## GivenOrValidNumberInput
Registered as `plus:given-or-valid-number-input`, it allows users to perform an input flow considering all the
same things in the previous section, but:

1. The `validate` will be given. It will parse any number according to some configurations:
   1. If `integerOnly` option is set, only integer numbers will be allowed.
   2. If `allowHex` option is set, hexadescimal numbers will be alternatively accepted (as integers).
2. The `convert` argument can state `"string"`, `"number"` or `"bigint"` constant, or a custom function
   (which takes the string and converts it). This is a **mandatory** setting to determine the type
   of the output.
3. If `convert` is **not** `"string"`, then `min` and/or `max` can be specified to validate the range
   of the input number. They're also properly converted using the same convert criterion that is used
   to convert the value, and then properly compared to validate the number.

This input is intended for numbers (not for hexadecimal-only inputs, for example) in particular.

## GivenOrBooleanSelect
Registered as `plus:given-or-boolean-select`, it allows users to ask a yes/no questions.

1. The `yes` and `no` options are configurable labels.
2. The result is a boolean telling whether the first option (yes) was picked.

## GivenOrArrayPrompt
Registered as `plus:given-or-array`, it allows users to ask for an array of elements (typically, of the same type).
An `applier` must be specified, which tells how to ask for each element.

For example, to ask for an array of Foo/Bar/Baz elements (**any** prompt will do it), you'd use:

```javascript
const Enquirer = require(".");

/**
 * The applier can be asynchronous, and the index is
 * typically given for message purposes only (it also
 * reflects the amount of elements already processed).
 * @param index The current index.
 * @param given The given value for the item at the
 * current index.
 * @param nonInteractive Whether to force non-interactive
 * (raising an error if the action becomes interactive).
 * This flag should be passed directly to the options
 * in all the prompts that allow it.
 * @returns {Promise<*>} A value of the expected type
 * (async function).
 */
async function someApplier(index, given, nonInteractive) {
	return await new Enquirer.GivenOrSelect({
		given, nonInteractive,
		choices: ["Foo", "Bar", "Baz"],
		message: `Element ${index}`
	}).run();
}

class GivenOrSampleArrayPrompt extends Enquirer.GivenOrArrayPrompt {
    constructor(options) {
        super({applier: someApplier, ...options});
    }
}

// Ask for an arbitrary amount of values, where the
// user will need to confirm each time.
// `given` can be specified (as an array of valid
// items) to skip the input when already provided.
console.log(await new GivenOrSampleArrayPrompt({
	message: "Fill this array ('till you stop)"
}).run());

// Ask for a fixed amount of values.
// `given` can be specified (as an array of valid
// items) to skip the prompts when already provided.
console.log(await new GivenOrSampleArrayPrompt({
 	message: "Fill this array (3 elements)", length: 3
}).run());

// Ask non-interactively for an amount of users.
// `given` must be specified, and be an array of valid
// items to avoid the prompts or an error will occur.
console.log(await new GivenOrSampleArrayPrompt({
	message: "Fill this array (non-interactive)", nonInteractive: true,
	given: ["Foo", "Bar", "Baz", "Foo"]
}).run());
```

Alternatively, you can define a subclass from `GivenOrBaseArrayPrompt`, implementing the `_apply`
method directly (and having access to `._nonInteractive`):

```javascript
class GivenOrSampleArrayPrompt extends Enquirer.GivenOrBaseArrayPrompt {
    constructor(options) {
        super(options);
    }
    
    _apply(index, given) {
        return someApplier(index, given, this._nonInteractive);
    }
}
```

You should register your input using `new Enquirer().register(someKey, GivenOrSampleArrayPrompt)`.

Alternatively, you can use `Enquirer.prompt()` directly:

```javascript
// E.g. for first case:
console.log(await Enquirer.prompt([{
    type: "plus:given-or-array", message: "Fill this array ('till you stop)",
    applier: someApplier, name: "foo"
}]));
// use {someKey} instead of "plus:given-or-array" to use your custom class.
```

## GivenOrTuplePrompt
Registered as `plus:given-or-tuple`, it allows users to ask for a compound type (it will be returned as an array).
An `applier` must be specified, which tells how to ask for each member.

For example, to ask for a (string, uint, bool) triple, you'd use:

```javascript
const Enquirer = require(".");

/**
 * The appliers can be asynchronous, and the index is
 * typically given for message purposes only (it also
 * reflects the amount of elements already processed).
 * 
 * Ensure you make use of `nonInteractive` or at least
 * `given` (the index is optional) on each applier.
 * 
 * Each applier will be:
 * @param index The current index.
 * @param given The given value for the item at the
 * current index.
 * @param nonInteractive Whether to force non-interactive
 * (raising an error if the action becomes interactive).
 * This flag should be passed directly to the options
 * in all the prompts that allow it.
 * @returns {Promise<*>} A value of the expected type
 * (async function).
 */

// This is an array of appliers.
const APPLIERS = [
   (index, given, nonInteractive) => given === undefined ? new Enquirer.Input({
      given, nonInteractive,
      message: `Element ${index} / foo`
   }).run() : given,
   (index, given, nonInteractive) => new Enquirer.GivenOrValidNumberInput({
      given, integerOnly: true, allowHex: true, convert: "bigint",
      nonInteractive, message: `Element ${index} / bar`
   }).run(),
   (index, given, nonInteractive) => new Enquirer.GivenOrBooleanSelect({
      given, yes: "Yes", no: "No", nonInteractive,
      message: `Element ${index} / baz`
   }).run()
];

class GivenOrSampleTuplePrompt extends Enquirer.GivenOrTuplePrompt {
   constructor(options) {
      super({appliers: APPLIERS, ...options});
   }
}

// Ask for the tuple data.
console.log(await new GivenOrSampleTuplePrompt({
   message: "Fill this tuple"
}).run());

// Ask non-interactively for the tuple data.
// `given` must be specified, and be a tuple of valid
// items to avoid the prompts or an error will occur.
console.log(await new GivenOrSampleTuplePrompt({
   message: "Fill this tuple (non-interactive)", nonInteractive: true,
   given: ["Foo", "123", "true"]
}).run());
```

Alternatively, you can define a subclass from `GivenOrBaseTuplePrompt`, implementing the `_apply`
method directly (and having access to `._nonInteractive`):

```javascript
class GivenOrSampleTuplePrompt extends Enquirer.GivenOrBaseTuplePrompt {
    constructor(options) {
        super(options);
    }
    
    async _apply(index, given) {
        const nonInteractive = this._nonInteractive;
        switch(index) {
           case 0:
               return given === undefined ? await new Enquirer.Input({
                  given, nonInteractive,
                  message: `Element ${index} / foo`
               }).run() : given;
           case 1:
               return new Enquirer.GivenOrValidNumberInput({
                   given, integerOnly: true, allowHex: true, convert: "bigint",
                   nonInteractive, message: `Element ${index} / bar`
               }).run();
           default: // 2
               return new Enquirer.GivenOrBooleanSelect({
                   given, yes: "Yes", no: "No", nonInteractive,
                   message: `Element ${index} / baz`
               }).run();
        }
    }
}
```

You should register your input using `new Enquirer().register(someKey, GivenOrSampleTuplePrompt)`.

Alternatively, you can use `Enquirer.prompt()` directly:

```javascript
// E.g. for first case:
console.log(await Enquirer.prompt([{
    type: "plus:given-or-tuple", message: "Fill this tuple",
    appliers: APPLIERS
}]));
// use {someKey} instead of "plus:given-or-tuple" to use your custom class.
```
