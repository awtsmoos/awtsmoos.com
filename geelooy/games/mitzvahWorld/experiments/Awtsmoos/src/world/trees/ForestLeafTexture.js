// B"H
/** @file ForestLeafTexture.js @description Generates a tiny reusable alpha leaf mask without external assets. */
let cachedTexture = null;

export function createForestLeafTexture() {
	if (cachedTexture || typeof document === 'undefined') return cachedTexture;
	const canvas = document.createElement('canvas');
	canvas.width = 64;
	canvas.height = 64;
	canvas.dataset.url = 'procedural://awtsmoos-forest-leaf-mask';
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, 64, 64);
	const gradient = context.createRadialGradient(25, 21, 3, 32, 34, 31);
	gradient.addColorStop(0, 'rgba(255,255,255,1)');
	gradient.addColorStop(.72, 'rgba(235,245,230,1)');
	gradient.addColorStop(1, 'rgba(255,255,255,0)');
	context.fillStyle = gradient;
	context.beginPath();
	context.moveTo(32, 59);
	context.bezierCurveTo(7, 47, 4, 18, 30, 5);
	context.bezierCurveTo(55, 17, 59, 44, 32, 59);
	context.fill();
	context.strokeStyle = 'rgba(100,120,90,.42)';
	context.lineWidth = 2;
	context.beginPath();
	context.moveTo(32, 58);
	context.quadraticCurveTo(29, 31, 31, 8);
	context.stroke();
	cachedTexture = canvas;
	return cachedTexture;
}

export default createForestLeafTexture;
