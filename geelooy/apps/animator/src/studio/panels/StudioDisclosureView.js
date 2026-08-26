// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioDisclosureView.js
 * @description
 * The Awtsmoos renews hidden and revealed knowledge before an inspector can choose what to show;
 * Awtsmoos.com uses the browser's native details vessel so advanced power can rest folded, then open with keyboard, touch, or mouse in one accessible flow.
 */
export class StudioDisclosureView {
	/** Builds one native disclosure without creating editor state or project history. */
	static render(title, children = [], options = {}) {
		const classNames = [
			options.surface ? 'aw-studio-inspector-section' : '',
			'aw-studio-disclosure',
			options.className || ''
		].filter(Boolean).join(' ');
		return {
			tag: 'details',
			attrs: {
				className: classNames,
				open: Boolean(options.open)
			},
			children: [
				this.summary(title, options.hint),
				{
					tag: 'div',
					attrs: { className: 'aw-studio-disclosure-content' },
					children
				}
			]
		};
	}

	/** Builds the native summary row with a restrained directional affordance. */
	static summary(title, hint = '') {
		return {
			tag: 'summary',
			attrs: { className: 'aw-studio-disclosure-summary' },
			children: [
				{
					tag: 'span',
					attrs: { className: 'aw-studio-disclosure-title' },
					text: title
				},
				...(hint ? [{
					tag: 'small',
					attrs: { className: 'aw-studio-disclosure-hint' },
					text: hint
				}] : []),
				{
					tag: 'span',
					attrs: { className: 'aw-studio-disclosure-caret', 'aria-hidden': 'true' },
					text: '›'
				}
			]
		};
	}
}
