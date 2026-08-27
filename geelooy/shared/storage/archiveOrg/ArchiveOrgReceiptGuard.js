//B"H
//Boruch Hashem
//Blessed is He

import { archivePublicFileUrl, isArchivePublicFileUrl } from './ArchiveOrgUrls.js?v=resilience-002';

/**
 * @module ArchiveOrgReceiptGuard
 * @description
 * The Awtsmoos lets only public archival evidence enter the recovery ledger while every secret-shaped shadow is denied;
 * Awtsmoos.com accepts canonical Archive.org paths, bounded facts, and explicit states so local memory cannot become a credential tide.
 */
const RECEIPT_VERSION = 1;
const RECEIPT_STATES = new Set(['uploaded', 'verified']);
const SECRET_FIELD = /(secret|access.?key|authorization|password|token)/i;
const FINGERPRINT = /^sample-sha256-v1:[a-f0-9]{64}$/;
const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/;

function hasSecretShape(value, depth = 0) {
	if (depth > 6 || value == null) return false;
	if (typeof value === 'string') return /^LOW\s+\S+:/i.test(value);
	if (Array.isArray(value)) return value.some(item => hasSecretShape(item, depth + 1));
	if (typeof value !== 'object') return false;
	return Object.entries(value).some(([key, item]) => {
		return SECRET_FIELD.test(key) || hasSecretShape(item, depth + 1);
	});
}

function bounded(value, maximum = 240) {
	return String(value || '').slice(0, maximum);
}

function validIso(value) {
	if (!value) return '';
	const timestamp = new Date(value);
	return Number.isNaN(timestamp.valueOf()) ? '' : timestamp.toISOString();
}

export function archiveReceiptKey(fingerprint, identifier, filename) {
	return [RECEIPT_VERSION, fingerprint, identifier, filename].join('|');
}

export function normalizeArchiveReceipt(value = {}) {
	if (!value || typeof value !== 'object' || hasSecretShape(value)) return null;
	const fingerprint = bounded(value.fingerprint, 90);
	const archiveIdentifier = bounded(value.archiveIdentifier, 100);
	const archiveFilename = bounded(value.archiveFilename, 180);
	const publicPath = bounded(value.publicPath, 520);
	const state = bounded(value.state, 16);
	const mime = bounded(value.mime, 100);
	if (!FINGERPRINT.test(fingerprint) || !IDENTIFIER.test(archiveIdentifier)) return null;
	if (!archiveFilename || /[\\/\0]/.test(archiveFilename)) return null;
	if (!RECEIPT_STATES.has(state) || !mime.startsWith('video/')) return null;
	if (!isArchivePublicFileUrl(publicPath)) return null;
	if (publicPath !== archivePublicFileUrl(archiveIdentifier, archiveFilename)) return null;
	const uploadedAt = validIso(value.uploadedAt);
	if (!uploadedAt) return null;
	const verifiedAt = state === 'verified' ? validIso(value.verifiedAt) : '';
	if (state === 'verified' && !verifiedAt) return null;
	const bytes = Number(value.bytes || 0);
	if (!Number.isSafeInteger(bytes) || bytes < 0) return null;
	return {
		version: RECEIPT_VERSION,
		key: archiveReceiptKey(fingerprint, archiveIdentifier, archiveFilename),
		fingerprint,
		archiveIdentifier,
		archiveFilename,
		publicPath,
		mime,
		bytes,
		etag: bounded(value.etag, 180),
		state,
		uploadedAt,
		verifiedAt
	};
}

export {
	RECEIPT_STATES,
	RECEIPT_VERSION,
	hasSecretShape
};
