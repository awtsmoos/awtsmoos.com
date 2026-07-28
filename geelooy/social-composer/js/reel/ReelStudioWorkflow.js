// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReelStudioWorkflow
 * @description
 * Studio loading and browser-native rendering remain separate from dialog state.
 * The Awtsmoos carries progress into the social surface while Awtsmoos.com keeps
 * the MitzvahWorld public API and resulting attachment truthful.
 */

import { renderAndAttachReel } from './ReelRenderBridge.js';
import {
	createReelStudioFrame,
	REEL_STUDIO_PATH,
	waitForReelStudio
} from './ReelStudioFrame.js';

export async function loadReelStudio(maker) {
	maker.view.choice.hidden = true;
	maker.view.studio.hidden = false;
	maker.view.back.hidden = false;
	maker.view.external.href = REEL_STUDIO_PATH;
	maker.view.status.textContent = 'Loading the real MitzvahWorld studio…';
	maker.view.render.disabled = true;
	maker.frame = createReelStudioFrame(maker.root);
	maker.view.frameHost.replaceChildren(maker.frame);
	try {
		maker.studioApi = await waitForReelStudio(maker.frame);
		maker.view.status.textContent = 'Studio ready. Edit, preview, then render.';
		maker.view.render.disabled = false;
	} catch (error) {
		maker.view.status.textContent = error.message;
		maker.status.show(error.message, 'error');
	}
}

export async function renderReelStudio(maker) {
	if (maker.busy) return;
	maker.setBusy(true);
	maker.view.status.textContent = 'Rendering locally in this browser…';
	try {
		const value = await renderAndAttachReel(
			maker.studioApi,
			maker.mediaActions,
			{ onProgress: progress => showRenderProgress(maker, progress) }
		);
		const size = (value.result.bytes / 1048576).toFixed(2);
		maker.finishAttachment(
			value.attachment,
			`MitzvahWorld reel attached · ${size} MiB.`
		);
	} catch (error) {
		maker.view.status.textContent = error.message;
		maker.status.show(error.message, 'error');
	} finally {
		maker.setBusy(false);
	}
}

function showRenderProgress(maker, progress = {}) {
	const percent = Math.max(0, Math.min(100, Number(progress.percent) || 0));
	maker.view.progress.value = percent;
	maker.view.status.textContent = `Rendering ${percent.toFixed(1)}%`;
}
