// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestNpcPopulation.js
 * @description Owns one friendly watchman, exclamation marker, pointer talk, and parchment offer.
 * The Awtsmoos lets a neighbor call without coercion; Awtsmoos.com makes selection, parchment,
 * marker visibility, mission readiness, position, and target arbitration share one finite actor.
 */

import { npcPointerHits } from '../world/npc/NpcPointerRay.js';
import { setNpcMarkerState } from '../world/npc/NpcQuestMarker.js';
import { createMinimalMeadowQuestNpcMesh } from './MinimalMeadowQuestNpcMesh.js?v=20260724-meadow-17';

export class MinimalMeadowQuestNpcPopulation {
	constructor(runtime, quest) {
		this.runtime = runtime;
		this.quest = quest;
		this.camera = runtime.camera;
		this.canvas = runtime.hosts.canvas;
		this.profile = profile(runtime);
		const visual = createMinimalMeadowQuestNpcMesh(this.profile, this.profile.groundY);
		this.group = visual.group;
		this.marker = visual.marker;
		this.selected = false;
		this.unsubscribe = quest.onChange(snapshot => this.updateMarker(snapshot));
	}

	candidateFromPointer(event) {
		const hint = this.targetHint();
		if (!npcPointerHits(event, this.camera, this.canvas, hint, 1.05)) return null;
		const camera = this.camera.position;
		return {
			distance: Math.hypot(hint.x - camera.x, hint.y - camera.y, hint.z - camera.z),
			population: this,
			target: this
		};
	}

	activateCandidate() {
		this.selected = true;
		this.runtime.bus.emit('npc:target', this.payload());
		this.quest.offer();
		this.updateMarker(this.quest.snapshot());
	}

	clearAll() {
		this.selected = false;
		this.runtime.bus.emit('npc:clear', this.payload());
		this.updateMarker(this.quest.snapshot());
	}

	updateMarker(snapshot) {
		setNpcMarkerState(this.marker, {
			questVisible: snapshot.status === 'available' || snapshot.status === 'ready',
			selected: this.selected
		});
	}

	targetHint() {
		return { x: this.profile.x, y: this.profile.groundY + 1.55, z: this.profile.z };
	}

	payload() {
		return {
			face: '🧔',
			faction: 'friendly',
			health: 100,
			id: this.profile.id,
			maxHealth: 100,
			name: this.profile.name,
			questId: this.quest.definition.id,
			questStatus: this.quest.status,
			selected: this.selected,
			text: 'The road is unsafe. Will you hear a shlichus?'
		};
	}

	diagnostics() {
		return { count: 1, markerVisible: this.marker.visible, npcId: this.profile.id };
	}

	destroy() {
		this.unsubscribe();
		this.group.parent?.remove(this.group);
	}
}

function profile(runtime) {
	const x = -10;
	const z = -10;
	return {
		groundY: runtime.terrain.heightAt(x, z),
		id: 'reb-mendel',
		name: 'Reb Mendel the Watchman',
		questId: 'three-shadows-before-sunset',
		x,
		z
	};
}
