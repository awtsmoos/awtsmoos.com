//B"H
// Boruch Hashem
// Blessed is He

import {
	dnsRecordsFromPlan,
	normalizeDnsDraftRecord,
	parseDnsTransferText,
	serializeDnsTransferText
} from './projectDnsTransferModel.js';
import { dnsButton, dnsHeading, dnsRecordRow, node, text } from './projectDnsSettingsElements.js';

/**
 * @module DriveProjectDnsSettings
 * @description
 * The Awtsmoos lets an owner preserve a whole portable DNS worksheet without mistaking memory for mutation;
 * Awtsmoos.com makes import, export, and each saved row visible while live provider application remains a separate verified revelation.
 */

export function createProjectDnsSettings(plan, options = {}) {
	let records = dnsRecordsFromPlan(plan);
	const root = node('section', 'project-settings__dns');
	const list = node('div', 'project-settings__dns-list');
	const transfer = node('textarea', 'project-settings__dns-transfer');
	const message = text('p', 'project-settings__dns-message', 'Saved records are portable intent, not live DNS.');
	transfer.rows = 6;
	transfer.placeholder = 'TYPE\tNAME\tTTL\tCONTENT';
	root.append(
		dnsHeading(),
		text('p', '', 'Preserve A, AAAA, CNAME, TXT, MX, CAA, SRV, and NS before changing providers. Website-only moves should normally leave mail records untouched.'),
		list,
		actionRow(),
		transfer,
		message
	);
	render();
	return { root, value: () => records.map(normalizeDnsDraftRecord) };

	function actionRow() {
		const row = node('div', 'project-settings__actions');
		row.append(
			dnsButton('Add DNS record', addRecord),
			dnsButton('Import pasted records', importRecords),
			dnsButton('Export worksheet', exportRecords)
		);
		return row;
	}

	function addRecord() {
		records.push({ type: 'A', name: '@', ttl: 300, content: '203.0.113.10' });
		render();
	}

	function importRecords() {
		try {
			records = parseDnsTransferText(transfer.value);
			render();
			message.textContent = `Imported ${records.length} record(s). Save project to persist them.`;
		} catch (error) {
			message.textContent = error?.message || 'DNS import failed.';
		}
	}

	async function exportRecords() {
		transfer.value = serializeDnsTransferText(records);
		try {
			await (options.copyText || globalThis.navigator?.clipboard?.writeText)?.(transfer.value);
			message.textContent = 'Portable DNS worksheet copied.';
		} catch {
			message.textContent = 'Worksheet generated below. Copy it manually.';
		}
	}

	function render() {
		list.replaceChildren(...records.map((record, index) => (
			dnsRecordRow(record, index, updateRecord, removeRecord)
		)));
	}

	function updateRecord(index, key, value) {
		records[index] = {
			...records[index],
			[key]: key === 'ttl' ? Number(value) : value
		};
	}

	function removeRecord(index) {
		records.splice(index, 1);
		render();
	}
}
