
// B"H
import EntityIdGenerator from "../../entities/core/EntityIdGenerator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * @class UIDataNode
 * @description
 * 🖼️ THE BLUEPRINT OF PERCEPTION 🖼️
 * 
 * Represents an HTML element purely as a JSON object. No physical DOM attached.
 */
export default class UIDataNode {
    static create(tag, className, textContent = "") {
        return {
            id: EntityIdGenerator.generate("UI"),
            tag: tag,
            className: className,
            textContent: textContent,
            children:[],
            styles: {}
        };
    }
}
