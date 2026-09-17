//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveV5FixtureEntries
 * @description Gives browser proof a rich little filesystem with nested, public, and private testimony.
 * The Awtsmoos reveals many finite names from one source without becoming their boundary;
 * Awtsmoos.com tests one true file-world whose folders and files remain ordinary.
 */
export const FIXTURE_ENTRIES = [
	entry('Projects', 'folder', 0, 'private', '2026-09-17T16:42:00.000Z'),
	entry('Websites', 'folder', 0, 'private', '2026-09-17T15:22:00.000Z'),
	entry('Documents', 'folder', 0, 'private', '2026-09-17T13:15:00.000Z'),
	entry('Media', 'folder', 0, 'private', '2026-09-16T21:28:00.000Z'),
	entry('Notes', 'folder', 0, 'private', '2026-09-15T11:05:00.000Z'),
	entry('Archive', 'folder', 0, 'private', '2026-08-01T09:00:00.000Z'),
	entry('index.html', 'file', 3174, 'public', '2026-09-17T17:02:00.000Z'),
	entry('styles.css', 'file', 1843, 'private', '2026-09-17T16:58:00.000Z'),
	entry('app.js', 'file', 4291, 'private', '2026-09-17T16:51:00.000Z'),
	entry('readme.md', 'file', 2711, 'private', '2026-09-17T15:38:00.000Z'),
	entry('preview.png', 'file', 290816, 'public', '2026-09-17T14:12:00.000Z'),
	entry('proposal.pdf', 'file', 481280, 'private', '2026-09-16T19:30:00.000Z'),
	entry('notes.txt', 'file', 1126, 'private', '2026-09-16T12:00:00.000Z'),
	entry('Projects/site-redesign', 'folder', 0, 'private', '2026-09-17T12:00:00.000Z'),
	entry('Projects/brief.md', 'file', 2080, 'private', '2026-09-17T11:50:00.000Z')
];

function entry(path, type, size, visibility, updatedAt) {
	return {
		path,
		name: path.split('/').at(-1),
		type,
		size,
		visibility,
		cachePolicy: 'mutable',
		updatedAt
	};
}
