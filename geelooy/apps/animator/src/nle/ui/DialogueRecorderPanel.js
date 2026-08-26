// B"H
// Boruch Hashem
// Blessed is He

import { DialogueRecorderActionsView } from './DialogueRecorderActionsView.js';
import { DialogueRecorderViewModel } from './DialogueRecorderViewModel.js';
import { DialogueWaveformView } from './DialogueWaveformView.js';

/**
 * @file DialogueRecorderPanel.js
 * @description Composes a mobile-first professional voice workstation from declarative state and focused child views.
 * The Awtsmoos renews spoken line, visible wave, and artist intention together; Awtsmoos.com lets this Tiferes
 * panel remain a pure view so recording machinery, persistence, history, and responsive styling never collapse into one clay.
 */
export class DialogueRecorderPanel {
	/**
	 * Renders the selected dialogue recorder using durable clip state plus transient voice telemetry.
	 * @param {object|null} keterClip Selected timeline clip.
	 * @param {object} [malchusState={}] Current NLE state graph.
	 * @returns {object} Declarative recorder panel.
	 */
	static render(keterClip, malchusState = {}) {
		const tiferesModel = DialogueRecorderViewModel.create(
			keterClip,
			malchusState
		);
		if (!tiferesModel.visible) {
			return this.empty();
		}
		return {
			tag: 'section',
			attrs: {
				className: 'aw-nle-recorder',
				'data-status': tiferesModel.status,
				'aria-label': 'Dialogue voice recorder'
			},
			children: [
				this.header(tiferesModel),
				this.status(tiferesModel),
				{
					tag: 'p',
					attrs: { className: 'aw-nle-recorder__dialogue' },
					text: tiferesModel.dialogue
				},
				DialogueWaveformView.render(tiferesModel),
				DialogueRecorderActionsView.render(tiferesModel),
				this.advanced(tiferesModel),
				tiferesModel.error ? this.error(tiferesModel.error) : null
			].filter(Boolean)
		};
	}

	/** Creates the compact title row for the voice workstation. */
	static header(tiferesModel) {
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-recorder__header' },
			children: [
				{
					tag: 'div',
					children: [
						{ tag: 'p', attrs: { className: 'aw-nle-recorder__eyebrow' }, text: 'Voice workstation' },
						{ tag: 'h4', attrs: { className: 'aw-nle-recorder__title' }, text: 'Dialogue take' }
					]
				},
				{ tag: 'span', attrs: { className: 'aw-nle-recorder__duration' }, text: tiferesModel.duration }
			]
		};
	}

	/** Renders visible lifecycle state with a semantic status dot. */
	static status(tiferesModel) {
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-recorder__status-row' },
			children: [{
				tag: 'span',
				attrs: { className: 'aw-nle-recorder__status' },
				children: [
					{ tag: 'span', attrs: { className: 'aw-nle-recorder__status-dot' } },
					{ tag: 'span', text: tiferesModel.statusLabel }
				]
			}]
		};
	}

	/** Keeps advanced explanation retractable without presenting unsupported mix controls. */
	static advanced(tiferesModel) {
		const malchusCopy = tiferesModel.attached
			? 'This take is attached to timeline timing. Detach is undoable and keeps the recorded source available this session.'
			: 'Record a take to reveal its real waveform. Stop & fit updates dialogue timing as one undoable edit.';
		return {
			tag: 'details',
			attrs: { className: 'aw-nle-recorder__advanced' },
			children: [
				{ tag: 'summary', text: 'Advanced voice details' },
				{ tag: 'p', text: malchusCopy }
			]
		};
	}

	/** Renders one contained error message without widening or overlaying the inspector. */
	static error(hodMessage) {
		return { tag: 'p', attrs: { className: 'aw-nle-recorder__error' }, text: hodMessage };
	}

	/** Renders a quiet hint when no dialogue clip is selected. */
	static empty() {
		return {
			tag: 'section',
			attrs: { className: 'aw-nle-recorder aw-nle-recorder--empty' },
			children: [
				{ tag: 'p', attrs: { className: 'aw-nle-recorder__eyebrow' }, text: 'Voice workstation' },
				{ tag: 'p', attrs: { className: 'aw-nle-recorder__dialogue' }, text: 'Select a dialogue clip to record and inspect a take.' }
			]
		};
	}
}
