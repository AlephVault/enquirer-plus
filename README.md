# enquirer-plus
Extensions over the enquirer library with some extended "maybe-interactive" prompts and new interaction types as well.

# Installation
Run this command to install it from NPM:

```shell
npm install enquirer-plus@^1.0.6
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

1. The `validate` will be given. It will parse only _zero/positive_ numbers according to some configurations:
   1. If `integerOnly` option is set, only integer numbers will be allowed.
   2. If `allowHex` option is set, hexadecimal numbers will be alternatively accepted (as integers).

This input is intended for numbers (not for hexadecimal-only inputs, for example) in particular.