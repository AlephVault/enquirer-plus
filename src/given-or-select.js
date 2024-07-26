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
        this._onInvalidGiven = onInvalidGiven || ((v) => `Invalid input: ${v}`);
    }

    async run() {
        if (this._given !== undefined && this.choices.every((o) => {
            return this._given !== o && this._given !== o.name;
        })) {
            if (this._onInvalidGiven) {
                await this._onInvalidGiven(this._given);
            }
            this._given = undefined;
        }

        if (this._given !== undefined) {
            this.value = this._given;
            this.index = this.choices.findIndex((o) => {
                return this._given === o || this._given === o.name;
            });
            await this.submit();
            return this.value;
        }
        checkNotInteractive(!!this._nonInteractive);
        return await super.run();
    }
}

module.exports = GivenOrSelect;