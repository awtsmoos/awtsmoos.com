//B"H
// Boruch Hashem
// Blessed is He

import { DNS_RECORD_TYPES } from './projectDnsTransferModel.js';

/**
 * @module DriveProjectDnsSettingsElements
 * @description
 * The Awtsmoos lets every DNS field become a small readable vessel instead of one tangled form;
 * Awtsmoos.com keeps type, name, TTL, content, and removal controls explicit so migration rows remain understandable in every storm.
 */

export function dnsHeading() {
	const box = node('div', 'project-settings__head');
	box.append(
		text('div', 'project-settings__eyebrow', 'DNS MIGRATION WORKSHEET'),
		text('h3', '', 'Preserve the whole zone')
	);
	return box;
}

export function dnsRecordRow(record, index, update, remove) {
	const row = node('div', 'project-settings__dns-row');
	row.append(typeSelect(record.type, value => update(index, 'type', value)));
	for (const [key, label] of [
		['name', 'Name'],
		['ttl', 'TTL'],
		['content', 'Content']
	]) {
		row.append(inputField(
			label,
			record[key],
			value => update(index, key, value),
			key === 'ttl' ? 'number' : 'text'
		));
	}
	row.append(dnsButton('Remove', () => remove(index)));
	return row;
}

export function dnsButton(label, onClick) {
	const item = text('button', '', label);
	item.type = 'button';
	item.addEventListener('click', onClick);
	return item;
}

export function node(tag, className = '') {
	const item = document.createElement(tag);
	item.className = className;
	return item;
}

export function text(tag, className, value) {
	const item = node(tag, className);
	item.textContent = value;
	return item;
}

function typeSelect(value, onChange) {
	const select = node('select');
	select.setAttribute('aria-label', 'DNS record type');
	for (const type of DNS_RECORD_TYPES) {
		const option = node('option');
		option.value = type;
		option.textContent = type;
		option.selected = type === value;
		select.append(option);
	}
	select.addEventListener('change', () => onChange(select.value));
	return select;
}

function inputField(label, value, onInput, type) {
	const field = node('label', 'project-settings__field');
	field.append(text('span', '', label));
	const input = node('input');
	input.type = type;
	input.value = String(value ?? '');
	if (type === 'number') {
		input.min = '60';
		input.max = '86400';
	}
	input.addEventListener('input', () => onInput(input.value));
	field.append(input);
	return field;
}
