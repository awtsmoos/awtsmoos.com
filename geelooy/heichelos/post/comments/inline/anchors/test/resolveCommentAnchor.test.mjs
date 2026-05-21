// B"H
import assert from "node:assert/strict";
import { anchorCommentElement, resolveCommentAnchor } from "../index.js";

class FakeElement {
    constructor({ classes = [], attrs = {}, text = "", children = [] } = {}) {
        this.classes = new Set(classes);
        this.attrs = { ...attrs };
        this.text = text;
        this.children = children;
        this.dataset = {};
        this.nodeType = 1;
        this.id = attrs.id || "";
    }

    get textContent() {
        return [this.text, ...this.children.map(child => child.textContent)].join(" ").trim();
    }

    setAttribute(name, value) {
        this.attrs[name] = String(value);
    }

    querySelector(selector) {
        return this.querySelectorAll(selector)[0] || null;
    }

    querySelectorAll(selectorList) {
        const selectors = selectorList.split(",").map(item => item.trim());
        return this.allDescendants().filter(el => selectors.some(selector => el.matches(selector)));
    }

    allDescendants() {
        return this.children.flatMap(child => [child, ...child.allDescendants()]);
    }

    matches(selector) {
        const classMatch = selector.match(/\.([\w-]+)/);
        const attrMatch = selector.match(/\[([^=\]]+)="?([^"\]]+)"?\]/);
        if (classMatch && !this.classes.has(classMatch[1])) return false;
        if (attrMatch && String(this.attrs[attrMatch[1]]) !== attrMatch[2]) return false;
        return Boolean(classMatch || attrMatch);
    }
}

const subsection = new FakeElement({
    classes: ["sub-awtsmoos"],
    attrs: { "data-awtsmoos-sub": "3", id: "sub-three" },
    text: "The anchored words glow inside the vessel."
});
const section = new FakeElement({
    classes: ["section"],
    attrs: { "data-awtsmoos-idx": "7" },
    children: [subsection]
});
const root = new FakeElement({ children: [section] });

const anchor = resolveCommentAnchor({ verseSection: 7, subSection: 3 }, { root });
assert.equal(anchor.element, subsection);
assert.equal(anchor.method, "element");

const fallback = resolveCommentAnchor({
    verseSection: 99,
    semanticFingerprint: "anchored words glow"
}, { root });
assert.equal(fallback.element, subsection);

const card = new FakeElement();
const attached = anchorCommentElement(card, { verseSection: 7, subSection: 3 }, { root });
assert.equal(attached.element, subsection);
assert.equal(card.attrs["aria-controls"], "sub-three");
assert.equal(card.dataset.awtsmoosAnchorMethod, "element");

console.log('B"H resolveCommentAnchor.test passed');
