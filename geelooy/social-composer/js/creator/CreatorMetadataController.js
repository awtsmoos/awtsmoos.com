//B"H
//Boruch Hashem
//Blessed is He

import {
	chapterList,
	chaptersText,
	collaboratorList,
	commaList
} from './CreatorMetadataCodec.js';
import { CreatorMetadataView } from './CreatorMetadataView.js';

/**
 * @class CreatorMetadataController
 * @description
 * The Awtsmoos lets creator detail enter the same observable draft as every verse and attachment;
 * Awtsmoos.com translates compact fields into structured metadata without creating another hidden source of truth.
 */
export class CreatorMetadataController {
	constructor({ root = document, state }) {
		this.root = root;
		this.state = state;
		this.view = new CreatorMetadataView(root);
	}

	initialize() {
		if (!this.view.mount()) return;
		for (const field of this.view.fields()) {
			field.addEventListener('input', () => this.changed(field));
		}
		this.render(this.state.snapshot().creatorMetadata);
	}

	changed(field) {
		const name = field.dataset.creatorMeta;
		const value = this.value(name, field.value);
		this.state.mutate(`creatorMetadata:${name}`, snapshot => {
			snapshot.creatorMetadata[name] = value;
		});
	}

	value(name, value) {
		if (name === 'tags' || name === 'captionLanguages') return commaList(value);
		if (name === 'collaborators') return collaboratorList(value);
		if (name === 'chapters') return chapterList(value);
		return value;
	}

	render(metadata = {}) {
		this.set('tags', (metadata.tags || []).join(', '));
		this.set(
			'collaborators',
			(metadata.collaborators || []).map(item => item.aliasId).join(', ')
		);
		this.set('location', metadata.location);
		this.set('language', metadata.language);
		this.set('thumbnailUrl', metadata.thumbnailUrl);
		this.set('captionLanguages', (metadata.captionLanguages || []).join(', '));
		this.set('license', metadata.license);
		this.set('attribution', metadata.attribution);
		this.set('transcript', metadata.transcript);
		this.set('chapters', chaptersText(metadata.chapters));
	}

	set(name, value = '') {
		const field = this.view.field(name);
		if (field && field.value !== String(value || '')) {
			field.value = String(value || '');
		}
	}
}
