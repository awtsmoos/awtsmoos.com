// B"H
/**
 * @module UniversalInterpreter
 * @description
 * Chapter 231: The true child-sections are heard.
 * A verse may contain dozens of real baby chambers as arrays, nested arrays,
 * objects with text/content/body/html, paragraphs, subSections, or sections.
 * This interpreter does not pretend that a whole verse is one blob. It extracts
 * the actual leaf subsection bodies so the verse can virtualize internally.
 */

const TEXT_KEYS = ["text", "content", "html", "body", "value"];
const CHILD_KEYS = ["subSections", "subsections", "paragraphs", "sections", "children", "items"];
const BLOCK_TAGS = new Set(["P", "DIV", "SECTION", "ARTICLE", "BLOCKQUOTE", "H1", "H2", "H3", "H4", "H5", "H6", "LI"]);

function meaningful(value) {
    return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, "").length > 0;
}

function outerOf(node) {
    if (!node) return "";
    if (node.nodeType === 3) return node.textContent || "";
    if (node.nodeType === 1) return node.outerHTML || node.textContent || "";
    return "";
}

function splitByBreaks(html) {
    return String(html || "")
        .replace(/<br\s*\/?>(\s*<br\s*\/?>)+/gi, "[[AWTSMOOS_BREAK]]")
        .split("[[AWTSMOOS_BREAK]]")
        .map(part => part.trim())
        .filter(meaningful);
}

function parserBlocks(html) {
    if (typeof DOMParser !== "function") return [];
    const doc = new DOMParser().parseFromString(String(html || ""), "text/html");
    const children = Array.from(doc.body.childNodes).filter(node => meaningful(node.textContent));
    if (children.length > 1) return children.map(outerOf).filter(meaningful);
    const only = children[0];
    if (!only || only.nodeType !== 1 || !BLOCK_TAGS.has(only.tagName)) return [];
    const innerBlocks = Array.from(only.children || []).filter(child => BLOCK_TAGS.has(child.tagName) && meaningful(child.textContent));
    return innerBlocks.length > 1 ? innerBlocks.map(outerOf).filter(meaningful) : [];
}

function splitHtmlString(value) {
    const html = String(value || "").trim();
    if (!html) return [];
    const parsed = parserBlocks(html);
    if (parsed.length > 1) return parsed;
    const br = splitByBreaks(html);
    return br.length > 1 ? br : [];
}

function firstOwn(value, keys) {
    if (!value || typeof value !== "object") return undefined;
    for (const key of keys) if (Object.prototype.hasOwnProperty.call(value, key)) return value[key];
    return undefined;
}

function collectLeaves(value, out = []) {
    if (value === null || value === undefined) return out;
    if (typeof value === "string") {
        if (meaningful(value)) out.push(value);
        return out;
    }
    if (Array.isArray(value)) {
        value.forEach(item => collectLeaves(item, out));
        return out;
    }
    if (typeof value !== "object") return out;

    const child = firstOwn(value, CHILD_KEYS);
    if (Array.isArray(child)) {
        collectLeaves(child, out);
        return out;
    }

    const text = firstOwn(value, TEXT_KEYS);
    if (Array.isArray(text)) {
        collectLeaves(text, out);
        return out;
    }
    if (typeof text === "string" && meaningful(text)) {
        const split = splitHtmlString(text);
        split.length > 1 ? split.forEach(part => collectLeaves(part, out)) : out.push(text);
        return out;
    }

    return out;
}

function directFlatText(data) {
    if (typeof data === "string") return data;
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    const child = firstOwn(data, CHILD_KEYS);
    if (child !== undefined) return null;
    const text = firstOwn(data, TEXT_KEYS);
    return typeof text === "string" ? text : null;
}

export class UniversalInterpreter {
    /**
     * @param {Object|string|Array} data Raw verse vessel.
     * @returns {{flatText:string|null,dynamicContent:Array|null}}
     */
    static decipher(data) {
        if (!data) return { flatText: null, dynamicContent: null };
        const leaves = collectLeaves(data, []);
        if (leaves.length > 1) return { flatText: null, dynamicContent: leaves };
        const flat = directFlatText(data) ?? leaves[0] ?? null;
        const split = typeof flat === "string" ? splitHtmlString(flat) : [];
        if (split.length > 1) return { flatText: null, dynamicContent: split };
        return { flatText: flat, dynamicContent: null };
    }

    /**
     * @param {*} value Any data vessel.
     * @returns {string|Array} Extracted subsection text map.
     */
    static extractPureText(value) {
        const leaves = collectLeaves(value, []);
        if (leaves.length > 1) return leaves;
        return leaves[0] || directFlatText(value) || "";
    }

    /**
     * @param {*} value Any verse vessel.
     * @returns {number} Count of actual leaf baby sections.
     */
    static countSubsections(value) {
        return collectLeaves(value, []).length;
    }
}
