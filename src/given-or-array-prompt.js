const {Prompt} = require("enquirer");
const GivenOrBooleanSelect = require("./given-or-boolean-select");

/**
 * This prompt asks for a specified amount of elements,
 * or a dynamic one (until the users stops accepting
 * more elements).
 */
class GivenOrBaseArrayPrompt extends Prompt {
    constructor({length, given, nonInteractive, ...options}) {
        super(options);
        if (length !== undefined && (typeof length !== "number" || length < 0)) {
            throw new Error(`Invalid length: ${length}`);
        }
        this._given = given;
        this._length = length;
        this._nonInteractive = nonInteractive;
    }

    async _apply(index, given) {
        throw new Error("_apply(e) must be implemented in the array prompt");
    }

    /**
     * Prompts the user for a fixed amount of times.
     * @returns {Promise<*[]>} The answers (async function).
     * @private
     */
    async _runFixed() {
        const elements = [];
        for(let index = 0; index < this._length; index++) {
            const given_ = this._given ? this._given[index] : undefined;
            elements.push(await this._apply(index, given_));
        }
        return elements;
    }

    /**
     * Interactively asks whether a new element must be prompted
     * into the array or not.
     * @returns {Promise<boolean>} The answer (async function).
     * @protected
     */
    async _confirmNextElement() {
        return new GivenOrBooleanSelect({
            message: "Do you want to add another element?",
            nonInteractive: this._nonInteractive
        }).run();
    }

    /**
     * Prompts the user to add elements while they want to.
     * @returns {Promise<*[]>} The answers (async function).
     * @private
     */
    async _runAsWanted() {
        const elements = [];
        while(true) {
            console.log(`Currently, you've added ${elements.length || "no"} elements`);
            if (!(await this._confirmNextElement())) break;
            elements.push(await this._apply(elements.length));
        }
        return elements;
    }

    /**
     * Prompts the user to add the elements, either a fixed
     * amount of times (as given or stated) or a dynamic one.
     * @returns {Promise<*[]>} The answers (async function).
     */
    async _run() {
        console.log(this.options.message);

        // 1. If the given value is invalid, then remove it.
        //    Otherwise, use its length to process a simple
        //    fixed input (with prepared given values).
        if (this._given) {
            if (typeof this._given.length !== "number" || this._given.length < 0 ||
                (this._length !== undefined && this._length !== this._given.length)) {
                console.error(`Invalid given value: ${this._given}`);
                this._given = undefined;
            } else {
                this._length = this._given.length;
            }
        }

        // 2. Execute the fetching.
        if (this._length !== undefined) {
            return await this._runFixed();
        } else {
            return await this._runAsWanted();
        }
    }

    /**
     * Prompts the user to add the elements, either a fixed
     * amount of times (as given or stated) or a dynamic one.
     * @returns {Promise<*[]>} The answers (async function).
     */
    async run() {
        this.value = await this._run();
        this.submit();
        return this.value;
    }

    async render() {}
}

module.exports = GivenOrBaseArrayPrompt;