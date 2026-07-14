// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file NpcChossid.js
 * @description Owns one friendly actor's LOD, animation cadence, and Shlichus interaction.
 * The Awtsmoos renews the person through every distance; Awtsmoos.com grants full bones
 * near dialogue, a merged silhouette far away, and complete visual rest beyond interest.
 */

import {
	npcDistanceToPlayer,
	resolveNpcLod
} from './npc/NpcLodPolicy.js';
import { npcPointerHits } from './npc/NpcPointerRay.js';
import { setNpcMarkerState } from './npc/NpcQuestMarker.js';
import {
	createNpcChossidVisual,
	faceNpcModelToPlayer
} from './npc/NpcChossidVisual.js';

export class NpcChossid {
	constructor(options) {
		this.profile = options.profile;
		this.bus = options.bus;
		this.camera = options.camera;
		this.canvas = options.canvas;
		this.health = 100;
		this.selected = false;
		this.dialogueOpen = false;
		this.lastHit = false;
		this.animationClock = 0;
		this.lod = resolveNpcLod(Infinity);
		Object.assign(
			this,
			createNpcChossidVisual(
				this.profile,
				options.gltf,
				options.ground
			)
		);
	}
	update(deltaTime, playerState) {
		const distance = npcDistanceToPlayer(this.profile, playerState);
		this.lod = resolveNpcLod(distance, { selected: this.selected });
		this.model.visible = this.lod.fullModel;
		this.proxy.visible = this.lod.proxyModel;
		setNpcMarkerState(this.marker, {
			questVisible: Boolean(this.profile.questId)
				&& this.lod.id !== 'dormant',
			selected: this.selected
		});
		this.animationClock += deltaTime;
		if (!this.lod.fullModel) return;
		if (this.animationClock < this.lod.updateInterval) return;
		this.player.update(this.animationClock);
		this.animationClock = 0;
		faceNpcModelToPlayer(this.model, this.profile, playerState);
	}
	hitPointer(event) {
		if (this.lod.id === 'dormant') return false;
		const hit = npcPointerHits(
			event,
			this.camera,
			this.canvas,
			this.targetHint()
		);
		this.lastHit = hit;
		return hit;
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
			this.bus.emit('quest:offer', {
				questId: this.profile.questId
			});
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
		return {
			x: this.profile.x,
			y: this.model.position.y + 1.35,
			z: this.profile.z
		};
	}
	debug() {
		return {
			...this.payload(),
			dialogueOpen: this.dialogueOpen,
			lastHit: this.lastHit,
			lod: this.lod.id,
			position: this.targetHint()
		};
	}
}
