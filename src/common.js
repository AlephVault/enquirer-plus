/**
 * Raises an error when forceNonInteractive is true.
 * @param forceNonInteractive The force-non-interactive setting.
 */
function checkNotInteractive(forceNonInteractive) {
    if (forceNonInteractive) throw new Error("Aborting: The current action became interactive");
}

module.exports = {
    checkNotInteractive
}