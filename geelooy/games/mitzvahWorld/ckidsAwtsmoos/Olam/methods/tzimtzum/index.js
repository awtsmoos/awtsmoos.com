
/**
 * B"H
 * @module TzimtzumManager
 * @description
 * "He measured the waters in the hollow of His hand, and meted out heaven with the span."
 * The Tzimtzum is the initial contraction, making space for a finite world.
 * This class coordinates the Data, the UI, and the Genesis sequence through pure, modular vessels.
 */

import DataMerger from "./DataMerger.js";
import UIBuilder from "./UIBuilder.js";
import GameStarter from "./GameStarter.js";

export default class TzimtzumManager {
    /**
     * @async
     * @function tzimtzum
     * @description The main entry point for creating the universe.
     * @param {Object} payload - The initial data drop containing system and user info.
     */
    async tzimtzum({ systemInfo = {}, userInfo = {} } = {}) {
        console.log("B\"H - ⚡ INTENSE LOG: Tzimtzum Sequence Initiated!");

        try {
            // 1. Gather the Sparks (Merge Data)
            const info = await DataMerger.merge(systemInfo, userInfo);

            // 2. Bind the Laws of Nature (Event Listeners)
            if (typeof info.on === "object") {
                Object.keys(info.on).forEach(q => this.on(q, info.on[q]));
            }

            // 3. Name the World
            if (info.shaym && !this.shaym) {
                this.shaym = info.shaym;
            }

            if (!this.resetY) this.resetY = -6;

            // 4. Prepare the Holy Tongue (Fonts)
            await this.loadHebrewFonts();

            // 5. Draw down the Light (Load external components if any exist)
            if (info.components && Object.keys(info.components).length > 0) {
                console.log("B\"H - ⚡ INTENSE LOG: Loading external components...");
                await this.loadComponents(info.components);
            }

            // 6. Sculpt the Canvas (HTML UI)
            if (info.html) {
                this.htmlUI = await UIBuilder.build(this, info.html);
                this.styled = true;
            }

            this.baseInfo = userInfo;

            // 7. Breathe Life into the Void
            return await GameStarter.start(this, info);

        } catch(e) {
            console.error("B\"H - ⚡ INTENSE ERROR: Critical failure during Tzimtzum:", e);
            this.ayshPeula("error", {
                code: "ISSUE_IN_TZIMTZUM",
                details: e,
                message: "A catastrophic failure occurred while forming the world's foundation."
            });
        }
    }
}
