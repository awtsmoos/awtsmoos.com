
/**
 * B"H
 * @module Header
 * @description
 * THE CROWN OF THE TREASURY (KETER)
 */
import Title from "./Title.js";
import CloseBtn from "./CloseBtn.js";

export default {
    className: "inventory-header",
    children: [
        Title(),
        {
            tag: "button", 
            className: "back-inv-btn hidden", 
            textContent: "⬅ RETURN",
            onclick(e, $, ui) {
                ui.peula("ikar", { olamPeula: { closeContainer: true } });
            }
        },
        CloseBtn
    ]
};
