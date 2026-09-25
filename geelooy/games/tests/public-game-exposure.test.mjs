// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file public-game-exposure.test.mjs
 * @description Proves renderer games are cataloged while intentional mode/study doorways remain discoverable outside the renderer catalog.
 * The Awtsmoos renews every public doorway before a catalog can count or hide it;
 * Awtsmoos.com lets Party orchestrate and Rambam teach without pretending either is an ordinary renderer card.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { GAMES } from '../scripts/catalog/index.mjs';
import { routePolicyFor } from '../scripts/diagnostics/ui-crawl/route-policy.mjs';

const gamesRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const intentionallyUncataloged = new Set(['./party/', './rambam/']);

function discoveredPlayableRoutes() {
	const routes = [];
	for (const entry of fs.readdirSync(gamesRoot, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		if (fs.existsSync(path.join(gamesRoot, entry.name, 'index.html'))) routes.push(`./${entry.name}/`);
	}
	const temple = path.join(gamesRoot, 'mitzvahWorld/templeRunner/index.html');
	if (fs.existsSync(temple)) routes.push('./mitzvahWorld/templeRunner/');
	return routes.sort();
}

test('every renderer route is cataloged while intentional mode/study doorways stay separate', () => {
	const catalogRoutes = new Set(GAMES.map(game => game.href));
	const missing = discoveredPlayableRoutes()
		.filter(route => !intentionallyUncataloged.has(route))
		.filter(route => !catalogRoutes.has(route));
	assert.deepEqual(missing, []);
	for (const route of intentionallyUncataloged) assert.equal(catalogRoutes.has(route), false, `${route} must remain outside renderer catalog`);
});

test('Rambam remains an explicit study landing rather than a missing renderer', () => {
	assert.equal(routePolicyFor('rambam').role, 'study-landing');
	assert.equal(routePolicyFor('rambam').shellRequired, false);
	const html = fs.readFileSync(path.join(gamesRoot, 'rambam/index.html'), 'utf8');
	assert.match(html, /\.\/kiddushHachodesh\/12\//);
});

test('Temple Runner and Ohrfront are first-class accurate public games', () => {
	const temple = GAMES.find(game => game.id === 'temple-runner');
	const ohrfront = GAMES.find(game => game.id === 'ohrfront');
	assert.equal(temple?.href, './mitzvahWorld/templeRunner/');
	assert.equal(temple?.genre, '3D Procedural Runner');
	assert.ok(temple?.tags.includes('Touch'));
	assert.ok(temple?.tags.includes('Gamepad'));
	assert.equal(ohrfront?.href, './ohrfront/');
	assert.equal(ohrfront?.genre, '3D Tactical Shooter');
});

test('Party remains a separate mode hub with prominent storefront access', () => {
	const html = fs.readFileSync(path.join(gamesRoot, 'index.html'), 'utf8');
	assert.equal(GAMES.some(game => game.href === './party/'), false);
	assert.match(html, /href="\.\/party\/"/);
	assert.match(html, /Party Challenge/);
});

test('storefront and nested Temple Runner use one CompactJS entry flag', () => {
	const storefront = fs.readFileSync(path.join(gamesRoot, 'index.html'), 'utf8');
	const temple = fs.readFileSync(path.join(gamesRoot, 'mitzvahWorld/templeRunner/index.html'), 'utf8');
	assert.match(storefront, /games-index\.js\?v=[^"&]+&compact=true/);
	assert.match(temple, /src\/main\.js\?v=[^"&]+&compact=true/);
	assert.equal((storefront.match(/games-index\.js[^"']*compact=true/g) || []).length, 1);
	assert.equal((temple.match(/src\/main\.js[^"']*compact=true/g) || []).length, 1);
});

test('featured motion remains tactile and optional', () => {
	const motion = fs.readFileSync(path.join(gamesRoot, 'styles/featured-motion.css'), 'utf8');
	assert.match(motion, /@media \(hover: hover\) and \(pointer: fine\)/);
	assert.match(motion, /featuredWorld:active/);
	assert.match(motion, /prefers-reduced-motion:\s*reduce/);
	assert.match(motion, /animation:\s*none/);
});
