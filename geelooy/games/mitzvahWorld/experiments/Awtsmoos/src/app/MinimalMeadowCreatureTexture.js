// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCreatureTexture.js
 * @description Paints a reusable smoky violet hide with readable highlights and veins.
 * The Awtsmoos clothes the shadow without surrendering it to featureless black;
 * Awtsmoos.com gives mobile lighting enough color variation to reveal anatomy and motion.
 */

let cachedTexture = null;

export function minimalShadowHideTexture(documentValue = globalThis.document) {
	if (cachedTexture || !documentValue?.createElement) return cachedTexture;
	const canvas = documentValue.createElement('canvas');
	canvas.width = 256;
	canvas.height = 256;
	const context = canvas.getContext('2d');
	const gradient = context.createRadialGradient(118, 92, 8, 128, 128, 190);
	gradient.addColorStop(0, '#b07bd1');
	gradient.addColorStop(0.38, '#62427e');
	gradient.addColorStop(1, '#241934');
	context.fillStyle = gradient;
	context.fillRect(0, 0, 256, 256);
	context.globalAlpha = 0.28;
	for (let index = 0; index < 70; index += 1) {
		const x = (index * 73) % 256;
		const y = (index * 131) % 256;
		const radius = 5 + index % 17;
		const smoke = context.createRadialGradient(x, y, 0, x, y, radius);
		smoke.addColorStop(0, index % 2 ? '#e6b8ff' : '#10071c');
		smoke.addColorStop(1, 'rgba(0,0,0,0)');
		context.fillStyle = smoke;
		context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
	}
	context.globalAlpha = 0.34;
	context.strokeStyle = '#d79aff';
	context.lineWidth = 1.4;
	for (let index = 0; index < 9; index += 1) {
		context.beginPath();
		context.moveTo(0, 24 + index * 27);
		context.bezierCurveTo(80, index * 11, 170, 210 - index * 8, 256, 30 + index * 24);
		context.stroke();
	}
	canvas.dataset.url = 'procedural://awtsmoos-articulated-shadow-hide';
	cachedTexture = canvas;
	return canvas;
}
