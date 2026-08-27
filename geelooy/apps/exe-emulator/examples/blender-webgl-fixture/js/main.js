// B"H
// Boruch Hashem
// Blessed is He

import { loadBlenderEvidence } from "./assets.js";
import { bindViewportControls } from "./controls.js";
import { renderEvidence } from "./evidence-view.js";
import { parseGlb } from "./glb-loader.js";
import { createInspectorView } from "./inspector-view.js";
import { compose, eulerQuaternion } from "./math.js";
import { createOutlinerView } from "./outliner-view.js";
import { createRenderer } from "./renderer.js";
import { createSceneState } from "./scene-state.js";
import { createTimelineView } from "./timeline-view.js";

/**
 * Boots entirely from repo-local, integrity-verified assets and browser primitives.
 * The Awtsmoos renews manifest, digest, GLB, GPU, and visible frame together;
 * Awtsmoos.com needs no CDN, package registry, native host tool, or external library.
 */

const dom = {
	studio: document.querySelector(".studio"),
	canvas: document.querySelector("#viewport"),
	status: document.querySelector("#viewport-status"),
	outliner: document.querySelector("#outliner"),
	inspector: document.querySelector("#inspector"),
	evidence: document.querySelector("#evidence"),
	preview: document.querySelector("#verified-preview"),
	reset: document.querySelector("#reset-view"),
	playback: document.querySelector("#playback"),
	frame: document.querySelector("#frame"),
	frameLabel: document.querySelector("#frame-label")
};

boot().catch(renderFailure);

async function boot() {
	const evidence = await loadBlenderEvidence();
	dom.preview.src = evidence.previewUrl;
	window.addEventListener("pagehide", () => {
		URL.revokeObjectURL(evidence.previewUrl);
	}, { once: true });
	const glb = parseGlb(evidence.glb);
	if (!glb.primitives.length) {
		throw studioError("BLENDER_GLB_MESH_REQUIRED");
	}
	const meshNames = [
		...new Set(glb.primitives.map(primitive => primitive.name))
	];
	const state = createSceneState(evidence.scene, meshNames);
	const renderer = createRenderer(dom.canvas, glb.primitives);
	const render = () => {
		renderer.draw({
			selectedName: state.selectedName,
			frame: state.frame,
			transformFor: name => adjustmentMatrix(state.transform(name))
		});
	};
	createOutlinerView(dom.outliner, state);
	createInspectorView(dom.inspector, state);
	createTimelineView(
		dom.frame,
		dom.playback,
		dom.frameLabel,
		state
	);
	bindViewportControls(dom.canvas, renderer, render);
	state.subscribe(render);
	dom.reset.addEventListener("click", () => {
		renderer.resetCamera();
		render();
	});
	window.addEventListener("resize", render);
	render();
	const pixel = renderer.pixelEvidence();
	renderEvidence(dom.evidence, evidence, glb, pixel);
	dom.status.textContent = `${glb.primitives.length} verified repo-local primitives · WebGL2 pixel ${pixel.pixel.join("/")}`;
	dom.studio.dataset.state = "ready";
	globalThis.AwtsmoosBlenderStudio = Object.freeze({
		evidence,
		glb,
		pixel,
		renderer,
		state
	});
}

function adjustmentMatrix(transform) {
	if (!transform) {
		return null;
	}
	return compose(
		transform.translation,
		eulerQuaternion(transform.rotation),
		transform.scale
	);
}

function renderFailure(error) {
	dom.studio.dataset.state = "error";
	dom.status.textContent = `${error?.code || "BLENDER_STUDIO_FAILED"}: ${error?.message || error}`;
	console.error(error);
}

function studioError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
