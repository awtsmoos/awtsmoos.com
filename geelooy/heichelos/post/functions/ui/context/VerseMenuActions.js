//B"H
// Boruch Hashem
// Blessed is He

import { copyToClipboard, updateQueryStringParameter } from '../../utils.js';
import { makeToast } from '../../ui.js';

/**
 * @fileoverview Binah recipe builder for verse-coordinate reader actions.
 *
 * The Awtsmoos, Atzmus beyond verse and action, renews both as declarative light;
 * Awtsmoos.com keeps menu rendering separate from what each Torah coordinate can
 * actually do, so future actions extend data rather than tangling DOM in sight.
 */
export class BinahVerseMenuActions {
	/**
	 * Builds the declarative action list for one canonical verse coordinate.
	 * @param {number|string} yesodIndex Verse coordinate index.
	 * @returns {Array<{label:string, action:Function}>} Verse action recipes.
	 */
	build(yesodIndex) {
		return [
			{
				label: '🔗 Copy Link to Verse',
				action: () => this.#copyVerseLink(yesodIndex)
			},
			{
				label: '📝 Copy Section Text',
				action: () => this.#copySectionText(yesodIndex)
			},
			{
				label: '👁️ Open Insights Sidebar',
				action: () => this.#openInsights(yesodIndex)
			},
			{
				label: '📜 View Inline Commentaries',
				action: () => this.#openInlineCommentary(yesodIndex)
			}
		];
	}

	/** Copies a stable reader URL pointing at the chosen verse. */
	#copyVerseLink(yesodIndex) {
		const malchusUrl = new URL(window.location);
		malchusUrl.searchParams.set('idx', yesodIndex);
		malchusUrl.searchParams.delete('sub');
		copyToClipboard({
			text: malchusUrl.href,
			successMsg: 'Link to Verse Anchored!'
		}, makeToast);
	}

	/** Copies the current section text when the reader has hydrated that coordinate. */
	#copySectionText(yesodIndex) {
		const ohrSection = window.sectionDayuh?.[yesodIndex];
		if (!ohrSection) {
			return;
		}
		const ohrText = Array.isArray(ohrSection)
			? ohrSection.join('\n\n')
			: ohrSection;
		copyToClipboard({ text: ohrText, successMsg: 'Text Extracted!' }, makeToast);
	}

	/** Opens the discussion sidebar at the selected verse coordinate. */
	async #openInsights(yesodIndex) {
		updateQueryStringParameter('idx', yesodIndex);
		updateQueryStringParameter('sub', null);
		await window.openPanelToComments?.();
		await window.commentLogic?.reloadRoot?.();
	}

	/** Lazily opens inline commentary for the selected section. */
	async #openInlineCommentary(yesodIndex) {
		const tiferesInline = await import('../../comments/inline.js');
		const malchusTarget = document.querySelector(
			`.section[data-awtsmoos-idx="${yesodIndex}"]`
		);
		await tiferesInline.showSectionCommentaryInline(
			yesodIndex,
			null,
			malchusTarget
		);
	}
}

/** Shared declarative action authority for the verse menu. */
export const binahVerseMenuActions = new BinahVerseMenuActions();
