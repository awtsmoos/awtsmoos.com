// B"H
import assert from "node:assert/strict";
import { renderChunked } from "../SmoothScheduler.js";

class Fragment {
    constructor() { this.children = []; }
    appendChild(node) { this.children.push(node); return node; }
}

class Container {
    constructor() { this.children = []; }
    appendChild(node) {
        if (node instanceof Fragment) this.children.push(...node.children);
        else this.children.push(node);
        return node;
    }
}

globalThis.document = { createDocumentFragment: () => new Fragment() };
globalThis.requestAnimationFrame = fn => setTimeout(() => fn(Date.now()), 0);
globalThis.requestIdleCallback = fn => setTimeout(() => fn(), 0);

const container = new Container();
const rendered = await renderChunked([1, 2, 3, 4, 5], value => ({ value }), container, 2);
assert.equal(rendered, 5);
assert.deepEqual(container.children.map(node => node.value), [1, 2, 3, 4, 5]);

console.log('B"H SmoothScheduler.test passed');
