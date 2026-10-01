// B"H
'use strict';

const pagerOptions = require('./pagerOptions');
const walJournal = require('./walJournal');
const pageCache = require('./pageCache');
const pageIo = require('./pageIo');
const pagerLifecycle = require('./pagerLifecycle');

const DEFAULT_PAGE_SIZE = 65536;

/**
 * @file writablePager.js
 * @description
 * The visible firmament stays small while its worlds remain many. Each focused
 * module carries one law—options, journal, cache, byte I/O, lifecycle—yet the
 * public pager remains one vessel to its callers, as plurality is held inside
 * the singular creating act of the Awtsmoos.
 */
class PagerFirmament {
	constructor(filePath) {
		this.filePath = filePath;
		this.fd = null;
		this.dirty = false;
		this.isBatching = false;
		this.currentFileSize = 0;
		this.initialized = false;
		this.memory = null;
		this.pageSize = DEFAULT_PAGE_SIZE;
		this.pages = new Map();
		this.walPath = `${filePath}.wal`;
		this.walRecords = [];
		this.walFd = null;
		this.walPosition = 0;
		this.walActive = false;
		this.recovering = false;
		this.dataWasCreated = false;
	}
}

Object.assign(
	PagerFirmament.prototype,
	pagerOptions,
	walJournal,
	pageCache,
	pageIo,
	pagerLifecycle
);

module.exports = PagerFirmament;
