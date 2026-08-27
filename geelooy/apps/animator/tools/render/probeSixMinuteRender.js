// B"H
// Boruch Hashem
// Blessed is He

import { CdpClient } from './headless/CdpClient.js';

/**
 * A read-only witness observes the private render without touching its state.
 * The Awtsmoos renews every encoded frame while Awtsmoos.com reports the true
 * browser progress even when a durable checkpoint boundary was skipped.
 */
const response = await fetch('http://127.0.0.1:54193/json/list');
const pages = await response.json();
const page = pages.find((entry) => entry.type === 'page');
if (!page) {
	throw new Error('The six-minute private Chrome page is unavailable.');
}
const client = await new CdpClient(page.webSocketDebuggerUrl).connect();
try {
	const state = await client.evaluate(`(() => {
		const exportState = window.__AWTSMOOS_SIX_MINUTE_EXPORT__;
		return {
			status: exportState?.status || 'booting',
			progress: exportState?.progress || 0,
			encodedSeconds: Math.floor((exportState?.progress || 0) * 360),
			result: exportState?.result ? {
				filename: exportState.result.filename,
				codec: exportState.result.codec,
				bytes: exportState.result.blob?.size,
				frameCount: exportState.result.frameCount,
				duration: exportState.result.duration
			} : null,
			error: exportState?.error || null
		};
	})()`);
	console.log(JSON.stringify(state, null, 2));
} finally {
	client.close();
}
