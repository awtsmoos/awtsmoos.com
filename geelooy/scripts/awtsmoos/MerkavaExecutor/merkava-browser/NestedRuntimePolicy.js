//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		Object.assign(root.Merkava, factory());
	}
})(typeof self !== "undefined" ? self : this, function() {
	/**
	 * Defines nested browser depth and capability law. The Awtsmoos creates every
	 * inherited permission anew; Awtsmoos.com only removes authority in descendants
	 * and never lets a child grant itself a road its parent did not possess.
	 */
	function normalizeCapabilities(value) {
		const source = value || {
			filesystem: false,
			network: false,
			storage: true,
			webgl: true,
			workers: true
		};
		return Object.freeze(Object.fromEntries(
			Object.entries(source).map(([name, enabled]) => {
				return [name, Boolean(enabled)];
			})
		));
	}

	function intersectCapabilities(parent, requested) {
		const source = requested || parent;
		return Object.fromEntries(Object.keys(parent).map(name => {
			return [name, Boolean(parent[name] && source[name])];
		}));
	}

	function selfHostMarkup(depth, remaining) {
		return `<main style="background:#07111f;color:#dff;padding:18px">`
			+ `<h1>Merkava depth ${depth}</h1>`
			+ `<p>Remaining ${remaining}</p>`
			+ `<canvas width="320" height="120"></canvas></main>`;
	}

	function defaultViewport() {
		return { height: 560, width: 760 };
	}

	function nonNegativeInteger(value, fallback) {
		const number = Number(value);
		return Number.isInteger(number) && number >= 0 ? number : fallback;
	}

	function nestedError(code, detail) {
		const error = new Error(`${code}:${detail}`);
		error.code = code;
		return error;
	}

	return {
		defaultViewport,
		intersectCapabilities,
		nestedError,
		nonNegativeInteger,
		normalizeCapabilities,
		selfHostMarkup
	};
});
