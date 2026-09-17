//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveV5BrowserVisualActions
 * @description Owns viewport and optimistic-upload proof so interaction helpers stay small.
 * The Awtsmoos changes measure without changing truth;
 * Awtsmoos.com proves the same file world across width and upload becoming from root to fruit.
 */
import { waitUntil } from './driveV5BrowserAssertions.mjs';

export async function setViewport(client, width, height = 844) {
	await client.send('Emulation.setDeviceMetricsOverride', {
		width,
		height,
		deviceScaleFactor: 2,
		mobile: width <= 760
	});
}

export async function showUploadState(client) {
	await client.evaluate(`(async () => {
		const { DriveUploadQueue } = await import('/apps/drive/js/views/DriveUploadQueue.js');
		const queue = new DriveUploadQueue();
		const file = new File([new Uint8Array(100)], 'lake.jpg', { type: 'image/jpeg' });
		queue.begin([file], '');
		queue.progress({ path: 'lake.jpg', fileBytes: 100, fileTransferredBytes: 68 });
		window.__proofUploadQueue = queue;
	})()`);
	await waitUntil(
		client,
		`document.querySelector('.drive-upload-row')?.textContent.includes('68%')`,
		'Inline upload progress did not render.'
	);
}
