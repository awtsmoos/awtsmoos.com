// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcChossid.js
 * @description Owns one exact chossid.glb actor, phased motion, and Shlichus state.
 * The Awtsmoos renews each complete person and every mitzvah; Awtsmoos.com preserves the real
 * animated body while relevance cadences distribute route, ground, pose, marker, and facing work.
 */

import { NpcAnimationCadence } from './npc/NpcAnimationCadence.js';
import { updateNpcChossidMotion } from './npc/NpcChossidMotion.js';
import { resolveNpcLod } from './npc/NpcLodPolicy.js';
import { npcPointerHits } from './npc/NpcPointerRay.js';
import { NpcRelevanceCadence } from './npc/NpcRelevanceCadence.js';
import { createNpcChossidVisual } from './npc/NpcChossidVisual.js';

export class NpcChossid {
	constructor(options) {
		this.profile = options.profile;
		this.bus = options.bus;
		this.camera = options.camera;
		this.canvas = options.canvas;
		this.ground = options.ground;
		this.health = 100;
		this.selected = false;
		this.dialogueOpen = false;
		this.lastHit = false;
		this.elapsed = 0;
		this.worldX = this.profile.x;
		this.worldZ = this.profile.z;
		this.lod = resolveNpcLod(Infinity);
		this.animationCadence = new NpcAnimationCadence(this.profile.id);
		this.motionCadence = new NpcRelevanceCadence(`${this.profile.id}:motion`);
		Object.assign(this, createNpcChossidVisual(
			this.profile,
			options.gltf,
			options.ground
		));
		this.worldY = this.groundY + this.footOffset;
	}

	update(deltaTime, playerState) {
		updateNpcChossidMotion(this, deltaTime, playerState);
	}

	hitPointer(event) {
		if (this.lod.id === 'dormant') return false;
		this.lastHit = npcPointerHits(
			event,
			this.camera,
			this.canvas,
			this.targetHint()
		);
		return this.lastHit;
	}

	target() {
		this.selected = true;
		this.dialogueOpen = false;
		this.bus.emit('npc:target', this.payload());
	}

	dialogue() {
		this.dialogueOpen = true;
		const payload = this.payload();
		this.bus.emit('npc:dialogue', payload);
		if (this.profile.questId) {
			this.bus.emit('quest:offer', { questId: this.profile.questId });
		}
	}

	clear() {
		if (!this.selected && !this.dialogueOpen) return;
		this.selected = false;
		this.dialogueOpen = false;
		this.bus.emit('npc:clear', this.payload());
	}

	payload() {
		return {
			face: '🧔',
			health: this.health,
			id: this.profile.id,
			level: 'Shlichus giver',
			name: this.profile.name,
			questId: this.profile.questId,
			selected: this.selected
		};
	}

	targetHint() {
		return { x: this.worldX, y: this.worldY + 1.35, z: this.worldZ };
	}

	debug() {
		return {
			...this.payload(),
			animation: this.player.diagnostics(),
			animationCadence: this.animationCadence.stats(),
			dialogueOpen: this.dialogueOpen,
			lastHit: this.lastHit,
			lod: this.lod.id,
			modelSource: 'chossid.glb',
			motionCadence: this.motionCadence.stats(),
			position: this.targetHint()
		};
	}
}
