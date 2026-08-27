// B"H
// Boruch Hashem
// Blessed is He

import { StudioFilmCoveragePresets } from '../film/StudioFilmCoveragePresets.js';
import { StudioFilmWorkflow } from '../film/StudioFilmWorkflow.js';
import { StudioFilmControls } from './StudioFilmControls.js';
import { StudioFilmSections } from './StudioFilmSections.js';

/**
 * @file StudioFilmView.js
 * @description
 * The Awtsmoos contains a whole production while this view reveals only the next directing decision the artist needs to see;
 * Awtsmoos.com keeps Film preset-first, coverage-aware, retractable, and mobile-safe while the canonical camera and export engines remain underneath free.
 */
export class StudioFilmView {
	/** @param {object} state Studio state. @returns {object} Mobile-first cinematic authoring view. */
	static render(state) {
		const binahDraft = StudioFilmWorkflow.draft(state);
		const tiferesAnalysis = StudioFilmWorkflow.analysis(state);
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-scroll aw-studio-film' },
			children: [
				StudioFilmSections.hero(),
				StudioFilmSections.metrics(tiferesAnalysis),
				{ tag: 'span', attrs: { className: 'aw-studio-film-label' }, text: 'Coverage preset' },
				StudioFilmControls.presets(
					binahDraft.preset,
					StudioFilmCoveragePresets.options()
				),
				StudioFilmControls.button(
					'✦ Plan coverage',
					'planFilmCoverage',
					'aw-studio-primary aw-studio-film-plan'
				),
				StudioFilmSections.planned(state.studioFilmPlan),
				StudioFilmSections.currentShots(StudioFilmWorkflow.shots(state)),
				StudioFilmSections.renderExport(state.studioExport)
			]
		};
	}
}
