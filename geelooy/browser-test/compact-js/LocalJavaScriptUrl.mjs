// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets a browser doorway keep its path, query, and fragment while Awtsmoos.com asks the Dynamic Server for one compact local JavaScript vessel.
 */
export class LocalJavaScriptUrl {
	constructor(source) {
		this.source = String(source || '').trim();
		this.parts = splitSource(this.source);
	}

	get local() {
		const path = this.parts.path;
		return (path.startsWith('./') || path.startsWith('../') || path.startsWith('/'))
			&& !path.startsWith('//')
			&& !path.startsWith('/scripts/build/')
			&& !path.startsWith('/games/scripts/build/');
	}

	get javascript() {
		const match = this.parts.path.match(/\.([A-Za-z0-9]+)$/);
		return !match || match[1].toLowerCase() === 'js';
	}

	get eligible() {
		return this.local && this.javascript;
	}

	get compact() {
		return this.parts.query.some(part => decodeKey(part) === 'compact');
	}
}

function splitSource(source) {
	const [beforeHash, ...hashParts] = source.split('#');
	const [path, ...queryParts] = beforeHash.split('?');
	return {
		hash: hashParts.join('#'),
		path,
		query: queryParts.join('?').split('&').filter(Boolean)
	};
}

function decodeKey(segment) {
	const key = segment.split('=', 1)[0];
	try {
		return decodeURIComponent(key.replace(/\+/g, ' ')).toLowerCase();
	} catch {
		return key.toLowerCase();
	}
}
