//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

/**
 * @file lazy-startup-contract.test.mjs
 * @description Protects Seven Mitzvos lightweight shell ownership from renderer,
 * city, Realm, and multi-game static-import regressions.
 * The Awtsmoos reveals each world only when its route calls; Awtsmoos.com keeps
 * shell readiness truthful, immediate, and independent from heavyweight hydration.
 */
const root = path.resolve(import.meta.dirname, '..');
const gamesRoot = path.resolve(root, '..');
const read = relative => readFileSync(path.join(root, relative), 'utf8');
const readGames = relative => readFileSync(path.join(gamesRoot, relative), 'utf8');
const STATIC_HEAVY = /import\s+[^;]+from\s+['"]\.\.\/(?:city|open-world|realm|views|games3d)\//;

/** Shell must own routing before any heavyweight route implementation loads. */
test('app shell owns routing without static heavyweight imports', () => {
	const app = read('js/app/seven-mitzvos-app.js');
	assert.doesNotMatch(app, STATIC_HEAVY);
	assert.match(app, /AppRouteServices/);
	const routerStart = app.indexOf('this.router.start(');
	const ready = app.indexOf("document.body.dataset.sevenMitzvosReady = 'true';");
	assert.ok(routerStart >= 0 && ready > routerStart, 'readiness must follow router ownership');
});

/** Dynamic imports live behind the route factories rather than in the app shell. */
test('route factories keep city, games, Realm, and professions lazy', () => {
	const routes = read('js/app/app-route-services.js');
	const world = read('js/app/app-world-route-services.js');
	const factories = read('js/app/route-service-factories.js');
	assert.doesNotMatch(routes, STATIC_HEAVY);
	assert.doesNotMatch(world, STATIC_HEAVY);
	assert.match(factories, /import\('\.\.\/city\/living-city-service\.js'\)/);
	assert.match(factories, /import\('\.\.\/open-world\/open-world-session\.js'\)/);
	assert.match(factories, /import\('\.\.\/views\/game-shell\.js'\)/);
	assert.match(factories, /import\('\.\.\/realm\/realm-session\.js'\)/);
	assert.match(factories, /import\('\.\.\/open-world\/world-profession-bridge\.js'\)/);
	assert.match(world, /scheduleDeferredRoute/);
});

/** Seven semantic game IDs remain stable while constructors become on-demand. */
test('game registry imports only the selected native-3D world on demand', () => {
	const registry = read('js/games3d/game-registry.js');
	assert.doesNotMatch(registry, /^import\s/m);
	for (const id of [
		'false-powers', 'words-of-creation', 'every-life', 'households',
		'honest-market', 'living-sanctuary', 'court-of-nations'
	]) {
		assert.match(registry, new RegExp(`['"]${id}['"]\\s*:\\s*\\(\\) => import\\(`));
	}
	assert.equal((registry.match(/:\s*\(\) => import\(/g) || []).length, 7);
});

/** Late constructor hydration must never resurrect a route that has been left. */
test('game session is generation-safe across lazy constructor hydration', () => {
	const session = read('js/app/game-session.js');
	assert.match(session, /await loadGame\(definition\.id\)/);
	assert.match(session, /generation !== this\.generation/);
	assert.match(session, /this\.generation \+= 1/);
});

/** Browser smoke must observe real shell ownership rather than static DOM existence. */
test('gameplay smoke waits for authoritative shell readiness', () => {
	const probe = readGames('scripts/diagnostics/gameplay-smoke/probes/seven-mitzvos.mjs');
	assert.match(probe, /document\.body\.dataset\.sevenMitzvosReady === 'true'/);
	assert.doesNotMatch(probe, /worldHud.*hubLayer|hubLayer.*worldHud/);
	assert.match(probe, /15000/);
});
