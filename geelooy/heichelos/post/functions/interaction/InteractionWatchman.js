
/**
 * B"H
 * @module InteractionWatchman
 * @description
 * Chapter 18: The Watchman now refuses the broken vision where Egypt glows but
 * the verse-frame sleeps. Any subsection highlight immediately wraps its outer
 * section in active light, and a scroll fail-safe repairs the frame every breath.
 */

import Highlighter from "/api/nav/highlighter.js";
import { updateQueryStringParameter } from "./CoordinateInteraction.js";
import {
    activateOuterVerseForInner,
    installOuterVerseFailsafe,
    syncOuterVerseFromActiveInner
} from "./ActiveVerseEnvelope.js";

function call(callback, payload) {
    if (typeof callback === "function") callback(payload);
}

function dispatchSubDeselect() {
    updateQueryStringParameter("sub", null);
    window.dispatchEvent(new CustomEvent("awtsmoos index", { detail: { sub: null } }));
}

/**
 * Sets up verse and subsection highlighters.
 * @param {string} elId Parent container id.
 * @param {string} targetClass Verse target class.
 * @param {Function} callback Highlight callback.
 * @param {Function} desCallback Deselect callback.
 */
export function startHighlighting(elId, targetClass, callback, desCallback) {
    const containerSelector = "#" + elId;
    const verseSelector = "." + targetClass;
    const subSelector = `${verseSelector} .sub-awtsmoos`;

    const verseChai = new Highlighter(containerSelector, verseSelector, h => {
        syncOuterVerseFromActiveInner(document.querySelector(containerSelector) || document);
        call(callback, { main: h });
    }, {
        deselectEnabled: true,
        onDeselectCallback: () => {
            syncOuterVerseFromActiveInner(document.querySelector(containerSelector) || document);
            if (typeof desCallback === "function") desCallback();
        }
    });

    const subChai = new Highlighter(containerSelector, subSelector, h => {
        const main = activateOuterVerseForInner(h, document.querySelector(containerSelector) || document);
        call(callback, { main, sub: h });
    }, {
        deselectEnabled: true,
        onDeselectCallback: () => {
            syncOuterVerseFromActiveInner(document.querySelector(containerSelector) || document);
            dispatchSubDeselect();
        }
    });

    window.chai = verseChai;
    window.subChai = subChai;
    window.awtsmoosOuterVerseFailsafeCleanup?.();
    window.awtsmoosOuterVerseFailsafeCleanup = installOuterVerseFailsafe(containerSelector);
}
