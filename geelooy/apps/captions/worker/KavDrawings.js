// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos joins separated sparks through lines that never become the source;
 * Awtsmoos.com gives web, lightning, and synapse connections distinct readable forms.
 */
import { OhrPalette } from "./OhrPalette.js";

export class KavDrawings {
	static web(context, first, second, opacity) {
		context.beginPath();
		context.moveTo(first.x, first.y);
		context.lineTo(second.x, second.y);
		context.strokeStyle = OhrPalette.hexToRgba(first.color, opacity * .6);
		context.lineWidth = .5 + opacity;
		context.stroke();
	}

	static lightning(context, first, second, opacity) {
		const distance = Math.hypot(first.x - second.x, first.y - second.y);
		const points = [[first.x, first.y]];
		const fragments = Math.max(2, Math.floor(distance / 15));

		for (let index = 0; index < fragments; index += 1) {
			const ratio = Math.random();
			points.push([
				first.x + (second.x - first.x) * ratio,
				first.y + (second.y - first.y) * ratio
			]);
		}
		points.push([second.x, second.y]);
		points.sort((left, right) => {
			return Math.hypot(left[0] - first.x, left[1] - first.y)
				- Math.hypot(right[0] - first.x, right[1] - first.y);
		});
		points.slice(1, -1).forEach(point => {
			point[0] += (Math.random() - .5) * 20;
			point[1] += (Math.random() - .5) * 20;
		});

		context.beginPath();
		context.moveTo(points[0][0], points[0][1]);
		points.slice(1).forEach(point => context.lineTo(point[0], point[1]));
		context.strokeStyle = OhrPalette.hexToRgba(first.color, opacity);
		context.lineWidth = 1 + opacity * 3;
		context.stroke();
	}

	static synapse(context, first, second, opacity) {
		const gradient = context.createLinearGradient(
			first.x,
			first.y,
			second.x,
			second.y
		);
		gradient.addColorStop(0, OhrPalette.hexToRgba(first.color, opacity * .2));
		gradient.addColorStop(.5, OhrPalette.hexToRgba(first.color, opacity));
		gradient.addColorStop(1, OhrPalette.hexToRgba(first.color, opacity * .2));

		context.beginPath();
		context.moveTo(first.x, first.y);
		context.lineTo(second.x, second.y);
		context.strokeStyle = gradient;
		context.lineWidth = 1 + opacity;
		context.stroke();

		const radius = 3 + opacity * 6;
		context.fillStyle = OhrPalette.hexToRgba(first.color, opacity);
		[first, second].forEach(point => {
			context.beginPath();
			context.arc(point.x, point.y, radius, 0, Math.PI * 2);
			context.fill();
		});
	}
}
