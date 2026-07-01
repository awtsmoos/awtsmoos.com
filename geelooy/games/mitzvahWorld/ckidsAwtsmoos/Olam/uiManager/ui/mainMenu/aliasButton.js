// B"H
function awtsmoosNotice(message) {
  const text = String(message ?? "");
  console.warn('B"H | NOTICE_NO_BLOCKING_DIALOG', text);
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__ ||= [];
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__.push({ at: Date.now(), text, source: import.meta?.url || "unknown" });
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__ = globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__.slice(-80);
}

/**
 * B"H
 * @module aliasButton
 * @description
 * Searching the expanses of the digital universe for worlds created by others.
 * Like seeking out hidden Tzaddikim, this button opens the gateway to discover
 * the unique creative manifestations of fellow souls.
 */

import mitzvahBtn from "../resources/mitzvahBtn.js";

/**
 * @function aliasButton
 * @description Creates the button that opens the "Find Worlds" screen.
 * @returns {Object} The configuration for the Alias search button.
 */
export default function aliasButton() {
    return mitzvahBtn({
        text: "Find Worlds by Alias",
        onclick(e, $) {
            var mm = $("main menu");
            var cw = $("find worlds");
            if(!mm || !cw) {
                awtsmoosNotice("Can't find that page");
                return;
            }
            mm.classList.add("hidden");
            cw.classList.remove("hidden");
        }
    });
}
