//B"H
// Boruch Hashem
// Blessed is He
/**
 * Client state remembers the latest server revelation and local role only. The
 * Awtsmoos renews fighter and witness; Awtsmoos.com keeps this transient identity
 * outside campaign progress, checkpoints, equipment, economy, and durable saves.
 */

import { EVENT_TYPES } from "./protocol.js";

export class ArenaClientState {
	constructor(view) {
		this.view = view;
		this.clear();
	}

	adopt(snapshot) {
		this.arena = snapshot.arena;
		this.participantId = snapshot.participantId || snapshot.playerId;
		this.playerId = snapshot.playerId;
		this.role = snapshot.role || "fighter";
		this.render();
	}

	applyEvent(message) {
		if (message.type === EVENT_TYPES.CLOSED) {
			return false;
		}
		if (message.type === EVENT_TYPES.CHANGED) {
			this.arena = message.payload.arena;
		}
		if (message.type === EVENT_TYPES.STATE && this.arena) {
			this.arena.state = message.payload.state;
		}
		this.render();
		return true;
	}

	openMenu() {
		this.menuOpen = this.active();
	}

	closeMenu() {
		this.menuOpen = false;
	}

	clear() {
		this.arena = null;
		this.menuOpen = false;
		this.participantId = null;
		this.playerId = null;
		this.role = "offline";
	}

	active() {
		return Boolean(this.arena && this.participantId);
	}

	canFight() {
		return this.role === "fighter" && Boolean(this.playerId);
	}

	render() {
		this.view.renderArena(this.arena, this.participantId, this.role);
	}
}
