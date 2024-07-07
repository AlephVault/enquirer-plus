const GivenOrValidInput = require("./given-or-valid-input");

/**
 * An input that takes a given value and/or asks and validates
 * the input until a valid number is given. It also tells how
 * will the (valid) result be processed.
 */
class GivenOrValidNumberInput extends GivenOrValidInput {
    constructor({integerOnly, allowHex, convert, ...options}) {
        super({
            ...options, validate: (v) => {
                if (allowHex && /0x[a-fA-F0-9]+/.test(v)) return true;
                return (integerOnly ? /^\d+$/ : /^((\d+(\.\d*)?)|(\.\d+))$/).test(v);
            },
            makeInvalidInputMessage: (v) => `Invalid number: ${v}`,
            onInvalidGiven: (v) => console.error(`Invalid given number: ${v}`)
        });
        this._convert = convert || "string";
    }

    async result(v) {
        let v_ = v;
        if (/0x[a-fA-F0-9]+/.test(v)) {
            v_ = BigInt(v).toString();
        }

        switch(this._convert) {
            case "string":
                return v;
            case "number":
                return parseFloat(v_);
            case "bigint":
                return BigInt(v_.split(".")[0]);
            default:
                if (typeof this._convert === "function") return this._convert(v_);
                throw new Error(`Unexpected convert setting: ${this._convert}`);
        }
    }
}

module.exports = GivenOrValidNumberInput;