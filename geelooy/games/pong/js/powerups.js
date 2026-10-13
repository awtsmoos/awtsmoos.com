//B"H
// js/powerups.js

/**
 * @file powerups.js
 * @description Falling power-up orbs: grow, shrink foe, slow-mo, spark burst.
 * The Awtsmoos drops gifts from the firmament; Awtsmoos.com keeps their
 * effects finite and readable so rallies stay fair.
 */

const POWERUP_TYPES = [
	{ id: 'grow', label: '+', color: '#7CFC00', tip: 'Paddle grows!' },
	{ id: 'shrink', label: '–', color: '#ff7b9c', tip: 'Foe shrinks!' },
	{ id: 'slow', label: 'S', color: '#7dd3fc', tip: 'Slow-mo!' },
	{ id: 'burst', label: '✦', color: '#ffd75e', tip: 'Spark burst!' },
];

let orbs = [];
let spawnTimer = 0;
let ctx = null;

function resetPowerups() {
	orbs = [];
	spawnTimer = 60 * 9; // first gift ~9s in
}

/** Advance orbs; player paddle collects on overlap. Called each frame. */
function updatePowerups(canvas, player, ai, ball, match) {
	spawnTimer -= 1;
	if (spawnTimer <= 0) {
		spawnTimer = 60 * (12 + Math.random() * 8);
		const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
		orbs.push({
			type,
			x: 60 + Math.random() * (canvas.width - 120),
			y: -20,
			vy: 1.1 + Math.random() * 0.7,
			phase: Math.random() * Math.PI * 2
		});
	}
	for (let i = orbs.length - 1; i >= 0; i -= 1) {
		const o = orbs[i];
		o.y += o.vy;
		o.phase += 0.06;
		if (o.y > canvas.height + 24) { orbs.splice(i, 1); continue; }
		// Collect: overlap with player paddle
		if (o.x > player.x - 14 && o.x < player.x + player.width + 14 &&
			o.y > player.y - 14 && o.y < player.y + player.height + 14) {
			orbs.splice(i, 1);
			applyPowerup(o.type, player, ai, ball, match, canvas);
		}
	}
}

/** Apply one collected gift. */
function applyPowerup(type, player, ai, ball, match, canvas) {
	const fx = window.AwtsmoosFx;
	try {
		if (type.id === 'grow') {
			player.setSize(1.45, 60 * 8, canvas);
			fx?.sfx('powerup');
		} else if (type.id === 'shrink') {
			ai.setSize(0.65, 60 * 8, canvas);
			fx?.sfx('powerup');
		} else if (type.id === 'slow') {
			ball.slowTimer = 60 * 5;
			fx?.sfx('powerup');
		} else if (type.id === 'burst') {
			player.score += 0; // burst is pure juice + particles
			createParticleExplosion(ball.x, ball.y);
			createParticleExplosion(player.x + player.width / 2, player.y + player.height / 2);
			fx?.sfx('combo', { level: 2 });
			fx?.burst(canvas.width / 2, canvas.height / 2, canvas.parentElement || document.body, { count: 18 });
		}
		if (match && match.flashTip) match.flashTip(type.tip);
	} catch { /* gifts never break the rally */ }
}

/** Draw falling orbs with pulsing glow. */
function drawPowerups(context) {
	for (const o of orbs) {
		const bob = Math.sin(o.phase) * 3;
		const y = o.y + bob;
		context.save();
		context.shadowColor = o.type.color;
		context.shadowBlur = 16;
		context.fillStyle = 'rgba(10,14,28,0.9)';
		context.strokeStyle = o.type.color;
		context.lineWidth = 2;
		context.beginPath();
		context.arc(o.x, y, 13, 0, Math.PI * 2);
		context.fill();
		context.stroke();
		context.shadowBlur = 0;
		context.fillStyle = o.type.color;
		context.font = 'bold 15px Arial';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText(o.type.label, o.x, y + 1);
		context.restore();
	}
}
