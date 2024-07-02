const Enquirer_ = require("enquirer");
const PressAnyKey = require("./press-any-key");
const GivenOrSelect = require("./given-or-select");

/**
 * This is an extended Enquirer class, which takes the
 * three new prompt types that we'll make use of.
 */
class Enquirer extends Enquirer_ {
    constructor(options, answers) {
        super(options, answers);
        this.register("press-any-key", PressAnyKey);
        // this.register("given-or-input-until", GivenOrInputUntil);
        this.register("given-or-select", GivenOrSelect);
    }
}

Enquirer.PressAnyKey = PressAnyKey;
Enquirer.GivenOrSelect = GivenOrSelect;

module.exports = Enquirer;