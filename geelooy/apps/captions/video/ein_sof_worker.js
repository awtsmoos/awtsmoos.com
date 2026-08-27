/* B"H
 * Boruch Hashem
 * Blessed is He
 *
 * The Awtsmoos loads the lightweight renderer once, then waits for an explicit
 * handshake so readiness can never race ahead of the page's message listener.
 */

const workerVersion = "caption-studio-010";
let bootError = null;

function loadModule(path) {
	try {
		importScripts(`${path}?v=${workerVersion}`);
	} catch (error) {
		throw new Error(`Load failed [${path}]: ${error.message}`);
	}
}

try {
	loadModule("modules/polyfills.js");
	loadModule("modules/utils.js");
	loadModule("modules/renderer_core.js");
	loadModule("modules/bg_deepspace.js");
	loadModule("modules/bg_nebula.js");
	loadModule("modules/bg_portals.js");
	loadModule("modules/bg_orchestrator.js");
	loadModule("modules/renderer_particles.js");
	loadModule("modules/renderer_components.js");
	loadModule("modules/text_layout.js");
	loadModule("modules/text_caption_box.js");
	loadModule("modules/renderer_text.js");
	loadModule("modules/fx_analog.js");
	loadModule("modules/fx_optics.js");
	loadModule("modules/fx_artistic.js");
	loadModule("modules/fx_orchestrator.js");
	loadModule("modules/task_trace.js");
	loadModule("modules/task_scene.js");
	loadModule("modules/task_frame.js");
	loadModule("modules/video_encoder_loader.js");
	loadModule("modules/task_video_sources.js");
	loadModule("modules/task_video.js");
	loadModule("modules/task_images.js");
	loadModule("modules/tasks.js");
} catch (error) {
	bootError = error;
}

self.onmessage = async event => {
	try {
		const { type, payload } = event.data;
		if (type === "INITIALIZE") {
			reportInitialization();
			return;
		}
		if (bootError) throw bootError;
		if (!self.taskHandlers) throw new Error("Worker not initialized");
		if (type === "START_RENDER") {
			await self.taskHandlers.handleRender(payload);
			return;
		}
		if (type === "GENERATE_PREVIEW") {
			await self.taskHandlers.handlePreview(payload);
		}
	} catch (error) {
		self.postMessage({
			type: "FATAL_ERROR",
			payload: { message: error.message }
		});
	}
};

function reportInitialization() {
	if (bootError) {
		self.postMessage({
			type: "FATAL_ERROR",
			payload: { message: bootError.message }
		});
		return;
	}
	self.postMessage({
		type: "WORKER_READY",
		payload: { version: workerVersion }
	});
}
