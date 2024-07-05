const {Prompt, Input} = require("enquirer");
const {checkNotInteractive} = require("./common");

/**
 * An input that takes a given value and/or asks and
 * validates the input until a valid value is given.
 */
class GivenOrValidInput extends Prompt {
    constructor(options) {
        super(options);
        this._forwardOptions = options;
        const validate = options.validate; // An async function (v:string) => Promise<boolean>, or a regex
        this._onInvalidGiven = options.onInvalidGiven; // An async function (v:string) => Promise<void>.
        this._validate = validate instanceof RegExp ? (v) => validate.test(v) : validate;
        this._makeInvalidInputMessage = options.makeInvalidInputMessage || ((v) => `Invalid input: ${v}`);
        this._given = options.given;
        this._nonInteractive = options.nonInteractive;
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
        if (!(await this._validate(this._given))) {
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
            const value = await new Input(this._forwardOptions).run();
            if (await this._validate(value)) {
                return value;
            }
            console.error(this._makeInvalidInputMessage(value));
        }
    }
}

module.exports = GivenOrValidInput;