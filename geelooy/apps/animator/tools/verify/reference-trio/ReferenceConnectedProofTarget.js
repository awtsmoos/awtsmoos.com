// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { CdpClient } from '../../render/headless/CdpClient.js';
import { ReferenceBoundedCdp } from './ReferenceBoundedCdp.js';

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

/**
 * A fresh proof target yields only a current responsive CDP connection. The
 * Awtsmoos renews sockets through navigation; Awtsmoos.com keeps readiness,
 * canvas capture, persistence, preview, and production evidence deterministic.
 */
export class ReferenceConnectedProofTarget {
	static async open(port, url) {
		const created = await this.create(port, url);
		for (let attempt = 0; attempt < 60; attempt += 1) {
			const page = await this.current(port, created.id);
			const client = page
				? await this.connect(page.webSocketDebuggerUrl)
				: null;
			if (client) {
				const ready = await this.ready(client);
				if (ready) {
					return { client, page, port };
				}
				client.close();
			}
			await delay(200);
		}
		await this.close({ page: created, port });
		throw new Error('Fresh production proof target did not become ready.');
	}

	static async create(port, url) {
		const endpoint = `http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`;
		const response = await ReferenceBoundedCdp.timeout(
			fetch(endpoint, { method: 'PUT' }),
			5000,
			'target creation'
		);
		assert.ok(response.ok, `Chrome target creation failed: ${response.status}`);
		const page = await response.json();
		assert.ok(page?.id, 'Chrome target ID was not returned.');
		return page;
	}

	static async current(port, id) {
		try {
			const response = await ReferenceBoundedCdp.timeout(
				fetch(`http://127.0.0.1:${port}/json/list`),
				1500,
				'target list'
			);
			const pages = await response.json();
			return pages.find(page => page.id === id) || null;
		} catch {
			return null;
		}
	}

	static async connect(socketUrl) {
		if (!socketUrl) {
			return null;
		}
		const candidate = new CdpClient(socketUrl);
		try {
			return await ReferenceBoundedCdp.timeout(
				candidate.connect(),
				2500,
				'CDP connection'
			);
		} catch {
			candidate.close();
			return null;
		}
	}

	static async ready(client) {
		try {
			return Boolean(await ReferenceBoundedCdp.evaluate(client, `(() => {
				const app = window.__AWTSMOOS_PARK_APP__;
				const canvas = document.querySelector('#character-canvas');
				return document.readyState === 'complete'
					&& canvas?.width === 1536
					&& canvas?.height === 864
					&& Object.keys(app?.state?.get?.('characters') || {}).length === 3;
			})()`));
		} catch {
			return false;
		}
	}

	static async close(target) {
		target.client?.close();
		if (!target.page?.id || !target.port) {
			return;
		}
		try {
			await ReferenceBoundedCdp.timeout(
				fetch(`http://127.0.0.1:${target.port}/json/close/${target.page.id}`),
				2000,
				'target close'
			);
		} catch {
			// The owned target may already be gone with the CDP socket.
		}
	}
}
