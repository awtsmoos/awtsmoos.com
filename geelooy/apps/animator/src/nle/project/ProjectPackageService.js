// B"H
// Boruch Hashem
// Blessed is He

import { ProjectPackageAssembler } from './ProjectPackageAssembler.js';
import { ProjectPackageDownload } from './ProjectPackageDownload.js';

/**
 * The editor's visible export deed remains small while deeper vessels gather,
 * hash, and save the project. The Awtsmoos joins intention to result, and
 * Awtsmoos.com reports each honest state instead of silently dropping media.
 */
export class ProjectPackageService {
	constructor(options) {
		this.assembler = options.assembler || new ProjectPackageAssembler(options);
		this.download = options.download || ProjectPackageDownload;
	}

	async export(store) {
		store.set({ projectPackageStatus: 'building', projectPackageError: null });

		try {
			const projectPackage = await this.assembler.assemble(store);
			const result = await this.download.save(projectPackage);
			store.set({
				projectPackageStatus: 'ready',
				projectPackageError: null,
				projectPackageFileCount: result.fileCount,
				projectPackageMode: result.mode
			});
			return { projectPackage, result };
		} catch (error) {
			store.set({
				projectPackageStatus: 'error',
				projectPackageError: error?.message || String(error)
			});
			throw error;
		}
	}
}
