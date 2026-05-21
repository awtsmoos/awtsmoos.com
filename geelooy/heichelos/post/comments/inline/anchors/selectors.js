// B"H
/**
 * @file selectors.js
 * @description
 * Chapter 1: The Awtsmoos breathes names into stone, and selectors become the
 * small lanterns that find each textual vessel without grabbing the whole page.
 */

function cssEscape(value) {
    const text = String(value ?? "");
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
        return CSS.escape(text);
    }
    return text.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Builds safe selector candidates for a verse section.
 * @param {string|number} verseSection Section coordinate.
 * @returns {string[]} Selector candidates, strongest first.
 */
export function verseSectionSelectors(verseSection) {
    const value = cssEscape(verseSection);
    return [
        `.section[data-awtsmoos-idx="${value}"]`,
        `.section[data-idx="${value}"]`,
        `[data-awtsmoos-idx="${value}"]`,
        `[data-verse-section="${value}"]`
    ];
}

/**
 * Builds safe selector candidates for a subsection or paragraph.
 * @param {string|number} subSection Subsection coordinate.
 * @returns {string[]} Selector candidates, strongest first.
 */
export function subSectionSelectors(subSection) {
    const value = cssEscape(subSection);
    return [
        `.sub-awtsmoos[data-awtsmoos-sub="${value}"]`,
        `.sub-awtsmoos[data-idx="${value}"]`,
        `[data-awtsmoos-sub="${value}"]`,
        `[data-sub-section="${value}"]`,
        `[data-paragraph="${value}"]`
    ];
}

/**
 * Returns the first element matching any selector under a root.
 * @param {ParentNode|null} root Search root.
 * @param {string[]} selectors Selector candidates.
 * @returns {Element|null} First matching element.
 */
export function firstMatchingElement(root, selectors) {
    if (!root || typeof root.querySelector !== "function") return null;
    for (const selector of selectors) {
        const found = root.querySelector(selector);
        if (found) return found;
    }
    return null;
}
