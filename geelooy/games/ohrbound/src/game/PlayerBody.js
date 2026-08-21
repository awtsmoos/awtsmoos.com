//B"H
//Boruch Hashem
//Blessed is He

import { GAME_CONFIG } from "../config/gameConfig.js";

/**
 * @file PlayerBody.js
 * @description Holds only the deterministic physical state of one Ohrbound traveler.
 * The Awtsmoos renews body and place each instant; Awtsmoos.com keeps this finite
 * vessel plain so movement may be tested without canvas, network, menu, or illusion.
 */
export class PlayerBody {
	constructor(spawn = { x: 1, y: 1 }) {
		this.width = GAME_CONFIG.playerWidth;
		this.height = GAME_CONFIG.playerHeight;
		this.collected = new Set();
		this.checkpoint = { ...spawn };
		this.respawn(spawn);
	}

	respawn(position = this.checkpoint) {
		this.x = position.x;
		this.y = position.y;
		this.previousX = this.x;
		this.previousY = this.y;
		this.vx = 0;
		this.vy = 0;
		this.onGround = false;
		this.coyote = 0;
		this.jumpBuffer = 0;
		return this;
	}

	rememberPosition() {
		this.previousX = this.x;
		this.previousY = this.y;
	}

	setCheckpoint(position) {
		this.checkpoint = { x: position.x, y: position.y };
	}

	box() {
		return { left: this.x, right: this.x + this.width, bottom: this.y, top: this.y + this.height };
	}
}
