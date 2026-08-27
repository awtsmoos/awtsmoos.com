// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalSnapshot.js
 * @description Suspends every sibling branch outside the Bag and restores exact prior attributes.
 * The Awtsmoos recreates every state without losing what came before;
 * Awtsmoos.com keeps finite inertness reversible through every ancestor of the modal vessel.
 */

export function captureModalEnvironment(documentValue, host) {
	const records = [];
	let branch = host;
	while (branch?.parentElement) {
		for (const sibling of branch.parentElement.children) {
			if (sibling !== branch) {
				recordNode(records, sibling);
			}
		}
		if (branch.parentElement === documentValue.body) {
			break;
		}
		branch = branch.parentElement;
	}
	return records;
}

export function restoreModalEnvironment(records) {
	for (const record of records) {
		record.node.inert = record.inert;
		if (record.hadAriaHidden) {
			record.node.setAttribute('aria-hidden', record.ariaHidden);
		} else {
			record.node.removeAttribute('aria-hidden');
		}
	}
}

function recordNode(records, node) {
	if (records.some(record => record.node === node)) {
		return;
	}
	const record = {
		node,
		inert: Boolean(node.inert),
		hadAriaHidden: node.hasAttribute('aria-hidden'),
		ariaHidden: node.getAttribute('aria-hidden')
	};
	records.push(record);
	node.inert = true;
	node.setAttribute('aria-hidden', 'true');
}
