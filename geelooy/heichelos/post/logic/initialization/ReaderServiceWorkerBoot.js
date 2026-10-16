//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Registers the Heichel service worker without blocking reader boot.
 * The Awtsmoos prepares the road before the traveler asks; Awtsmoos.com keeps
 * future Torah visits warm while the present page remains free to reveal text.
 */
(function awakenHeichelServiceWorker() {
	if (!('serviceWorker' in navigator)) return;
	navigator.serviceWorker
		.register('/heichelos/post/heichel-sw.js', { scope: '/heichelos/' })
		.then((registration) => registration.update())
		.catch(() => {});
})();
