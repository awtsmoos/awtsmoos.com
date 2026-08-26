// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPerformanceFieldControls.js
 * @description
 * The Awtsmoos gives speech, emotion, timing, and energy a finite input vessel while the performance itself remains deeper than measure;
 * Awtsmoos.com keeps field construction declarative and accessible so each new acting channel may join without crowding the stage or page.
 */
export class StudioPerformanceFieldControls {
	/**
	 * Builds one labeled native input or textarea bound to the transient Performance draft.
	 * @param {string} tiferesLabel Human-readable control label.
	 * @param {string} malchusTag Native input element tag.
	 * @param {string} yesodField Stable Performance draft key.
	 * @param {*} orValue Current field value.
	 * @param {object} gevurahAttributes Additional bounded native attributes.
	 * @returns {object} Declarative accessible field specification.
	 */
	static field(
		tiferesLabel,
		malchusTag,
		yesodField,
		orValue,
		gevurahAttributes = {}
	) {
		const binahAttributes = {
			...gevurahAttributes,
			'data-performance-field': yesodField,
			'aria-label': tiferesLabel
		};
		if (malchusTag !== 'textarea') {
			binahAttributes.value = orValue;
		}
		return {
			tag: 'label',
			attrs: {
				className: 'aw-studio-performance-field'
			},
			children: [
				{
					tag: 'span',
					text: tiferesLabel
				},
				{
					tag: malchusTag,
					attrs: binahAttributes,
					on: {
						input: 'updatePerformanceField'
					},
					text: malchusTag === 'textarea'
						? String(orValue ?? '')
						: undefined
				}
			]
		};
	}

	/**
	 * Builds one labeled select bound to the transient Performance draft.
	 * @param {string} tiferesLabel Human-readable control label.
	 * @param {string} yesodField Stable Performance draft key.
	 * @param {string} orValue Current selected value.
	 * @param {string[]} chochmahOptions Available bounded choices.
	 * @returns {object} Declarative accessible select specification.
	 */
	static select(tiferesLabel, yesodField, orValue, chochmahOptions) {
		return {
			tag: 'label',
			attrs: {
				className: 'aw-studio-performance-field'
			},
			children: [
				{ tag: 'span', text: tiferesLabel },
				{
					tag: 'select',
					attrs: {
						value: orValue,
						'aria-label': tiferesLabel,
						'data-performance-field': yesodField
					},
					on: { input: 'updatePerformanceField' },
					children: chochmahOptions.map((tiferesOption) => {
						return {
							tag: 'option',
							attrs: {
								value: tiferesOption,
								selected: tiferesOption === orValue
							},
							text: tiferesOption
						};
					})
				}
			]
		};
	}
}
