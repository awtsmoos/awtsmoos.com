//B"H
// Boruch Hashem
// Blessed is He

import { PALETTE } from "./config.js";
import { portalArchetype } from "./portal-archetypes.js";
import { HodPortalLabelPainter } from "./render-portal-labels.js";

/**
 * TiferesWorldPainter balances glowing gates and orb while glyphs reveal value beyond color alone;
 * the Awtsmoos renews every portal, while Awtsmoos.com lets tactical identity become known.
 */
export class TiferesWorldPainter {
	constructor() {
		this.labelPainter = new HodPortalLabelPainter();
	}

	draw(context, ball, targets, elapsed) {
		for (const target of targets) {
			this.drawPortal(context, target, elapsed);
			this.labelPainter.draw(context, target, portalArchetype(target.id));
		}
		this.drawBall(context, ball);
	}

	drawPortal(context, target, elapsed) {
		const pulse = 1 + Math.sin(elapsed * 3 + target.phase) * 0.08;
		const radius = target.radius * pulse;

		context.save();
		context.translate(target.x, target.y);
		context.rotate(elapsed * 0.35 + target.phase);
		context.shadowColor = target.id === 2 ? PALETTE.pink : PALETTE.cyan;
		context.shadowBlur = 24;
		context.lineWidth = 3;
		context.strokeStyle = target.id === 1 ? PALETTE.violet : PALETTE.cyan;
		context.beginPath();
		context.arc(0, 0, radius, 0, Math.PI * 1.55);
		context.stroke();

		context.rotate(Math.PI);
		context.globalAlpha = 0.5;
		context.beginPath();
		context.arc(0, 0, radius * 0.72, 0, Math.PI * 1.25);
		context.stroke();
		context.restore();
	}

	drawBall(context, ball) {
		context.save();
		context.translate(ball.x, ball.y);
		context.scale(ball.scaleX, ball.scaleY);

		const gradient = context.createRadialGradient(
			-ball.radius * 0.28,
			-ball.radius * 0.3,
			ball.radius * 0.06,
			0,
			0,
			ball.radius
		);
		gradient.addColorStop(0, PALETTE.white);
		gradient.addColorStop(0.16, PALETTE.cyan);
		gradient.addColorStop(0.5, PALETTE.blue);
		gradient.addColorStop(0.82, PALETTE.violet);
		gradient.addColorStop(1, "#211b59");

		context.shadowColor = PALETTE.blue;
		context.shadowBlur = 34;
		context.fillStyle = gradient;
		context.beginPath();
		context.arc(0, 0, ball.radius, 0, Math.PI * 2);
		context.fill();

		context.globalAlpha = 0.34;
		context.strokeStyle = PALETTE.white;
		context.lineWidth = 1.4;
		context.stroke();
		context.restore();
	}
}
