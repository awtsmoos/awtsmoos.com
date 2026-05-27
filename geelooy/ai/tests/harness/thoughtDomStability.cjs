//B"H
const path = require("path");
const { pathToFileURL } = require("url");
const { ROOT, assert, test } = require("./assert.cjs");

async function run() {
  return test("thought-open-vessel-defers-innerhtml-rewrite", async () => {
    const suffix = `?h=${Date.now()}${Math.random()}`;
    const mod = await import(pathToFileURL(path.join(ROOT, "js/render/runtime/thoughtVesselStability.js")).href + suffix);
    const vessel = fakeVessel(true);
    const held = mod.holdOpenVessel(vessel, "<p>new</p>");
    assert(held === true, "open vessel must hold pending html", vessel);
    assert(vessel.innerHTML === "<p>old</p>", "open vessel must not rewrite innerHTML", vessel);
    assert(vessel.dataset.pendingInnerEventHtml === "<p>new</p>", "pending html should be stored", vessel);
    vessel.open = false;
    const applied = mod.applyPendingWhenClosed(vessel);
    assert(applied === true, "closed vessel should accept pending html", vessel);
    assert(vessel.innerHTML === "<p>new</p>", "closed vessel should receive pending html", vessel);
    const selected = fakeVessel(false);
    selected.innerHTML = "<p>selected</p>";
    globalThis.getSelection = () => ({
      isCollapsed: false,
      rangeCount: 1,
      getRangeAt: () => ({ intersectsNode: node => node === selected, commonAncestorContainer: selected })
    });
    const selectedHeld = mod.holdOpenVessel(selected, "<p>new selected</p>");
    delete globalThis.getSelection;
    assert(selectedHeld === true, "selected vessel must hold pending html", selected);
    assert(selected.innerHTML === "<p>selected</p>", "selected vessel must not rewrite innerHTML", selected);
    return { held, applied, selectedHeld, finalHtml: vessel.innerHTML };
  });
}

function fakeVessel(open) {
  return {
    open,
    innerHTML: "<p>old</p>",
    dataset: {},
    classList: {
      values: new Set(),
      add(name) { this.values.add(name); },
      remove(name) { this.values.delete(name); }
    },
    contains(node) { return node === this; },
    querySelector(selector) { return selector.includes("details[open]") && this.open ? {} : null; }
  };
}

module.exports = { run };
