// B"H
// Boruch Hashem
// Blessed is He

import { ProjectPackageConstants } from './ProjectPackageConstants.js';

/**
 * A package leaves memory and enters a human-chosen vessel here. The Awtsmoos
 * renews directory and download alike; Awtsmoos.com offers a real folder when
 * possible and one self-contained fallback when browser law withholds it.
 */
export class ProjectPackageDownload {
	static async save(projectPackage) {
		if (globalThis.showDirectoryPicker) {
			return this.saveDirectory(projectPackage);
		}

		return this.saveBundle(projectPackage);
	}

	static async saveDirectory(projectPackage) {
		const root = await globalThis.showDirectoryPicker({ mode: 'readwrite' });
		const folder = await root.getDirectoryHandle(
			this.safeName(projectPackage.manifest.project.id),
			{ create: true }
		);
		await this.writeHandle(folder, 'manifest.json', this.jsonBytes(projectPackage.manifest));

		for (const file of projectPackage.files) {
			const [directoryName, fileName] = file.path.split('/');
			const directory = await folder.getDirectoryHandle(directoryName, { create: true });
			await this.writeHandle(directory, fileName, file.bytes);
		}

		return { mode: 'directory', fileCount: projectPackage.files.length + 1 };
	}

	static async saveBundle(projectPackage) {
		const bundle = {
			manifest: projectPackage.manifest,
			files: projectPackage.files.map((file) => ({
				path: file.path,
				mimeType: file.mimeType,
				base64: this.base64(file.bytes)
			}))
		};
		const blob = new Blob([JSON.stringify(bundle)], {
			type: ProjectPackageConstants.bundleMimeType
		});
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = `${this.safeName(projectPackage.manifest.project.id)}.awtpkg`;
		anchor.click();
		setTimeout(() => URL.revokeObjectURL(url), 0);
		return { mode: 'bundle', fileCount: projectPackage.files.length + 1 };
	}

	static async writeHandle(directory, name, bytes) {
		const handle = await directory.getFileHandle(name, { create: true });
		const writable = await handle.createWritable();
		await writable.write(bytes);
		await writable.close();
	}

	static jsonBytes(value) {
		return new TextEncoder().encode(JSON.stringify(value, null, 2));
	}

	static base64(bytes) {
		let binary = '';
		for (let offset = 0; offset < bytes.length; offset += 32768) {
			binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
		}
		return btoa(binary);
	}

	static safeName(value) {
		return String(value || 'awtsmoos-animator-project')
			.replace(/[^a-z0-9._-]+/gi, '-')
			.replace(/^-+|-+$/g, '')
			|| 'awtsmoos-animator-project';
	}
}
