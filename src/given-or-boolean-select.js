const { BooleanPrompt } = require('enquirer');

/**
 * A boolean Select prompt. The yes/no labels can be configured.
 */
class GivenOrBooleanSelect extends BooleanPrompt {
    constructor({given, ...options}) {
        super(options);
        this._given = given;
    }

    async run() {
        if (this._given !== undefined) {
            const value = !!this._given ? "t" : "f";
            await this.dispatch(value);
            return this.value;
        } else {
            return await super.run();
        }
    }
}

module.exports = GivenOrBooleanSelect;
