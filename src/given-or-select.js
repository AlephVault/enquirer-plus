const enquirer = require("enquirer");
const {checkNotInteractive} = require("./common");

/**
 * This select is an extension that takes an optional
 * given value and validates it among the options. If
 * it is present among them, then the interaction is
 * not run and the given value is taken directly.
 */
class GivenOrSelect extends enquirer.Select {
    /**
     * Takes and validates the given value, and also the
     * nonInteractive flag to be used to raise errors when
     * the run() method becomes interactive.
     * @param given The given value (to use, if valid).
     * @param onInvalidGiven What to do when the given value
     * is invalid, prior to launching the interaction.
     * @param nonInteractive Whether to raise an error when
     * becoming interactive.
     * @param options More options.
     */
    constructor({given, nonInteractive, onInvalidGiven, ...options}) {
        super(options);
        this._given = (given !== undefined && given !== null) ? given.toString() : given;
        this._nonInteractive = nonInteractive;
        this._choices = options.choices;
        this._onInvalidGiven = onInvalidGiven || ((v) => `Invalid input: ${v}`);
    }

    /**
     * Properly converts an option after selection.
     * @param v The option to convert.
     * @returns {Promise<*>} The converted value (async function).
     * @protected
     */
    async _convertOption(v) {
        return v;
    }

    /**
     * Performs a select execution in 3 steps:
     * 1. If the given value was kept (i.e. valid among the options)
     *    then return it directly.
     * 2. If nonInteractive is set, then raise an error since the
     *    interactive mode was explicitly disabled.
     * 3. Perform the usual Select logic.
     * @returns {Promise<*>} The chosen option (async function).
     */
    async run() {
        if (this._given !== undefined && this._choices.every((o) => {
            return this._given !== o && this._given !== o.name;
        })) {
            if (this._onInvalidGiven) {
                await this._onInvalidGiven(this._given);
            }
            this._given = undefined;
        }

        if (this._given !== undefined) {
            return this._convertOption(this._given);
        }
        checkNotInteractive(!!this._nonInteractive);
        return await this._convertOption(await super.run());
    }
}

module.exports = GivenOrSelect;