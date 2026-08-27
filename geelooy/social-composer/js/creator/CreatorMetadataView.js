//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class CreatorMetadataView
 * @description
 * The Awtsmoos lets deep creator detail rest behind one quiet disclosure;
 * Awtsmoos.com exposes metadata only when wanted, preserving a clean canvas while keeping YouTube-scale precision near.
 */
export class CreatorMetadataView {
	constructor(root = document) {
		this.root = root;
	}

	mount() {
		const surface = this.root.querySelector('.creatorSurface');
		if (!surface || this.root.querySelector('.creatorMetadata')) return null;
		this.panel = this.root.createElement('details');
		this.panel.className = 'creatorMetadata';
		this.panel.innerHTML = [
			'<summary><strong>Creator details</strong><span>Tags · people · location · transcript · chapters</span></summary>',
			'<div class="creatorMetadataGrid">',
			this.input('tags', 'Tags', 'Torah, learning, story'),
			this.input('collaborators', 'Collaborators', 'alias-one, alias-two'),
			this.input('location', 'Location', 'Jerusalem'),
			this.input('language', 'Language', 'en'),
			this.input('thumbnailUrl', 'Thumbnail URL', 'https://…', 'url'),
			this.input('captionLanguages', 'Caption languages', 'en, he'),
			this.input('license', 'License', 'Creator license'),
			this.input('attribution', 'Attribution', 'Source / credit'),
			'<label class="creatorMetadataWide">Transcript<textarea data-creator-meta="transcript" rows="6" placeholder="Paste or edit transcript…"></textarea></label>',
			'<label class="creatorMetadataWide">Chapters<textarea data-creator-meta="chapters" rows="5" placeholder="0:00 Opening&#10;1:20 First idea"></textarea></label>',
			'</div>'
		].join('');
		surface.after(this.panel);
		return this.panel;
	}

	input(field, label, placeholder, type = 'text') {
		return [
			'<label>',
			label,
			`<input type="${type}" data-creator-meta="${field}" placeholder="${placeholder}">`,
			'</label>'
		].join('');
	}

	fields() {
		return [...this.panel?.querySelectorAll('[data-creator-meta]') || []];
	}

	field(name) {
		return this.panel?.querySelector(`[data-creator-meta="${name}"]`) || null;
	}
}
