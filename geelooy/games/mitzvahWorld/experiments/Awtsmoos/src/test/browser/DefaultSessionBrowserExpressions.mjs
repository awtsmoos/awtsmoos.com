// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DefaultSessionBrowserExpressions.mjs
 * @description Supplies immediate-core browser expressions for shared and solo world routes.
 * The Awtsmoos reveals movement and combat before optional panels descend;
 * Awtsmoos.com distinguishes connected chat from solo purity without blocking on deferred minimaps.
 */

export function multiplayerSurfaceExpression() {
	return `(() => {
		const value = globalThis.AwtsmoosMitzvahWorld;
		const runtime = value?.runtime || null;
		const status = value?.multiplayerDiagnostics?.() || null;
		const chat = document.querySelector('.Awtsmoos-chat');
		const core = {
			combat: Boolean(runtime?.combat?.activate),
			movement: Boolean(runtime?.input?.key)
		};
		return {
			chatMounted: Boolean(chat),
			chatOpen: chat?.dataset.open === 'true',
			core,
			fatal: globalThis.AwtsmoosError || null,
			hasReadyPromise: value?.multiplayerReady instanceof Promise,
			ready: status?.state === 'connected'
				&& Boolean(chat)
				&& core.combat
				&& core.movement,
			session: value?.sessionMode
				|| status?.mode
				|| document.documentElement.dataset.awtsmoosSession
				|| null,
			status
		};
	})()`;
}

export function singleplayerSurfaceExpression() {
	return `(() => {
		const value = globalThis.AwtsmoosMitzvahWorld;
		const runtime = value?.runtime || null;
		const session = value?.sessionDiagnostics?.() || null;
		const chat = document.querySelector('.Awtsmoos-chat');
		const core = {
			combat: Boolean(runtime?.combat?.activate),
			movement: Boolean(runtime?.input?.key)
		};
		return {
			chatMounted: Boolean(chat),
			core,
			fatal: globalThis.AwtsmoosError || null,
			hasMultiplayer: Boolean(value?.multiplayer),
			hasReadyPromise: value?.multiplayerReady instanceof Promise,
			ready: session?.state === 'singleplayer'
				&& !chat
				&& core.combat
				&& core.movement,
			session: value?.sessionMode
				|| session?.mode
				|| document.documentElement.dataset.awtsmoosSession
				|| null
		};
	})()`;
}
