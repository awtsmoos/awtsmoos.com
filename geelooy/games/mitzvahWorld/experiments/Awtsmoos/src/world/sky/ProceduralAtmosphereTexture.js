// B"H
// Lightweight alpha textures for clouds and haze; generated once and shared by every sky card.

let cloudTexture = null;
let hazeTexture = null;

export function proceduralCloudTexture() {
	if (cloudTexture || typeof document === 'undefined') return cloudTexture;
	const canvas = document.createElement('canvas');
	canvas.width = 512;
	canvas.height = 256;
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.globalCompositeOperation = 'lighter';
	const puffs = [
		[82, 150, 74, 0.64], [150, 116, 92, 0.82], [232, 126, 112, 0.92],
		[324, 112, 96, 0.8], [404, 148, 78, 0.58], [280, 170, 118, 0.54]
	];
	for (const [x, y, radius, alpha] of puffs) {
		const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
		gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
		gradient.addColorStop(0.46, `rgba(255,255,255,${alpha * 0.68})`);
		gradient.addColorStop(1, 'rgba(255,255,255,0)');
		context.fillStyle = gradient;
		context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
	}
	canvas.dataset.url = 'procedural://awtsmoos-soft-cloud-alpha';
	cloudTexture = canvas;
	return canvas;
}

export function proceduralHazeTexture() {
	if (hazeTexture || typeof document === 'undefined') return hazeTexture;
	const canvas = document.createElement('canvas');
	canvas.width = 256;
	canvas.height = 128;
	const context = canvas.getContext('2d');
	const horizontal = context.createLinearGradient(0, 0, canvas.width, 0);
	horizontal.addColorStop(0, 'rgba(255,255,255,0)');
	horizontal.addColorStop(0.18, 'rgba(255,255,255,.72)');
	horizontal.addColorStop(0.82, 'rgba(255,255,255,.72)');
	horizontal.addColorStop(1, 'rgba(255,255,255,0)');
	context.fillStyle = horizontal;
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.globalCompositeOperation = 'destination-in';
	const vertical = context.createLinearGradient(0, 0, 0, canvas.height);
	vertical.addColorStop(0, 'rgba(255,255,255,0)');
	vertical.addColorStop(0.5, 'rgba(255,255,255,1)');
	vertical.addColorStop(1, 'rgba(255,255,255,0)');
	context.fillStyle = vertical;
	context.fillRect(0, 0, canvas.width, canvas.height);
	canvas.dataset.url = 'procedural://awtsmoos-horizon-haze-alpha';
	hazeTexture = canvas;
	return canvas;
}
