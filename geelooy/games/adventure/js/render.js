// B"H
// Boruch Hashem
// Blessed is He
import { ADVENTURE_COLORS } from './config.js';

/**
 * The Awtsmoos gives light, wall, shadow, and portal their visible vessels; Awtsmoos.com renders meaning first so polish never hides the rules.
 * Elevated: vessel-of-light player with walk-bob and idle breath, scintillating
 * star sparks, ornate golden key, shadow-wisp hazards, swirling portal,
 * hewn stone walls, parallax starfield with drifting dust.
 */
export class AdventureRenderer {
	constructor(canvas, context, colors = ADVENTURE_COLORS) {
		this.canvas = canvas;
		this.context = context;
		this.colors = colors;
		this.stars = this.makeStars(90, 7);
		this.starsFar = this.makeStars(60, 42);
		this.dust = this.makeStars(26, 99);
	}

	/** Deterministic pseudo-random star field so every run paints the same sky. */
	makeStars(count, seed) {
		const pts = [];
		let s = seed;
		const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
		for (let i = 0; i < count; i += 1) {
			pts.push({ x: rnd(), y: rnd(), r: 0.6 + rnd() * 1.8, tw: rnd() * Math.PI * 2 });
		}
		return pts;
	}

	render(world) {
		this.drawBackground(world);
		for (const wall of world.walls) this.drawWall(wall);
		for (const spark of world.sparks) this.drawSpark(spark, world);
		if (!world.keyCollected) this.drawKey(world.key, world.sparks.length === 0, world.frame);
		for (const hazard of world.hazards) this.drawHazard(hazard, world.frame);
		this.drawPortal(world.portal, world.portalReady, world.frame);
		this.drawBursts(world);
		this.drawPlayer(world);
		this.drawDamageFlash(world);
	}

	drawBackground(world) {
		const { context, canvas } = this;
		const hues = [198, 227, 270, 210, 250, 285];
		const hue = hues[world.stageIndex] ?? 210;
		const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
		gradient.addColorStop(0, `hsl(${hue} 56% 10%)`);
		gradient.addColorStop(1, '#020711');
		context.fillStyle = gradient;
		context.fillRect(0, 0, canvas.width, canvas.height);
		// parallax starfield: far layer drifts slowly with the player
		const px = (world.player ? world.player.x : 0) * 0.02;
		const py = (world.player ? world.player.y : 0) * 0.02;
		for (const layer of [{ pts: this.starsFar, dim: 0.35, par: 0.4 }, { pts: this.stars, dim: 0.8, par: 1 }]) {
			for (const st of layer.pts) {
				const tw = 0.5 + 0.5 * Math.sin(world.frame * 0.03 + st.tw);
				context.globalAlpha = layer.dim * (0.35 + 0.65 * tw);
				context.fillStyle = '#cfe6ff';
				const sx = ((st.x * canvas.width - px * layer.par) % canvas.width + canvas.width) % canvas.width;
				const sy = ((st.y * canvas.height - py * layer.par) % canvas.height + canvas.height) % canvas.height;
				context.fillRect(sx, sy, st.r, st.r);
			}
		}
		context.globalAlpha = 1;
		// drifting dust motes
		context.fillStyle = 'rgba(255, 215, 120, 0.16)';
		for (const d of this.dust) {
			const dx = (d.x * canvas.width + world.frame * 0.12) % canvas.width;
			const dy = (d.y * canvas.height + Math.sin(world.frame * 0.01 + d.tw) * 8 + canvas.height) % canvas.height;
			context.beginPath();
			context.arc(dx, dy, d.r * 0.8, 0, Math.PI * 2);
			context.fill();
		}
	}

	drawWall(wall) {
		const { context } = this;
		const g = context.createLinearGradient(wall.x, wall.y, wall.x, wall.y + wall.height);
		g.addColorStop(0, '#3d4a63');
		g.addColorStop(0.5, '#2a3350');
		g.addColorStop(1, '#1a2138');
		context.fillStyle = g;
		context.fillRect(wall.x, wall.y, wall.width, wall.height);
		// hewn bevel: light top edge, dark bottom edge
		context.fillStyle = 'rgba(190, 210, 245, 0.28)';
		context.fillRect(wall.x, wall.y, wall.width, 3);
		context.fillStyle = 'rgba(0, 0, 0, 0.4)';
		context.fillRect(wall.x, wall.y + wall.height - 3, wall.width, 3);
		// chisel marks
		context.strokeStyle = 'rgba(160, 180, 220, 0.12)';
		context.lineWidth = 1;
		const step = 26;
		for (let yy = wall.y + 10; yy < wall.y + wall.height - 4; yy += step) {
			context.beginPath();
			context.moveTo(wall.x + 4, yy);
			context.lineTo(wall.x + wall.width - 4, yy);
			context.stroke();
		}
		context.strokeStyle = this.colors.wallEdge;
		context.lineWidth = 1.5;
		context.strokeRect(wall.x + 0.75, wall.y + 0.75, wall.width - 1.5, wall.height - 1.5);
	}

