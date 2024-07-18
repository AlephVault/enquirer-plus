const GivenOrSelect = require("./given-or-select");

/**
 * A boolean Select prompt. The yes/no labels can be configured.
 */
class GivenOrBooleanSelect extends GivenOrSelect {
    constructor({yes, no, ...options}) {
        super({...options, choices: [
            {name: "true", message: yes || "Yes"}, {name: "false", message: no || "No"}
        ]});
    }

    async _convertOption(v) {
        return v === "true";
    }
}

module.exports = GivenOrBooleanSelect;
