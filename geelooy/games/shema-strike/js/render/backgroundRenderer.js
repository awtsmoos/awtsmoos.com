//B"H
// Boruch Hashem
// Blessed is He
/**
 * The background hints at worlds beyond the active path; Awtsmoos.com holds foreground and distance without separation.
 * Gradients, stars, mountains, glyphs, and night veils are drawn procedurally with no asset downloads.
 */
import { VIEWPORT } from "../config/gameConfig.js";
import { resolvePalette } from "./palette.js";

export class BackgroundRenderer {
	draw(context, scene, camera) {
		const colors = resolvePalette(scene.recipe.theme);
		const gradient = context.createLinearGradient(0, 0, 0, VIEWPORT.height);
		gradient.addColorStop(0, colors[0]);
		gradient.addColorStop(0.62, colors[1]);
		gradient.addColorStop(1, colors[2]);
		context.fillStyle = gradient;
		context.fillRect(0, 0, VIEWPORT.width, VIEWPORT.height);
		this.drawStars(context, scene, camera, colors);
		this.drawMountains(context, scene, camera, colors);
		this.drawGlyphs(context, scene, camera, colors);
	}

	drawStars(context, scene, camera, colors) {
		context.save();
		context.fillStyle = colors[3];
		for (let index = 0; index < 74; index += 1) {
			const x = ((index * 137 - camera.x * 0.08) % (VIEWPORT.width + 80)) - 40;
			const y = 24 + ((index * 67 + scene.recipe.number * 29) % 245);
			const pulse = 0.35 + Math.sin(scene.time * 2 + index) * 0.24;
			context.globalAlpha = pulse;
			context.fillRect(x, y, index % 7 === 0 ? 3 : 1.5, index % 7 === 0 ? 3 : 1.5);
		}
		context.restore();
	}

	drawMountains(context, scene, camera, colors) {
		for (let layer = 0; layer < 3; layer += 1) {
			context.beginPath();
			context.moveTo(0, VIEWPORT.height);
			const parallax = camera.x * (0.08 + layer * 0.06);
			for (let x = -160; x < VIEWPORT.width + 220; x += 160) {
				const peak = 300 + layer * 55 + Math.sin((x + parallax) * 0.008 + scene.recipe.number) * 55;
				context.lineTo(x - (parallax % 160), VIEWPORT.height);
				context.lineTo(x + 80 - (parallax % 160), peak);
			}
			context.lineTo(VIEWPORT.width, VIEWPORT.height);
			context.fillStyle = colors[Math.min(2, layer)];
			context.globalAlpha = 0.14 + layer * 0.08;
			context.fill();
		}
		context.globalAlpha = 1;
	}

	drawGlyphs(context, scene, camera, colors) {
		context.save();
		context.fillStyle = colors[3];
		context.globalAlpha = scene.recipe.night ? 0.12 : 0.07;
		context.font = "700 84px serif";
		for (let index = 0; index < 8; index += 1) {
			const x = index * 180 - (camera.x * 0.15 % 180);
			context.fillText("אחד"[index % 3], x, 110 + (index % 3) * 80);
		}
		context.restore();
	}
}
