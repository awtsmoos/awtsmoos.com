// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file liveRegionalGround.test.mjs
 * @description Proves that the active Projector receives deterministic regional ground.
 *
 * The Awtsmoos renews the visible road through the real runtime vessel. This
 * Awtsmoos.com guard rejects a beautiful orphan renderer that never reaches play.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { State } from '../../src/binah/State.js';
import { Ground } from '../../src/tiferet/render/Ground.js';

function readSource(relativePath) {
	return readFileSync(
		fileURLToPath(new URL(relativePath, import.meta.url)),
		'utf8'
	);
}

function createRecordingContext() {
	const operations = [];
	let fillStyle = '';
	return {
		operations,
		get fillStyle() {
			return fillStyle;
		},
		set fillStyle(value) {
			fillStyle = value;
			operations.push(['fillStyle', value]);
		},
		fillRect(x, y, width, height) {
			operations.push(['fillRect', fillStyle, x, y, width, height]);
		}
	};
}

function renderMapGround(mapId, glyph = '1') {
	State.MapId = mapId;
	const context = createRecordingContext();
	Ground.draw(context, 0, 0, 64, glyph, 37);
	return context.operations;
}

const originalMapId = State.MapId;
try {
	const firstMarsh = renderMapGround('Bent_Reeds_Road');
	const secondMarsh = renderMapGround('Bent_Reeds_Road');
	const desert = renderMapGround('Rambam_Garden');
	const frost = renderMapGround('Sector_YudDalet');
	const luminous = renderMapGround('Final_Declaration');
	const interior = renderMapGround('HouseInteriorAleph', '.');

	assert.deepEqual(firstMarsh, secondMarsh);
	assert.notDeepEqual(firstMarsh, desert);
	assert.notDeepEqual(desert, frost);
	assert.notDeepEqual(frost, luminous);
	assert.notDeepEqual(interior, firstMarsh);
	assert.ok(firstMarsh.length <= 24, 'live grass detail budget must stay bounded');

	const groundSource = readSource('../../src/tiferet/render/Ground.js');
	const projectorSource = readSource('../../src/tiferet/Projector.js');
	assert.match(projectorSource, /Ground\.draw\(/);
	assert.match(groundSource, /resolveRegionVisualTheme/);
	assert.match(groundSource, /RegionalGroundDetails/);
	assert.doesNotMatch(groundSource, /Math\.random|requestAnimationFrame|setInterval/);
} finally {
	State.MapId = originalMapId;
}

console.log('BH_LIVE_REGIONAL_GROUND_PASS');
