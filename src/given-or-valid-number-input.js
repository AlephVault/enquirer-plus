const GivenOrValidInput = require("./given-or-valid-input");
const hexInt = /^0x[a-fA-F0-9]+$/;
const decInt = /^-?\d+$/;
const float = /^-?((\d+(\.\d*)?)|(\.\d+))$/;

function applyConvert(convert, v, raiseOnFail) {
    let v_ = v;
    if (hexInt.test(v)) {
        v_ = BigInt(v).toString();
    } else if (raiseOnFail && !decInt.test(v) && !float.test(v)) {
        throw new Error(`Invalid boundary value: ${v}`);
    }

    switch(convert) {
        case "string":
            return v;
        case "number":
            return parseFloat(v_);
        case "bigint":
            return BigInt(v_.split(".")[0]);
        default:
            if (typeof convert === "function") return convert(v_);
            throw new Error(`Unexpected convert setting: ${convert}`);
    }
}

function checkRange(convert, v, min, max) {
    try {
        v = applyConvert(convert, v, false);
    } catch {
        return false;
    }

    return (min === undefined || min <= v) && (v <= max || max === undefined);
}

/**
 * An input that takes a given value and/or asks and validates
 * the input until a valid number is given. It also tells how
 * will the (valid) result be processed.
 */
class GivenOrValidNumberInput extends GivenOrValidInput {
    constructor({integerOnly, allowHex, convert, min, max, ...options}) {
        if (convert === "string" && (min !== undefined || max !== undefined)) {
            throw new Error("Cannot use min or max boundaries where the convert is string");
        }
        min = min !== undefined ? applyConvert(convert, min, true) : undefined;
        max = max !== undefined ? applyConvert(convert, max, true) : undefined;

        super({
            ...options, validate: (v) => {
                if (hexInt.test(v)) {
                    return allowHex && checkRange(convert, v, min, max);
                } else if (decInt.test(v)) {
                    return checkRange(convert, v, min, max);
                } else if (float.test(v)) {
                    return !integerOnly && checkRange(convert, v, min, max);
                }
            },
            makeInvalidInputMessage: (v) => `Invalid number: ${v}`,
            onInvalidGiven: (v) => console.error(`Invalid given number: ${v}`)
        });
        this._convert = convert || "string";
    }

    async result(v) {
        return applyConvert(this._convert, v);
    }
}

module.exports = GivenOrValidNumberInput;