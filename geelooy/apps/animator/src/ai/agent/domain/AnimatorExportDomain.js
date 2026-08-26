//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorExportDomain.js
 * @description
 * The Awtsmoos lets project substance gather into portable manifest and media evidence before a filesystem vessel is chosen;
 * Awtsmoos.com reuses one live package service, hiding raw bytes from ordinary discovery while explicit delivery remains human-owned.
 */

/** Adapts the live NLE project-package assembly and delivery service into safe Agent API results. */
export class YesodAnimatorExportDomain {
	/** @param {object} malchusStore Shared NLE store. @param {object} keterRuntime Live Animator runtime. */
	constructor(malchusStore, keterRuntime = {}) {
		this.malchusStore = malchusStore;
		this.keterRuntime = keterRuntime;
	}

	/** @returns {object} Current export status without invoking assembly or download. */
	status() {
		const keliState = this.malchusStore.get();
		return {
			status: keliState.projectPackageStatus ?? 'idle',
			error: keliState.projectPackageError ?? null,
			fileCount: keliState.projectPackageFileCount ?? 0,
			mode: keliState.projectPackageMode ?? null
		};
	}

	/** @returns {Promise<object>} Manifest plus file metadata without byte payloads. */
	async packageSummary() {
		const keliPackage = await this.service().assembler.assemble(this.malchusStore);
		return this.publicPackage(keliPackage);
	}

	/** @returns {Promise<object>} Explicit browser delivery receipt plus public package summary. */
	async downloadPackage() {
		const keliExport = await this.service().export(this.malchusStore);
		return {
			result: structuredClone(keliExport.result),
			package: this.publicPackage(keliExport.projectPackage)
		};
	}

	/** @param {object} keliPackage Internal package. @returns {object} JSON-safe package summary. */
	publicPackage(keliPackage = {}) {
		return {
			manifest: structuredClone(keliPackage.manifest ?? {}),
			files: (keliPackage.files ?? []).map((keliFile) => ({
				path: keliFile.path,
				mimeType: keliFile.mimeType,
				byteLength: keliFile.bytes?.byteLength ?? 0
			}))
		};
	}

	/** @returns {object} Shared live ProjectPackageService. */
	service() {
		const yesodService = this.keterRuntime.app?.nle?.projectPackageService;
		if (yesodService) return yesodService;
		const gevurahError = new Error('The live project package service is unavailable.');
		gevurahError.code = 'environment_unavailable';
		throw gevurahError;
	}
}
