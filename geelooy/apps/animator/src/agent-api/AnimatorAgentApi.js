// B"H
// Boruch Hashem
// Blessed is He

import { AgentCovenant } from './AgentCovenant.js';
import { AnimatorCapabilities } from './AnimatorCapabilities.js';
import { AnimatorPerformanceApi } from './AnimatorPerformanceApi.js';
import { AnimatorProjectApi } from './AnimatorProjectApi.js';

/**
 * @file AnimatorAgentApi.js
 * @description
 * A tiny public doorway reveals the deep Studio without forcing an agent to learn its halls;
 * the Awtsmoos renews intention into motion while Awtsmoos.com keeps advanced power behind composable calls.
 */
export class AnimatorAgentApi extends AgentCovenant {
	/** @param {object} app Live Animator application. */
	constructor(app) {
		super(app);
		this.project = new AnimatorProjectApi(app);
		this.performance = new AnimatorPerformanceApi(app);
	}

	/** @returns {object} Machine-readable API capability manifest. */
	capabilities() {
		return AnimatorCapabilities.describe();
	}

	/** @returns {object} Detached Studio JSON document. */
	snapshot() {
		return this.project.snapshot();
	}

	/** @param {object} document Studio JSON document. @returns {object} Load receipt. */
	loadProject(document) {
		return this.project.load(document);
	}

	/** @param {string} prompt Scene premise. @returns {object} Generation receipt. */
	generateScene(prompt) {
		return this.project.generate(prompt);
	}

	/** @param {object} input Performance input. @returns {object} One face/body sample. */
	samplePerformance(input) {
		return this.performance.sample(input);
	}

	/** @param {object} input Dialogue input. @returns {object} Timed performance receipt. */
	sampleDialogue(input) {
		return this.performance.dialogue(input);
	}

	/** @param {string} panel Responsive Studio panel identity. @returns {object} Action receipt. */
	openPanel(panel) {
		this.studio().openMobilePanel(panel);
		return this.receipt('openPanel', { panel });
	}

	/** @returns {object} Opens the existing character lab. */
	openCharacterLab() {
		this.studio().openCharacterLab();
		return this.receipt('openCharacterLab');
	}

	/** @returns {Promise<*>} Existing browser movie export. */
	exportMovie() {
		return this.project.exportMovie();
	}
}
