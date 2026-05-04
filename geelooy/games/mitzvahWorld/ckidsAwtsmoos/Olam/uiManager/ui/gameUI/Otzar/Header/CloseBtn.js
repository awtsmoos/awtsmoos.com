
/**
 * B"H
 * @module CloseBtn
 * @description
 * THE PORTAL TO THE WORLD
 */
export default {
    tag: "button",
    className: "close-btn",
    textContent: "X",
    onclick(e, $, ui) {
        // B"H: silent

        ui.htmlAction({ shaym: "inventoryScreen", id: "inventoryScreen", methods: { classList: { add: "hidden" } } });
        ui.htmlAction({ shaym: "itemContextMenu", id: "itemContextMenu", methods: { classList: { add: "hidden" } } });
    }
};
