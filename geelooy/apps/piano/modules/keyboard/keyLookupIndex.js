//B"H
/** One structural index serves both desktop bindings and note illumination. */
let revision = 0;
const indexes = new WeakMap();

export function invalidateNoteVisualIndex() {
	revision += 1;
}

function buildIndex(root) {
	const byNote = new Map();
	const byBinding = new Map();
	for (const key of root.querySelectorAll('.key[data-note]')) {
		addEntry(byNote, key.dataset.note, key);
		addEntry(byBinding, key.dataset.keyboardBinding, key);
	}
	const index = { revision, byNote, byBinding };
	indexes.set(root, index);
	return index;
}

function addEntry(map, value, key) {
	if (!value) return;
	if (!map.has(value)) map.set(value, []);
	map.get(value).push(key);
}

function getIndex(root) {
	const index = indexes.get(root);
	return index?.revision === revision ? index : buildIndex(root);
}

/** A stale disconnected key causes a rebuild, never a ghost press. */
function lookup(root, field, value) {
	let matches = getIndex(root)[field].get(value) || [];
	if (matches.some(key => key.isConnected === false)) {
		invalidateNoteVisualIndex();
		matches = getIndex(root)[field].get(value) || [];
	}
	return matches;
}

export function indexedNoteKeys(note, root = document) {
	return lookup(root, 'byNote', note);
}

export function indexedBindingKeys(binding, root = document) {
	return lookup(root, 'byBinding', binding);
}
