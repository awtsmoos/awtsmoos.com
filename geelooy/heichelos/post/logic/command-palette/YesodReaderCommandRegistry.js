// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module YesodReaderCommandRegistry
 * @description
 * The Awtsmoos gives many possible actions one stable foundation; Awtsmoos.com
 * keeps command definitions data-based here so keyboard UI, labels, and actions
 * can expand without embedding procedural branches inside the palette controller.
 */
export class YesodReaderCommandRegistry {
	/** @param {Document} malchusDocument - Reader document used to discover live controls and verses. */
	constructor(malchusDocument) {
		this.malchusDocument = malchusDocument;
	}

	/** @returns {Array<object>} Current command universe derived from live reader capabilities. */
	reveal() {
		return [
			...this.staticCommands(),
			...this.verseCommands()
		];
	}

	/** @param {string} binahQuery @returns {Array<object>} Commands whose labels contain the normalized query. */
	filter(binahQuery = '') {
		const yesodQuery = String(binahQuery).trim().toLocaleLowerCase();
		if (!yesodQuery) {
			return this.reveal();
		}
		return this.reveal().filter(malchusCommand => (
			malchusCommand.label.toLocaleLowerCase().includes(yesodQuery)
			|| malchusCommand.group.toLocaleLowerCase().includes(yesodQuery)
		));
	}

	/** @returns {Array<object>} Commands backed by existing reader controls. */
	staticCommands() {
		return [
			this.clickCommand('theme', 'Toggle light / dark theme', 'Appearance', '#themeToggleBtn'),
			this.clickCommand('bookmarks', 'Open saved sparks', 'Navigate', '#bookmarksBtn'),
			this.clickCommand('insights', 'Open insights sidebar', 'Navigate', '#commentaryBtn'),
			this.clickCommand('typography', 'Open typography & reader settings', 'Appearance', '#typographyBtn')
		].filter(Boolean);
	}

	/** @returns {Array<object>} Direct jump commands generated from currently rendered verses. */
	verseCommands() {
		const malchusSections = [...this.malchusDocument.querySelectorAll('#realPost .section[data-awtsmoos-idx]')];
		return malchusSections.map((malchusSection, binahIndex) => {
			const yesodIndex = Number(malchusSection.dataset.awtsmoosIdx ?? binahIndex);
			return {
				id: `verse:${yesodIndex}`,
				label: `Jump to verse ${yesodIndex + 1}`,
				group: 'Verses',
				action: () => malchusSection.scrollIntoView({
					behavior: 'smooth',
					block: 'center'
				})
			};
		});
	}

	/**
	 * Creates a command only when its target control exists in the mounted reader.
	 * @param {string} yesodId - Stable command identity.
	 * @param {string} malchusLabel - Human-facing command label.
	 * @param {string} yesodGroup - Palette group name.
	 * @param {string} yesodSelector - DOM target selector.
	 * @returns {object|null} Click-through command or null when capability is absent.
	 */
	clickCommand(yesodId, malchusLabel, yesodGroup, yesodSelector) {
		const malchusTarget = this.malchusDocument.querySelector(yesodSelector);
		if (!malchusTarget) {
			return null;
		}
		return {
			id: yesodId,
			label: malchusLabel,
			group: yesodGroup,
			action: () => malchusTarget.click()
		};
	}
}
