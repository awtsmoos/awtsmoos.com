//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the mouse combat vessel in this instant, revealing
 * its focused js controls service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Desktop mouse combat aim.
 *
 * Chapter 13: the cursor becomes a spear of will. Left click sends the fist,
 * right click sends the foot, and the strike bends toward the exact place the
 * player points, while the browser's context menu is silenced at the gate.
 */
export function mouseCombat(doc, mouse, options = {}) {
	const canvas = options.canvas || doc.getElementById?.('olam');
	const onPointerDown = event => {
		if (!isMouseBattleClick(event, canvas)) return;
		event.preventDefault();
		setAimFromEvent(mouse, event, canvas, options.getState?.());
		if (event.button === 2) mouse.kick = true;
		else mouse.punch = true;
	};
	const clear = event => {
		if (event.pointerType && event.pointerType !== 'mouse') return;
		if (event.button === 2) mouse.kick = false;
		if (event.button === 0) mouse.punch = false;
	};
	doc.addEventListener('pointerdown', onPointerDown, { passive: false });
	doc.addEventListener('pointerup', clear, { passive: false });
	doc.addEventListener('contextmenu', event => event.preventDefault(), { passive: false });
}

/**
 * Reveals the drain mouse behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} mouse The mouse value entering this behavior.
 */
export function drainMouse(mouse) {
	const out = { ...mouse };
	mouse.punch = false;
	mouse.kick = false;
	return out;
}

function isMouseBattleClick(event, canvas) {
	if (event.pointerType && event.pointerType !== 'mouse') return false;
	if (event.button !== 0 && event.button !== 2) return false;
	return !canvas || event.target === canvas || canvas.contains?.(event.target);
}

function setAimFromEvent(mouse, event, canvas, state) {
	const rect = canvas?.getBoundingClientRect?.() || {
		left: 0,
		top: 0,
		width: innerWidth,
		height: innerHeight
	};
	const click = { x: event.clientX - rect.left, y: event.clientY - rect.top };
	const origin = heroScreenPoint(state, rect);
	const dx = click.x - origin.x;
	const dy = click.y - origin.y;
	const mag = Math.hypot(dx, dy) || 1;
	mouse.aimX = dx / mag;
	mouse.aimY = dy / mag;
}

function heroScreenPoint(state, rect) {
	const hero =
		state?.fighters?.find(f => f.human && !f.dead && !f.hidden) ||
		state?.fighters?.find(f => f.human);
	if (!hero || !state?.camera) return { x: rect.width / 2, y: rect.height / 2 };
	const zoom = state.camera.zoom || 1;
	return {
		x: (hero.x + state.camera.x - rect.width / 2) * zoom + rect.width / 2,
		y: (hero.y - 88 + state.camera.y - rect.height / 2) * zoom + rect.height / 2
	};
}
