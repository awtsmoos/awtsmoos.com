//B"H
//Boruch Hashem
//Blessed is He

import { archiveFileFingerprint } from './ArchiveOrgFileFingerprint.js';
import { archiveUploadHeaders } from './ArchiveOrgHeaders.js';
import { archiveFilenameFor, archiveIdentifierFor } from './ArchiveOrgIdentity.js?v=resilience-002';
import { sharedArchiveOrgInflightRegistry } from './ArchiveOrgInflightRegistry.js';
import { ArchiveOrgOverloadClient } from './ArchiveOrgOverloadClient.js';
import { ArchiveOrgPublicVerifier } from './ArchiveOrgPublicVerifier.js';
import { ArchiveOrgReceiptLedger } from './ArchiveOrgReceiptLedger.js';
import { archiveReceiptKey } from './ArchiveOrgReceiptGuard.js';
import {
	adoptedArchiveReceipt,
	archiveAssetFromReceipt,
	uploadedArchiveReceipt
} from './ArchiveOrgReceiptAsset.js';
import { ArchiveOrgUploader, ArchiveOrgUploadError } from './ArchiveOrgUploader.js?v=resilience-002';
import { archiveUploadUrl } from './ArchiveOrgUrls.js?v=resilience-002';

/**
 * @module ArchiveOrgUploadService
 * @description
 * The Awtsmoos resolves public evidence before asking for a secret and journals accepted bytes before downstream uncertainty;
 * Awtsmoos.com reuses fingerprinted Archive.org truth across callers, while credentials exist only for a genuine upload necessity.
 */
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const transientCodes = new Set(['SLOW_DOWN', 'NETWORK', 'PREFLIGHT_NETWORK', 'SERVER']);

function metadataFor(item = {}) {
	return {
		title: item.title || item.text || 'Migrated creator video',
		creator: item.sourceProfile?.name || item.provider || '',
		description: item.text || '',
		date: item.publishedAt ? String(item.publishedAt).slice(0, 10) : '',
		language: item.language || ''
	};
}

export class ArchiveOrgUploadService {
	constructor({
		overloadClient = new ArchiveOrgOverloadClient(),
		uploader = new ArchiveOrgUploader(),
		ledger = new ArchiveOrgReceiptLedger(),
		inflight = sharedArchiveOrgInflightRegistry,
		verifier = new ArchiveOrgPublicVerifier(),
		fingerprint = archiveFileFingerprint,
		wait = delay,
		now = () => new Date().toISOString(),
		maxAttempts = 3
	} = {}) {
		Object.assign(this, { overloadClient, uploader, ledger, inflight, verifier, fingerprint, wait, now, maxAttempts });
	}

	async uploadVideo(input = {}) {
		const { file, item = {}, mediaPath = '', existingAsset } = input;
		const mime = String(input.mime || file?.type || '');
		if (!file || !mime.startsWith('video/')) throw new Error('Archive.org video storage accepts video files only.');
		const fileFingerprint = await this.fingerprint(file);
		const identifier = archiveIdentifierFor(item, mediaPath);
		const filename = archiveFilenameFor(file, mediaPath, fileFingerprint);
		const key = archiveReceiptKey(fileFingerprint, identifier, filename);
		let receipt = this.ledger.find(key);
		if (!receipt) {
			const adopted = adoptedArchiveReceipt(existingAsset, fileFingerprint, this.now);
			if (adopted?.archiveIdentifier === identifier && adopted.archiveFilename === filename) {
				receipt = this.ledger.save(adopted);
			}
		}
		if (receipt) return archiveAssetFromReceipt(await this.refreshReceipt(receipt, input.signal), item);
		return this.inflight.run(key, () => this.uploadMiss({ ...input, mime, item, identifier, filename, fileFingerprint, key }));
	}

	async uploadMiss(context) {
		const cached = this.ledger.find(context.key);
		if (cached) return archiveAssetFromReceipt(await this.refreshReceipt(cached, context.signal), context.item);
		const credentials = context.credentials || await context.credentialsProvider?.();
		if (!credentials?.accessKey || !credentials?.secretKey) {
			throw new Error('Archive.org credentials are required only for a new direct video upload.');
		}
		for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
			try {
				const capacity = await this.overloadClient.check({ accessKey: credentials.accessKey, identifier: context.identifier, signal: context.signal });
				if (capacity.overLimit) throw new ArchiveOrgUploadError('Archive.org upload capacity is temporarily full.', 'SLOW_DOWN', 503);
				const transport = await this.uploader.put({
					url: archiveUploadUrl(context.identifier, context.filename),
					file: context.file,
					headers: archiveUploadHeaders({ credentials, file: context.file, mime: context.mime, metadata: metadataFor(context.item) }),
					signal: context.signal,
					onProgress: context.onProgress
				});
				const receipt = uploadedArchiveReceipt({ fingerprint: context.fileFingerprint, identifier: context.identifier, filename: context.filename, mime: context.mime, bytes: Number(context.file.size || 0), etag: transport.etag, now: this.now });
				this.ledger.save(receipt);
				return archiveAssetFromReceipt(await this.refreshReceipt(receipt, context.signal), context.item);
			} catch (error) {
				if (context.signal?.aborted || error.code === 'ABORTED' || error.code === 'AUTH') throw error;
				if (!transientCodes.has(error.code) || attempt >= this.maxAttempts) throw error;
				await this.wait(800 * (2 ** (attempt - 1)));
			}
		}
		throw new Error('Archive.org upload exhausted its retry window.');
	}

	async refreshReceipt(receipt, signal) {
		if (receipt.state === 'verified') return receipt;
		const evidence = await this.verifier.verify(receipt.archiveIdentifier, receipt.archiveFilename, signal);
		if (!evidence.verified) return receipt;
		return this.ledger.save({ ...receipt, state: 'verified', verifiedAt: this.now() }) || receipt;
	}
}
