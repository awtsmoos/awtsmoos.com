// B"H
/** Owns one exact chossid.glb actor's skeletal animation, walking route, LOD cadence, and Shlichus. */
import { npcDistanceToPlayer, resolveNpcLod } from './npc/NpcLodPolicy.js';
import { npcPointerHits } from './npc/NpcPointerRay.js';
import { setNpcMarkerState } from './npc/NpcQuestMarker.js';
import {
	createNpcChossidVisual,
	faceNpcModelAlongPath,
	faceNpcModelToPlayer
} from './npc/NpcChossidVisual.js';

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
		this.animationClock = 0;
		this.elapsed = 0;
		this.worldX = this.profile.x;
		this.worldZ = this.profile.z;
		this.lod = resolveNpcLod(Infinity);
		Object.assign(this, createNpcChossidVisual(this.profile, options.gltf, options.ground));
		this.worldY = this.groundY + this.footOffset;
	}

	update(deltaTime, playerState) {
		this.elapsed += deltaTime * (this.profile.motionSpeed || 0);
		this.updateRoute();
		const distance = npcDistanceToPlayer({ x: this.worldX, z: this.worldZ }, playerState);
		this.lod = resolveNpcLod(distance, { selected: this.selected });
		this.model.visible = this.lod.fullModel;
		this.proxy.visible = false;
		setNpcMarkerState(this.marker, {
			questVisible: Boolean(this.profile.questId) && this.lod.id !== 'dormant',
			selected: this.selected
		});
		this.animationClock += deltaTime;
		if (!this.lod.fullModel) return;
		if (this.animationClock >= this.lod.updateInterval) {
			this.player.update(this.animationClock);
			this.animationClock = 0;
			this.worldY = this.ground.heightAt(this.worldX, this.worldZ) + this.footOffset;
		}
		this.model.position.set(this.worldX, this.worldY, this.worldZ);
		this.moveMarker();
		if (this.selected || !this.profile.wanderRadius) {
			faceNpcModelToPlayer(this.model, { x: this.worldX, z: this.worldZ }, playerState);
		} else {
			faceNpcModelAlongPath(this.model, this.elapsed, this.profile.motionPhase || 0);
		}
	}

	updateRoute() {
		const radius = this.profile.wanderRadius || 0;
		const phase = this.profile.motionPhase || 0;
		this.worldX = this.profile.x + Math.cos(this.elapsed + phase) * radius;
		this.worldZ = this.profile.z + Math.sin((this.elapsed + phase) * 0.83) * radius * 0.72;
	}

	moveMarker() {
		this.marker.position.set(
			this.worldX - this.profile.x,
			this.worldY - (this.groundY + this.footOffset),
			this.worldZ - this.profile.z
		);
	}

	hitPointer(event) {
		if (this.lod.id === 'dormant') return false;
		const hit = npcPointerHits(event, this.camera, this.canvas, this.targetHint());
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
		if (this.profile.questId) this.bus.emit('quest:offer', { questId: this.profile.questId });
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
			dialogueOpen: this.dialogueOpen,
			lastHit: this.lastHit,
			lod: this.lod.id,
			modelSource: 'chossid.glb',
			position: this.targetHint()
		};
	}
}
