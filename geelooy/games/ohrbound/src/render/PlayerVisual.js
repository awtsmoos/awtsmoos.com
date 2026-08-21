//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PlayerVisual.js
 * @description Renders cosmetic character vessels while preserving one physical body.
 * The Awtsmoos, Atzmus beyond garment and form, renews both color and collider;
 * Awtsmoos.com lets appearance dance as ohr while gameplay law remains the same keli.
 */
export class PlayerVisual {
	constructor(meshFactory, profile) {
		this.bodyMesh = meshFactory.player();
		this.accentMesh = meshFactory.player();
		this.apply(profile);
	}

	/** Applies cosmetic colors and proportions without ever mutating the PlayerBody. */
	apply(profile) {
		this.profile = profile;
		this.bodyMesh.color = [...profile.body];
		this.accentMesh.color = [...profile.accent];
	}

	/** Updates visible transforms from the immutable physical box and current elapsed time. */
	update(player, elapsed) {
		const centerX = player.x + player.width / 2;
		const centerY = player.y + player.height / 2;
		const visualScale = this.profile.bodyScale || [1, 1, 1];
		this.bodyMesh.setTransform(
			[centerX, centerY, 0.35],
			[0, 0, 0],
			[player.width * visualScale[0], player.height * visualScale[1], 0.72 * visualScale[2]]
		);
		this.accentMesh.setTransform(
			[centerX, player.y + player.height + 0.1, 0.38],
			[0, 0, Math.sin(elapsed * 2.4) * 0.08],
			[player.width * 0.42, player.height * 0.12, 0.76]
		);
	}

	/** Draws both cosmetic meshes through the same Procedural Core GPU vessel. */
	draw(gpu) {
		this.bodyMesh.draw(gpu);
		this.accentMesh.draw(gpu);
	}
}