	/** Scintillating four-pointed star. */
	drawSpark(spark, world) {
		const { context } = this;
		const cx = spark.x + 11, cy = spark.y + 11;
		const pulse = 1 + Math.sin(world.frame * 0.08 + spark.x * 0.7) * 0.18;
		const rot = Math.sin(world.frame * 0.02 + spark.y * 0.3) * 0.35;
		context.save();
		context.translate(cx, cy);
		context.rotate(rot);
		context.scale(pulse, pulse);
		context.shadowColor = '#ffd75e';
		context.shadowBlur = 20;
		context.fillStyle = '#ffe9a8';
		const R = 10, r = 3.2;
		context.beginPath();
		for (let i = 0; i < 8; i += 1) {
			const ang = (i / 8) * Math.PI * 2;
			const rad = i % 2 === 0 ? R : r;
			const px = Math.cos(ang) * rad, py = Math.sin(ang) * rad;
			if (i === 0) context.moveTo(px, py); else context.lineTo(px, py);
		}
		context.closePath();
		context.fill();
		context.shadowBlur = 0;
		context.fillStyle = '#ffffff';
		context.beginPath();
		context.arc(0, 0, 2.6, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}

	/** Ornate golden key drawn from paths — bow, shaft, teeth. */
	drawKey(key, awake, frame) {
		const { context } = this;
		const cx = key.x + 12, cy = key.y + 12;
		const bob = Math.sin(frame * 0.05) * 3;
		context.save();
		context.translate(cx, cy + bob);
		context.rotate(-0.5 + Math.sin(frame * 0.03) * 0.08);
		context.globalAlpha = awake ? 1 : 0.35;
		context.shadowColor = '#f5d97e';
		context.shadowBlur = awake ? 22 : 6;
		context.strokeStyle = '#e8c95c';
		context.fillStyle = '#f5d97e';
		context.lineWidth = 4;
		// bow (ring)
		context.beginPath();
		context.arc(-10, 0, 8, 0, Math.PI * 2);
		context.stroke();
		// shaft
		context.beginPath();
		context.moveTo(-2, 0);
		context.lineTo(16, 0);
		context.stroke();
		// teeth
		context.lineWidth = 3.4;
		context.beginPath();
		context.moveTo(9, 0); context.lineTo(9, 7);
		context.moveTo(14, 0); context.lineTo(14, 5);
		context.stroke();
		// gem in bow
		context.fillStyle = awake ? '#fff3c4' : '#8a7a4d';
		context.beginPath();
		context.arc(-10, 0, 3, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}

	/** Shadow wisp: dark core with violet tendrils that breathe. */
	drawHazard(hazard, frame) {
		const { context } = this;
		const cx = hazard.x + hazard.width / 2, cy = hazard.y + hazard.height / 2;
		const breathe = 0.8 + Math.sin(frame * 0.09 + hazard.phase) * 0.2;
		context.save();
		context.translate(cx, cy);
		// tendrils
		context.strokeStyle = 'rgba(150, 90, 255, 0.55)';
		context.lineWidth = 3;
		context.shadowColor = '#8a4dff';
		context.shadowBlur = 16;
		for (let i = 0; i < 5; i += 1) {
			const ang = (i / 5) * Math.PI * 2 + frame * 0.02 + hazard.phase;
			const len = (hazard.width / 2 + 10) * breathe;
			context.beginPath();
			context.moveTo(0, 0);
			context.quadraticCurveTo(
				Math.cos(ang + 0.5) * len * 0.6, Math.sin(ang + 0.5) * len * 0.6,
				Math.cos(ang) * len, Math.sin(ang) * len
			);
			context.stroke();
		}
		// dark core
		const g = context.createRadialGradient(0, 0, 2, 0, 0, hazard.width / 2 * breathe);
		g.addColorStop(0, 'rgba(8, 4, 18, 0.95)');
		g.addColorStop(0.7, 'rgba(30, 12, 60, 0.85)');
		g.addColorStop(1, 'rgba(90, 40, 160, 0)');
		context.fillStyle = g;
		context.beginPath();
		context.arc(0, 0, hazard.width / 2 * breathe + 6, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}

	/** Swirling portal: counter-rotating arcs around a radiant core. */
	drawPortal(portal, ready, frame) {
		const { context } = this;
		const cx = portal.x + portal.width / 2, cy = portal.y + portal.height / 2;
		const R = Math.max(portal.width, portal.height) / 2;
		context.save();
		context.translate(cx, cy);
		if (!ready) {
			context.strokeStyle = this.colors.portalLocked;
			context.lineWidth = 3;
			context.globalAlpha = 0.7;
			context.strokeRect(-portal.width / 2, -portal.height / 2, portal.width, portal.height);
			context.restore();
			return;
		}
		// radiant core
		const g = context.createRadialGradient(0, 0, 2, 0, 0, R * 1.4);
		g.addColorStop(0, 'rgba(255, 240, 200, 0.9)');
		g.addColorStop(0.5, 'rgba(245, 217, 126, 0.35)');
		g.addColorStop(1, 'rgba(245, 217, 126, 0)');
		context.fillStyle = g;
		context.beginPath();
		context.arc(0, 0, R * 1.4, 0, Math.PI * 2);
		context.fill();
		// swirling arcs
		context.shadowColor = '#f5d97e';
		context.shadowBlur = 18;
		context.strokeStyle = '#ffe9a8';
		context.lineWidth = 4;
		for (let ring = 0; ring < 3; ring += 1) {
			const rr = R * (0.55 + ring * 0.28);
			const start = frame * (0.03 + ring * 0.014) * (ring % 2 ? -1 : 1);
			context.beginPath();
			context.arc(0, 0, rr, start, start + Math.PI * 1.25);
			context.stroke();
		}
		context.restore();
	}

	/** Collect bursts: expanding golden rings + fading sparks. */
	drawBursts(world) {
		const { context } = this;
		world.bursts = (world.bursts || []).filter(b => world.frame - b.born < 26);
		for (const b of world.bursts) {
			const age = world.frame - b.born;
			const t = age / 26;
			context.save();
			context.globalAlpha = 1 - t;
			context.strokeStyle = '#ffe9a8';
			context.lineWidth = 3;
			context.shadowColor = '#f5d97e';
			context.shadowBlur = 10;
			context.beginPath();
			context.arc(b.x, b.y, 6 + t * 30, 0, Math.PI * 2);
			context.stroke();
			context.fillStyle = '#fff3c4';
			for (let i = 0; i < 6; i += 1) {
				const ang = (i / 6) * Math.PI * 2 + b.seed;
				const d = t * 36;
				context.beginPath();
				context.arc(b.x + Math.cos(ang) * d, b.y + Math.sin(ang) * d, 2.4 * (1 - t) + 0.6, 0, Math.PI * 2);
				context.fill();
			}
			context.restore();
		}
	}

	/** Vessel of light: radiant head orb, robed body, walk-bob and idle breath. */
	drawPlayer(world) {
		if (world.graceFrames > 0 && Math.floor(world.graceFrames / 5) % 2 === 0) return;
		const { context } = this;
		const p = world.player;
		const cx = p.x + p.width / 2;
		const feetY = p.y + p.height;
		const moving = Math.abs(p.dx) > 0.1 || Math.abs(p.dy) > 0.1;
		const bob = moving ? Math.abs(Math.sin(world.frame * 0.35)) * 3 : Math.sin(world.frame * 0.06) * 1.6;
		const facing = p.facing || 1;
		context.save();
		context.translate(cx, feetY - bob);
		context.scale(facing, 1);
		const W = p.width, H = p.height;
		context.shadowColor = '#ffe9a8';
		context.shadowBlur = 20;
		// robe body
		const g = context.createLinearGradient(0, -H, 0, 0);
		g.addColorStop(0, '#fff6dd');
		g.addColorStop(0.6, '#f0d488');
		g.addColorStop(1, '#b98f2e');
		context.fillStyle = g;
		context.beginPath();
		context.moveTo(-W * 0.22, -H * 0.62);
		context.quadraticCurveTo(-W * 0.42, -H * 0.25, -W * 0.36, 0);
		context.lineTo(W * 0.36, 0);
		context.quadraticCurveTo(W * 0.42, -H * 0.25, W * 0.22, -H * 0.62);
		context.closePath();
		context.fill();
		// sash
		context.shadowBlur = 0;
		context.strokeStyle = '#8a5a1a';
		context.lineWidth = 2;
		context.beginPath();
		context.moveTo(-W * 0.3, -H * 0.3);
		context.quadraticCurveTo(0, -H * 0.18, W * 0.3, -H * 0.34);
		context.stroke();
		// head orb
		context.shadowColor = '#fff3c4';
		context.shadowBlur = 24;
		const hg = context.createRadialGradient(0, -H * 0.78, 1, 0, -H * 0.78, W * 0.22);
		hg.addColorStop(0, '#ffffff');
		hg.addColorStop(0.6, '#ffedb5');
		hg.addColorStop(1, '#e8b93e');
		context.fillStyle = hg;
		context.beginPath();
		context.arc(0, -H * 0.78, W * 0.2, 0, Math.PI * 2);
		context.fill();
		// halo
		context.shadowBlur = 0;
		context.strokeStyle = 'rgba(255, 240, 200, 0.65)';
		context.lineWidth = 1.6;
		context.beginPath();
		context.ellipse(0, -H * 0.82, W * 0.3, W * 0.1, -0.25, 0, Math.PI * 2);
		context.stroke();
		context.restore();
	}

	/** Red edge vignette while damage flash is active. */
	drawDamageFlash(world) {
		if (!world.damageFlash || world.damageFlash <= 0) return;
		const { context, canvas } = this;
		const a = Math.min(0.5, world.damageFlash / 40);
		const g = context.createRadialGradient(
			canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.3,
			canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.7
		);
		g.addColorStop(0, 'rgba(255, 40, 40, 0)');
		g.addColorStop(1, `rgba(255, 40, 40, ${a})`);
		context.fillStyle = g;
		context.fillRect(0, 0, canvas.width, canvas.height);
	}
}
