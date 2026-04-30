
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

        // B"H: The Title Group - Concisely identifying the essence
        let html = `
            <div class="ctx-title-group">
                <div class="ctx-title">${(item.name || "Spark").toUpperCase()}</div>
                <div class="ctx-type">[ ${item.className || "Unknown"} ]</div>
                <div class="ctx-desc">${item.description || "A remnant of light."}</div>
            </div>
        `;

        // B"H: The Decree Buttons - Encoding payloads into the DOM
        actions.forEach(action => {
            const payloadStr = action.payload ? 
                encodeURIComponent(JSON.stringify(action.payload)) : 
                "null";

            html += `
                <button class="ctx-btn" 
                        style="border-left: 4px solid ${action.color};" 
                        data-awts-payload="${payloadStr}">
                    ${action.text}
                </button>
            `;
        });

        // Instant manifestation on the screen
        await ui.htmlAction({
            shaym: "itemContextMenu",
            properties: { innerHTML: html }
        });
    }
}
