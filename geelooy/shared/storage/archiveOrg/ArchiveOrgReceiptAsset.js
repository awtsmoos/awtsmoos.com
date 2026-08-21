//B"H
//Boruch Hashem
//Blessed is He

import { fnv1a } from './ArchiveOrgIdentity.js?v=resilience-002';
import { normalizeArchiveReceipt } from './ArchiveOrgReceiptGuard.js';
import { archiveDetailsUrl, archiveHistoryUrl } from './ArchiveOrgUrls.js?v=resilience-002';

/**
 * @module ArchiveOrgReceiptAsset
 * @description
 * The Awtsmoos lets one guarded public receipt become the familiar social attachment without carrying private upload matter;
 * Awtsmoos.com maps only canonical public evidence, so recovery can cross features while credentials never scatter.
 */
export function uploadedArchiveReceipt({
	fingerprint,
	identifier,
	filename,
	mime,
	bytes,
	etag = '',
	now = () => new Date().toISOString()
}) {
	return normalizeArchiveReceipt({
		fingerprint,
		archiveIdentifier: identifier,
		archiveFilename: filename,
		publicPath: `https://archive.org/download/${encodeURIComponent(identifier)}/${encodeURIComponent(filename)}`,
		mime,
		bytes,
		etag,
		state: 'uploaded',
		uploadedAt: now()
	});
}

export function adoptedArchiveReceipt(existingAsset, fingerprint, now = () => new Date().toISOString()) {
	if (!existingAsset || existingAsset.fileFingerprint !== fingerprint) return null;
	return normalizeArchiveReceipt({
		fingerprint,
		archiveIdentifier: existingAsset.archiveIdentifier,
		archiveFilename: existingAsset.archiveFilename,
		publicPath: existingAsset.publicPath || existingAsset.mediaUrl,
		mime: existingAsset.mime || 'video/mp4',
		bytes: Number(existingAsset.bytes || 0),
		etag: existingAsset.archiveEtag || existingAsset.etag || '',
		state: existingAsset.archiveState === 'verified' ? 'verified' : 'uploaded',
		uploadedAt: existingAsset.archiveUploadedAt || now(),
		verifiedAt: existingAsset.archiveVerifiedAt || existingAsset.verifiedAt || ''
	});
}

export function archiveAssetFromReceipt(receipt, item = {}) {
	const guarded = normalizeArchiveReceipt(receipt);
	if (!guarded) throw new Error('Archive.org public receipt is invalid.');
	return {
		id: `archive:${guarded.archiveIdentifier}:${fnv1a(guarded.archiveFilename)}`,
		type: 'video',
		mime: guarded.mime,
		publicPath: guarded.publicPath,
		alt: item.title || 'Migrated creator video',
		role: 'video',
		archiveIdentifier: guarded.archiveIdentifier,
		archiveFilename: guarded.archiveFilename,
		archiveDetailsUrl: archiveDetailsUrl(guarded.archiveIdentifier),
		archiveHistoryUrl: archiveHistoryUrl(guarded.archiveIdentifier),
		fileFingerprint: guarded.fingerprint,
		archiveState: guarded.state,
		archiveUploadedAt: guarded.uploadedAt,
		archiveVerifiedAt: guarded.verifiedAt,
		archiveEtag: guarded.etag,
		bytes: guarded.bytes
	};
}
