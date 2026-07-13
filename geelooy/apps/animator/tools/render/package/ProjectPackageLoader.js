// B"H
// Boruch Hashem
// Blessed is He

import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';

/**
 * Browser packages cross into Node through this narrow gate. The Awtsmoos
 * renews folder and bundle, while Awtsmoos.com refuses paths that would escape
 * their vessel and removes temporary revelation after its appointed use.
 */
export class ProjectPackageLoader {
	static load(inputPath) {
		if (!inputPath || !existsSync(inputPath)) {
			throw new Error(`Project package does not exist: ${inputPath}`);
		}

		if (statSync(inputPath).isDirectory()) {
			return this.fromManifest(join(inputPath, 'manifest.json'));
		}

		if (inputPath.endsWith('.awtpkg')) {
			return this.fromBundle(inputPath);
		}

		return this.fromManifest(inputPath);
	}

	static fromManifest(manifestPath) {
		const root = dirname(resolve(manifestPath));
		const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
		return { manifest, root, temporary: false };
	}

	static fromBundle(bundlePath) {
		const bundle = JSON.parse(readFileSync(bundlePath, 'utf8'));
		const root = mkdtempSync(join(tmpdir(), 'awtsmoos-animator-package-'));
		writeFileSync(
			join(root, 'manifest.json'),
			JSON.stringify(bundle.manifest, null, 2)
		);

		for (const file of bundle.files || []) {
			const target = this.safePath(root, file.path);
			mkdirSync(dirname(target), { recursive: true });
			writeFileSync(target, Buffer.from(file.base64, 'base64'));
		}

		return { manifest: bundle.manifest, root, temporary: true };
	}

	static safePath(root, relativePath) {
		const target = resolve(root, relativePath);
		const prefix = `${resolve(root)}${sep}`;
		if (!target.startsWith(prefix)) {
			throw new Error(`Unsafe packaged media path: ${relativePath}`);
		}
		return target;
	}

	static cleanup(loaded) {
		if (loaded?.temporary && loaded.root) {
			rmSync(loaded.root, { recursive: true, force: true });
		}
	}
}
