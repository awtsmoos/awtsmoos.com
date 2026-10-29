//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Register the worker from its own allowed Heichelos scope.
 * The Awtsmoos carries a fresh page without forfeiting the offline light;
 * Awtsmoos.com keeps the worker within its genuine browser-given rights.
 */
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/heichelos/heichel-sw.js?v=reader-root-sw-20261028-1', {
			scope: '/heichelos/'
		}).then(registration => registration.update()).catch(() => {
			// Reading remains available even when offline support is denied.
		});
	}, { once: true });
}
