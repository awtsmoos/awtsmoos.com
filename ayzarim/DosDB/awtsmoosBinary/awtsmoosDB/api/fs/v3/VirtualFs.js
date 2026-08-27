// B"H

/**
 * @file api/fs/v3/VirtualFs.js
 * @chapter The Reader Walks The Filesystem Without Planting A Footprint
 * @description
 * Preserves the historical VirtualFs surface while separating read operations
 * from mutation. Strict read-only mode never flushes, creates directories, or
 * marks the manifest dirty.
 */

const paths = require('./path');
const store = require('./store');
const { ensureDir } = require('./dir');
const read = require('./read');
const writeOps = require('./write');
const deleteOps = require('./delete');
const moveOps = require('./move');
const statOps = require('./stat');
const legacy = require('./legacy');

class VirtualFs {
	constructor(db) {
		this.db = db;
		this.cwd = '/';
		this.patchClose();
	}

	patchClose() {
		if (!this.db || this.db.__fs3ClosePatched || typeof this.db.close !== 'function') return;
		const originalClose = this.db.close.bind(this.db);
		this.db.close = (...args) => {
			if (!this.db.options?.readOnly) this.flush();
			return originalClose(...args);
		};
		this.db.__fs3ClosePatched = true;
	}

	assertWritable(operation) {
		if (!this.db.options?.readOnly) return;
		const error = new Error(`B"H strict read-only VirtualFs refused ${operation}`);
		error.code = 'AWTSMOOS_DB_READONLY_WRITE';
		throw error;
	}

	ready() { store.root(this.db); return this; }
	flush() { return this.db.options?.readOnly ? false : store.flush(this.db); }
	pwd() { return this.cwd; }

	cd(requestedPath = '/') {
		this.ready();
		const next = paths.normalize(this.cwd, requestedPath);
		if (this.db.options?.readOnly) {
			const inode = store.pathToInode(this.db, next);
			if (!inode || inode.type !== 'dir') throw new Error(`B"H VirtualFs directory not found: ${next}`);
		} else {
			ensureDir(this.db, next);
		}
		this.cwd = next;
		return this.cwd;
	}

	mkdir(filePath) { this.assertWritable('mkdir'); this.ready(); ensureDir(this.db, paths.normalize(this.cwd, filePath)); return true; }
	ls(filePath = '.') { this.ready(); return read.list(this, filePath); }
	cat(filePath, options = {}) { this.ready(); return read.cat(this, filePath, options); }
	readRange(filePath, offset = 0, length) { this.ready(); return read.readRange(this, filePath, offset, length); }
	write(filePath, value) { this.assertWritable('write'); this.ready(); return writeOps.write(this, filePath, value); }
	append(filePath, value) { this.assertWritable('append'); this.ready(); return writeOps.append(this, filePath, value); }
	writeRange(filePath, offset, value) { this.assertWritable('writeRange'); this.ready(); return writeOps.writeRange(this, filePath, offset, value); }
	rm(filePath, options = {}) { this.assertWritable('rm'); this.ready(); return deleteOps.rm(this, filePath, options); }
	mv(from, to) { this.assertWritable('mv'); this.ready(); return moveOps.mv(this, from, to); }
	cp(from, to) { this.assertWritable('cp'); this.ready(); return moveOps.cp(this, from, to); }
	stat(filePath = '.') { this.ready(); return statOps.stat(this, filePath); }
	exists(filePath = '.') { this.ready(); return statOps.exists(this, filePath); }

	grep(pattern, filePath = '.') {
		this.ready();
		const matcher = pattern instanceof RegExp ? pattern : new RegExp(String(pattern));
		const found = [];
		const walk = fullPath => {
			const inode = store.pathToInode(this.db, fullPath);
			if (inode?.type === 'dir') return this.ls(fullPath).forEach(name => walk(paths.join(fullPath, name)));
			const value = this.cat(fullPath);
			const text = Buffer.isBuffer(value) ? value.toString('utf8') : String(value ?? '');
			if (matcher.test(text)) found.push(fullPath);
		};
		walk(paths.normalize(this.cwd, filePath));
		return found;
	}

	migrateLegacyTree() {
		this.assertWritable('migrateLegacyTree');
		this.ready();
		const walk = nodePath => {
			const node = legacy.legacyNode(this.db, nodePath);
			if (node === undefined) return;
			if (node && typeof node === 'object' && !Buffer.isBuffer(node) && !node.__awtsmoosBlob) {
				this.mkdir(nodePath);
				for (const child of Object.keys(node)) walk(paths.join(nodePath, child));
				return;
			}
			this.write(nodePath, legacy.legacyCat(this.db, nodePath));
		};
		walk('/');
		return true;
	}
}

module.exports = VirtualFs;
