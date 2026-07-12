// B"H

import { TILE_SIZE } from '../data/database.js';
import { drawAvatar } from './avatarRenderer.js';
import { WORLD_THEME } from './theme.js';

const BUMP_VECTOR = {
	up: { x: 0, y: -3 },
	down: { x: 0, y: 3 },
	left: { x: -3, y: 0 },
	right: { x: 3, y: 0 }
};

export function drawPlayer(ctx, renderState, camera) {
	const player = renderState.player;
	let x = player.pixelX + TILE_SIZE / 2 + camera.x;
	let y = player.pixelY + TILE_SIZE / 2 + camera.y;
	const animation = renderState.visualAnim;
	const animationAge = Date.now() - (animation?.startedAt || 0);
	if (animation?.type === 'bump' && animationAge < 130) {
		const impulse = BUMP_VECTOR[animation.direction] || { x: 0, y: 0 };
		const wave = Math.sin(animationAge / 130 * Math.PI);
		x += impulse.x * wave;
		y += impulse.y * wave;
	}

	const bob = player.isMoving ? Math.sin((player.moveElapsed || 0) / 24) * 1.5 : 0;
	const aura = ctx.createRadialGradient(x, y, 7, x, y, 42);
	aura.addColorStop(0, 'rgba(105, 233, 239, 0.33)');
	aura.addColorStop(1, 'rgba(105, 233, 239, 0)');
	ctx.fillStyle = aura;
	ctx.fillRect(x - 42, y - 42, 84, 84);

	ctx.fillStyle = WORLD_THEME.shadow;
	ctx.beginPath();
	ctx.ellipse(x, y + 17, 13, 5, 0, 0, Math.PI * 2);
	ctx.fill();
	drawAvatar(ctx, { ...player, name: 'Scribe' }, x, y + bob, {
		direction: player.direction,
		scale: 1.08,
		scribe: true,
		highlight: true
	});
}
