const {Prompt, Input} = require("enquirer");
const {checkNotInteractive} = require("./common");

/**
 * An input that takes a given value and/or asks and
 * validates the input until a valid value is given.
 * It takes an optional given value and a validation
 * criterion. If the given value is valid, it is then
 * returned. Otherwise, the input will run.
 */
class GivenOrValidInput extends Input {
    /**
     *
     * @param validate The validation criterion.
     * @param given The given value.
     * @param onInvalidGiven What to do when the given
     * value is invalid, prior to launching the interaction.
     * @param makeInvalidInputMessage A rendering for the
     * invalid value.
     * @param nonInteractive Whether to raise an error when
     * becoming interactive.
     * @param options More options.
     */
    constructor({validate, onInvalidGiven, makeInvalidInputMessage, given, nonInteractive, ...options}) {
        super(options);
        this._onInvalidGiven = onInvalidGiven; // An async function (v:string) => Promise<void>.
        this._validate = validate instanceof RegExp ? (v) => validate.test(v) : validate;
        this._makeInvalidInputMessage = makeInvalidInputMessage || ((v) => `Invalid input: ${v}`);
        this._given = given.toString();
        this._nonInteractive = nonInteractive;
    }

    /**
     * Performs an input execution in 3 steps:
     * 1. If the given value was kept (i.e. valid among the options)
     *    then return it directly.
     * 2. If nonInteractive is set, then raise an error since the
     *    interactive mode was explicitly disabled.
     * 3. Perform the usual Select logic.
     * @returns {Promise<*>} The chosen option (async function).
     */
    async run() {
        if (this._given !== undefined && !(await this._validate(this._given))) {
            if (this._onInvalidGiven) {
                await this._onInvalidGiven(this._given);
            }
            this._given = undefined;
        }

        if (this._given !== undefined) {
            return this._given;
        }
        checkNotInteractive(!!this._nonInteractive);
        while(true) {
            const value = await super.run();
            if (await this._validate(value)) {
                return value;
            }
            console.error(this._makeInvalidInputMessage(value));
        }
    }
}

module.exports = GivenOrValidInput;