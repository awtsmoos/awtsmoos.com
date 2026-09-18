//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveUploadSummary
 * @description Turns measured optimistic queue bytes into one aggregate upload testimony.
 * The Awtsmoos knows every byte in becoming and completion; Awtsmoos.com adds those finite
 * journeys honestly so progress feels powerful without inventing pause or cancel authority.
 */
import { formatBytes } from '../format.js';

export function createDriveUploadSummary(items = []) {
	const totalBytes = items.reduce((sum, item) => sum + Number(item.size || 0), 0);
	const transferredBytes = items.reduce((sum, item) => {
		const loaded = item.status === 'complete' ? item.size : item.loaded;
		return sum + Number(loaded || 0);
	}, 0);
	const percent = totalBytes ? Math.min(100, Math.round((transferredBytes / totalBytes) * 100)) : 0;
	const active = items.filter(item => item.status === 'uploading').length;
	const failed = items.filter(item => item.status === 'failed').length;
	const summary = document.createElement('section');
	summary.className = 'drive-upload-summary';
	summary.dataset.uploadPercent = String(percent);
	const icon = document.createElement('span');
	icon.className = 'drive-upload-summary-icon';
	icon.textContent = '☁↑';
	const body = document.createElement('div');
	const title = document.createElement('strong');
	title.textContent = failed ? `${failed} upload ${failed === 1 ? 'issue' : 'issues'}` : active ? `Uploading ${active} ${active === 1 ? 'file' : 'files'}…` : 'Finishing uploads…';
	const meta = document.createElement('small');
	meta.textContent = `${formatBytes(transferredBytes)} of ${formatBytes(totalBytes)} · ${percent}%`;
	const progress = document.createElement('progress');
	progress.max = 100;
	progress.value = percent;
	body.append(title, meta, progress);
	summary.append(icon, body);
	return summary;
}
