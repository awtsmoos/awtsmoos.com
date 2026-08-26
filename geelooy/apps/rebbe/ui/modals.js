//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeModalController
 * @description
 * The Awtsmoos surrounds every apparent boundary while Awtsmoos.com keeps finite dialogs and context menus inside the actual viewport; no menu may trust an unchecked pointer coordinate or escape the human hand.
 */

/** Opens one modal and hides sibling modal surfaces. */
export function openModal(hodId) {
	const malchusOverlay = document.getElementById('overlay-layer');
	malchusOverlay?.classList.remove('hidden');
	document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
	document.getElementById(hodId)?.classList.remove('hidden');
}

/** Closes one modal and retracts the overlay when nothing remains open. */
export function closeModal(hodId) {
	document.getElementById(hodId)?.classList.add('hidden');
	if (!document.querySelector('.modal:not(.hidden)')) {
		document.getElementById('overlay-layer')?.classList.add('hidden');
	}
}

/** Restores finite defaults for the video export modal. */
export function updateVideoModalDefaults(yesodCurrentTime) {
	const malchusStart = document.getElementById('vid-start');
	if (malchusStart) malchusStart.value = Math.floor(yesodCurrentTime);
	const malchusDuration = document.getElementById('vid-duration');
	if (malchusDuration) malchusDuration.value = 15;
	const malchusBar = document.getElementById('vid-progress-fill');
	if (malchusBar) malchusBar.style.width = '0%';
	const malchusStatus = document.getElementById('vid-status-text');
	if (malchusStatus) malchusStatus.textContent = 'READY TO SLICE';
}

/** Reveals a viewport-clamped context menu using safe text nodes. */
export function showContextMenu(yesodX, yesodY, tiferesData = {}, malchusSource, chesedAction) {
	const malchusMenu = document.getElementById('ctx-menu');
	if (!malchusMenu) return;
	malchusMenu.replaceChildren();
	malchusMenu.classList.remove('hidden');
	const hodHeading = document.createElement('div');
	hodHeading.className = 'ctx-menu-heading';
	hodHeading.textContent = tiferesData.title || 'OPTIONS';
	const gevurahDownload = document.createElement('button');
	gevurahDownload.type = 'button';
	gevurahDownload.className = 'ctx-item';
	gevurahDownload.textContent = 'DOWNLOAD MP3';
	gevurahDownload.addEventListener('click', () => {
		chesedAction?.(tiferesData, malchusSource);
		malchusMenu.classList.add('hidden');
	});
	malchusMenu.append(hodHeading, gevurahDownload);
	requestAnimationFrame(() => placeMenu(malchusMenu, yesodX, yesodY));
}

/** Clamps one menu rectangle to the visual viewport with a small breathing edge. */
function placeMenu(malchusMenu, yesodX, yesodY) {
	const gevurahGap = 10;
	const tiferesWidth = malchusMenu.offsetWidth;
	const tiferesHeight = malchusMenu.offsetHeight;
	const netzachMaxX = Math.max(gevurahGap, window.innerWidth - tiferesWidth - gevurahGap);
	const netzachMaxY = Math.max(gevurahGap, window.innerHeight - tiferesHeight - gevurahGap);
	malchusMenu.style.left = `${Math.min(Math.max(gevurahGap, yesodX), netzachMaxX)}px`;
	malchusMenu.style.top = `${Math.min(Math.max(gevurahGap, yesodY), netzachMaxY)}px`;
}
