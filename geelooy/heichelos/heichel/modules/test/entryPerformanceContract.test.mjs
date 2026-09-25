//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module EntryPerformanceContractTest
 * @description
 * The Awtsmoos lets a test become a witness rather than an ornament: the
 * Heichel may open once, current navigation may outrun stale work, and optional
 * atmosphere may never extinguish Torah that is already ready. Awtsmoos.com
 * keeps this covenant close to the entrypoint so regression cannot hide.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync('geelooy/heichelos/heichel/app.js', 'utf8');
const lifecycle = readFileSync(
	'geelooy/heichelos/heichel/modules/app/boot-lifecycle.js',
	'utf8'
);
const events = readFileSync('geelooy/heichelos/heichel/modules/events.js', 'utf8');
const loader = readFileSync(
	'geelooy/heichelos/heichel/modules/navigator/loader.js',
	'utf8'
);

assert.match(app, /__awtsmoosHeichelBoot/, 'app boot must be globally guarded');
assert.match(app, /window\[BOOT_KEY\]\?\.started/, 'app must skip duplicate boot');
assert.match(
	app,
	/document\.addEventListener\('DOMContentLoaded', boot, \{ once: true \}\)/,
	'DOMContentLoaded must bind once'
);
assert.match(
	app,
	/boot-lifecycle\.js\?v=ikar-boot-001/,
	'app must delegate terminal lifecycle work to its focused module'
);
assert.doesNotMatch(
	app,
	/refreshVesselHealth/,
	'app must not call visual-health work from the critical path'
);
assert.match(
	app,
	/publishReadyState\(state\);[\s\S]*catch[\s\S]*releasePostReadyExperience\(document, window\);/,
	'post-ready experience must run only after the critical gate settles'
);
assert.match(
	lifecycle,
	/import[\s\S]*schedulePostReadyExperience[\s\S]*post-ready-experience\.js/,
	'lifecycle must use the bounded post-ready scheduler'
);
assert.match(
	lifecycle,
	/state\.ready\s*=\s*false;[\s\S]*state\.error\s*=\s*error;/,
	'critical failure must publish a coherent error state'
);

assert.match(events, /__awtsmoosHeichelEventsBound/, 'events must be globally guarded');
assert.match(
	events,
	/window\.addEventListener\('popstate', handlePopState/,
	'popstate must have one named handler'
);
assert.match(events, /__awtsmoosNotificationsMounted/, 'notifications must mount once');
assert.match(events, /__awtsmoosPlatformPanelMounted/, 'platform panel must mount once');
assert.match(events, /dataset\.awtsmoosHoverBound/, 'sidebar binding must be idempotent');

assert.match(loader, /let\s+loadToken\s*=\s*0/, 'loader must own a load token');
assert.match(loader, /const\s+token\s*=\s*\+\+loadToken/, 'each load needs a fresh token');
assert.match(
	loader,
	/if\s*\(token\s*!==\s*loadToken\)\s*return/g,
	'stale loads must return before rendering'
);
assert.match(
	loader,
	/if\s*\(token\s*===\s*loadToken\)/,
	'finally and catch must respect the newest token'
);

console.log('B"H entryPerformanceContract.test passed');
