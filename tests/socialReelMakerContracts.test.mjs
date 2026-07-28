// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialReelMakerContractsTest
 * @description
 * The Awtsmoos guards upload-first and a fast full NLE iframe whose optional 3D
 * world remains isolated from the parent social composer and ordinary gameplay.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('reel surface offers upload and MitzvahWorld NLE generation', () => {
	const view = source('geelooy/social-composer/js/reel/ReelMakerView.js');
	assert.ok(view.includes('Upload video'));
	assert.ok(view.includes('Create in MitzvahWorld'));
	assert.ok(view.includes('Render and attach'));
	assert.ok(view.includes('Open full studio'));
});

test('parent bridge points to the responsive social studio host', () => {
	const frame = source('geelooy/social-composer/js/reel/ReelStudioFrame.js');
	const workflow = source('geelooy/social-composer/js/reel/ReelStudioWorkflow.js');
	assert.ok(frame.includes('/social-composer/reel-studio/'));
	assert.ok(frame.includes('chossid-journey-30s.json'));
	assert.ok(frame.includes('iframe.contentWindow?.AwtsmoosMovie'));
	assert.ok(workflow.includes('waitForReelStudio(maker.frame)'));
	assert.ok(workflow.includes('renderAndAttachReel('));
});

test('parent social reel modules import no game source', () => {
	const folder = path.join(root, 'geelooy/social-composer/js/reel');
	for (const file of fs.readdirSync(folder).filter(name => name.endsWith('.js'))) {
		const value = fs.readFileSync(path.join(folder, file), 'utf8');
		assert.ok(!value.includes('/games/mitzvahWorld/experiments/Awtsmoos/src/'));
		assert.ok(!value.includes("from '../../../games"));
	}
});

test('composer assembly and six mobile tools expose Reel', () => {
	const assembly = source('geelooy/social-composer/js/ComposerAssembly.js');
	const hierarchy = source('geelooy/social-composer/js/civilization/mobileHierarchy.js');
	assert.ok(assembly.includes('createReelAssembly({ editor, status })'));
	assert.ok(hierarchy.includes("['reel', '▶', 'Reel']"));
	const tools = hierarchy.match(/\['[^']+', '[^']+', '[^']+'\]/g) || [];
	assert.equal(tools.length, 6);
});

test('full 3D source appears only in the optional world host', () => {
	const main = source('geelooy/social-composer/reel-studio/boot.js');
	const world = source('geelooy/social-composer/reel-studio/world-boot.js');
	assert.ok(!main.includes('/games/mitzvahWorld/experiments/Awtsmoos/src/'));
	assert.ok(world.includes('/games/mitzvahWorld/experiments/Awtsmoos/src/movie/MovieStudio.js'));
});
