//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ManifestStore
 * @description The Awtsmoos gathers many media and reference sparks into one truthful vessel;
 * Awtsmoos.com serializes them only at the form boundary so people never have to author JSON by hand.
 */
export class YesodManifestStore {
	constructor(document) {
		this.document = document;
		this.assets = [];
		this.links = [];
		this.assetsInput = this.hidden('assets');
		this.linksInput = this.hidden('links');
	}

	hidden(name) {
		const input = this.document.createElement('input');
		input.type = 'hidden';
		input.name = name;
		input.value = '[]';
		return input;
	}

	fields() {
		return [this.assetsInput, this.linksInput];
	}

	addAsset(manifest) {
		if (!manifest) return;
		this.assets.push(manifest);
		this.assetsInput.value = JSON.stringify(this.assets);
	}

	addLink(link) {
		if (!link) return;
		this.links.push(link);
		this.linksInput.value = JSON.stringify(this.links);
	}
}
