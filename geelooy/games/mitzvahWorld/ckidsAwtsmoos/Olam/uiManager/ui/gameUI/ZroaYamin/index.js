
/**
 * B"H
 * @module ZroaYamin (The Right Arm of Action)
 * @description
 * THE ARM OF REVELATION
 * 
 * "With a strong hand and an outstretched arm..."
 * This is the refined, modular manifestation of the Action Bar.
 * It coordinates the Tzimtzum (contraction), the Kelim (vessels), 
 * and the Nitzotzos (sparks) into a single interactive limb.
 */
import startSlotsConfig from "../../startSlotsConfig.js";
import MinimizeBtn from "./MinimizeBtn.js";
import BagSlot from "./BagSlot.js";
import createActionSlot from "./ActionSlot.js";

const ZroaYamin = {
    shaym: "action bar",
    id: "actionBar",
    className: "awtsmoosAction",
    awtsmoosClick: true,
    style: {
        pointerEvents: "none",
    },
    startSlotsConfig,
    children: [
        MinimizeBtn, 
        { 
            className: "slots", 
            shaym: "action slots", 
            id: "actionSlots",
            style: { pointerEvents: "none" },
            children: [ BagSlot ]
        }
    ],
    on: {
        async updateActionSlots(e, $, ui) {
            console.log('B"H - 🌊 [ZROA_UPDATE]: Refreshing the Right Arm of Action.');
            const actionSlotsData = e.detail || [];
            
            const slotsContainer = $("actionSlots") || document.getElementById("actionSlots");
            if (slotsContainer) {
                const dynamicSlots = slotsContainer.querySelectorAll(".actionSlot:not(.bag-slot)");
                dynamicSlots.forEach(s => s.remove());
            }

            for (let index = 0; index < actionSlotsData.length; index++) {
                const slotData = actionSlotsData[index];
                await ui.html(createActionSlot(slotData, index, ui));
            }
        }
    }
};

export default ZroaYamin;
