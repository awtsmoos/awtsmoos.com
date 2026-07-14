//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AnimalShapes
 * @description
 * Each creature is drawn from simple living geometry: wing, ear, tail, antler,
 * eye, and glow. No copied sprite enters Awtsmoos.com; procedural form becomes a
 * fresh garment for the varied life continually created by the Awtsmoos.
 */

export function drawDove(context, size, phase) {
	const flap = Math.sin(phase * 7) * size * 0.45;
	context.beginPath();
	context.moveTo(-size, 0);
	context.quadraticCurveTo(-size * 0.4, -flap, 0, 0);
	context.quadraticCurveTo(size * 0.4, -flap, size, 0);
	context.stroke();
	context.beginPath();
	context.arc(0, 0, size * 0.28, 0, Math.PI * 2);
	context.fill();
}

export function drawDeer(context, size, phase) {
	const step = Math.sin(phase * 5) * size * 0.22;
	context.beginPath();
	context.ellipse(0, 0, size, size * 0.52, 0, 0, Math.PI * 2);
	context.fill();
	context.beginPath();
	context.arc(size * 0.75, -size * 0.45, size * 0.32, 0, Math.PI * 2);
	context.fill();
	for (const x of [-size * 0.55, size * 0.45]) {
		context.beginPath();
		context.moveTo(x, size * 0.35);
		context.lineTo(x + step, size * 1.1);
		context.stroke();
	}
	context.beginPath();
	context.moveTo(size * 0.72, -size * 0.7);
	context.lineTo(size * 0.5, -size * 1.1);
	context.moveTo(size * 0.88, -size * 0.7);
	context.lineTo(size * 1.1, -size * 1.1);
	context.stroke();
}

export function drawFox(context, size, phase) {
	const tail = Math.sin(phase * 3) * size * 0.25;
	context.beginPath();
	context.ellipse(0, 0, size, size * 0.48, 0, 0, Math.PI * 2);
	context.fill();
	context.beginPath();
	context.moveTo(size * 0.55, -size * 0.25);
	context.lineTo(size * 1.15, 0);
	context.lineTo(size * 0.55, size * 0.25);
	context.closePath();
	context.fill();
	context.beginPath();
	context.moveTo(-size * 0.75, 0);
	context.quadraticCurveTo(-size * 1.45, tail, -size * 1.65, -size * 0.35);
	context.stroke();
}

export function drawOwl(context, size, phase) {
	const wing = Math.sin(phase * 5) * size * 0.2;
	context.beginPath();
	context.ellipse(0, 0, size * 0.72, size, 0, 0, Math.PI * 2);
	context.fill();
	for (const side of [-1, 1]) {
		context.beginPath();
		context.arc(side * size * 0.3, -size * 0.25, size * 0.17, 0, Math.PI * 2);
		context.stroke();
		context.beginPath();
		context.moveTo(side * size * 0.45, 0);
		context.lineTo(side * size, wing);
		context.stroke();
	}
}

export function drawFirefly(context, size, phase) {
	const pulse = 0.75 + Math.sin(phase * 4) * 0.25;
	context.globalAlpha = pulse;
	context.beginPath();
	context.arc(0, 0, size, 0, Math.PI * 2);
	context.fill();
}
