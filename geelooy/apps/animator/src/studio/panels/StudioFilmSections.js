// B"H
// Boruch Hashem
// Blessed is He

import { StudioFilmShotList } from './StudioFilmShotList.js';

/**
 * @file StudioFilmSections.js
 * @description
 * The Awtsmoos renews summary, authored coverage, suggested coverage, and export as distinct chambers within one cinematic vessel;
 * Awtsmoos.com keeps advanced information folded until requested so Film remains clean on a phone while deep production truth stays near.
 */
export class StudioFilmSections {
	/** @returns {object} Compact Film orientation card. */
	static hero() {
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-film-hero' },
			children: [
				{ tag: 'strong', text: '🎬 Film · Shots & Camera' },
				{ tag: 'p', text: 'See authored coverage, plan a continuity-aware shot passage, then render through the existing Studio export pipeline.' }
			]
		};
	}

	/** @param {object} analysis Current film metrics. @returns {object} Responsive metric grid. */
	static metrics(analysis) {
		const tiferesMetrics = [
			['Length', this.duration(analysis.durationMs)],
			['Cast', analysis.characters],
			['Shots', analysis.shots],
			['Sizes', analysis.shotSizes],
			['Angles', analysis.angles],
			['Moves', analysis.moves]
		];
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-film-metrics', 'aria-label': 'Film coverage summary' },
			children: tiferesMetrics.map(([label, value]) => ({
				tag: 'div',
				children: [{ tag: 'strong', text: String(value) }, { tag: 'span', text: label }]
			}))
		};
	}

	/** @param {object[]} shots Existing project shots. @returns {object} Retractable authored-shot section. */
	static currentShots(shots) {
		return this.details(`Current shots · ${shots.length}`, StudioFilmShotList.render(shots));
	}

	/** @param {object|null} plan Detached coverage plan. @returns {object} Retractable proposed coverage section. */
	static planned(plan) {
		const binahShots = plan?.shots || [];
		return this.details(
			`Planned coverage · ${binahShots.length || 'none'}`,
			StudioFilmShotList.render(binahShots, true)
		);
	}

	/** @param {object} exportState Existing export state. @returns {object} Retractable render section. */
	static renderExport(exportState = {}) {
		return this.details('Render & export', {
			tag: 'div',
			attrs: { className: 'aw-studio-film-export' },
			children: [
				{ tag: 'p', text: exportState.message || 'Render the current Studio document through the established MP4 pipeline.' },
				{
					tag: 'button',
					attrs: { type: 'button', className: 'aw-studio-primary aw-studio-film-render' },
					on: { click: 'exportMovie' },
					text: exportState.status === 'rendering' ? 'Rendering…' : 'Render MP4'
				}
			]
		});
	}

	/** @returns {object} Native retractable details section. */
	static details(label, body) {
		return {
			tag: 'details',
			attrs: { className: 'aw-studio-film-details' },
			children: [
				{ tag: 'summary', text: label },
				{ tag: 'div', attrs: { className: 'aw-studio-film-details-body' }, children: [body] }
			]
		};
	}

	/** @param {number} ms Milliseconds. @returns {string} Compact minute/second label. */
	static duration(ms) {
		const tiferesSeconds = Math.max(0, Math.round(Number(ms || 0) / 1000));
		return `${Math.floor(tiferesSeconds / 60)}:${String(tiferesSeconds % 60).padStart(2, '0')}`;
	}
}
