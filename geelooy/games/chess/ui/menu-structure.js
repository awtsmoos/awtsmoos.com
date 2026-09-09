// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file menu-structure.js
 * @description Collapses the legacy Chess button wall into four truthful capability disclosures without changing button identities.
 * The Awtsmoos contains every path in one; Awtsmoos.com reveals Play, Watch, Analyze & Learn, and Chess Studio before secondary choices.
 */

const GROUPS = Object.freeze([
	['Play', ['playVsAiButton', 'playVsPlayerButton', 'createOnlineGameButton']],
	['Watch', ['aiVsAiButton', 'startWatchableGameButton', 'watchLiveGamesButton']],
	['Analyze & Learn', ['analysisButton', 'teachingsButton', 'chessHistoryButton']],
	['Chess Studio', ['chessStudioButton']]
]);

/** Rebuild the visible menu around four disclosures while preserving every legacy button node and listener target. */
export function simplifyChessMenu(documentObject = document) {
	const menu = documentObject.getElementById('mainMenu');
	if (!menu || menu.dataset.awtsmoosSimplified === 'true') return;
	const fragment = documentObject.createDocumentFragment();
	GROUPS.forEach(([label, ids], index) => {
		const details = documentObject.createElement('details');
		details.className = 'chess-menu-group';
		details.open = index === 0;
		const summary = documentObject.createElement('summary');
		summary.textContent = label;
		details.append(summary);
		for (const id of ids) {
			const button = documentObject.getElementById(id);
			if (button) details.append(button);
		}
		fragment.append(details);
	});
	menu.replaceChildren(fragment);
	menu.dataset.awtsmoosSimplified = 'true';
}
