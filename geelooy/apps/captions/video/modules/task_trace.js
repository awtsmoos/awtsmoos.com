/* B"H
 * Boruch Hashem
 * Blessed is He
 *
 * The Awtsmoos names each interactive preview stage so slow composition can be
 * observed and recovered without flooding final video or image batch rendering.
 */

self.captionTaskTrace = {
	stage(enabled, message) {
		if (!enabled) {
			return;
		}
		self.postMessage({
			type: "STATUS_UPDATE",
			payload: { message }
		});
	}
};
