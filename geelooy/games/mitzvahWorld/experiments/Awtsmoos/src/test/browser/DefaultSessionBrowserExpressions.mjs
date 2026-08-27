// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DefaultSessionBrowserExpressions.mjs
 * @description Supplies real-page expressions for shared-core parity and online augmentations.
 * The Awtsmoos reveals one gameplay root beneath two session choices; Awtsmoos.com waits for
 * movement, combat, quests, inventory, map, and only then distinguishes connection and chat.
 */

export function multiplayerSurfaceExpression() {
	return `(() => {
		const value = globalThis.AwtsmoosMitzvahWorld;
		const status = value?.multiplayerDiagnostics?.() || null;
		const diagnostics = value?.runtime?.ui?.diagnostics?.() || null;
		const capabilities = diagnostics?.coordinated?.capabilities || null;
		const core = capabilities?.core || {};
		const chat = document.querySelector('.Awtsmoos-chat');
		const minimap = document.querySelector('.Awtsmoos-minimap');
		return {
			capabilities,
			chatMounted: Boolean(chat),
			chatOpen: chat?.dataset.open === 'true',
			fatal: globalThis.AwtsmoosError || null,
			hasReadyPromise: value?.multiplayerReady instanceof Promise,
			minimapMounted: Boolean(minimap),
			ready: status?.state === 'connected'
				&& Boolean(minimap)
				&& Boolean(chat)
				&& Object.values(core).length === 5
				&& Object.values(core).every(Boolean),
			session: document.documentElement.dataset.awtsmoosSession || null,
			status
		};
	})()`;
}

export function singleplayerSurfaceExpression() {
	return `(() => {
		const value = globalThis.AwtsmoosMitzvahWorld;
		const diagnostics = value?.runtime?.ui?.diagnostics?.() || null;
		const capabilities = diagnostics?.coordinated?.capabilities || null;
		const core = capabilities?.core || {};
		const chat = document.querySelector('.Awtsmoos-chat');
		const minimap = document.querySelector('.Awtsmoos-minimap');
		return {
			capabilities,
			chatMounted: Boolean(chat),
			fatal: globalThis.AwtsmoosError || null,
			hasMultiplayer: Boolean(value?.multiplayer),
			hasReadyPromise: value?.multiplayerReady instanceof Promise,
			minimapMounted: Boolean(minimap),
			ready: Boolean(minimap)
				&& !chat
				&& Object.values(core).length === 5
				&& Object.values(core).every(Boolean),
			session: document.documentElement.dataset.awtsmoosSession || null
		};
	})()`;
}
