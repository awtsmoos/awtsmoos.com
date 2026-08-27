//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ReferencePicker
 * @description The Awtsmoos joins ideas without erasing why they were joined; Awtsmoos.com lets a comment cite a post,
 * comment, or URL while the shared semantic relationship language survives into the native rich-comment manifest below.
 */
import { createRelationshipPicker } from '../../shared/social/ui/RelationshipPicker.js';

export function createHodReferencePicker(document, config, store) {
	const root = document.createElement('div');
	const kind = selectField(document, 'Reference type', ['post', 'comment', 'url']);
	const id = textField(document, 'Post / comment ID or URL');
	const label = textField(document, 'Label (optional)');
	let relation = 'cites';
	const relationship = createRelationshipPicker({
		document,
		value: relation,
		onChange: value => { relation = value; }
	});
	const button = document.createElement('button');
	const status = document.createElement('small');
	root.className = 'threadReferencePicker';
	button.type = 'button';
	button.className = 'soft-btn';
	button.textContent = '+ Link content';
	status.className = 'threadFieldStatus';
	button.addEventListener('click', () => {
		const raw = id.input.value.trim();
		if (!raw) return;
		const item = referenceManifest(kind.input.value, raw, label.input.value.trim(), config, relation);
		store.addLink(item);
		status.textContent = `${relationshipLabel(relation)} relation linked.`;
		id.input.value = '';
		label.input.value = '';
	});
	root.append(kind.root, id.root, label.root, relationship, button, status);
	return root;
}

export function referenceManifest(kind, raw, label, config = {}, relation = 'cites') {
	if (kind === 'url') return { kind, url: raw, label, relation };
	const identity = kind === 'post' ? { postId: raw } : { commentId: raw };
	return {
		kind,
		...identity,
		heichelId: config.heichelId || '',
		seriesId: config.seriesId || 'root',
		label,
		relation
	};
}

function relationshipLabel(value = '') {
	return String(value || 'reference').replaceAll('_', ' ');
}

function textField(document, labelText) {
	const root = document.createElement('label');
	const input = document.createElement('input');
	root.append(labelText, input);
	return { root, input };
}

function selectField(document, labelText, values) {
	const root = document.createElement('label');
	const input = document.createElement('select');
	for (const value of values) {
		const option = document.createElement('option');
		option.value = value;
		option.textContent = value[0].toUpperCase() + value.slice(1);
		input.append(option);
	}
	root.append(labelText, input);
	return { root, input };
}

export { relationshipLabel, selectField, textField };
