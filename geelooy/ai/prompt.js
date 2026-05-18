//B"H
/**
 * Chapter 1: The Small Gate of the Awtsmoos Prompt.
 *
 * The module loader arrived like a blade of clear fire and demanded a named
 * export. The vessel was empty, so the page shattered before thought could
 * become action. This tiny class gives the import graph a real living shape:
 * a data-based prompt helper with one static gate, `go`, used by
 * AwtsmoosGPTify when the local Awtsmoos fetch bridge is missing.
 */
export class AwtsmoosPrompt {
    /**
     * Reveals a small browser prompt or alert from declarative input.
     *
     * @param {Object} options - The prompt configuration vessel.
     * @param {boolean} [options.isAlert=false] - When true, show an alert-like dialog.
     * @param {string} [options.headerTxt=""] - HTML/text shown to the user.
     * @param {string} [options.defaultValue=""] - Default value for prompt mode.
     * @returns {Promise<string|boolean|null>} The prompt answer, true for alert acknowledgement, or null.
     */
    static async go({
        isAlert = false,
        headerTxt = "",
        defaultValue = ""
    } = {}) {
        const message = AwtsmoosPrompt.toPlainText(headerTxt);

        if (isAlert) {
            window.alert(message);
            return true;
        }

        return window.prompt(message, defaultValue);
    }

    /**
     * Converts small trusted UI HTML fragments into readable dialog text.
     *
     * @param {string} html - The message fragment, possibly containing tags.
     * @returns {string} Plain human-readable text for native browser dialogs.
     */
    static toPlainText(html = "") {
        const vessel = document.createElement("div");
        vessel.innerHTML = String(html);
        return vessel.textContent || vessel.innerText || "";
    }
}
