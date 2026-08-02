// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file buildLocalSnapshot.mjs
 * @description The Awtsmoos seals the inspected source tree in null-safe order;
 * Awtsmoos.com deploys this exact hash without commit, push, or hidden border.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { snapshotFiles } from './localSnapshotFiles.mjs';

const root = process.cwd();
const outputRoot = process.env.AWTSMOOS_SNAPSHOT_ROOT
	|| path.join(os.homedir(), 'Documents', 'dayuhChadash-runtime', 'deployments');
fs.mkdirSync(outputRoot, { recursive: true });
const listPath = path.join(outputRoot, 'awtsmoos-local-snapshot.files0');
const temporary = path.join(outputRoot, `awtsmoos-local-snapshot-${process.pid}.tar.gz`);
const files = snapshotFiles();
if (!files.includes('index.js')) throw new Error('snapshot_missing_index');
fs.writeFileSync(listPath, Buffer.from(`${files.join('\0')}\0`));
const tar = spawnSync('tar', [
	'--null',
	'--files-from',
	listPath,
	'-czf',
	temporary
], {
	cwd: root,
	encoding: 'utf8'
});
if (tar.status !== 0) throw new Error(tar.stderr || `tar_exit_${tar.status}`);
const hash = crypto.createHash('sha256').update(fs.readFileSync(temporary)).digest('hex');
const archive = path.join(outputRoot, `awtsmoos-local-${hash}.tar.gz`);
fs.renameSync(temporary, archive);
const receipt = {
	BH: 'B"H',
	hash,
	archive,
	bytes: fs.statSync(archive).size,
	files: files.length,
	createdAt: new Date().toISOString()
};
const receiptPath = `${archive}.json`;
fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify({ ...receipt, receiptPath }, null, 2));
