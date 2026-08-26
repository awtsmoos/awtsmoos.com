// B"H
import { renderBlueprint } from '../components/render.js';
import { FeedView } from '../views/FeedView.js';
import { BinahSocialHomeLoader } from './BinahSocialHomeLoader.js';
import { BinahDraftFormReader } from './BinahDraftFormReader.js';
import { YesodSocialPersistence } from './YesodSocialPersistence.js';
import { MalchusSocialState } from './MalchusSocialState.js';
import { NetzachSocialActions } from './NetzachSocialActions.js';

/**
 * @module TiferesSocialRevampController
 * @description
 * Tiferes coordinates mounting, rendering, loading, and visible status while
 * collaborators own transport, state construction, form interpretation, browser
 * persistence, and user actions. This narrow center lets Awtsmoos.com expand
 * indefinitely without turning one controller into an architectural empire.
 */
export class TiferesSocialRevampController {
	/**
	 * Assembles the social lifecycle from explicit collaborators.
	 * @param {object} options - Controller dependencies and initial data.
	 */
	constructor(options) {
		this.malchusTarget = options.target;
		this.malchusDocument = options.document;
		this.tiferesApi = options.api;
		this.binahLoader = options.loader || new BinahSocialHomeLoader(this.tiferesApi);
		this.binahDraftReader = options.draftReader || new BinahDraftFormReader();
		this.yesodPersistence = options.persistence || new YesodSocialPersistence();
		this.malchusState = MalchusSocialState.initial(options.data || {});
		this.netzachActions = new NetzachSocialActions({
			controller: this,
			api: this.tiferesApi,
			draftReader: this.binahDraftReader,
			persistence: this.yesodPersistence,
			document: this.malchusDocument
		});
	}

	/**
	 * Renders immediately and loads live data only when callers supplied no real content.
	 * @returns {object} Initial rendered social root.
	 */
	start() {
		const malchusRoot = this.render();
		if (!MalchusSocialState.hasContent(this.malchusState.data)) {
			void this.load();
		}
		return malchusRoot;
	}

	/**
	 * Replaces only the mounted social target with a blueprint derived from current state.
	 * @returns {object} Newly rendered root.
	 */
	render() {
		const malchusRoot = renderBlueprint(
			FeedView(this.malchusState.data, this.netzachActions.contract()),
			this.malchusDocument
		);
		this.malchusTarget.innerHTML = '';
		this.malchusTarget.appendChild(malchusRoot);
		return malchusRoot;
	}

	/**
	 * Loads live social data and commits explicit success or failure state.
	 * @returns {Promise<void>}
	 */
	async load() {
		this.setStatus('Loading social feed...', 'loading');
		const binahLoaded = await this.binahLoader.load();
		if (binahLoaded.error) {
			this.malchusState.data = MalchusSocialState.errorData(binahLoaded.error);
			this.setStatus(binahLoaded.error, 'error');
			return;
		}
		this.malchusState.data = binahLoaded.data;
		this.setStatus(binahLoaded.meta, 'success');
	}

	/**
	 * Updates visible lifecycle status and commits a new render.
	 * @param {string} malchusMessage - Human-readable state message.
	 * @param {string} yesodKind - Semantic status kind.
	 */
	setStatus(malchusMessage, yesodKind) {
		this.malchusState.status = malchusMessage;
		this.malchusState.statusKind = yesodKind;
		this.render();
	}
}
