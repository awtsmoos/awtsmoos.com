// B"H
/** Owns one friendly Chossid actor, its visible body, schedule state, and interaction events. */

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
		this.routeCenterX = this.profile.x;
		this.routeCenterZ = this.profile.z;
		this.dailyPeriod = null;
		this.currentAction = 'arriving';
		this.activeScheduleAction = 'arriving';
		this.navigationTarget = this.profile.dailyAnchors?.day?.location || null;
		this.isTravelling = false;
		this.scheduleChanges = 0;
		this.relationshipState = this.profile.relationship?.initial || 'neighbor';
		this.lod = resolveNpcLod(Infinity);
		this.animationCadence = new NpcAnimationCadence(this.profile.id);
		this.motionCadence = new NpcRelevanceCadence(`${this.profile.id}:motion`);
		Object.assign(this, createNpcChossidVisual(this.profile, options.gltf, options.ground));
		this.worldY = this.groundY + this.footOffset;
	}

	update(deltaTime, playerState, worldHour) {
		updateNpcChossidMotion(this, deltaTime, playerState, worldHour);
	}

	hitPointer(event) {
		if (this.lod.id === 'dormant') return false;
		this.lastHit = npcPointerHits(event, this.camera, this.canvas, this.targetHint());
		return this.lastHit;
	}

	target() {
		this.selected = true;
		this.dialogueOpen = false;
		this.bus.emit('npc:target', this.payload());
	}

	dialogue(mode = 'greeting') {
		this.dialogueOpen = true;
		const payload = { ...this.payload(), dialogueMode: mode, dialogueText: this.profile.dialogue?.[mode] || this.profile.dialogue?.greeting };
		this.bus.emit('npc:dialogue', payload);
		this.bus.emit('npc:talk', payload);
		this.bus.emit('quest:event', { count: 1, npcId: this.profile.id, target: this.profile.id, type: 'npc:talk' });
		if (this.profile.questId) this.bus.emit('quest:offer', { questId: this.profile.questId });
	}

	setRelationship(state) {
		if (!state || state === this.relationshipState) return false;
		this.relationshipState = state;
		this.bus.emit('npc:relationship', this.payload());
		return true;
	}

	clear() {
		if (!this.selected && !this.dialogueOpen) return;
		this.selected = false;
		this.dialogueOpen = false;
		this.bus.emit('npc:clear', this.payload());
	}

	payload() {
		return {
			currentAction: this.currentAction,
			dialogueModes: this.profile.dialogueModes,
			face: '🧔',
			health: this.health,
			homeId: this.profile.home?.id || null,
			id: this.profile.id,
			level: this.profile.role || 'Village resident',
			name: this.profile.name,
			navigationTarget: this.navigationTarget,
			period: this.dailyPeriod,
			questId: this.profile.questId,
			relationship: this.relationshipState,
			role: this.profile.role,
			selected: this.selected,
			torah: this.profile.torah,
			vendor: this.profile.vendor,
			workplaceId: this.profile.workplace?.id || null
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
			position: this.targetHint(),
			scheduleChanges: this.scheduleChanges,
			travelling: this.isTravelling
		};
	}
}
