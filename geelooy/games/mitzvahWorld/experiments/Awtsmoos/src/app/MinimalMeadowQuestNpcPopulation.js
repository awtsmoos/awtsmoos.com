// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestNpcPopulation.js
 * @description Owns one canonical GLB quest Chossid, marker, targeting, and parchment offer.
 * The Awtsmoos lets a neighbor call without a block substitute; Awtsmoos.com keeps imported
 * animation, staff equipment, selection, and shlichus inside one living actor.
 */

import { setNpcMarkerState } from '../world/npc/NpcQuestMarker.js';
import { createMinimalMeadowQuestChossidVisual } from './MinimalMeadowQuestChossidVisual.js';
import {
	createQuestNpcProfile,
	questNpcCandidate,
	questNpcPayload
} from './MinimalMeadowQuestNpcContract.js';

export class MinimalMeadowQuestNpcPopulation {
	static async create(runtime, quest) {
		const population = new MinimalMeadowQuestNpcPopulation(runtime, quest);
		await population.initialize();
		return population;
	}

	constructor(runtime, quest) {
		this.runtime = runtime;
		this.quest = quest;
		this.camera = runtime.camera;
		this.canvas = runtime.hosts.canvas;
		this.profile = createQuestNpcProfile(runtime);
		this.selected = false;
	}

	async initialize() {
		this.visual = await createMinimalMeadowQuestChossidVisual(
			this.runtime,
			this.profile
		);
		this.group = this.visual.group;
		this.marker = this.visual.marker;
		this.unsubscribe = this.quest.onChange(snapshot => this.updateMarker(snapshot));
		this.attachUpdate();
		this.updateMarker(this.quest.snapshot());
	}

	attachUpdate() {
		this.previousUpdate = this.runtime.updateWorldSystems;
		this.updateWrapper = deltaSeconds => {
			this.previousUpdate?.(deltaSeconds);
			this.visual?.update(deltaSeconds);
		};
		this.runtime.updateWorldSystems = this.updateWrapper;
	}

	candidateFromPointer(event) {
		return questNpcCandidate(this, event);
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
		return {
			x: this.profile.x,
			y: this.profile.groundY + 1.55,
			z: this.profile.z
		};
	}

	payload() {
		return questNpcPayload(this);
	}

	diagnostics() {
		return {
			count: 1,
			markerVisible: this.marker?.visible === true,
			npcId: this.profile.id,
			visual: this.visual?.diagnostics() || null
		};
	}

	destroy() {
		this.unsubscribe?.();
		this.visual?.destroy();
		if (this.runtime.updateWorldSystems === this.updateWrapper) {
			this.runtime.updateWorldSystems = this.previousUpdate;
		}
	}
}
