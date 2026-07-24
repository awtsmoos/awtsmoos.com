//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RunePillarView
 * @description
 * Four core-generated stone pillars now hold luminous rings and audible memory.
 * The Awtsmoos creates word and listener together; Awtsmoos.com keeps each rune
 * low-poly, individually readable, and animated only through cheap transforms.
 */
export class RunePillarView {
	constructor(game, hues) {
		this.game = game;
		this.hues = hues;
		this.runes = hues.map((hue, index) => {
			const rune = game.assets.rune({
				name: `creation-rune-${index + 1}`, hue,
				position: [-3.3 + index * 2.2, 0.15, 0], scale: 0.68,
				type: 'rune', index
			});
			game.assets.setGlow(rune, 0x000000, 0);
			game.addAsset(rune, true);
			return rune;
		});
	}

	controls(choose) {
		return this.runes.map((rune, index) => ({
			label: `Rune ${index + 1}`,
			run: () => choose(index)
		}));
	}

	illuminate(index) {
		this.runes.forEach((rune, runeIndex) => {
			this.paint(rune, runeIndex === index ? this.game.assets.parts.color(this.hues[runeIndex], 0.72).getHex() : 0x000000, runeIndex === index ? 1.8 : 0);
		});
	}

	reset() {
		this.runes.forEach(rune => this.paint(rune, 0x000000, 0));
	}

	animate(delta, elapsed, accepting) {
		this.runes.forEach((rune, index) => {
			rune.rotation.y += delta * (accepting ? 0.34 : 0.16);
			rune.position.y = 0.15 + Math.sin(elapsed * 2 + index) * 0.045;
		});
	}

	paint(root, color, intensity) {
		root.traverse(child => {
			if (!child.isMesh || !child.material.emissive) return;
			child.material.emissive.setHex(color);
			child.material.emissiveIntensity = intensity;
		});
	}
}
