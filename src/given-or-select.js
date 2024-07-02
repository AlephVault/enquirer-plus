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
     * @param options The options. The new ones are:
     *   given, onInvalidGiven, nonInteractive.
     */
    constructor(options) {
        const given = options.given;
        const nonInteractive = options.nonInteractive;
        super(options);
        this._given = given;
        this._nonInteractive = nonInteractive;
        if (options.choices.every((o) => {
            return given !== o && given !== o.name;
        })) {
            if (options.onInvalidGiven) {
                options.onInvalidGiven(given);
            }
            this._given = undefined;
        }
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
        if (this._given !== undefined) {
            return this._given;
        }
        checkNotInteractive(!!this._nonInteractive);
        return await super.run();
    }
}

module.exports = GivenOrSelect;