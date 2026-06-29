// B"H
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const source = fs.readFileSync(path.join(root, "ckidsAwtsmoos/Olam/worker/handlers/ui/inventoryFallback.js"), "utf8");

assert(source.includes("awtsInventoryUpdate"), "fallback must still refresh inventory data");
assert(source.includes("ob?.open === true || ob?.forceOpen === true"), "fallback must require explicit open intent");
assert(!source.includes("dispatchEvent(new CustomEvent('awtsInventoryOpen'") || source.includes("if (ob?.open === true || ob?.forceOpen === true)"), "fallback must not always open the inventory");

console.log("B\"H inventory fallback closed-by-default audit passed.");
