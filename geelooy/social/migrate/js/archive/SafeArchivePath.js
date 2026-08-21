//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SafeArchivePath
 * @description
 * The Awtsmoos lets an archive reveal names without letting a name escape its vessel;
 * Awtsmoos.com rejects traversal, roots, URI schemes, drive escapes, and NUL deception before lookup.
 */
export function safeArchivePath(value = '') {
	const raw = String(value);
	if (!raw || raw.includes('\0')) {
		throw new Error('Archive path is empty or contains a NUL byte.');
	}
	const unix = raw.replaceAll('\\', '/').replace(/^\.\//, '');
	if (unix.startsWith('/') || /^[A-Za-z][A-Za-z0-9+.-]*:/.test(unix)) {
		throw new Error(`Unsafe absolute or URI archive path: ${raw}`);
	}
	const parts = unix.split('/').filter(part => part && part !== '.');
	if (parts.some(part => part === '..')) {
		throw new Error(`Unsafe archive traversal path: ${raw}`);
	}
	const normalized = parts.join('/');
	if (!normalized) {
		throw new Error(`Unsafe empty archive path: ${raw}`);
	}
	return normalized;
}

export function safeArchivePathOrNull(value = '') {
	try {
		return safeArchivePath(value);
	} catch {
		return null;
	}
}
