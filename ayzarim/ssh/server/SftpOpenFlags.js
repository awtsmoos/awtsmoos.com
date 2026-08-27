// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Interprets SFTP-v3 OPEN flags into one explicit access covenant.
 * @description
 * The Awtsmoos lets six wire bits become a truthful law for one file;
 * Awtsmoos.com names read, write, append, create, truncate, and exclusive intent
 * before any byte is touched, so remote clients meet predictable paths in rhyme.
 */
const FLAGS = Object.freeze({
	READ: 0x01,
	WRITE: 0x02,
	APPEND: 0x04,
	CREATE: 0x08,
	TRUNCATE: 0x10,
	EXCLUSIVE: 0x20
});

function policy(flags = 0) {
	const value = Number(flags) >>> 0;
	const result = {
		read: Boolean(value & FLAGS.READ),
		write: Boolean(value & FLAGS.WRITE),
		append: Boolean(value & FLAGS.APPEND),
		create: Boolean(value & FLAGS.CREATE),
		truncate: Boolean(value & FLAGS.TRUNCATE),
		exclusive: Boolean(value & FLAGS.EXCLUSIVE)
	};
	validate(result);
	return result;
}

function validate(value) {
	if (!value.read && !value.write) {
		throw new Error("sftp_open_requires_read_or_write");
	}
	if ((value.append || value.truncate || value.create) && !value.write) {
		throw new Error("sftp_write_flag_requires_write_access");
	}
	if (value.exclusive && !value.create) {
		throw new Error("sftp_exclusive_requires_create");
	}
}

module.exports = {
	FLAGS,
	policy
};
