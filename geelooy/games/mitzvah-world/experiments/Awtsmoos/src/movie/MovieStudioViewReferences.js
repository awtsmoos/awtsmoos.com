// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioViewReferences.js
 * @description Collects semantic DOM references for transport, projects, cameras, 3D, utilities, and responsive surfaces.
 * The Awtsmoos renews every visible vessel beyond selector and node; Awtsmoos.com gives
 * controllers one truthful map so runtime deeds, mobile sheets, and desktop drawers never drift.
 */

import { collectMovieStudioTransportView } from './MovieStudioTransportView.js';

export function collectMovieStudioViewReferences(root) {
	return {
		...collectMovieStudioTransportView(root),
		actionBrowserCategory: root.querySelector('[data-action-browser-category]'),
		actionBrowserCount: root.querySelector('[data-action-browser-count]'),
		actionBrowserList: root.querySelector('[data-action-browser-list]'),
		actionBrowserPreview: root.querySelector('[data-action-browser-preview]'),
		actionBrowserSearch: root.querySelector('[data-action-browser-search]'),
		actionBrowserStatus: root.querySelector('[data-action-browser-status]'),
		apply: root.querySelector('[data-apply-json]'),
		authoring3dAction: root.querySelector('[data-authoring3d-action]'),
		authoring3dAddGeometry: root.querySelector('[data-authoring3d-add-geometry]'),
		authoring3dAddModifier: root.querySelector('[data-authoring3d-add-modifier]'),
		authoring3dAddResource: root.querySelector('[data-authoring3d-add-resource]'),
		authoring3dAddShader: root.querySelector('[data-authoring3d-add-shader]'),
		authoring3dApply: root.querySelector('[data-authoring3d-apply]'),
		authoring3dBrush: root.querySelector('[data-authoring3d-brush]'),
		authoring3dGeometryType: root.querySelector('[data-authoring3d-geometry-type]'),
		authoring3dJson: root.querySelector('[data-authoring3d-json]'),
		authoring3dKeyframe: root.querySelector('[data-authoring3d-keyframe]'),
		authoring3dModel: root.querySelector('[data-authoring3d-model]'),
		authoring3dModifierType: root.querySelector('[data-authoring3d-modifier-type]'),
		authoring3dMotionMode: root.querySelector('[data-authoring3d-motion-mode]'),
		authoring3dRecord: root.querySelector('[data-authoring3d-record]'),
		authoring3dResourceType: root.querySelector('[data-authoring3d-resource-type]'),
		authoring3dShaderType: root.querySelector('[data-authoring3d-shader-type]'),
		authoring3dStatus: root.querySelector('[data-authoring3d-status]'),
		authoring3dValidate: root.querySelector('[data-authoring3d-validate]'),
		cameraActionName: root.querySelector('[data-camera-action-name]'),
		cameraActionStatus: root.querySelector('[data-camera-action-status]'),
		cameraActionTarget: root.querySelector('[data-camera-action-target]'),
		cameraAddAction: root.querySelector('[data-camera-add-action]'),
		cameraAddShot: root.querySelector('[data-camera-add-shot]'),
		cameraCapturePose: root.querySelector('[data-camera-capture-pose]'),
		cameraShotDuration: root.querySelector('[data-camera-shot-duration]'),
		cameraShotFov: root.querySelector('[data-camera-shot-fov]'),
		cameraShotStyle: root.querySelector('[data-camera-shot-style]'),
		cameraShotTarget: root.querySelector('[data-camera-shot-target]'),
		commandCount: root.querySelector('[data-command-count]'),
		commandList: root.querySelector('[data-command-list]'),
		commandSearch: root.querySelector('[data-command-search]'),
		copy: root.querySelector('[data-copy-url]'),
		density: root.querySelector('[data-density]'),
		diagnosticsOutput: root.querySelector('[data-diagnostics-output]'),
		inspector: root.querySelector('[data-inspector]'),
		inspectorClose: root.querySelector('[data-inspector-close]'),
		inspectorToggle: root.querySelector('[data-inspector-toggle]'),
		json: root.querySelector('[data-project-json]'),
		newEmptyProject: root.querySelector('[data-new-empty-project]'),
		overlayInputs: [...root.querySelectorAll('[data-overlay-toggle]')],
		preview: root.querySelector('[data-preview]'),
		previewBadge: root.querySelector('[data-preview-badge]'),
		previewFrame: root.querySelector('[data-preview-frame]'),
		previewZoom: root.querySelector('[data-preview-zoom]'),
		render: root.querySelector('[data-render]'),
		renderExact: root.querySelector('[data-render-exact]'),
		renderJobsList: root.querySelector('[data-render-jobs-list]'),
		resetPreferences: root.querySelector('[data-reset-preferences]'),
		root,
		status: root.querySelector('[data-status]'),
		statusBar: root.querySelector('[data-status-bar]'),
		statusFields: collectMovieStatusFields(root),
		theme: root.querySelector('[data-theme]'),
		timeline: root.querySelector('[data-timeline]'),
		title: root.querySelector('[data-title]'),
		transform: root.querySelector('[data-transform]'),
		utilityBackdrop: root.querySelector('[data-utility-backdrop]'),
		utilityCloseButtons: [...root.querySelectorAll('[data-utility-close]')],
		utilityPanels: collectNamedElements(root, '[data-utility-panel]'),
		utilityToggles: collectNamedElements(root, '[data-utility-toggle]'),
		workspace: root.querySelector('[data-workspace]')
	};
}

function collectMovieStatusFields(root) {
	return {
		autosave: root.querySelector('[data-status-autosave]'),
		instance: root.querySelector('[data-status-instance]'),
		render: root.querySelector('[data-status-render]'),
		revision: root.querySelector('[data-status-revision]'),
		selection: root.querySelector('[data-status-selection]'),
		snapping: root.querySelector('[data-status-snapping]')
	};
}

function collectNamedElements(root, selector) {
	const output = {};
	for (const element of root.querySelectorAll(selector)) {
		const name = element.dataset.utilityPanel || element.dataset.utilityToggle;
		if (name) output[name] = element;
	}
	return output;
}
