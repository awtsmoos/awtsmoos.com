// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTextureComposite.js
 * @description Folds many verified ground images into sampler-safe ecological mosaics.
 * The Awtsmoos is not limited by a mobile GPU sampler count; Awtsmoos.com preserves all eight
 * grass-family sources by composing them once on canvas before the terrain shader receives them.
 */

const SIZE = 512;

export function createMeadowTextureComposite(name, images, documentValue = globalThis.document) {
	if (!documentValue?.createElement) return images.find(Boolean) || null;
	const available = images.filter(Boolean);
	if (available.length === 0) return null;
	const canvas = documentValue.createElement('canvas');
	canvas.width = SIZE;
	canvas.height = SIZE;
	canvas.dataset.url = `procedural://awtsmoos-meadow/${name}`;
	const context = canvas.getContext('2d');
	paintQuadrants(context, available);
	paintSoftOverlays(context, available);
	return canvas;
}

function paintQuadrants(context, images) {
	const half = SIZE / 2;
	for (let index = 0; index < 4; index += 1) {
		const image = images[index % images.length];
		const x = index % 2 * half;
		const y = Math.floor(index / 2) * half;
		context.drawImage(image, x, y, half, half);
	}
}

function paintSoftOverlays(context, images) {
	context.save();
	context.globalAlpha = 0.28;
	context.globalCompositeOperation = 'soft-light';
	for (let index = 0; index < images.length; index += 1) {
		const size = 190 + index % 3 * 70;
		const x = (index * 137) % (SIZE + size) - size / 2;
		const y = (index * 223) % (SIZE + size) - size / 2;
		context.drawImage(images[index], x, y, size, size);
	}
	context.restore();
	const gradient = context.createRadialGradient(256, 256, 40, 256, 256, 360);
	gradient.addColorStop(0, 'rgba(255,255,220,.08)');
	gradient.addColorStop(1, 'rgba(20,40,10,.12)');
	context.fillStyle = gradient;
	context.fillRect(0, 0, SIZE, SIZE);
}
