
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file JSONToHTMLCrafter.js
 * 
 * Chapter: The Alphabet of Creation.
 * The 22 letters of the Aleph-Beis combine in infinite permutations.
 * Instead of manually carving out every HTML element (`document.createElement`),
 * we simply describe the 'soul' of the element in pure JSON.
 * This Crafter interprets that JSON and utters the corresponding HTML string.
 */

/**
 * @class JSONToHTMLCrafter
 * @extends SederHishtalshelusNode
 * @description Master pure function engine converting deep JSON structures to HTML Strings.
 */
export default class JSONToHTMLCrafter extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Yetzirah_HTML_Interpreter" });
    }

    /**
     * @method craftHTMLString
     * @description Recursively builds an HTML string from a pure JSON object.
     * @param {Object|Array} schema - The pure JSON representation.
     * @returns {string} The final HTML string.
     */
    craftHTMLString(schema) {
        if (!schema) return '';
        if (Array.isArray(schema)) {
            return schema.map(item => this.craftHTMLString(item)).join('');
        }
        if (typeof schema === 'string' || typeof schema === 'number') {
            return schema.toString();
        }

        const { tag = 'div', attrs = {}, content = '', children =[] } = schema;
        
        let attributesString = '';
        const attrKeys = Object.keys(attrs);
        for (let i = 0; i < attrKeys.length; i++) {
            const key = attrKeys[i];
            attributesString += ` ${key}="${attrs[key]}"`;
        }

        const innerHTML = content + this.craftHTMLString(children);
        
        return `<${tag}${attributesString}>${innerHTML}</${tag}>`;
    }
}
