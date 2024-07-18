const {Prompt} = require("enquirer");

/**
 * This prompt asks for a specified amount of elements,
 * which might be of different types.
 *
 * This is abstract, and determining the specs of
 * the tuple prompt should never be asynchronous.
 */
class GivenOrBaseTuplePrompt extends Prompt {
    constructor({given, nonInteractive, ...options}) {
        super(options);
        this._given = given;
        this._nonInteractive = nonInteractive;
    }

    _length() {
        throw new Error("_length() must be implemented in the tuple prompt");
    }

    async _apply(index, given) {
        throw new Error("_apply(e) must be implemented in the tuple prompt");
    }

    /**
     * Prompts the user for a fixed amount of times.
     * @returns {Promise<*[]>} The answers (async function).
     * @private
     */
    async _runFixed() {
        const elements = [];
        for(let index = 0; index < this._length(); index++) {
            const given_ = this._given ? this._given[index] : undefined;
            elements.push(await this._apply(index, given_));
        }
        return elements;
    }

    async _run() {
        console.log(this.options.message);
        const length = this._length();

        // Validate the given elements. If it is not
        // an array-like element, unset it.
        if (this._given) {
            if (typeof this._given.length !== "number" || this._given.length !== length) {
                console.error(`Invalid given value: ${typeof this._given === "string" ? this._given : JSON.stringify(this._given)}`);
                this._given = undefined;
            }
        }

        // Execute the runFixed call.
        return await this._runFixed();
    }

    async run() {
        this.value = await this._run();
        this.submit();
        return this.value;
    }

    async render() {}
}

module.exports = GivenOrBaseTuplePrompt;