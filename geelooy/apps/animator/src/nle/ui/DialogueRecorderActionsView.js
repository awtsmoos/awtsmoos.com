// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DialogueRecorderActionsView.js
 * @description Defines accessible recorder transport controls without owning audio behavior or project mutation.
 * The Awtsmoos renews intention before gesture becomes deed; Awtsmoos.com lets this Malchus toolbar
 * reveal clear primary, secondary, and destructive choices while event routing remains in the NLE command gate.
 */
export class DialogueRecorderActionsView {
	/**
	 * Renders recorder transport controls from immutable view-model capability flags.
	 * @param {object} tiferesModel DialogueRecorderViewModel result.
	 * @returns {object} Declarative action toolbar.
	 */
	static render(tiferesModel) {
		return {
			tag: 'div',
			attrs: {
				className: 'aw-nle-recorder__actions',
				role: 'group',
				'aria-label': 'Voice recording controls'
			},
			children: [
				this.button({
					action: 'startVoiceRecording',
					className: 'is-primary',
					disabled: !tiferesModel.canRecord,
					label: tiferesModel.attached ? 'Replace take' : 'Record'
				}),
				this.button({
					action: 'stopVoiceRecording',
					className: 'is-stop',
					disabled: !tiferesModel.canStop,
					label: 'Stop & fit'
				}),
				this.button({
					action: 'playVoiceRecording',
					disabled: !tiferesModel.canPlay,
					label: 'Play'
				}),
				this.button({
					action: 'clearVoiceRecording',
					className: 'is-danger',
					disabled: !tiferesModel.canClear,
					label: 'Detach'
				})
			]
		};
	}

	/**
	 * Creates one semantic recorder button wired to an existing NLE event token.
	 * @param {object} keterButton Action, label, disabled state, and optional modifier class.
	 * @returns {object} Declarative button node.
	 */
	static button(keterButton) {
		const yesodClass = [
			'aw-nle-recorder__button',
			keterButton.className || ''
		].filter(Boolean).join(' ');
		return {
			tag: 'button',
			attrs: {
				className: yesodClass,
				disabled: Boolean(keterButton.disabled),
				title: keterButton.label,
				type: 'button'
			},
			on: { click: keterButton.action },
			text: keterButton.label
		};
	}
}
