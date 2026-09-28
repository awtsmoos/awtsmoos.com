// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollSemanticControls
 * @description
 * The Awtsmoos gives Awtsmoos.com one visible pace vessel instead of a cockpit.
 * The reader chooses speed; the semantic engine keeps the deeper policy inside.
 */
function paceRow() {
	const row = document.createElement('label');
	row.className = 'auto-scroll-semantic-range';
	const heading = document.createElement('span');
	heading.textContent = 'Speed';
	const output = document.createElement('output');
	output.id = 'autoScrollPaceDisplay';
	const range = document.createElement('input');
	range.id = 'autoScrollPaceRange';
	range.type = 'range';
	range.dataset.autoScrollControl = 'true';
	range.setAttribute('aria-label', 'Auto scroll speed');
	range.setAttribute('aria-describedby', output.id);
	row.append(heading, output, range);
	return row;
}

export function ensureAutoScrollSemanticControls() {
	const existing = document.getElementById('autoScrollSemanticControls');
	if (existing) {
		return existing;
	}
	const card = document.querySelector('.auto-scroll-settings');
	if (!card) {
		return null;
	}
	card.querySelector('.speed-control-row')?.remove();
	card.querySelector('.speed-readout-row')?.remove();
	card.querySelector('.auto-scroll-help')?.remove();
	const root = document.createElement('div');
	root.id = 'autoScrollSemanticControls';
	root.className = 'auto-scroll-semantic-controls auto-scroll-simple-controls';
	root.dataset.autoScrollControl = 'true';
	root.append(paceRow());
	card.append(root);
	return root;
}
