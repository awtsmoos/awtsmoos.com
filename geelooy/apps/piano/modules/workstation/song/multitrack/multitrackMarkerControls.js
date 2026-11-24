//B"H
/** The Awtsmoos names the landmarks of a song so the hand can return to them. */
import { addMarker, addSection, removeMarker, removeSection } from './multitrackMarkers.js';

/** Marker/section controls plus the timeline lane that renders them. */
export function bindMarkerControls(state, onSeek) {
	const panel = document.createElement('div');
	panel.className = 'multitrack-markers';
	const name = document.createElement('input');
	name.type = 'text'; name.placeholder = 'Marker / section name'; name.maxLength = 48;
	name.setAttribute('aria-label', 'Marker or section name');
	const addMark = document.createElement('button');
	addMark.type = 'button'; addMark.className = 'multitrack-tool'; addMark.textContent = '＋ Marker at playhead';
	addMark.addEventListener('click', () => {
		const { project, marker } = addMarker(state.project, { name: name.value || 'Marker', time: state.selection.playheadSeconds });
		state.setProject(project);
		state.setStatus(`Marker “${marker.name}” at ${marker.time.toFixed(2)}s.`);
	});
	const addSect = document.createElement('button');
	addSect.type = 'button'; addSect.className = 'multitrack-tool'; addSect.textContent = '＋ Section (4s)';
	addSect.addEventListener('click', () => {
		const start = state.selection.playheadSeconds;
		const { project, section } = addSection(state.project, { name: name.value || 'Section', start, end: start + 4 });
		state.setProject(project);
		state.setStatus(`Section “${section.name}” ${section.start.toFixed(1)}–${section.end.toFixed(1)}s.`);
	});
	const list = document.createElement('div');
	list.className = 'multitrack-marker-list';
	panel.append(name, addMark, addSect, list);
	function render() {
		list.replaceChildren();
		for (const marker of state.project.markers || []) list.appendChild(chip(
			`⚑ ${marker.name} · ${marker.time.toFixed(1)}s`,
			() => onSeek?.(marker.time),
			() => state.setProject(removeMarker(state.project, marker.id))));
		for (const section of state.project.sections || []) list.appendChild(chip(
			`▦ ${section.name} · ${section.start.toFixed(1)}–${section.end.toFixed(1)}s`,
			() => onSeek?.(section.start),
			() => state.setProject(removeSection(state.project, section.id))));
	}
	state.subscribe(render);
	render();
	return panel;
}

function chip(label, onSeek, onDelete) {
	const wrap = document.createElement('span');
	wrap.className = 'multitrack-marker-chip';
	const seek = document.createElement('button');
	seek.type = 'button'; seek.className = 'multitrack-tool'; seek.textContent = label;
	seek.addEventListener('click', onSeek);
	const del = document.createElement('button');
	del.type = 'button'; del.className = 'multitrack-tool'; del.textContent = '✕';
	del.setAttribute('aria-label', `Delete ${label}`);
	del.addEventListener('click', onDelete);
	wrap.append(seek, del);
	return wrap;
}

/** Draws markers and section bands into a lane positioned by the timeline scale. */
export function renderMarkerLane(lane, project, scale) {
	if (!lane) return;
	lane.replaceChildren();
	for (const section of project.sections || []) {
		const band = document.createElement('div');
		band.className = 'multitrack-section-band';
		band.style.left = `calc(var(--multitrack-header-width) + ${section.start * scale}px)`;
		band.style.width = `${(section.end - section.start) * scale}px`;
		band.textContent = section.name;
		lane.appendChild(band);
	}
	for (const marker of project.markers || []) {
		const flag = document.createElement('div');
		flag.className = 'multitrack-marker-flag';
		flag.style.left = `calc(var(--multitrack-header-width) + ${marker.time * scale}px)`;
		flag.textContent = `⚑ ${marker.name}`;
		lane.appendChild(flag);
	}
}
