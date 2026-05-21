// B"H
/**
 * @file fingerprint.js
 * @description
 * Chapter 1: when coordinates crack, the semantic fingerprint remains like a
 * scent of cedar smoke in the ruins, guiding the anchor back to its paragraph.
 */

function normalizeText(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

function candidateElements(root) {
    if (!root || typeof root.querySelectorAll !== "function") return [];
    return Array.from(root.querySelectorAll([
        ".sub-awtsmoos",
        ".toichen",
        "p",
        "li",
        "blockquote",
        "[data-awtsmoos-sub]",
        "[data-paragraph]"
    ].join(",")));
}

/**
 * Finds the best element whose text contains a semantic fingerprint.
 * @param {ParentNode} root Search root.
 * @param {string} fingerprint Saved semantic text clue.
 * @returns {Element|null} Best matching element.
 */
export function findBySemanticFingerprint(root, fingerprint) {
    const needle = normalizeText(fingerprint);
    if (!needle) return null;

    const rootText = normalizeText(root?.textContent || "");
    if (root?.nodeType === 1 && rootText.includes(needle)) {
        const deeper = candidateElements(root).find(el =>
            normalizeText(el.textContent || "").includes(needle)
        );
        return deeper || root;
    }

    const doc = root?.ownerDocument || (typeof document !== "undefined" ? document : null);
    const scope = root || doc;
    return candidateElements(scope).find(el =>
        normalizeText(el.textContent || "").includes(needle)
    ) || null;
}

/**
 * Creates a compact semantic fingerprint from an element.
 * @param {Element} element Text-bearing element.
 * @param {number} [maxLength=120] Maximum fingerprint length.
 * @returns {string} Normalized fingerprint text.
 */
export function makeSemanticFingerprint(element, maxLength = 120) {
    return normalizeText(element?.textContent || "").slice(0, maxLength);
}
