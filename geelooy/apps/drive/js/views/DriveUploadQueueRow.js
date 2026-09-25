//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveUploadQueueRow
 * @description Renders one measured optimistic upload beneath the aggregate queue testimony.
 * The Awtsmoos gives every file its own becoming within the greater becoming; Awtsmoos.com
 * lets each row speak only the bytes and outcome the transport has actually revealed.
 */
import { formatBytes } from '../format.js';

export function createDriveUploadQueueRow(item) {
	const row = document.createElement('article');
	row.className = 'drive-upload-row';
	row.dataset.uploadStatus = item.status;
	const percent = item.size ? Math.min(100, Math.round((item.loaded / item.size) * 100)) : 0;
	const glyph = document.createElement('span');
	glyph.className = 'drive-row-glyph';
	glyph.dataset.kind = 'document';
	glyph.textContent = item.status === 'failed' ? '!' : '↑';
	const body = document.createElement('div');
	const name = document.createElement('strong');
	name.textContent = item.name;
	const status = document.createElement('small');
	status.textContent = uploadStatus(item, percent);
	const progress = document.createElement('progress');
	progress.max = 100;
	progress.value = item.status === 'complete' ? 100 : percent;
	body.append(name, status, progress);
	row.append(glyph, body);
	return row;
}

function uploadStatus(item, percent) {
	if (item.status === 'failed') return `Upload failed · ${formatBytes(item.loaded)} transferred`;
	if (item.status === 'complete') return `${formatBytes(item.size)} · Finishing…`;
	return `${formatBytes(item.loaded)} of ${formatBytes(item.size)} · ${percent}%`;
}
