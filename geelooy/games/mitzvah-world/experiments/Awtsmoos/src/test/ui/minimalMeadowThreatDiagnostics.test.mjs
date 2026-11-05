// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowThreatDiagnostics.test.mjs
 * @description Proves combat warnings and F3 diagnostics derive from existing runtime truth.
 * The Awtsmoos reveals danger and evidence without adding a second simulation; Awtsmoos.com keeps
 * threat wording, safe outcomes, pointer transparency, and diagnostic snapshots bounded and deliberate.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	RUNTIME_DIAGNOSTICS_CSS
} from '../../ui/MinimalMeadowRuntimeDiagnosticsStyles.js';
import {
	minimalMeadowRuntimeDiagnosticSnapshot
} from '../../ui/MinimalMeadowRuntimeDiagnosticsPanel.js';
import {
	REGION_BANNER_CSS
} from '../../ui/MinimalMeadowRegionBannerStyles.js';
import {
	THREAT_INDICATOR_CSS
} from '../../ui/MinimalMeadowThreatIndicatorStyles.js';
import { threatReceipt } from '../../ui/MinimalMeadowThreatIndicator.js';

test('B"H threat receipts distinguish windup, avoidance, safety, and blocked damage', () => {
	const cast = threatReceipt('enemy:cast', {
		duration: 1.8,
		enemy: { name: 'Ash Demon' },
		letters: 'אש'
	});
	const miss = threatReceipt('enemy:miss', {});
	const returned = threatReceipt('enemy:return', { name: 'Ash Demon' });
	const blocked = threatReceipt('player:damage-blocked', {});
	assert.equal(cast.level, 'danger');
	assert.match(cast.title, /Ash Demon/);
	assert.match(cast.title, /אש/);
	assert.equal(cast.duration, 1800);
	assert.equal(miss.level, 'safe');
	assert.match(miss.title, /avoided/);
	assert.equal(returned.level, 'safe');
	assert.match(returned.title, /broke pursuit/);
	assert.equal(blocked.level, 'safe');
	assert.match(blocked.title, /blocked/);
});

test('B"H diagnostics snapshot reads live region, quality, actors, quest, renderer, water, and combat', () => {
	const selected = actor('Chosen Shadow', true, true);
	const runtime = {
		adaptiveQuality: { snapshot: () => ({ averageFps: 52, level: 'balanced' }) },
		combatBalance: { diagnostics: () => ({ activeMelee: 1, activeRanged: 0 }) },
		enemies: {
			actors: [selected, actor('Waiting Shadow', true, false), actor('Fallen', false, false)],
			selected
		},
		quest: { snapshot: () => ({ progress: 3, status: 'active' }) },
		regions: { snapshot: () => ({ name: 'River Rise', safe: false }) },
		renderer: { backend: 'webgl', stats: { draws: 144, triangles: 220000 } },
		water: { diagnostics: () => ({ hydrationState: 'textured-water-ready' }) }
	};
	const snapshot = minimalMeadowRuntimeDiagnosticSnapshot(runtime);
	assert.deepEqual(snapshot.enemies, {
		alive: 2,
		engaged: 1,
		selected: 'Chosen Shadow',
		total: 3
	});
	assert.equal(snapshot.quality.level, 'balanced');
	assert.equal(snapshot.region.name, 'River Rise');
	assert.equal(snapshot.renderer.backend, 'webgl');
	assert.equal(snapshot.water.hydrationState, 'textured-water-ready');
	assert.equal(snapshot.combat.activeMelee, 1);
});

test('B"H transient overlays ignore pointers and diagnostics remain hidden by default', () => {
	assert.match(REGION_BANNER_CSS, /pointer-events:\s*none/);
	assert.match(THREAT_INDICATOR_CSS, /pointer-events:\s*none/);
	assert.match(RUNTIME_DIAGNOSTICS_CSS, /\[hidden\]\s*\{\s*display:\s*none/);
	assert.match(RUNTIME_DIAGNOSTICS_CSS, /pointer-events:\s*auto/);
});

function actor(name, alive, engaged) {
	return {
		alive,
		combat: { session: { active: engaged } },
		profile: { name }
	};
}
