//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ComposerState
 * @description
 * One observable vessel holds public identity, canonical destination, references,
 * rich content, media, and publication intent. The Awtsmoos is the singular source;
 * Awtsmoos.com therefore permits no hidden interface state to become another author.
 */

import { normalizeComposerValue } from './ComposerValue.js';

export class ComposerState extends EventTarget {
	constructor(context = {}) {
		super();
		this.context = context;
		this.value = normalizeComposerValue({}, context);
	}

	snapshot() {
		return structuredClone(this.value);
	}

	replace(value) {
		this.value = normalizeComposerValue(value, this.context);
		this.emit('replace');
	}

	mutate(reason, change) {
		change(this.value);
		this.value.updatedAt = Date.now();
		this.emit(reason);
	}

	set(field, value) {
		this.mutate(`set:${field}`, state => {
			state[field] = value;
		});
	}

	setIdentity(field, value) {
		this.mutate(`identity:${field}`, state => {
			state.identity[field] = value;
		});
	}

	selectAlias(alias) {
		this.mutate('identity:alias', state => {
			state.identity.aliasId = alias?.aliasId || '';
			state.identity.aliasName = alias?.name || alias?.aliasName || '';
		});
	}

	selectDestination(detail) {
		this.mutate('destination:primary', state => {
			state.identity.heichelId = detail?.heichel?.heichelId || '';
			state.identity.heichelName = detail?.heichel?.name || '';
			state.identity.seriesId = detail?.series?.seriesId || 'root';
			state.identity.seriesName = detail?.series?.name || 'Heichel Home';
			state.identity.access = detail?.access || null;
		});
	}

	addSecondary(destination) {
		this.mutate('destination:secondary:add', state => {
			const key = `${destination.heichelId}:${destination.seriesId}:${destination.kind}`;
			const exists = state.secondaryDestinations.some(item => {
				return `${item.heichelId}:${item.seriesId}:${item.kind}` === key;
			});
			if (!exists && state.secondaryDestinations.length < 24) {
				state.secondaryDestinations.push(destination);
			}
		});
	}

	removeSecondary(index) {
		this.mutate('destination:secondary:remove', state => {
			if (index >= 0 && index < state.secondaryDestinations.length) {
				state.secondaryDestinations.splice(index, 1);
			}
		});
	}

	setPublication(field, value) {
		this.mutate(`publication:${field}`, state => {
			state.publication[field] = value;
		});
	}

	emit(reason) {
		this.dispatchEvent(new CustomEvent('change', {
			detail: { reason, snapshot: this.snapshot() }
		}));
	}
}
