// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleInspectorFields
 * @description
 * Project and clip controls remain semantic labeled fields rather than raw JSON,
 * while the Awtsmoos.com editor exposes only bounded meaningful values.
 */

export function projectInspectorMarkup(project) {
	return /*html*/`
		<header class="nle-panel-heading"><div><small>Movie settings</small><h2>Project</h2></div></header>
		<label><span>Title</span><input data-project-field="title" value="${escapeAttribute(project.title)}"></label>
		<div class="nle-field-pair">
			<label><span>Duration</span><input type="number" min="0.1" max="900" step="0.1" data-project-field="duration" value="${project.duration}"></label>
			<label><span>FPS</span><input type="number" min="1" max="60" step="1" data-project-field="fps" value="${project.fps}"></label>
		</div>
		<label><span>Aspect preset</span><select data-nle-aspect><option value="1280x720">Landscape 16:9</option><option value="720x1280">Reel 9:16</option><option value="1080x1080">Square 1:1</option><option value="1080x1350">Portrait 4:5</option></select></label>
		<div class="nle-field-pair">
			<label><span>Width</span><input type="number" min="160" max="1920" data-resolution-field="width" value="${project.resolution.width}"></label>
			<label><span>Height</span><input type="number" min="90" max="1920" data-resolution-field="height" value="${project.resolution.height}"></label>
		</div>
		<section class="nle-inspector-note"><strong>Same movie document</strong><p>Original scene, actor, camera, dialogue, door, and audio tracks remain preserved beside social NLE tracks.</p></section>
	`;
}

export function clipInspectorMarkup(track, clip) {
	return /*html*/`
		<header class="nle-panel-heading"><div><small>${escapeHtml(track.type)}</small><h2>${escapeHtml(clip.label || clip.id)}</h2></div></header>
		<label><span>Label</span><input data-clip-field="label" value="${escapeAttribute(clip.label || '')}"></label>
		<div class="nle-field-pair">
			<label><span>Start</span><input type="number" min="0" step="0.001" data-clip-field="start" value="${clip.start}"></label>
			<label><span>Duration</span><input type="number" min="0.001" step="0.001" data-clip-field="duration" value="${clip.duration}"></label>
		</div>
		<dl class="nle-clip-receipt"><div><dt>Track</dt><dd>${escapeHtml(track.id)}</dd></div><div><dt>Clip ID</dt><dd>${escapeHtml(clip.id)}</dd></div>${clip.assetId ? `<div><dt>Asset</dt><dd>${escapeHtml(clip.assetId)}</dd></div>` : ''}</dl>
	`;
}

function escapeAttribute(value) {
	return escapeHtml(value).replace(/"/g, '&quot;');
}

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character]);
}
