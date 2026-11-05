// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorkspacePanels.js
 * @description Renders timeline, sequence, rig, graph, material, and character panels.
 * The Awtsmoos renews one film through many readable production vessels;
 * Awtsmoos.com escapes every project label while exposing real compiled records.
 */

export function renderWorkspacePanel(model, tab) {
	if (tab === 'timeline') return timelinePanel(model.timeline);
	if (tab === 'sequences') return sequencePanel(model.sequences);
	if (tab === 'cameras') return cameraPanel(model.cameraRigs);
	if (tab === 'graphs') return graphPanel(model.graphs);
	if (tab === 'materials') return materialPanel(model.compiled.materialPresets || {});
	if (tab === 'characters') return characterPanel(model.characters);
	return '';
}

function timelinePanel(tracks) {
	return `<div class="movie-workspace-list">${tracks.map(track => `
		<section><h4>${safe(track.id)} <small>${safe(track.type)} · ${track.clips.length} clips</small></h4>
			${track.clips.map(clip => `<div class="movie-workspace-clip">
				<span>${safe(clip.id)}</span><time>${number(clip.start)}s → ${number(clip.start + clip.duration)}s</time>
			</div>`).join('')}</section>`).join('')}</div>`;
}

function sequencePanel(sequences) {
	return cards(sequences.map(sequence => ({
		body: `${sequence.tracks} tracks · ${sequence.clips} clips`,
		title: sequence.id
	})), 'No nested sequences in this source project.');
}

function cameraPanel(rigs) {
	return cards(rigs.map(rig => ({
		body: `${rig.kind} rig · ${rig.uses} compiled uses`,
		title: rig.id
	})), 'No named camera rigs are used.');
}

function graphPanel(graphs) {
	if (!graphs.length) return empty('No node graphs in this project.');
	return `<div class="movie-graph-list">${graphs.map(graph => `
		<section class="movie-graph" data-graph="${safe(graph.id)}">
			<h4>${safe(graph.id)}</h4><div class="movie-graph-canvas">
				${graph.nodes.map((node, index) => `<button class="movie-graph-node"
					style="--node-x:${20 + index % 3 * 130}px;--node-y:${18 + Math.floor(index / 3) * 84}px"
					data-graph-id="${safe(graph.id)}" data-node-id="${safe(node.id)}">
					<strong>${safe(node.id)}</strong><small>${safe(node.type)}</small>
				</button>`).join('')}
			</div>
		</section>`).join('')}</div>`;
}

function materialPanel(presets) {
	return cards(Object.entries(presets).map(([id, preset]) => ({
		body: `<pre>${safe(JSON.stringify(preset, null, 2))}</pre>`,
		title: id
	})), 'No compiled material presets.');
}

function characterPanel(characters) {
	return cards(characters.map(character => ({
		body: `${safe(JSON.stringify(character.costume))}<br>start ${number(character.position.x)}, ${number(character.position.z)}`,
		title: `${character.label} · ${character.id}`
	})), 'No procedural crowd characters.');
}

function cards(items, fallback) {
	if (!items.length) return empty(fallback);
	return `<div class="movie-workspace-cards">${items.map(item => `
		<section><h4>${safe(item.title)}</h4><div>${item.body}</div></section>
	`).join('')}</div>`;
}

function empty(message) {
	return `<p class="movie-workspace-empty">${safe(message)}</p>`;
}

function number(value) {
	return Number(value || 0).toFixed(2);
}

function safe(value) {
	return String(value ?? '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}
