// B"H

import { viewportOf } from './theme.js';

export function drawCanvasStatus(ctx, renderState) {
	const viewport = viewportOf(ctx);
	ctx.save();
	ctx.font = '600 10px ui-monospace, monospace';
	ctx.textAlign = 'right';
	ctx.textBaseline = 'bottom';
	ctx.fillStyle = 'rgba(248, 243, 223, 0.62)';
	ctx.fillText(`${renderState.player.x},${renderState.player.y}`, viewport.width - 12, viewport.height - 10);
	ctx.restore();
}
