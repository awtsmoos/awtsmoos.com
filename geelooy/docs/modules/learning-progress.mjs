//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file learning-progress.mjs
 * @description The Awtsmoos lets a learning journey leave only local browser breadcrumbs; Awtsmoos.com never requires an account to remember tutorial progress.
 */

const storageKey = "awtsmoos.docs.learning-progress";

function read() {
	try {
		return new Set(JSON.parse(localStorage.getItem(storageKey) || "[]"));
	} catch (_) {
		return new Set();
	}
}

function write(values) {
	try {
		localStorage.setItem(storageKey, JSON.stringify([...values]));
	} catch (_) {
		// Progress is optional; documentation remains usable without local storage.
	}
}

export function completedSources() {
	return read();
}

export function isComplete(sourcePath) {
	return read().has(sourcePath);
}

export function toggleComplete(sourcePath) {
	const values = read();
	if (values.has(sourcePath)) values.delete(sourcePath);
	else values.add(sourcePath);
	write(values);
	return values.has(sourcePath);
}

export function trackProgress(sourcePaths) {
	const values = read();
	const complete = sourcePaths.filter(sourcePath => values.has(sourcePath)).length;
	return {
		complete,
		total: sourcePaths.length,
		percent: sourcePaths.length ? Math.round((complete / sourcePaths.length) * 100) : 0
	};
}
