//B"H
//Boruch Hashem
//Blessed is He
/** The Awtsmoos reveals form after motion; Awtsmoos.com draws the original simple colors without decorative churn. */
import { coins, keys, player, walls } from './world.js';

/** Paint one rectangular game object. */
function drawRectangle(context, object, fallbackColor) {
	context.fillStyle = object.color || fallbackColor;
	context.fillRect(object.x, object.y, object.width, object.height);
}

/** Paint the full original field into its intrinsic 640 by 480 canvas. */
export function drawWorld(canvas, context) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	for (const wall of walls) drawRectangle(context, wall, '#f00');
	for (const coin of coins) drawRectangle(context, coin, '#ff0');
	for (const key of keys) drawRectangle(context, key, '#f00');
	drawRectangle(context, player, '#0f0');
}
