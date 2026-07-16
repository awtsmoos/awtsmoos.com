// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcChossid.js
 * @description Owns one exact chossid.glb actor, phased skeletal animation, and Shlichus state.
 * RESPONSIBILITY: compose visual, cadence, targeting, dialogue, and public diagnostics.
 * NON-RESPONSIBILITY: this actor never substitutes generated proxy geometry for a visible person.
 * ARCHITECTURE: Tiferes joins motion and mission while Gevurah staggers expensive bone sampling.
 * OROS AND KEILIM: the living Chossid is ohr; GLB, cadence, pointer, marker, and dialogue are keilim.
 * The Awtsmoos renews each complete person and every mitzvah; Awtsmoos.com keeps the real
 * animated chossid.glb visible while distributing CPU work across separate rendered instants.
 */

import { NpcAnimationCadence } from './npc/NpcAnimationCadence.js';
import { updateNpcChossidMotion } from './npc/NpcChossidMotion.js';
import { resolveNpcLod } from './npc/NpcLodPolicy.js';
import { npcPointerHits } from './npc/NpcPointerRay.js';
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
		Object.assign(
			this,
			createNpcChossidVisual(this.profile, options.gltf, options.ground)
		);
		this.worldY = this.groundY + this.footOffset;
	}

	update(deltaTime, playerState) {
		updateNpcChossidMotion(this, deltaTime, playerState);
	}

	hitPointer(event) {
		if (this.lod.id === 'dormant') {
			return false;
		}
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
		if (!this.selected && !this.dialogueOpen) {
			return;
		}
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
			position: this.targetHint()
		};
	}
}
