// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file backgroundDraw.js
 * @description Draws Dove's sky, ocean, letters, creatures, and waves from detached ambient state.
 * The Awtsmoos renews visible form while Awtsmoos.com keeps rendering separate from simulation.
 */
const cloudImage = new Image();
cloudImage.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 80%22><text y=%22.9em%22 font-size=%2270%22>☁️</text></svg>';

const WAVES = [
	{ color: 'rgba(255,255,255,.9)', speed: 1, amplitude: 15, frequency: 0.02, lineWidth: 3 },
	{ color: 'rgba(255,255,255,.7)', speed: 0.8, amplitude: 20, frequency: 0.015, lineWidth: 2 }
];

/** Draws one complete ambient frame. */
export function drawBackground(context, state, width, height) {
	context.fillStyle = '#87CEEB';
	context.fillRect(0, 0, width, height);
	for (const cloud of state.clouds) {
		context.drawImage(cloudImage, cloud.x, cloud.y, cloud.width, cloud.height);
	}
	drawOcean(context, state, width, height);
	drawOceanActors(context, state);
	for (const wave of WAVES) drawWave(context, state, width, wave);
}

function drawOcean(context, state, width, height) {
	context.beginPath();
	context.moveTo(0, state.oceanTop);
	for (let x = 0; x <= width; x += 2) {
		const offset = Math.sin(x * 0.01 + state.frame * 0.005) * 20;
		context.lineTo(x, state.oceanTop + offset);
	}
	context.lineTo(width, height);
	context.lineTo(0, height);
	context.closePath();
	context.fillStyle = '#003366';
	context.fill();
}

function drawOceanActors(context, state) {
	context.fillStyle = 'rgba(255,255,255,.15)';
	context.font = '20px Arial';
	context.textAlign = 'center';
	for (const letter of state.letters) context.fillText(letter.char, letter.x, letter.y);
	for (const creature of state.creatures) {
		context.font = `${creature.size}px Arial`;
		context.fillText(creature.emoji, creature.x, creature.y);
	}
}

function drawWave(context, state, width, wave) {
	context.beginPath();
	for (let x = 0; x <= width; x += 2) {
		const offset = Math.sin(
			x * wave.frequency + state.frame * 0.01 * wave.speed
		) * wave.amplitude;
		context.lineTo(x, state.oceanTop + offset);
	}
	context.strokeStyle = wave.color;
	context.lineWidth = wave.lineWidth;
	context.stroke();
}
