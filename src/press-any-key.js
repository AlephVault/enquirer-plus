const {Prompt} = require("enquirer");
const readline = require("readline");

/**
 * A "press any key to continue..." prompt.
 */
class AnyKeyPrompt extends Prompt {
    constructor(message) {
        super();
        this.message = message;
    }

    async run() {
        console.log(this.message);
        return new Promise(resolve => {
            readline.emitKeypressEvents(process.stdin);
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.once('keypress', () => {
                process.stdin.setRawMode(false);
                resolve();
            });
        });
    }
}

module.exports = AnyKeyPrompt;