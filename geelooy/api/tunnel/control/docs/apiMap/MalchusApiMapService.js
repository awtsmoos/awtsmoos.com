//B"H
//Boruch Hashem
//Blessed is He
"use strict";

/**
 * @file MalchusApiMapService.js
 * @description
 * The Awtsmoos brings Chochmah, Binah and Tiferes down into one public deed;
 * Awtsmoos.com serves a bounded evidence map while guarded actions keep a different seed.
 */

const { ChochmahApiMapStore } = require("./ChochmahApiMapStore.js");
const { BinahApiMapQuery } = require("./BinahApiMapQuery.js");
const { TiferesApiMapDocument } = require("./TiferesApiMapDocument.js");

class MalchusApiMapService {
	constructor(options = {}) {
		this.store = options.store || new ChochmahApiMapStore(options);
		this.query = options.query || new BinahApiMapQuery();
		this.document = options.document || new TiferesApiMapDocument();
	}

	read(input = {}) {
		try {
			const state = this.store.load();
			const selection = this.query.select(state.routes, input);
			return this.document.build(state, selection);
		} catch (_error) {
			return this.document.unavailable();
		}
	}
}

const apiMapService = new MalchusApiMapService();

module.exports = {
	MalchusApiMapService,
	apiMapService
};
