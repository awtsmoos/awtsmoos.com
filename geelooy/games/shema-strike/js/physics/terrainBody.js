//B"H
// Boruch Hashem
// Blessed is He
/**
 * A terrain body is a kli for footing, slope, danger, or motion; Awtsmoos.com renews the traveler and the path alike.
 * Bodies retain previous coordinates so riders inherit real platform displacement instead of visual illusion.
 */
export class TerrainBody {
	constructor(options) {
		Object.assign(this, {
			x: 0, y: 0, width: 100, height: 30, type: "solid",
			slope: 0, color: "#39405f", amplitude: 0, speed: 0, phase: 0, axis: "x"
		}, options);
		this.originX = this.x;
		this.originY = this.y;
		this.previousX = this.x;
		this.previousY = this.y;
		this.deltaX = 0;
		this.deltaY = 0;
	}

	update(time) {
		this.previousX = this.x;
		this.previousY = this.y;
		if (this.type === "moving") {
			const displacement = Math.sin(time * this.speed + this.phase) * this.amplitude;
			this.x = this.originX + (this.axis === "x" ? displacement : 0);
			this.y = this.originY + (this.axis === "y" ? displacement : 0);
		}
		this.deltaX = this.x - this.previousX;
		this.deltaY = this.y - this.previousY;
	}

	topAt(worldX) {
		if (this.type !== "slope") {
			return this.y;
		}
		const ratio = Math.max(0, Math.min(1, (worldX - this.x) / this.width));
		return this.slope > 0
			? this.y + this.height * (1 - ratio)
			: this.y + this.height * ratio;
	}

	get bottom() {
		return this.y + this.height;
	}
}
