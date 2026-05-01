
/**
 * B"H
 * @module ContextMenuRenderer
 * @description
 * Transmuting pure logic into the physical appearance of the menu.
 */
import ActionGenerator from "./ActionGenerator.js";

export default class ContextMenuRenderer {
    /**
     * @function render
     * @description Carves the HTML architecture of the menu.
     */
    static async render(element, $, ui) {
        const data = element.contextData;
        if (!data || !data.item) return;

        const item = data.item;
        const actions = ActionGenerator.generate(item, data);

        // B"H: The Decree of Manifestation
        // We clear the vessel and fill it with JSON-based children,
        // avoiding the impurity of raw template strings.
        
        const children = [
            {
                className: "ctx-title-group",
                children: [
                    { className: "ctx-title", textContent: (item.name || "Spark").toUpperCase() },
                    { className: "ctx-type", textContent: `[ ${item.className || "Unknown"} ]` },
                    { className: "ctx-desc", textContent: item.description || "A remnant of light." }
                ]
            }
        ];

        actions.forEach(action => {
            const payloadStr = action.payload ? 
                encodeURIComponent(JSON.stringify(action.payload)) : 
                "null";

            children.push({
                tag: "button",
                className: "ctx-btn", 
                style: { borderLeft: `4px solid ${action.color}` },
                attributes: { "data-awts-payload": payloadStr },
                textContent: action.text
            });
        });

        // Instant manifestation on the screen by replacing existing content
        const ctxEl = $("itemContextMenu") || document.getElementById("itemContextMenu");
        if(ctxEl) {
            ctxEl.innerHTML = ''; // Purifying the vessel
            ui.html({
                parent: ctxEl,
                children: children
            });
        }
    }
}
