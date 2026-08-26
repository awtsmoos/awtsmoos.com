//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PlayerVisual.js
 * @description Adds lean, ascent stretch, and landing squash to cosmetic character vessels only.
 * The Awtsmoos, Atzmus beyond garment and form, renews motion without changing law;
 * Awtsmoos.com lets the visible ohr answer each jump while the physical keli keeps the same draw.
 */
export class PlayerVisual {
	constructor(meshFactory, profile) {
		this.bodyMesh = meshFactory.player();
		this.accentMesh = meshFactory.player();
		this.wasGrounded = false;
		this.landingSquash = 0;
		this.apply(profile);
	}

	/** Applies cosmetic colors and proportions without ever mutating the PlayerBody. */
	apply(profile) {
		this.profile = profile;
		this.bodyMesh.color = [...profile.body];
		this.accentMesh.color = [...profile.accent];
	}

	/** Updates responsive visual transforms from immutable physical position and velocity. */
	update(player, elapsed) {
		this.captureLanding(player);
		this.landingSquash *= 0.82;
		const centerX = player.x + player.width / 2;
		const centerY = player.y + player.height / 2;
		const profileScale = this.profile.bodyScale || [1, 1, 1];
		const verticalStretch = this.verticalStretch(player.vy);
		const squash = this.landingSquash;
		const scaleX = profileScale[0] * (1 - verticalStretch * 0.16 + squash * 0.18);
		const scaleY = profileScale[1] * (1 + verticalStretch * 0.2 - squash * 0.24);
		const lean = this.clamp(-player.vx * 0.012, -0.09, 0.09);
		this.bodyMesh.setTransform(
			[centerX, centerY, 0.35],
			[0, 0, lean],
			[
				player.width * scaleX,
				player.height * scaleY,
				0.72 * profileScale[2]
			]
		);
		this.updateAccent(player, elapsed, centerX, lean);
		this.wasGrounded = player.onGround;
	}

	/** Records one brief cosmetic compression when airborne motion resolves into ground. */
	captureLanding(player) {
		if (!this.wasGrounded && player.onGround) {
			this.landingSquash = this.clamp(Math.abs(player.vy) / 10, 0.22, 0.62);
		}
	}

	/** Returns signed vertical stretch around ascent/fall while remaining intentionally small. */
	verticalStretch(velocityY) {
		return this.clamp(velocityY / 13, -0.34, 0.42);
	}

	/** Keeps the accent readable above the body while echoing direction and motion. */
	updateAccent(player, elapsed, centerX, lean) {
		const bob = Math.sin(elapsed * 3.1) * 0.035;
		this.accentMesh.setTransform(
			[centerX, player.y + player.height + 0.1 + bob, 0.38],
			[0, 0, -lean * 1.8 + Math.sin(elapsed * 2.4) * 0.05],
			[player.width * 0.42, player.height * 0.12, 0.76]
		);
	}

	/** Restricts cosmetic response without importing physics or configuration state. */
	clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, value));
	}

	/** Draws both cosmetic meshes through the same Procedural Core GPU vessel. */
	draw(gpu) {
		this.bodyMesh.draw(gpu);
		this.accentMesh.draw(gpu);
	}
}
