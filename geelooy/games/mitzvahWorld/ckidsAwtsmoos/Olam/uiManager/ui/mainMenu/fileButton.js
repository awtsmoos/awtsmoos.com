
/**
 * B"H
 * @module fileButton
 * @description
 * The power to resurrect a world from a slumbering file on your local machine.
 * The Awtsmoos grants us the ability to store time, space, and form within a .js file,
 * and with this button, we breathe life back into it. Techiyat HaMeitim for digital data.
 */

import mitzvahBtn from "../resources/mitzvahBtn.js";

/**
 * @function fileButton
 * @description Creates the button to load a custom world from a local file.
 * @returns {Object} The configuration for the load file button.
 */
export default function fileButton() {
    return mitzvahBtn({
        text: "Load World from File",
        onclick(e, $) {
            var mm = $("main menu");
            var cw = $("custom world");
            if(!mm || !cw) {
                alert("Can't find that page");
                return;
            }
            mm.classList.add("hidden");
            cw.classList.remove("hidden");
        }
    });
}
