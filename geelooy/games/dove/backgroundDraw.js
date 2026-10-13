// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file backgroundDraw.js
 * @description Draws Dove's sky, ocean, letters, creatures, and waves from detached ambient state.
 * B"H 2026-10-13: real textures — gradient sky with sun glow, procedural puffy clouds
 * (no emoji sprites), gradient ocean with animated sparkles. The Awtsmoos renews visible
 * form while Awtsmoos.com keeps rendering separate from simulation.
 */

const WAVES = [
	{ color: 'rgba(255,255,255,.9)', speed: 1, amplitude: 15, frequency: 0.02, lineWidth: 3 },
	{ color: 'rgba(255,255,255,.7)', speed: 0.8, amplitude: 20, frequency: 0.015, lineWidth: 2 }
];

/** Draws one complete ambient frame. */
export function drawBackground(context, state, width, height) {
	drawSky(context, state, width, height);
	for (const cloud of state.clouds) drawCloud(context, cloud, state.frame);
	drawOcean(context, state, width, height);
	drawOceanActors(context, state);
	for (const wave of WAVES) drawWave(context, state, width, wave);
}

/** Gradient sky with a soft sun glow — no flat colors. */
function drawSky(context, state, width, height) {
	const skyH = state.oceanTop;
	const g = context.createLinearGradient(0, 0, 0, skyH);
	g.addColorStop(0, '#2f6fd0');
	g.addColorStop(0.55, '#6fb7ec');
	g.addColorStop(1, '#c4e9fb');
	context.fillStyle = g;
	context.fillRect(0, 0, width, Math.max(1, skyH));
	// sun with layered glow, upper-right
	const sx = width * 0.82;
	const sy = skyH * 0.22;
	const glow = context.createRadialGradient(sx, sy, 4, sx, sy, 90);
	glow.addColorStop(0, 'rgba(255,250,210,0.95)');
	glow.addColorStop(0.25, 'rgba(255,240,170,0.55)');
	glow.addColorStop(1, 'rgba(255,240,170,0)');
	context.fillStyle = glow;
	context.beginPath();
	context.arc(sx, sy, 90, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = '#fff7d6';
	context.beginPath();
	context.arc(sx, sy, 26, 0, Math.PI * 2);
	context.fill();
}

/** One procedural puffy cloud: layered white circles with soft blue shading. */
function drawCloud(context, cloud, frame) {
	const drift = Math.sin(frame * 0.008 + cloud.x * 0.01) * 4;
	const cx = cloud.x + drift;
	const cy = cloud.y;
	const w = cloud.width;
	const h = cloud.height;
	context.save();
	// soft drop shadow beneath
	context.fillStyle = 'rgba(120,160,200,0.25)';
	context.beginPath();
	context.ellipse(cx + w * 0.05, cy + h * 0.72, w * 0.42, h * 0.2, 0, 0, Math.PI * 2);
	context.fill();
	// shaded base (light blue-grey)
	context.fillStyle = '#dbe9f6';
	blob(context, cx, cy, w, h, 0.06);
	context.fill();
	// bright top puffs
	context.fillStyle = '#ffffff';
	blob(context, cx, cy - h * 0.08, w, h, -0.02);
	context.fill();
	// sun-kissed rim highlight
	context.fillStyle = 'rgba(255,252,235,0.9)';
	context.beginPath();
	context.ellipse(cx - w * 0.12, cy - h * 0.22, w * 0.2, h * 0.1, -0.25, 0, Math.PI * 2);
	context.fill();
	context.restore();
}

/** Builds a puffy multi-circle cloud path centered at (cx,cy). */
function blob(context, cx, cy, w, h, dy) {
	const puffs = [
		[-0.32, 0.10, 0.24], [-0.12, -0.06, 0.30], [0.10, -0.10, 0.32],
		[0.30, 0.02, 0.26], [0.02, 0.14, 0.34], [-0.22, 0.16, 0.26]
	];
	context.beginPath();
	for (const [ox, oy, r] of puffs) {
		context.moveTo(cx + ox * w + r * w, cy + (oy + dy) * h);
		context.arc(cx + ox * w, cy + (oy + dy) * h, r * w, 0, Math.PI * 2);
	}
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
	const g = context.createLinearGradient(0, state.oceanTop, 0, height);
	g.addColorStop(0, '#0a5f7a');
	g.addColorStop(0.35, '#084a66');
	g.addColorStop(1, '#03283f');
	context.fillStyle = g;
	context.fill();
	// animated sparkles riding the swell
	context.fillStyle = 'rgba(255,255,255,0.5)';
	for (let i = 0; i < 14; i++) {
		const sx = ((i * 97 + state.frame * 2.2) % (width + 40)) - 20;
		const sy = state.oceanTop + 24 + ((i * 53) % 90) + Math.sin(state.frame * 0.05 + i) * 8;
		const tw = 1 + Math.abs(Math.sin(state.frame * 0.08 + i * 1.7)) * 2.2;
		context.beginPath();
		context.arc(sx, sy, tw, 0, Math.PI * 2);
		context.fill();
	}
}

function drawOceanActors(context, state) {
	context.fillStyle = 'rgba(255,255,255,.15)';
	context.font = '20px Arial';
	context.textAlign = 'center';
	for (const letter of state.letters) context.fillText(letter.char, letter.x, letter.y);
	for (const creature of state.creatures) drawFish(context, creature);
}

/**
 * Draws one small vector fish swimming right: rounded body, forked tail, dorsal
 * fin, and a dark eye. Hue varies per creature so the school reads as alive.
 */
function drawFish(context, creature) {
	const s = creature.size / 2;
	const hue = creature.hue || 200;
	context.save();
	context.translate(creature.x, creature.y);
	// body
	const grad = context.createLinearGradient(0, -s * 0.5, 0, s * 0.5);
	grad.addColorStop(0, `hsl(${hue}, 70%, 68%)`);
	grad.addColorStop(1, `hsl(${hue}, 65%, 42%)`);
	context.fillStyle = grad;
	context.beginPath();
	context.ellipse(0, 0, s, s * 0.45, 0, 0, Math.PI * 2);
	context.fill();
	// tail
	context.fillStyle = `hsl(${hue}, 65%, 48%)`;
	context.beginPath();
	context.moveTo(-s * 0.85, 0);
	context.lineTo(-s * 1.5, -s * 0.45);
	context.lineTo(-s * 1.5, s * 0.45);
	context.closePath();
	context.fill();
	// dorsal fin
	context.beginPath();
	context.moveTo(-s * 0.2, -s * 0.4);
	context.lineTo(s * 0.25, -s * 0.4);
	context.lineTo(s * 0.05, -s * 0.85);
	context.closePath();
	context.fill();
	// eye
	context.fillStyle = '#0b1620';
	context.beginPath();
	context.arc(s * 0.55, -s * 0.08, s * 0.1, 0, Math.PI * 2);
	context.fill();
	context.restore();
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
