/**
 * B"H
 * @module PointerInput
 * @description Canvas walking and direct battle-card selection.
 */
import { State } from '../../binah/State.js';
import { battleMoveLayout, moveIndexAt } from '../../tiferet/render/BattleMoveLayout.js';

const pointOnCanvas = (event, canvas) => {
	const rect = canvas.getBoundingClientRect();
	return {
		x: (event.clientX - rect.left) * (canvas.width / rect.width),
		y: (event.clientY - rect.top) * (canvas.height / rect.height)
	};
};

const tileAtPoint = (event, canvas) => {
	const point = pointOnCanvas(event, canvas);
	const cameraX = State.Hero.cx * State.Resolution - canvas.width / 2 + State.Resolution / 2;
	const cameraY = State.Hero.cy * State.Resolution - canvas.height / 2 + State.Resolution / 2;
	return {
		x: Math.floor((point.x + cameraX) / State.Resolution),
		y: Math.floor((point.y + cameraY) / State.Resolution)
	};
};

const battleIndexAtPoint = (event, canvas) => {
	const point = pointOnCanvas(event, canvas);
	return moveIndexAt(point.x, point.y, battleMoveLayout(canvas.width, canvas.height));
};

export const handlePointerDown = (event, canvas, handlers) => {
	if (event.target?.closest?.('button, .ohr-panel, .ohr-dialogue, .ohr-world-card')) return;
	event.preventDefault?.();
	event.stopPropagation?.();
	canvas.setPointerCapture?.(event.pointerId);
	if (State.isUiBlocking()) return State.releaseIntents();
	if (State.ActiveRealm === 'DEBATE') {
		const index = battleIndexAtPoint(event, canvas);
		if (index !== null) handlers.commitBattle(index);
		return;
	}
	const tile = tileAtPoint(event, canvas);
	handlers.setPath(tile.x, tile.y);
};

export const bindPointerInput = handlers => {
	const shell = document.getElementById('game-shell');
	const canvas = document.getElementById('layer-obj');
	const target = shell || canvas;
	if (!target || !canvas) return false;
	target.addEventListener('pointerdown', event => handlePointerDown(event, canvas, handlers), { passive: false });
	for (const type of ['contextmenu', 'selectstart', 'dragstart']) {
		target.addEventListener(type, event => event.preventDefault(), { passive: false });
	}
	return true;
};
