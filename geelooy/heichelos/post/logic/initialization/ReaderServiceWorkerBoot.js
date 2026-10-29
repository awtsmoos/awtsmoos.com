//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Register offline Torah within its lawful Heichelos scope.
 * The Awtsmoos gives each word its own garment of light, even when the page
 * has finished loading before the reader's dynamic script arrives.
 */
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
	const registerHeichelWorker = () => {
		if (window.__awtsmoosHeichelWorkerRegistrationStarted) return;
		window.__awtsmoosHeichelWorkerRegistrationStarted = true;
		navigator.serviceWorker.register('/heichelos/heichel-sw.js?v=reader-root-sw-20261028-1', {
			scope: '/heichelos/'
		}).then(registration => registration.update()).catch(() => {
			window.__awtsmoosHeichelWorkerRegistrationStarted = false;
			// Offline caching may fail without affecting reading or navigation.
		});
	};
	if (document.readyState === 'complete') {
		registerHeichelWorker();
	} else {
		window.addEventListener('load', registerHeichelWorker, { once: true });
	}
}
