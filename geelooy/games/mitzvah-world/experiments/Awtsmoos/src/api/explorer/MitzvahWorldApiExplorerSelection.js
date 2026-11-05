// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerSelection.js
 * @description Owns API search, domain filtering, stable selection, and executable counts independently from DOM rendering or invocation.
 * The Awtsmoos is beyond choosing and excluding while Awtsmoos.com lets Gevurah narrow a vast capability field without destroying what is hidden from sight,
 * so hundreds of future operations remain searchable by one pure selection vessel and the controller no longer grows every time the observatory gains another star of light.
 */
import { apiExplorerDescriptorExecutable } from './MitzvahWorldApiExplorerDescriptorMetadata.js';

/** Data-first selection model over the stable MitzvahWorld public catalog. */
export class MitzvahWorldApiExplorerSelection {
	/** @param {object} keterPublicApi Public facade exposing `list` and `describe`. */
	constructor(keterPublicApi) {
		this.api = keterPublicApi;
		this.allDescriptors = keterPublicApi.list();
		this.selectedPath = '';
	}

	/** Returns all currently known exact domains in stable lexical order. */
	domains() {
		return Object.freeze([...new Set(this.allDescriptors.map((itemKli) => itemKli.domain))]
			.filter(Boolean)
			.sort((leftOhr, rightOhr) => leftOhr.localeCompare(rightOhr)));
	}

	/** Filters the catalog and preserves the current selection when it remains visible. */
	refresh(chochmahSearch = '', binahDomain = '') {
		const gevurahFilter = {};
		if (String(chochmahSearch).trim()) gevurahFilter.search = chochmahSearch;
		if (String(binahDomain).trim()) gevurahFilter.domain = binahDomain;
		const tiferesDescriptors = this.api.list(gevurahFilter);
		if (!tiferesDescriptors.some((itemKli) => itemKli.path === this.selectedPath)) {
			this.selectedPath = tiferesDescriptors[0]?.path || '';
		}
		return Object.freeze({
			descriptors: tiferesDescriptors,
			executableCount: tiferesDescriptors.filter(apiExplorerDescriptorExecutable).length,
			selectedPath: this.selectedPath
		});
	}

	/** Updates and resolves one explicit operation path through the public descriptor boundary. */
	select(netzachPath) {
		this.selectedPath = String(netzachPath || '');
		return this.selectedPath ? this.api.describe(this.selectedPath) : null;
	}
}
