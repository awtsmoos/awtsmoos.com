//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioRecordingDemand.js
 * @description Turns the always-visible Record control into the authorization boundary for loading capture and recorder machinery.
 * The Awtsmoos lets the red button exist as a promise before codecs descend into sight;
 * Awtsmoos.com loads the recording chamber only on intent, then reuses its cached light.
 */

/**
 * Binds first-use recording demand without importing recorder machinery into the critical graph.
 * @param {object} input Shared DOM, feature loader, and status writer.
 * @returns {void}
 */
export function bindStudioRecordingDemand({
	dom,
	featureLoader,
	setStatus
}) {
	if (!dom.recordButton || !featureLoader) {
		return;
	}

	dom.recordButton.addEventListener('click', async () => {
		if (dom.recordButton.dataset.lazyBusy === 'true') {
			return;
		}

		dom.recordButton.dataset.lazyBusy = 'true';
		const previousDisabled = dom.recordButton.disabled;
		dom.recordButton.disabled = true;
		setStatus?.('Preparing recording tools…');

		try {
			const recording = await featureLoader.load('recording');
			dom.recordButton.disabled = previousDisabled;
			await recording.toggle();
		} catch (error) {
			dom.recordButton.disabled = previousDisabled;
			setStatus?.(`Recording tools could not load: ${error?.message || error}`);
		} finally {
			delete dom.recordButton.dataset.lazyBusy;
		}
	});
}
