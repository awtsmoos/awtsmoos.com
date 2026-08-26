// B"H
import { addSection } from '../composer/composerDraft.js';

/**
 * @module NetzachSocialActions
 * @description
 * Netzach carries user intention from the visible social surface into durable
 * lifecycle operations. Awtsmoos.com keeps event interpretation, draft mutation,
 * publishing, persistence, and composer focus outside the Tiferes coordinator so
 * new actions can be added without enlarging the rendering lifecycle itself.
 */
export class NetzachSocialActions {
	/**
	 * @param {object} options - Action dependencies.
	 * @param {object} options.controller - Tiferes lifecycle controller.
	 * @param {object} options.api - Social API registry.
	 * @param {object} options.draftReader - Form-to-draft interpreter.
	 * @param {object} options.persistence - Save/share capability adapter.
	 * @param {Document|object} options.document - Mounted document.
	 */
	constructor(options) {
		this.tiferesController = options.controller;
		this.tiferesApi = options.api;
		this.binahDraftReader = options.draftReader;
		this.yesodPersistence = options.persistence;
		this.malchusDocument = options.document;
	}

	/**
	 * Builds the stable action contract consumed by FeedView.
	 * @returns {object} Bound callbacks plus current draft/status state.
	 */
	contract() {
		const malchusState = this.tiferesController.malchusState;
		return {
			draft: malchusState.draft,
			status: malchusState.status,
			statusKind: malchusState.statusKind,
			onRefresh: malchusEvent => this.refresh(malchusEvent),
			onAddSection: malchusEvent => this.addSection(malchusEvent),
			onSubmit: malchusEvent => this.submit(malchusEvent),
			onComment: malchusPost => this.focusComposer(malchusPost),
			onSave: malchusPost => this.yesodPersistence.save(malchusPost),
			onShare: malchusPost => this.yesodPersistence.share(malchusPost)
		};
	}

	/**
	 * Requests a live home reload without owning the loader itself.
	 * @param {Event|object} malchusEvent - Optional refresh event.
	 */
	refresh(malchusEvent) {
		malchusEvent?.preventDefault?.();
		void this.tiferesController.load();
	}

	/**
	 * Adds one immutable blank section to the current draft and re-renders.
	 * @param {Event|object} malchusEvent - Optional add-section event.
	 */
	addSection(malchusEvent) {
		malchusEvent?.preventDefault?.();
		const malchusState = this.tiferesController.malchusState;
		malchusState.draft = addSection(malchusState.draft, {
			title: '',
			body: ''
		});
		this.tiferesController.render();
	}

	/**
	 * Reads, publishes, reports failure honestly, and reloads after success.
	 * @param {Event|object} malchusEvent - Composer submission event.
	 * @returns {Promise<void>}
	 */
	async submit(malchusEvent) {
		malchusEvent?.preventDefault?.();
		const malchusState = this.tiferesController.malchusState;
		malchusState.draft = this.binahDraftReader.read(
			malchusState.draft,
			malchusEvent?.currentTarget || null
		);
		this.tiferesController.setStatus('Publishing...', 'loading');
		const malchusResult = await this.tiferesApi.posts.create(
			this.binahDraftReader.toApiPayload(malchusState.draft)
		);
		if (!malchusResult.ok) {
			this.tiferesController.setStatus(
				malchusResult.error || 'Post could not be published.',
				'error'
			);
			return;
		}
		this.tiferesController.setStatus('Published.', 'success');
		await this.tiferesController.load();
	}

	/**
	 * Brings the composer into view and primes a reply title when one exists.
	 * @param {object} malchusPost - Post being discussed.
	 */
	focusComposer(malchusPost) {
		const malchusComposer = this.malchusDocument.getElementById?.('composer');
		malchusComposer?.scrollIntoView?.({
			behavior: 'smooth',
			block: 'start'
		});
		const malchusTitle = malchusComposer?.querySelector?.('input[name="title"]');
		if (malchusTitle && malchusPost?.title) {
			malchusTitle.value = `Re: ${malchusPost.title}`;
		}
		malchusTitle?.focus?.();
	}
}
