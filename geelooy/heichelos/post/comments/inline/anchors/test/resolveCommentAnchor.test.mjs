// B"H
import assert from "node:assert/strict";
import { anchorCommentElement, resolveCommentAnchor } from "../index.js";

class FakeElement {
    constructor({ classes = [], attrs = {}, text = "", children = [], ownerDocument = null } = {}) {
        this.classes = new Set(classes);
        this.attrs = { ...attrs };
        this.text = text;
        this.children = [];
        this.dataset = {};
        this.nodeType = 1;
        this.id = attrs.id || "";
        this.ownerDocument = ownerDocument;
        Object.entries(attrs).forEach(([key, value]) => this.setAttribute(key, value));
        children.forEach(child => this.appendChild(child));
    }
    get className() { return [...this.classes].join(" "); }
    set className(value) { this.classes = new Set(String(value).split(/\s+/).filter(Boolean)); }
    get textContent() { return [this.text, ...this.children.map(child => child.textContent)].join(" ").trim(); }
    setAttribute(name, value) {
        this.attrs[name] = String(value);
        if (name === "id") this.id = String(value);
        if (name.startsWith("data-")) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value);
    }
    getAttribute(name) { return this.attrs[name] ?? null; }
    appendChild(child) {
        child.ownerDocument = this.ownerDocument || (typeof this.createElement === "function" ? this : null);
        this.children.push(child);
        return child;
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    querySelectorAll(selectorList) {
        const selectors = selectorList.split(",").map(item => item.trim());
        return this.allDescendants().filter(el => selectors.some(selector => el.matches(selector)));
    }
    allDescendants() { return this.children.flatMap(child => [child, ...child.allDescendants()]); }
    matches(selector) {
        const classMatch = selector.match(/\.([\w-]+)/);
        const attrMatch = selector.match(/\[([^=\]]+)="?([^"\]]+)"?\]/);
        if (classMatch && !this.classes.has(classMatch[1])) return false;
        if (attrMatch && String(this.attrs[attrMatch[1]]) !== attrMatch[2]) return false;
        return Boolean(classMatch || attrMatch);
    }
}

class FakeDocument extends FakeElement {
    createElement() { return new FakeElement({ ownerDocument: this }); }
}

const doc = new FakeDocument();
const subsection = new FakeElement({ classes: ["sub-awtsmoos"], attrs: { "data-awtsmoos-sub": "3", id: "sub-three" }, text: "The anchored words glow inside the vessel.", ownerDocument: doc });
const section = new FakeElement({ classes: ["section"], attrs: { "data-awtsmoos-idx": "7", id: "verse-seven" }, children: [subsection], ownerDocument: doc });
doc.appendChild(section);

const anchor = resolveCommentAnchor({ verseSection: 7, subSection: 3 }, { root: doc });
assert.equal(anchor.element, subsection);
assert.equal(anchor.method, "element");

const verseEnd = resolveCommentAnchor({ verseSection: 7 }, { root: doc });
assert.notEqual(verseEnd.element, section);
assert.equal(verseEnd.element.classes.has("awtsmoos-verse-inline-end"), true);
assert.equal(verseEnd.element.dataset.awtsmoosVerseEnd, "7");

const repeatedVerseEnd = resolveCommentAnchor({ verseSection: 7 }, { root: doc });
assert.equal(repeatedVerseEnd.element, verseEnd.element);

const fallback = resolveCommentAnchor({ verseSection: 99, semanticFingerprint: "anchored words glow" }, { root: doc });
assert.equal(fallback.element.classes.has("awtsmoos-verse-inline-end"), true);

const card = new FakeElement({ ownerDocument: doc });
const attached = anchorCommentElement(card, { verseSection: 7, subSection: 3 }, { root: doc });
assert.equal(attached.element, subsection);
assert.equal(card.attrs["aria-controls"], "sub-three");
assert.equal(card.dataset.awtsmoosAnchorMethod, "element");

console.log('B"H resolveCommentAnchor.test passed');
