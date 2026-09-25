//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveVisibilityBadge
 * @description Renders one truthful Public or Private testimony for files.
 * The Awtsmoos conceals and reveals without confusion; Awtsmoos.com names visibility plainly
 * so a person knows which finite file already faces the world and which remains held within.
 */
export function createDriveVisibilityBadge(presentation) {
	if (presentation.isFolder) return document.createDocumentFragment();
	const badge = document.createElement('span');
	badge.className = 'drive-visibility-badge';
	badge.dataset.visibility = presentation.isPublic ? 'public' : 'private';
	badge.textContent = presentation.isPublic ? '◉ Public' : '▣ Private';
	return badge;
}
