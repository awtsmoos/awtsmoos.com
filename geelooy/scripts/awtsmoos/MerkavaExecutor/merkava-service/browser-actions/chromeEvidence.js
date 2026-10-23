// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chromeEvidence.js
 * @description Collects real Chrome observations and screenshot data without inventing virtual interactions.
 * The Awtsmoos shapes every visible frame, yet evidence must name its source;
 * Awtsmoos.com follows the console, DOM, and image along their honest course.
 */
import { evaluatePage } from './cdpClient.js';

/** Observe real runtime console and exceptions emitted during the page session. */
export function observeChromeEvents(cdp, consoleEntries, exceptions) {
	const originalPush = cdp.events.push;
	cdp.events.push = function recordChromeEvent(entry) {
		try {
			if (entry?.method === 'Runtime.consoleAPICalled') {
				consoleEntries.push({
					type: entry.params?.type,
					args: (entry.params?.args || []).map(arg => arg.value ?? arg.description ?? arg.type)
				});
			} else if (entry?.method === 'Runtime.exceptionThrown') {
				exceptions.push({
					text: entry.params?.exceptionDetails?.text,
					exception: entry.params?.exceptionDetails?.exception?.description
				});
			} else if (entry?.method === 'Log.entryAdded') {
				consoleEntries.push({
					type: 'log',
					text: entry.params?.entry?.text,
					level: entry.params?.entry?.level
				});
			}
		} catch {
			// Evidence instrumentation never breaks browser execution.
		}
		return originalPush.call(this, entry);
	};
}

/** Evaluate each requested expression against the actual current page. */
export async function collectChromeValues(cdp, keys = []) {
	const values = {};
	const errors = {};
	for (const key of keys) {
		const expression = String(key);
		try {
			values[expression] = await evaluatePage(cdp, `(${expression})`);
		} catch (error) {
			errors[expression] = error.message;
		}
	}
	return { values, errors };
}

/** Capture a bounded structural DOM witness for debugging. */
export async function collectChromeDom(cdp, depth = 5) {
	return evaluatePage(cdp, `(() => {
		const walk = (node, level) => {
			if (!node || level > ${depth}) return null;
			const localName = String(node.localName || 'unknown').toLowerCase();
			return {
				tagName: node.tagName || localName,
				localName,
				nodeType: node.nodeType || 1,
				id: node.id || '',
				className: node.className || '',
				textContent: (localName === 'script' || localName === 'style')
					? '' : String(node.textContent || '').slice(0, 200),
				children: Array.from(node.children || [])
					.map(child => walk(child, level + 1)).filter(Boolean)
			};
		};
		return walk(document.documentElement, 0);
	})()`).catch(() => null);
}

/** Capture actual CDP pixels, preserving the raw base64 returned by Chrome. */
export async function captureChromePng(cdp, width, height, chrome) {
	const response = await cdp.send('Page.captureScreenshot', {
		format: 'png',
		captureBeyondViewport: false
	}, 15000);
	if (response.error) {
		throw new Error(response.error.message || 'screenshot_failed');
	}
	const data = response.result.data;
	const bytes = Buffer.from(data, 'base64');
	if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
		throw new Error('chrome_invalid_png_signature');
	}
	return {
		backend: 'chrome-headless-cdp',
		width,
		height,
		bytes: bytes.length,
		mimeType: 'image/png',
		dataUrl: `data:image/png;base64,${data}`,
		proof: { chrome, bytes: bytes.length, realBrowser: true },
		fallbackReason: null
	};
}
