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
        if (typeof this._given === "string") {
            this._given = this._given.toLowerCase();
        }

        switch(this._given) {
            case true:
            case "t":
            case "true":
            case "y":
            case "yes":
            case "1":
            case 1:
                this._given = true;
                break;
            case false:
            case "f":
            case "false":
            case "n":
            case "no":
            case "0":
            case 0:
                this._given = false;
                break;
            default:
                if (this._given !== undefined) {
                    console.error(`Invalid boolean value: ${this._given}`);
                    this._given = undefined;
                }
        }

        if (this._given !== undefined) {
            const value = this._given ? "t" : "f";
            await this.dispatch(value);
            return this.value;
        } else {
            return await super.run();
        }
    }
}

module.exports = GivenOrBooleanSelect;
