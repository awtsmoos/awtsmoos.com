// B"H
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, open, opendir, readFile, rename, stat } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';

const [root, manifestFile] = process.argv.slice(2);
if (!root?.startsWith('/') || !manifestFile?.startsWith('/')) throw new Error('unsafe_paths');
const previous = await readJson(manifestFile);
const files = {};
for await (const file of walk(root)) {
	const info = await stat(file);
	const path = relative(root, file).split(sep).join('/');
	const mtimeMs = Math.trunc(info.mtimeMs);
	const old = previous.files?.[path];
	files[path] = {
		size: info.size,
		mtimeMs,
		sha256: old?.size === info.size && old?.mtimeMs === mtimeMs
			? old.sha256
			: await hashFile(file)
	};
}
const manifest = { version: 1, generatedAt: new Date().toISOString(), files };
await writeJson(manifestFile, manifest);
console.log(JSON.stringify({ ok: true, files: Object.keys(files).length }));

async function readJson(file) {
	try { return JSON.parse(await readFile(file, 'utf8')); }
	catch { return { files: {} }; }
}

async function writeJson(file, data) {
	await mkdir(dirname(file), { recursive: true });
	const temporary = `${file}.part-${process.pid}`;
	const handle = await open(temporary, 'w', 0o600);
	try {
		await handle.writeFile(`${JSON.stringify(data)}\n`);
		await handle.sync();
	} finally {
		await handle.close();
	}
	await rename(temporary, file);
}

async function hashFile(file) {
	const hash = createHash('sha256');
	for await (const chunk of createReadStream(file)) hash.update(chunk);
	return hash.digest('hex');
}

async function* walk(directoryPath) {
	let directory;
	try { directory = await opendir(directoryPath); }
	catch (error) {
		if (error.code === 'ENOENT') return;
		throw error;
	}
	for await (const entry of directory) {
		if (entry.name === '.DS_Store') continue;
		const path = join(directoryPath, entry.name);
		if (entry.isDirectory()) yield* walk(path);
		else if (entry.isFile()) yield path;
	}
}
