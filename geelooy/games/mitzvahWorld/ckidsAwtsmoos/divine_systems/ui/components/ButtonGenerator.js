
// B"H
import UIDataNode from "../core/UIDataNode.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * @class ButtonGenerator
 * @description
 * 🔘 THE FORGE OF INTENTION 🔘
 */
export default class ButtonGenerator {
    static generate(text, colorHex) {
        const node = UIDataNode.create("button", "awtsmoosBtn", text);
        node.styles = {
            backgroundColor: colorHex || "#44C300",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            border: "2px solid gold",
            cursor: "pointer"
        };
        return node;
    }
}
