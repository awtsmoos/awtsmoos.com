// B"H
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, open, readFile, rename, stat } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';

/** Builds a cached content manifest; unchanged size+mtime pairs reuse old hashes. */
export async function buildManifest(root, cacheFile, progress = () => {}) {
	const previous = await readManifest(cacheFile);
	const files = {};
	let scanned = 0;
	for await (const file of walk(root)) {
		const info = await stat(file);
		const path = relative(root, file).split(sep).join('/');
		const old = previous.files?.[path];
		const mtimeMs = Math.trunc(info.mtimeMs);
		const sha256 = old?.size === info.size && old?.mtimeMs === mtimeMs
			? old.sha256
			: await hashFile(file);
		files[path] = { size: info.size, mtimeMs, sha256 };
		scanned += 1;
		progress({ phase: 'manifest', files: scanned, path, bytes: info.size });
	}
	const manifest = { version: 1, generatedAt: new Date().toISOString(), files };
	await writeManifest(cacheFile, manifest);
	return manifest;
}

export async function readManifest(file) {
	try {
		return JSON.parse(await readFile(file, 'utf8'));
	} catch {
		return { version: 1, files: {} };
	}
}

export async function writeManifest(file, manifest) {
	await mkdir(dirname(file), { recursive: true });
	const temporary = `${file}.part-${process.pid}`;
	const handle = await open(temporary, 'w', 0o600);
	try {
		await handle.writeFile(`${JSON.stringify(manifest)}\n`);
		await handle.sync();
	} finally {
		await handle.close();
	}
	await rename(temporary, file);
}

export async function hashFile(file) {
	const hash = createHash('sha256');
	for await (const chunk of createReadStream(file)) hash.update(chunk);
	return hash.digest('hex');
}

async function* walk(root) {
	const directory = await import('node:fs/promises').then(module => module.opendir(root));
	for await (const entry of directory) {
		if (entry.name === '.DS_Store') continue;
		const path = join(root, entry.name);
		if (entry.isDirectory()) yield* walk(path);
		else if (entry.isFile()) yield path;
	}
}
