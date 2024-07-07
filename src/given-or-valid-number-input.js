const GivenOrValidInput = require("./given-or-valid-input");

/**
 * An input that takes a given value and/or asks and validates
 * the input until a valid number is given. It also tells how
 * will the (valid) result be processed.
 */
class GivenOrValidNumberInput extends GivenOrValidInput {
    constructor({integerOnly, convert, ...options}) {
        super({
            ...options, validate: integerOnly ? /^\d+$/ : /^((\d+(\.\d*)?)|(\.\d+))$/,
            makeInvalidInputMessage: (v) => `Invalid number: ${v}`,
            onInvalidGiven: (v) => console.error(`Invalid given number: ${v}`)
        });
        this._convert = convert || "string";
    }

    async result(v) {
        switch(this._convert) {
            case "string":
                return v;
            case "number":
                return parseFloat(v);
            case "bigint":
                return BigInt(v.split(".")[0]);
            default:
                if (typeof this._convert === "function") return this._convert(v);
                throw new Error(`Unexpected convert setting: ${this._convert}`);
        }
    }
}

module.exports = GivenOrValidNumberInput;