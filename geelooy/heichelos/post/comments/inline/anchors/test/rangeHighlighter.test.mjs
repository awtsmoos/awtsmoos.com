// B"H
import assert from "node:assert/strict";
import { clearAnchorHighlights, highlightResolvedRange } from "../index.js";

class FakeMark {
    constructor() {
        this.className = "";
        this.dataset = {};
        this.childNodes = ["revealed"];
        this.replacedWith = [];
    }
    replaceWith(...nodes) {
        this.replacedWith = nodes;
    }
}

const created = [];
const doc = {
    createElement(tag) {
        assert.equal(tag, "mark");
        const mark = new FakeMark();
        created.push(mark);
        return mark;
    }
};

const startContainer = { ownerDocument: doc };
let surrounded = null;
const range = {
    collapsed: false,
    startContainer,
    surroundContents(mark) {
        surrounded = mark;
    }
};

const mark = highlightResolvedRange(range, { key: "k-1" });
assert.equal(mark, surrounded);
assert.equal(mark.className, "awtsmoos-inline-anchor-highlight");
assert.equal(mark.dataset.awtsmoosCoordinateKey, "k-1");

const removable = new FakeMark();
const root = { querySelectorAll: () => [removable] };
assert.equal(clearAnchorHighlights(root), 1);
assert.deepEqual(removable.replacedWith, ["revealed"]);

const brokenRange = { collapsed: false, startContainer, surroundContents() { throw new Error("split"); } };
assert.equal(highlightResolvedRange(brokenRange), null);

console.log('B"H rangeHighlighter.test passed');
