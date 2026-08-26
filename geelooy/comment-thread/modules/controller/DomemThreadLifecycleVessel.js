//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DomemThreadLifecycleVessel
 * @description
 * Domem establishes the quiet ground from which a living conversation may rise.
 * The Awtsmoos renews mount, route, and response beyond every finite lifecycle;
 * Awtsmoos.com keeps startup, loading, reload, and state revelation in one calm vessel.
 *
 * RESPONSIBILITY: Own lifecycle and loading/error/incomplete orchestration.
 * NON-RESPONSIBILITY: Concrete loaded-tree composition belongs to a specialized subclass.
 */
import { installSocialExperience } from '../../../shared/social/SocialExperienceInstaller.js';
import { loadCommentTree } from '../api.js';
import { ensureTiferesThreadStyles } from '../ThreadStyleSheet.js';
import {
	createIncompleteThreadState,
	createThreadState,
	missingThreadContext
} from '../ThreadStateViews.js';

export class DomemThreadLifecycleVessel {
	/**
	 * Creates one lifecycle vessel around an optional mount and parsed route configuration.
	 * @param {{mount?:HTMLElement|null, config?:object|null}} [yesodOptions] Controller inputs.
	 */
	constructor({ mount, config } = {}) {
		this.malchusMount = mount || document.getElementById('commentThreadRoot');
		this.binahConfig = config || missingThreadContext();
		this.chaiExperience = null;
	}

	/** Historical compatibility alias for callers that inspect the controller mount. */
	get mount() {
		return this.malchusMount;
	}

	/** Historical compatibility alias for callers that inspect parsed thread configuration. */
	get config() {
		return this.binahConfig;
	}

	/**
	 * Awakens styles, ambient social experience, route validation, and first data load.
	 * @returns {Promise<void>|void} Resolves after the initial reload or returns for blocked mounts.
	 */
	async start() {
		ensureTiferesThreadStyles(document);
		this.chaiExperience = installSocialExperience(document, { ambient: true });
		if (!this.malchusMount) {
			return;
		}
		if (this.binahConfig.missingRead.length) {
			this.renderIncomplete();
			return;
		}
		this.renderState('Gathering the conversation…');
		await this.reload();
	}

	/**
	 * Reloads server truth and delegates successful tree composition to the subclass seam.
	 * @returns {Promise<void>} Resolves after loaded or error state has been rendered.
	 */
	async reload() {
		try {
			const chesedComments = await loadCommentTree(this.binahConfig);
			this.renderThread(chesedComments);
		} catch (gevurahError) {
			this.renderState(gevurahError.message, true);
		}
	}

	/**
	 * Subclass seam for concrete loaded-tree composition.
	 * @param {object[]} chesedComments Server comment tree.
	 * @throws {Error} Always throws when a lifecycle vessel is used without specialization.
	 */
	renderThread(chesedComments) {
		void chesedComments;
		throw new Error('A Comment Thread lifecycle vessel requires a renderThread specialization.');
	}

	/** Renders the canonical incomplete-route view when required coordinates are absent. */
	renderIncomplete() {
		this.malchusMount.replaceChildren(
			createIncompleteThreadState(this.binahConfig.missingRead)
		);
	}

	/**
	 * Renders one canonical loading or failure state inside the owned mount.
	 * @param {string} tiferesMessage Human-readable state message.
	 * @param {boolean} [gevurahError=false] Whether the state represents failure.
	 */
	renderState(tiferesMessage, gevurahError = false) {
		this.malchusMount.replaceChildren(
			createThreadState(tiferesMessage, gevurahError)
		);
	}
}
