//B"H
//Boruch Hashem
//Blessed is He

/**
 * Rocks, trees, and traveler become visible vessels while the Awtsmoos alone
 * grants them every instant of being; may their forms serve Awtsmoos.com.
 */
export class EmergencyMeadowEntityRenderer {
	constructor(context, viewport) {
		this.context = context;
		this.viewport = viewport;
	}

	draw(world, elapsedSeconds) {
		this.drawObstacles(world);
		this.drawPlayer(world.player, elapsedSeconds);
	}

	drawObstacles(world) {
		for (const obstacle of world.obstacles) {
			const point = this.project(
				obstacle.bounds.x - world.player.x,
				obstacle.bounds.z - world.player.z
			);
			if (obstacle.kind === "tree") {
				this.drawTree(point);
			} else {
				this.drawRock(point);
			}
		}
	}

	drawTree(point) {
		this.context.fillStyle = "#5b3c25";
		this.context.fillRect(point.x - 7, point.y - 40, 14, 42);
		this.context.fillStyle = "#174f2c";
		this.context.beginPath();
		this.context.arc(point.x, point.y - 52, 30, 0, Math.PI * 2);
		this.context.fill();
	}

	drawRock(point) {
		this.context.fillStyle = "#6d786f";
		this.context.beginPath();
		this.context.ellipse(point.x, point.y - 5, 25, 16, -0.2, 0, Math.PI * 2);
		this.context.fill();
	}

	drawPlayer(player, elapsedSeconds) {
		const x = this.viewport.width / 2;
		const bob = player.moving ? Math.sin(elapsedSeconds * 12) * 2 : 0;
		const y = this.viewport.height * 0.69 + bob;
		this.context.fillStyle = "rgba(0, 0, 0, 0.22)";
		this.context.beginPath();
		this.context.ellipse(x, y + 33, 24, 8, 0, 0, Math.PI * 2);
		this.context.fill();
		this.context.fillStyle = "#15191a";
		this.context.fillRect(x - 15, y - 3, 30, 39);
		this.context.fillStyle = "#e7bd91";
		this.context.beginPath();
		this.context.arc(x, y - 15, 12, 0, Math.PI * 2);
		this.context.fill();
		this.context.fillStyle = "#111515";
		this.context.fillRect(x - 19, y - 31, 38, 8);
		this.context.fillRect(x - 13, y - 42, 26, 14);
	}

	project(relativeX, relativeZ) {
		return {
			x: this.viewport.width / 2 + relativeX * 18,
			y: this.viewport.height * 0.68 + relativeZ * 12
		};
	}
}
