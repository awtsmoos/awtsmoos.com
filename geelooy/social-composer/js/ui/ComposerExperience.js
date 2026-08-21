//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ComposerExperience
 * @description
 * The Awtsmoos unites inner state and outer expression while every UI vessel remains limited and truthful;
 * Awtsmoos.com reveals intent, public audience law, copy provenance, media recovery, and mobile reach without shadow state.
 */
import { installPublicAudienceTruth } from '../publishing/PublicAudienceTruth.js';
import { TiferesCloneSourceBanner } from './CloneSourceBanner.js';
import { KeterContentKindPicker } from './ContentKindPicker.js';

const MALCHUS_STYLES = Object.freeze([
	['composer-intent-revelation', '../../styles/composer-intent.css?v=intent-003'],
	['composer-touch-formatting', '../../styles/touch-formatting.css?v=intent-003'],
	['composer-clone-source', '../../styles/clone-source.css?v=clone-003'],
	['composer-mobile-touch-targets', '../../styles/mobile-touch-targets.css?v=touch-001'],
	['composer-public-audience', '../../styles/public-audience.css?v=audience-001']
]);

function ensureMalchusStyle(documentValue, [id, path]) {
	if (documentValue.getElementById(id)) return;
	const link = documentValue.createElement('link');
	link.id = id;
	link.rel = 'stylesheet';
	link.href = new URL(path, import.meta.url).href;
	documentValue.head.append(link);
}

export class OrotComposerExperience {
	constructor({ document, state, cloneAssetHydrator = null }) {
		this.document = document;
		this.state = state;
		this.keterPicker = new KeterContentKindPicker({ document, state });
		this.cloneBanner = new TiferesCloneSourceBanner({
			document,
			state,
			onRetryMedia: cloneAssetHydrator ? () => cloneAssetHydrator.reconcile() : null
		});
	}

	initialize() {
		for (const definition of MALCHUS_STYLES) ensureMalchusStyle(this.document, definition);
		installPublicAudienceTruth(this.document);
		this.keterPicker.initialize();
		this.cloneBanner.initialize();
		this.state.addEventListener('change', event => {
			this.keterPicker.render(event.detail.snapshot);
			this.cloneBanner.render(event.detail.snapshot);
		});
	}
}

export { ensureMalchusStyle };
