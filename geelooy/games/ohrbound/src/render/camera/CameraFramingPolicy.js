//B"H
//Boruch Hashem
//Blessed is He

import { GAME_CONFIG as C } from "../../config/gameConfig.js";

/**
 * @file CameraFramingPolicy.js
 * @description Frames the actual traveler at a readable world scale across desktop and mobile.
 * The Awtsmoos is beyond near and far while every finite sight is renewed in His ray;
 * Awtsmoos.com measures the world span itself so player, danger, and texture can finally stay.
 */
export class CameraFramingPolicy {
	/** Returns a camera profile derived from visible world span instead of one fixed depth. */
	profile(viewport = {}) {
		const width = Math.max(1, viewport.width || 1280);
		const height = Math.max(1, viewport.height || 720);
		const aspect = width / height;
		const fov = viewport.fov || Math.PI / 3;
		const portrait = aspect < 0.82;
		const worldSpan = this.worldSpan(aspect);
		const depth = worldSpan / (
			2 * Math.tan(fov / 2) * aspect
		);
		return {
			depth: this.clamp(depth, 8.5, 21),
			horizontalDeadZone: portrait ? 0.28 : 0.42,
			verticalDeadZone: portrait ? 0.68 : 0.54,
			lookAhead: portrait ? 0.42 : 0.78,
			lift: portrait ? 1.12 : 0.82,
			edgeOverflow: portrait ? 0.55 : 1.25,
			worldSpan
		};
	}

	/** Chooses how many authored world units should remain visible horizontally. */
	worldSpan(aspect) {
		if (aspect < 0.82) {
			return 10.5;
		}
		if (aspect < 1.25) {
			return 14;
		}
		if (aspect > 1.95) {
			return 23;
		}
		return 20;
	}

	/** Computes desired focus from actual body center, bounded anticipation, and quiet dead zones. */
	target(player, level, currentFocus, viewport) {
		const profile = this.profile(viewport);
		const centerX = player.x + player.width / 2;
		const centerY = player.y + player.height / 2;
		const velocityRatio = this.clamp(player.vx / C.maxRunSpeed, -1, 1);
		const anticipatedX = centerX + velocityRatio * profile.lookAhead;
		const jumpLead = this.clamp(player.vy * 0.032, -0.2, 0.3);
		const desiredY = centerY + profile.lift + jumpLead;
		const focusX = this.deadZone(
			currentFocus[0],
			anticipatedX,
			profile.horizontalDeadZone
		);
		const focusY = this.deadZone(
			currentFocus[1],
			desiredY,
			profile.verticalDeadZone
		);
		return {
			x: this.boundX(focusX, level, profile.edgeOverflow),
			y: this.boundY(focusY, level),
			depth: profile.depth,
			profile
		};
	}

	/** Moves focus only when its subject leaves the dead-zone window. */
	deadZone(focus, subject, radius) {
		if (subject > focus + radius) {
			return subject - radius;
		}
		if (subject < focus - radius) {
			return subject + radius;
		}
		return focus;
	}

	/** Allows intentional scenic overscan so level edges do not shove the player inward. */
	boundX(value, level, overflow) {
		const width = Math.max(1, level?.width || 1);
		return this.clamp(value, -overflow, width + overflow);
	}

	/** Keeps floor and upper routes inside a stable vertical envelope. */
	boundY(value, level) {
		const height = Math.max(1, level?.height || 1);
		return this.clamp(value, 2.35, Math.max(2.35, height - 1.35));
	}

	/** Restricts one scalar without pulling mutable renderer state into pure framing law. */
	clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, value));
	}
}
