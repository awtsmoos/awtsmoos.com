// B"H
/**
 * Chapter 50: The preview page is a small window, not a secret takeover.
 * This test proves the demo is opt-in, styled, and mounted through the bridge.
 */
import { strict as assert } from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';

const demoPath = 'geelooy/heichelos/social/demo/index.html';
assert.ok(existsSync(demoPath), 'demo page exists');

const html = readFileSync(demoPath, 'utf8');
assert.ok(html.includes('data-social-revamp="1"'), 'demo is explicitly opt-in');
assert.ok(html.includes('data-social-revamp-root'), 'demo has a mount target');
assert.ok(html.includes('../styles/index.css'), 'demo loads social styles');
assert.ok(html.includes("../app/bridge.js"), 'demo imports the safe bridge');
assert.ok(html.includes('mountSocialRevampWhenRequested'), 'demo uses the safe mount function');
assert.ok(html.includes('Image and audio post section'), 'demo includes media-aware content');
assert.ok(html.includes('Replies remain branches'), 'demo includes threaded comment content');

console.log('B"H social revamp demo passed');
