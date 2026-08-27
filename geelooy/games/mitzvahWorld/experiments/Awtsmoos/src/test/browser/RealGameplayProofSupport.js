// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealGameplayProofSupport.js
 * @description Observes production gameplay and drives only the same keyboard doors a player uses.
 * The Awtsmoos joins intention to consequence; Awtsmoos.com records focus, input release,
 * camera, renderer, target health, combat state, and canvas truth without a secret test-only path.
 */

export function dispatchGameplayKey(game, type, code, key = '') {
	const event = new game.KeyboardEvent(type, {
		bubbles: true,
		cancelable: true,
		code,
		key: key || code,
		view: game
	});
	game.dispatchEvent(event);
	game.document.dispatchEvent(event);
}

export function gameplaySnapshot(game) {
	const root = game.document.documentElement;
	const value = game.AwtsmoosMitzvahWorld;
	const runtime = value?.runtime;
	const canvas = game.document.querySelector('#AwtsmoosCanvas');
	const target = runtime?.enemies?.selected;
	return {
		bootError: root.dataset.awtsmoosBootError || null,
		bootStage: root.dataset.awtsmoosBootStage || null,
		camera: vector(runtime?.camera?.position),
		canvas: canvasDimensions(canvas),
		combat: runtime?.combat?.diagnostics?.() || null,
		dpr: Number(game.devicePixelRatio || 1),
		gameplay: root.dataset.awtsmoosGameplay || null,
		href: game.location.href,
		inputKeys: [...(runtime?.input?.keys || [])].sort(),
		player: playerPosition(runtime),
		productionEntry: [...game.document.scripts].some(script => (
			script.src.includes('mitzvah-world.compact.js')
		)),
		readiness: root.dataset.awtsmoosReadiness || null,
		renderer: rendererSnapshot(runtime),
		runtimeError: runtime?.lastFrameError || root.dataset.awtsmoosRuntimeError || null,
		target: targetSnapshot(target)
	};
}

export async function waitForGameplay(frame, timeoutMs = 30000) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const game = frame.contentWindow;
		const snapshot = game?.document ? gameplaySnapshot(game) : null;
		if (
			snapshot?.combat
			&& snapshot.canvas.cssWidth > 0
			&& snapshot.gameplay === 'true'
		) {
			return game;
		}
		await delay(100);
	}
	throw new Error('REAL_GAMEPLAY_BOOT_TIMEOUT');
}

export function playerDistance(before, after) {
	return Math.hypot(
		after.player.x - before.player.x,
		after.player.z - before.player.z
	);
}

export function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function playerPosition(runtime) {
	return {
		x: Number(runtime?.state?.x || 0),
		y: Number(runtime?.state?.y || 0),
		z: Number(runtime?.state?.z || 0)
	};
}

function canvasDimensions(canvas) {
	return {
		cssHeight: canvas?.clientHeight || 0,
		cssWidth: canvas?.clientWidth || 0,
		renderHeight: canvas?.height || 0,
		renderWidth: canvas?.width || 0
	};
}

function rendererSnapshot(runtime) {
	return {
		backend: runtime?.renderer?.backend || runtime?.renderer?.constructor?.name || null,
		renderDpr: runtime?.terrain?.stats?.renderDpr || null,
		renderScale: runtime?.terrain?.stats?.renderScale || null
	};
}

function targetSnapshot(target) {
	return target ? {
		alive: Boolean(target.alive),
		health: Number(target.health ?? target.profile?.health ?? 0),
		id: target.profile?.id || target.id || null,
		position: vector(target.group?.position)
	} : null;
}

function vector(value) {
	return {
		x: Number(value?.x || 0),
		y: Number(value?.y || 0),
		z: Number(value?.z || 0)
	};
}
