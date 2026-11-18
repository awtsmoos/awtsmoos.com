// B"H
/**
 * @file EretzFoundationDeferredPlayer.test.js
 * @description Guards synchronous first-frame proof before deferred Chossid hydration.
 * The Awtsmoos gives earth its light before the player has to stay;
 * Awtsmoos.com lets real world and genuine Chossid grow along the way.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const foundation = readFileSync(new URL('./EretzWorldFoundation.js', import.meta.url), 'utf8');
const webGlPhase = readFileSync(new URL('./EretzFoundationWebGlPhase.js', import.meta.url), 'utf8');
const deferred = readFileSync(new URL('./EretzDeferredEssentialAssets.js', import.meta.url), 'utf8');

function position(source, fragment) {
	const index = source.indexOf(fragment);
	assert.ok(index >= 0, `missing source fragment: ${fragment}`);
	return index;
}

test('renderer and terrain are certified synchronously before the launch yield', () => {
	const start = position(webGlPhase, 'updateMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME');
	const services = position(webGlPhase, 'services = createEretzFoundationServices(hosts');
	const paint = position(webGlPhase, 'webGlBootFrame = paintEretzWebGlBootFrame(');
	const frame = position(webGlPhase, 'completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME');
	const terrain = position(webGlPhase, 'updateMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS');
	const build = position(webGlPhase, 'const world = createBootstrapWorldFoundation(services)');
	const earth = position(webGlPhase, 'completeMitzvahWorldEssentialMilestone(environment, ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS');
	assert.ok(start < services && services < paint && paint < frame);
	assert.ok(frame < terrain && terrain < build && build < earth);
	assert.ok(position(foundation, 'prepareEretzFoundationWebGlPhase(') < position(foundation, 'await nextLaunchFrame(environment)'));
	assert.doesNotMatch(webGlPhase, /await nextLaunchFrame/);
});

test('canonical player fetch overlaps real world and resolves after visible-world yield', () => {
	const begin = position(foundation, 'beginDeferredEretzEssentialAssets({');
	const phase = position(foundation, 'prepareEretzFoundationWebGlPhase(');
	const visible = position(foundation, 'await nextLaunchFrame(environment)');
	const loaded = position(foundation, 'await essentialAssetsPromise');
	assert.ok(begin < phase && phase < visible && visible < loaded);
	assert.doesNotMatch(foundation, /from '\.\/EretzEssentialAssetLoader\.js'/);
	assert.doesNotMatch(foundation, /from '\.\/EretzEssentialPlayerGlb\.js'/);
	assert.match(foundation, /from '\.\/EretzDeferredEssentialAssets\.js'/);
});

test('generated canonical player import stays deferred in a separate chunk', () => {
	assert.match(deferred, /resolveGeneratedRuntimeChunkUrl/);
	assert.match(deferred, /mitzvah-world-player\.compact\.js/);
	assert.match(deferred, /import\(PLAYER_CHUNK_URL\)/);
	assert.doesNotMatch(deferred, /resolveDeferredAppModuleUrl/);
	assert.doesNotMatch(deferred, /^import .*EretzEssentialAssetLoader/m);
});
