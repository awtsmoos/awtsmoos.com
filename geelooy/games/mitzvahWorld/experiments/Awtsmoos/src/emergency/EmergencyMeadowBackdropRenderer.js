//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos spreads sky above earth anew in every painted instant.
 * This focused vessel gives Awtsmoos.com only the meadow and its horizon.
 */
export class EmergencyMeadowBackdropRenderer {
	constructor(context, viewport) {
		this.context = context;
		this.viewport = viewport;
	}

	draw(world, elapsedSeconds) {
		this.drawSky();
		this.drawMeadow(world, elapsedSeconds);
	}

	drawSky() {
		const { width, height } = this.viewport;
		const horizon = height * 0.43;
		const sky = this.context.createLinearGradient(0, 0, 0, horizon);
		sky.addColorStop(0, "#68b9ed");
		sky.addColorStop(1, "#dff5f0");
		this.context.fillStyle = sky;
		this.context.fillRect(0, 0, width, horizon);
		this.context.fillStyle = "#79a96a";
		this.context.beginPath();
		this.context.moveTo(0, horizon);
		for (let x = 0; x <= width; x += 80) {
			this.context.lineTo(x, horizon - 26 - 22 * Math.sin(x * 0.013));
		}
		this.context.lineTo(width, horizon + 30);
		this.context.lineTo(0, horizon + 30);
		this.context.fill();
	}

	drawMeadow(world, elapsedSeconds) {
		const { width, height } = this.viewport;
		const horizon = height * 0.4;
		const grass = this.context.createLinearGradient(0, horizon, 0, height);
		grass.addColorStop(0, "#6aa853");
		grass.addColorStop(1, "#1f5f34");
		this.context.fillStyle = grass;
		this.context.fillRect(0, horizon, width, height - horizon);
		for (let row = -10; row <= 10; row += 1) {
			for (let column = -16; column <= 16; column += 1) {
				const worldX = column * 3 + ((row & 1) ? 1.4 : 0);
				const worldZ = row * 3;
				const point = this.project(worldX - world.player.x, worldZ - world.player.z);
				const sway = Math.sin(elapsedSeconds * 2 + column + row) * 2;
				this.context.fillStyle = (column + row) % 4 ? "#d8ec73" : "#f5d8e8";
				this.context.fillRect(point.x + sway, point.y, 2.5, 5);
			}
		}
		this.context.strokeStyle = "rgba(236, 214, 157, 0.55)";
		this.context.lineWidth = 28;
		this.context.beginPath();
		this.context.moveTo(width * 0.45, height);
		this.context.quadraticCurveTo(width * 0.58, height * 0.68, width * 0.51, horizon);
		this.context.stroke();
	}

	project(relativeX, relativeZ) {
		return {
			x: this.viewport.width / 2 + relativeX * 18,
			y: this.viewport.height * 0.68 + relativeZ * 12
		};
	}
}
