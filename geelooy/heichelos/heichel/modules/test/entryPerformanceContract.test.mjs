// B"H
/**
 * Chapter 287: Entry performance covenant.
 * The Heichel entry must not duplicate boot, stack global listeners, or allow
 * stale fetches to repaint the page after newer navigation.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync('geelooy/heichelos/heichel/app.js', 'utf8');
const events = readFileSync('geelooy/heichelos/heichel/modules/events.js', 'utf8');
const loader = readFileSync('geelooy/heichelos/heichel/modules/navigator/loader.js', 'utf8');

assert.match(app, /__awtsmoosHeichelBoot/, 'app boot must be globally guarded');
assert.match(app, /window\[BOOT_KEY\]\?\.started/, 'app must skip duplicate boot');
assert.match(app, /document\.addEventListener\('DOMContentLoaded', boot, \{ once: true \}\)/, 'DOMContentLoaded must bind once');

assert.match(events, /__awtsmoosHeichelEventsBound/, 'events must be globally guarded');
assert.match(events, /window\.addEventListener\('popstate', handlePopState/, 'popstate must have one named handler');
assert.match(events, /__awtsmoosNotificationsMounted/, 'notifications panel must mount once');
assert.match(events, /__awtsmoosPlatformPanelMounted/, 'platform panel must mount once');
assert.match(events, /dataset\.awtsmoosHoverBound/, 'sidebar click binding must be idempotent');

assert.match(loader, /let\s+loadToken\s*=\s*0/, 'loader must own a load token');
assert.match(loader, /const\s+token\s*=\s*\+\+loadToken/, 'each load must receive a fresh token');
assert.match(loader, /if\s*\(token\s*!==\s*loadToken\)\s*return/g, 'stale loads must return before rendering');
assert.match(loader, /if\s*\(token\s*===\s*loadToken\)/, 'finally/catch must respect newest token');

console.log('B"H entryPerformanceContract.test passed');
