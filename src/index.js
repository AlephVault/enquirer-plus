const Enquirer_ = require("enquirer");
const PressAnyKey = require("./press-any-key");
const GivenOrSelect = require("./given-or-select");
const GivenOrValidInput = require("./given-or-valid-input");
const GivenOrValidNumberInput = require("./given-or-valid-number-input");

/**
 * This is an extended Enquirer class, which takes the
 * three new prompt types that we'll make use of.
 */
class Enquirer extends Enquirer_ {
    constructor(options, answers) {
        super(options, answers);
        this.register("plus:press-any-key", PressAnyKey);
        this.register("plus:given-or-valid-input", GivenOrValidInput);
        this.register("plus:given-or-valid-number-input", GivenOrValidNumberInput);
        this.register("plus:given-or-select", GivenOrSelect);
    }
}

Enquirer.PressAnyKey = PressAnyKey;
Enquirer.GivenOrSelect = GivenOrSelect;
Enquirer.GivenOrValidInput = GivenOrValidInput;
Enquirer.GivenOrValidNumberInput = GivenOrValidNumberInput;

module.exports = Enquirer;