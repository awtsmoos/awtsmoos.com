// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRuntimeDiagnosticsPanel.js
 * @description Provides an F3-toggleable panel backed only by existing runtime diagnostics.
 * The Awtsmoos gathers finite evidence without adding a second simulation; Awtsmoos.com formats
 * region, quality, actors, target, quest, renderer, water, and combat truth only while deliberately open.
 */

import {
	installMinimalMeadowRuntimeDiagnosticsStyles
} from './MinimalMeadowRuntimeDiagnosticsStyles.js';

export class MinimalMeadowRuntimeDiagnosticsPanel {
	constructor(runtime, documentValue, environment = globalThis) {
		this.runtime = runtime;
		this.documentValue = documentValue;
		this.environment = environment;
		this.open = false;
		this.refreshes = 0;
		installMinimalMeadowRuntimeDiagnosticsStyles(documentValue);
		this.root = createPanel(documentValue);
		this.output = this.root.querySelector('pre');
		documentValue.body.append(this.root);
		this.onKeyDown = event => {
			if (event.code === 'F3') {
				event.preventDefault();
				this.toggle();
			}
		};
		this.onClick = event => {
			if (event.target.closest('[data-diagnostics-close]')) this.toggle(false);
		};
		documentValue.addEventListener('keydown', this.onKeyDown);
		this.root.addEventListener('click', this.onClick);
		this.unsubscribe = runtime.bus.on('diagnostics:toggle', event => {
			this.toggle(event?.open);
		});
	}

	toggle(force) {
		this.open = typeof force === 'boolean' ? force : !this.open;
		this.root.hidden = !this.open;
		if (this.open) this.refresh();
		return this.open;
	}

	refresh() {
		if (!this.open) return false;
		const snapshot = minimalMeadowRuntimeDiagnosticSnapshot(this.runtime);
		this.output.textContent = diagnosticText(snapshot);
		this.refreshes += 1;
		return true;
	}

	diagnostics() {
		return { open: this.open, refreshes: this.refreshes };
	}

	destroy() {
		this.unsubscribe?.();
		this.documentValue.removeEventListener('keydown', this.onKeyDown);
		this.root.removeEventListener('click', this.onClick);
		this.root.remove();
	}
}

export function minimalMeadowRuntimeDiagnosticSnapshot(runtime) {
	const enemies = runtime.enemies?.actors || [];
	const selected = runtime.enemies?.selected;
	return Object.freeze({
		combat: runtime.combatBalance?.diagnostics?.() || null,
		enemies: {
			alive: enemies.filter(actor => actor.alive).length,
			engaged: enemies.filter(actor => actor.combat?.session?.active).length,
			selected: selected?.profile?.name || null,
			total: enemies.length
		},
		quality: runtime.adaptiveQuality?.snapshot?.() || null,
		quest: runtime.quest?.snapshot?.() || null,
		region: runtime.regions?.snapshot?.() || null,
		renderer: { backend: runtime.renderer?.backend, ...(runtime.renderer?.stats || {}) },
		water: runtime.water?.diagnostics?.() || null
	});
}

function createPanel(documentValue) {
	const root = documentValue.createElement('aside');
	root.className = 'Awtsmoos-runtime-diagnostics';
	root.hidden = true;
	root.innerHTML = '<header><h2>B\"H Runtime Diagnostics · F3</h2><button type="button" data-diagnostics-close>Close</button></header><pre></pre>';
	return root;
}

function diagnosticText(snapshot) {
	const quality = snapshot.quality || {};
	const region = snapshot.region || {};
	const quest = snapshot.quest || {};
	const renderer = snapshot.renderer || {};
	const water = snapshot.water || {};
	const combat = snapshot.combat || {};
	return [
		`Region: ${region.icon || '🌿'} ${region.name || 'Unknown'} · safe=${Boolean(region.safe)}`,
		`Frame: ${quality.averageFps || 0} FPS · ${quality.averageMilliseconds || 0} ms · ${quality.level || 'unknown'}`,
		`Enemies: ${snapshot.enemies.alive}/${snapshot.enemies.total} alive · ${snapshot.enemies.engaged} engaged · target=${snapshot.enemies.selected || 'none'}`,
		`Quest: ${quest.status || 'none'} · ${quest.progress || 0}/${quest.definition?.objective?.count || 0}`,
		`Renderer: ${renderer.backend || 'unknown'} · draws=${renderer.draws || 0} · triangles=${renderer.triangles || 0}`,
		`Water: ${water.hydrationState || 'none'} · normals=${water.normalMode || 'none'} · color=${water.colorMode || 'none'}`,
		`Threat slots: melee=${combat.activeMelee || 0} · ranged=${combat.activeRanged || 0} · blocked=${combat.blockedHits || 0}`
	].join('\n');
}
