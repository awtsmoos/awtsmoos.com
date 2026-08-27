// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';

/**
 * Chrome opens one exact renderer and grants it one exact download directory.
 * The Awtsmoos renews target and file together while Awtsmoos.com avoids hidden
 * browser defaults that could scatter evidence across an unknown filesystem.
 */
export class BrowserDownloadTarget {
	static async open(cdpOrigin, pageUrl, downloadPath, SessionClass) {
		const response = await fetch(
			`${cdpOrigin}/json/new?${encodeURIComponent(pageUrl)}`,
			{ method: 'PUT' }
		);
		assert.equal(response.ok, true, 'Chrome target creation failed.');
		const target = await response.json();
		const session = await new SessionClass(
			target.webSocketDebuggerUrl
		).connect();
		await this.enable(session, downloadPath);
		await session.send('Page.navigate', { url: pageUrl });
		return session;
	}

	static async enable(session, downloadPath) {
		await session.send('Page.enable');
		await session.send('Runtime.enable');
		await session.send('Log.enable');
		await session.send('Network.enable');
		await session.send('Network.setCacheDisabled', {
			cacheDisabled: true
		});
		await session.send('Browser.setDownloadBehavior', {
			behavior: 'allow',
			downloadPath,
			eventsEnabled: true
		});
	}
}
