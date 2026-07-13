//B"H
// Boruch Hashem
// Blessed is He
/**
 * Terrain drawing reveals collision truth rather than painting a false floor; Awtsmoos.com creates every visible and hidden support.
 * Solids, slopes, one-way ledges, moving bodies, hazards, and the awakened portal each receive distinct visual language.
 */
export class TerrainRenderer {
	draw(context, scene) {
		for (const body of scene.bodies) {
			if (body.type === "hazard") {
				this.drawHazard(context, body, scene.time);
			} else if (body.type === "slope") {
				this.drawSlope(context, body);
			} else {
				this.drawBlock(context, body);
			}
		}
		this.drawPortal(context, scene.portal, scene.time);
	}

	drawBlock(context, body) {
		const gradient = context.createLinearGradient(0, body.y, 0, body.y + body.height);
		gradient.addColorStop(0, body.type === "moving" ? "#7fe9ff" : "#6f78a2");
		gradient.addColorStop(0.12, "#343957");
		gradient.addColorStop(1, "#111426");
		context.fillStyle = gradient;
		context.fillRect(body.x, body.y, body.width, body.height);
		context.fillStyle = body.type === "oneWay" ? "#ffd36a" : "rgba(255,255,255,0.18)";
		context.fillRect(body.x, body.y, body.width, body.type === "oneWay" ? 5 : 3);
	}

	drawSlope(context, body) {
		context.beginPath();
		context.moveTo(body.x, body.y + body.height);
		if (body.slope > 0) {
			context.lineTo(body.x, body.y + body.height);
			context.lineTo(body.x + body.width, body.y);
		} else {
			context.lineTo(body.x, body.y);
			context.lineTo(body.x + body.width, body.y + body.height);
		}
		context.lineTo(body.x + body.width, body.y + body.height);
		context.closePath();
		context.fillStyle = "#29314e";
		context.fill();
		context.strokeStyle = "#9fd9e8";
		context.lineWidth = 3;
		context.stroke();
	}

	drawHazard(context, body, time) {
		context.fillStyle = "rgba(255, 92, 145, 0.2)";
		context.fillRect(body.x, body.y, body.width, body.height);
		context.fillStyle = "#ff7aa8";
		for (let x = body.x; x < body.x + body.width; x += 18) {
			const wave = Math.sin(time * 7 + x * 0.08) * 7;
			context.beginPath();
			context.moveTo(x, body.y + 18);
			context.lineTo(x + 9, body.y - 8 + wave);
			context.lineTo(x + 18, body.y + 18);
			context.fill();
		}
	}

	drawPortal(context, portal, time) {
		context.save();
		context.globalAlpha = portal.active ? 1 : 0.24;
		context.strokeStyle = portal.active ? "#fff2a8" : "#566078";
		context.lineWidth = 8;
		context.shadowBlur = portal.active ? 28 + Math.sin(time * 5) * 8 : 0;
		context.shadowColor = "#76f7ff";
		context.strokeRect(portal.x, portal.y, portal.width, portal.height);
		context.fillStyle = "rgba(118,247,255,0.16)";
		context.fillRect(portal.x, portal.y, portal.width, portal.height);
		context.restore();
	}
}
