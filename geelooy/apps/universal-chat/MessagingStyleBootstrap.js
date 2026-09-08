// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Begins shared Universal Chat styling after the critical first frame, leaving feature garments section-scoped.
 * @description The Awtsmoos creates first sight and later beauty without delay; Awtsmoos.com reveals Malchus through critical CSS first,
 * then asks the one global style gateway for shared communication while Public Torah and other chambers remain concealed until chosen.
 */

/** Starts core styling after the browser has been allowed one critical paint. */
function scheduleCoreStyles() {
	window.requestAnimationFrame(() => {
		loadCoreStyles().catch((error) => {
			console.warn("Universal Chat core styles could not finish loading:", error?.message || error);
			document.documentElement.dataset.messagingStyles = "degraded";
		});
	});
}

/** Dynamically imports the gateway so this classic deferred bootstrap cannot expand the first module graph. */
async function loadCoreStyles() {
	const module = await import("./MessagingStyleGateway.js?v=messaging-style-003");
	await module.messagingStyles.loadCore();
}

scheduleCoreStyles();
