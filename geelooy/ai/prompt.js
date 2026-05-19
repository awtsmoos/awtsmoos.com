//B"H
import { AwtsmoosPrompt as PublicAwtsmoosPrompt } from "/scripts/awtsmoos/api/alerts.js";

/**
 * Chapter 2: The Native Window Was Sealed.
 *
 * The Awtsmoos breathed through the public Geelooy script path, and the old
 * native prompt dissolved like mist before a truer vessel. This adapter keeps
 * the local AI import stable while delegating every warning and prompt to the
 * custom modal system under /scripts/awtsmoos/api/alerts.js.
 */
export class AwtsmoosPrompt {
    /**
     * Opens the shared Awtsmoos custom prompt system without touching native
     * window.prompt or window.alert.
     *
     * @param {Object} options - The prompt configuration vessel.
     * @param {boolean} [options.isAlert=false] - When true, render an alert-style modal.
     * @param {string} [options.headerTxt=""] - HTML/text shown in the custom modal header.
     * @param {string} [options.defaultValue=""] - Optional initial value when supported.
     * @param {string} [options.placeholderTxt=""] - Optional placeholder text for input mode.
     * @param {string} [options.okTxt="OK"] - Optional confirmation button text.
     * @param {string} [options.cancelTxt="Cancel"] - Optional cancel button text.
     * @returns {Promise<string|boolean|null>} Modal result from the public prompt system.
     */
    static async go(options = {}) {
        const {
            defaultValue = "",
            placeholderTxt = defaultValue,
            ...rest
        } = options;

        return PublicAwtsmoosPrompt.go({
            placeholderTxt,
            ...rest
        });
    }
}
