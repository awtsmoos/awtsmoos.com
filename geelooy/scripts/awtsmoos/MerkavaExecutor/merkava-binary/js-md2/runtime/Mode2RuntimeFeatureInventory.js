// B"H
'use strict';

/**
 * Chapter 5: The Awtsmoos names the unfinished sparks without shame.
 *
 * This inventory is not a placeholder. It is a compact, importable contract for
 * known MD2 JavaScript runtime/compiler limitations so future work can test the
 * real frontier instead of hunting rumors in chat logs.
 */
const MODE2_RUNTIME_FEATURE_INVENTORY = Object.freeze({
  verifiedNow: Object.freeze([
    'direct MD2 JS execution',
    'functions/arrows/closures',
    'array callbacks map/filter/reduce',
    'objects/properties/method calls',
    'if/else while for do-while switch/break',
    'loop break and labeled break basics',
    'continue and labeled continue basics',
    'for-of arrays and custom iterators',
    'basic generators via lowered yield list',
    'try/catch/finally and throw basics',
    'ternary comparisons compound assignments',
    'delete in optional chaining object spread',
    'computed property get/set/object keys basics',
    'computed property get/set/object keys basics',
    'dynamic spread calls regex literals getters/setters',
    'captured assignment with local declarations',
    'basic classes private fields extends/super',
    'class constructors and static fields/methods basics',
    'class constructors and static fields/methods basics',
    'async-lite await with synchronous shim',
    'ESM named export surface'
  ]),
  notYetSpecComplete: Object.freeze([
    'real generator state machine beyond yield-list lowering',
    'real async microtask/event loop and native timer scheduling',
    'module dependency graph and import resolution',
    'super() initialization rules',
    'full iterator protocol close/throw/return edge cases',
    'proxy and symbol edge semantics',
    'full Promise behavior',
    'typed-array lexical slot runtime for all locals/closures'
  ])
});

/**
 * @returns {typeof MODE2_RUNTIME_FEATURE_INVENTORY} frozen feature map.
 */
function getMode2RuntimeFeatureInventory() {
  return MODE2_RUNTIME_FEATURE_INVENTORY;
}

module.exports = { MODE2_RUNTIME_FEATURE_INVENTORY, getMode2RuntimeFeatureInventory };
