// B"H
import assert from "node:assert/strict";
import {
    activateOuterVerseForInner,
    syncOuterVerseFromActiveInner
} from "../ActiveVerseEnvelope.js";

class FakeClassList {
    constructor(owner) { this.owner = owner; this.set = new Set(); }
    add(name) { this.set.add(name); }
    remove(name) { this.set.delete(name); }
    contains(name) { return this.set.has(name); }
}

class FakeElement {
    constructor(classes = []) {
        this.parentElement = null;
        this.children = [];
        this.classList = new FakeClassList(this);
        classes.forEach(name => this.classList.add(name));
    }
    appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
    closest(selector) {
        const wanted = selector.slice(1);
        let node = this;
        while (node) {
            if (node.classList.contains(wanted)) return node;
            node = node.parentElement;
        }
        return null;
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    querySelectorAll(selector) {
        const selectors = selector.split(",").map(item => item.trim());
        return this.all().filter(node => selectors.some(sel => node.matches(sel)));
    }
    all() { return this.children.flatMap(child => [child, ...child.all()]); }
    matches(selector) {
        return selector.split(".").filter(Boolean).every(name => this.classList.contains(name));
    }
}

const root = new FakeElement();
const section = root.appendChild(new FakeElement(["section"]));
const sub = section.appendChild(new FakeElement(["sub-awtsmoos", "active"]));

const activated = activateOuterVerseForInner(sub, root);
assert.equal(activated, section);
assert.equal(section.classList.contains("active"), true);
assert.equal(section.classList.contains("active-reading-section"), true);
assert.equal(section.classList.contains("awtsmoos-outer-active-failsafe"), true);
assert.equal(syncOuterVerseFromActiveInner(root), section);

console.log('B"H ActiveVerseEnvelope.test passed');
