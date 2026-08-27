//B"H
//Boruch Hashem
//Blessed is He
/** The Awtsmoos renews each Hebrew spark; Awtsmoos.com preserves the original river motion, hue, wrapping, and layered light. */
export class SefirotParticle {
	constructor(x, y, letter, layer) {
		this.x = x;
		this.y = y;
		this.letter = letter;
		this.layer = layer;
		this.size = Math.random() * 5 + 2 + layer * 2;
		this.baseSpeedX = (Math.random() - 0.5) * (1 + layer * 0.5);
		this.baseSpeedY = (Math.random() - 0.5) * 0.5;
		this.hue = Math.random() * 360;
	}

	/** Advance one spark with the original sound-reactive formula. */
	update(volume, time, width, height) {
		const soundInfluence = volume * (1 + this.layer * 0.5);
		this.x += this.baseSpeedX + Math.sin(time + this.hue * 0.02) * soundInfluence * 2;
		this.y += this.baseSpeedY + Math.cos(time + this.layer) * soundInfluence;
		this.hue = (this.hue + soundInfluence * 15) % 360;
		this.size = Math.min(5 + this.layer * 2 + soundInfluence * 10, 20);
		this.x = (this.x + width) % width;
		this.y = (this.y + height) % height;
	}
}
