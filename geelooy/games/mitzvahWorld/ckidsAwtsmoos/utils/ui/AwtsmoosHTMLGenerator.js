// B"H
/**
 * @file AwtsmoosHTMLGenerator.js
 * @module AwtsmoosHTMLGenerator
 * 
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE VESSEL CRAFTER — JSON TO HTML EMANATION                                     ║
 * ║                                                                                  ║
 * ║  "And Betzalel made the vessels..."                                              ║
 * ║  Abstracts all UI generation into pure Seder Hishtalshelus JSON data.            ║
 * ║  Eliminates fragile template strings.                                            ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

export default class AwtsmoosHTMLGenerator {
    /**
     * Emanates HTML string from a pure JSON blueprint.
     * @param {Object} blueprint JSON representation of the UI.
     * @returns {string} Raw HTML string.
     */
    static emanate(blueprint) {
        if (!blueprint) return "";
        if (typeof blueprint === "string" || typeof blueprint === "number") {
            return String(blueprint);
        }
        if (Array.isArray(blueprint)) {
            return blueprint.map(b => this.emanate(b)).join("");
        }

        const tag = blueprint.tag || "div";
        const attrStr = this._compileAttributes(blueprint);
        const styleStr = this._compileStyles(blueprint.style);
        
        let openTag = `<${tag}${attrStr}${styleStr}>`;
        let closeTag = `</${tag}>`;
        
        // Self-closing tags
        if (["img", "input", "br", "hr", "meta", "link"].includes(tag.toLowerCase())) {
            return `<${tag}${attrStr}${styleStr} />`;
        }

        const content = blueprint.children ? this.emanate(blueprint.children) : (blueprint.text || "");
        return openTag + content + closeTag;
    }

    static _compileAttributes(blueprint) {
        let attrs = "";
        if (blueprint.id) attrs += ` id="${this._escape(blueprint.id)}"`;
        if (blueprint.className) attrs += ` class="${this._escape(blueprint.className)}"`;
        
        if (blueprint.attributes) {
            for (const [key, val] of Object.entries(blueprint.attributes)) {
                attrs += ` ${key}="${this._escape(String(val))}"`;
            }
        }
        return attrs;
    }

    static _compileStyles(styleObj) {
        if (!styleObj) return "";
        if (typeof styleObj === "string") return ` style="${this._escape(styleObj)}"`;
        
        const styles = Object.entries(styleObj)
            .map(([k, v]) => `${this._camelToKebab(k)}:${v}`)
            .join("; ");
        
        return styles ? ` style="${this._escape(styles)}"` : "";
    }

    static _camelToKebab(str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    static _escape(str) {
        return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}
