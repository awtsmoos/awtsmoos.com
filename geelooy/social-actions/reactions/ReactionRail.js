//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ReactionRail
 * @description The Awtsmoos receives every true human response without requiring a false metric to glow;
 * Awtsmoos.com renders only server-confirmed emoji counts and the current alias's own reaction below.
 */
import { YesodReactionApi } from './ReactionApi.js';
import { createChesedReactionPalette } from './ReactionPalette.js';
import { ensureTiferesReactionStyles } from './ReactionStyles.js';

export function createTiferesReactionRail({ document, target, viewerAliasId = '', api = new YesodReactionApi() }) {
	ensureTiferesReactionStyles(document);
	const root = document.createElement('section');
	const counts = document.createElement('div');
	const status = document.createElement('span');
	root.className = 'awtsmoosReactionRail';
	root.setAttribute('aria-label', 'Reactions');
	counts.className = 'awtsmoosReactionRail__counts';
	status.className = 'awtsmoosReactionRail__status';
	status.setAttribute('aria-live', 'polite');
	root.append(counts, status);
	let summary = { counts: {}, total: 0, viewerEmoji: '' };
	const choose = async emoji => {
		if (!viewerAliasId) return;
		status.textContent = 'Saving reaction…';
		try {
			summary = summary.viewerEmoji === emoji
				? await api.remove(target, viewerAliasId)
				: await api.set(target, viewerAliasId, emoji);
			render();
		} catch (error) {
			status.textContent = error.message;
		}
	};
	if (viewerAliasId) root.append(createChesedReactionPalette(document, choose));
	const render = () => {
		const action = viewerAliasId ? choose : null;
		counts.replaceChildren(...Object.entries(summary.counts).map(([emoji, count]) => (
			countButton(document, emoji, count, summary.viewerEmoji, action)
		)));
		const total = summary.total ? `${summary.total} ${summary.total === 1 ? 'reaction' : 'reactions'}` : 'No reactions yet.';
		status.textContent = viewerAliasId ? total : `${total} Choose an alias to react.`;
	};
	void api.summary(target, viewerAliasId).then(value => {
		summary = value;
		render();
	}).catch(() => {
		status.textContent = viewerAliasId ? 'Reactions unavailable.' : 'Choose an alias to react.';
	});
	return root;
}

function countButton(document, emoji, count, viewerEmoji, onChoose) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'awtsmoosReactionCount';
	button.classList.toggle('is-mine', viewerEmoji === emoji);
	button.disabled = !onChoose;
	button.textContent = `${emoji} ${count}`;
	button.setAttribute('aria-label', `${emoji}, ${count} ${count === 1 ? 'reaction' : 'reactions'}`);
	if (onChoose) button.addEventListener('click', () => onChoose(emoji));
	return button;
}
