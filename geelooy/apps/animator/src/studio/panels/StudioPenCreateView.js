// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPenCreateView.js
 * @description
 * The Awtsmoos renews every unborn anchor before a finished path receives authored form;
 * Awtsmoos.com shows Pen status without storing draft geometry in the project, so experimentation remains light until Finish makes it real.
 */
export class StudioPenCreateView {
	/** Renders Pen activation plus explicit transient-draft completion controls. */
	static render(state = {}) {
		const active = state.studioTool === 'pen';
		const count = Number(state.studioPenDraftCount || 0);
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-create-section aw-studio-pen-section' },
			children: [
				{ tag: 'h3', text: '✒️ Pen path' },
				{
					tag: 'button',
					attrs: {
						type: 'button',
						className: `aw-studio-create-button${active ? ' selected' : ''}`,
						'aria-pressed': active ? 'true' : 'false',
						'aria-label': active ? 'Deactivate Pen tool' : 'Activate Pen tool',
						title: 'Click anchors on the production stage. Enter or Finish commits the path.'
					},
					on: { click: 'togglePenTool' },
					text: active ? '✒️ Pen active' : '✒️ Pen'
				},
				...(active ? [this.status(count), this.actions(count)] : [])
			]
		};
	}

	/** Reports transient anchor count without implying the draft is already authored. */
	static status(count) {
		return {
			tag: 'p',
			attrs: { className: 'aw-studio-pen-status', role: 'status' },
			text: count
				? `${count} transient anchor${count === 1 ? '' : 's'} • Enter finishes • Escape cancels`
				: 'Tap or click the stage to place anchors • Enter finishes • Escape cancels'
		};
	}

	/** Renders explicit commit and discard actions for the current transient draft. */
	static actions(count) {
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-pen-actions' },
			children: [
				{
					tag: 'button',
					attrs: {
						type: 'button',
						disabled: count < 2,
						'aria-label': 'Finish Pen path'
					},
					on: { click: 'finishPenPath' },
					text: '✅ Finish'
				},
				{
					tag: 'button',
					attrs: { type: 'button', disabled: count === 0, 'aria-label': 'Cancel Pen draft' },
					on: { click: 'cancelPenPath' },
					text: '❌ Cancel draft'
				}
			]
		};
	}
}
