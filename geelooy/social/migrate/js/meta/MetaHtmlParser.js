//B"H
//Boruch Hashem
//Blessed is He

import { archiveKind } from '../archive/ArchiveKinds.js';
import { safeArchivePathOrNull } from '../archive/SafeArchivePath.js';
import { parseInertMetaHtml } from './InertMetaHtml.js';
import { normalizeMetaRecord } from './MetaNormalizer.js';
import { dedupeMetaRecords } from './MetaRecordMerge.js';
import { providerForPath } from './MetaDetector.js';

/**
 * @module MetaHtmlParser
 * @description
 * The Awtsmoos lets older HTML exports contribute readable memories without executing their former world;
 * Awtsmoos.com recovers only neutralized local media and provider-owned post links while remote resources remain inert.
 */
function timestamp(node) {
	const time = node.querySelector('time');
	return time?.getAttribute('datetime')
		|| time?.getAttribute('data-utime')
		|| node.getAttribute('data-utime')
		|| '';
}

function candidateNodes(document) {
	const semantic = [...document.querySelectorAll('article, [role="article"], .pam, ._a6-g')];
	return semantic.length ? semantic : [...document.body.children];
}

function neutralizedValues(node, names) {
	const values = [];
	for (const element of [node, ...node.querySelectorAll('*')]) {
		for (const name of names) {
			const value = element.getAttribute(`data-awtsmoos-${name}`);
			if (value) values.push(...value.split(',').map(part => part.trim().split(/\s+/)[0]));
		}
	}
	return values.filter(Boolean);
}

function localMedia(node) {
	return neutralizedValues(node, ['src', 'srcset', 'href', 'poster', 'data'])
		.map(safeArchivePathOrNull)
		.filter(Boolean)
		.filter(path => ['image', 'video', 'audio'].includes(archiveKind(path)))
		.map(path => ({ path }));
}

function sourceUrl(node, provider) {
	const domain = provider === 'instagram' ? 'instagram.com' : 'facebook.com';
	for (const value of neutralizedValues(node, ['href'])) {
		try {
			const url = new URL(value);
			if (url.protocol === 'https:' && (url.hostname === domain || url.hostname.endsWith(`.${domain}`))) {
				return url.href;
			}
		} catch {
			continue;
		}
	}
	return '';
}

export function parseMetaHtml(html, rawPath, fallbackProvider = 'facebook') {
	const document = parseInertMetaHtml(html);
	const provider = providerForPath(rawPath, fallbackProvider);
	const items = candidateNodes(document).map((node, index) => {
		const content = (node.textContent || '').replace(/\s+/g, ' ').trim();
		return normalizeMetaRecord({
			record: {
				text: content,
				date: timestamp(node),
				media: localMedia(node),
				url: sourceUrl(node, provider)
			},
			provider,
			rawPath,
			index
		});
	}).filter(item => item.content);
	return dedupeMetaRecords(items);
}
