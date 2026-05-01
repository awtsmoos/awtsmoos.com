
/**
 * B"H
 * @module BagSlot
 * @description
 * THE SACRED RECEPTACLE (KELI)
 * 
 * "And they shall make an Ark..." 
 * The Bag is the central portal to the Treasury (Otzar). 
 * It is a permanent fixture in the Right Arm of Action, 
 * ensuring the soul always has access to its gathered sparks.
 */
export default {
    className: "actionSlot occupied bag-slot",
    style: { pointerEvents: "auto" },
    onclick: async (e, $$, uui) => {
        console.log('B"H - 🎒 [OTZAR_PORTAL]: Engaging the Treasury gate.');
        const inventoryScreen = $$("inventoryScreen") || document.getElementById("inventoryScreen");
        if (inventoryScreen) {
            const isHidden = inventoryScreen.classList.contains("hidden");
            if (isHidden) {
                await uui.htmlAction({ shaym: "inventoryScreen", id: "inventoryScreen", methods: { classList: { remove: "hidden" } } });
            } else {
                await uui.htmlAction({ shaym: "inventoryScreen", id: "inventoryScreen", methods: { classList: { add: "hidden" } } });
            }
        }
    },
    children: [{
        className: "innerSlot",
        children: [{
            className: "slotBtn",
            style: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "32px",
                pointerEvents: "none"
            },
            textContent: "🎒"
        }]
    }]
};
