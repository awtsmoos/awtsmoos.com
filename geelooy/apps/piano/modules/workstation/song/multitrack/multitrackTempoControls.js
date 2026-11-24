//B"H
/** The Awtsmoos quickens and rests the pulse of a song — a tempo map the hand can edit. */
import { normalizeTempoMap, upsertTempoPoint, removeTempoPoint, replaceTempoPoint } from './multitrackTempoMap.js';

/**
 * Tempo-map editor bound to the shared studio state. Every add, edit and
 * delete goes through state.setProject — exactly one history step each —
 * and the beat-0 anchor's bpm also drives project.tempo.
 */
export function bindTempoControls(state) {
	const panel = document.createElement('details');
	panel.className = 'multitrack-tempo';
	const summary = document.createElement('summary');
	summary.textContent = '𝄩 Tempo map';
	const body = document.createElement('div');
	body.className = 'multitrack-tempo-body';
	panel.append(summary, body);
	const list = document.createElement('div');
	list.className = 'multitrack-tempo-list';
	const beat = numberEl('New point beat', 'multitrack-tempo-new-beat', 8, 0, 1);
	const bpm = numberEl('New point bpm', 'multitrack-tempo-new-bpm', 90, 20, 1);
	const bars = numberEl('New point beats per bar', 'multitrack-tempo-new-bars', 4, 1, 1);
	const add = document.createElement('button');
	add.type = 'button'; add.className = 'multitrack-tool multitrack-tempo-add'; add.textContent = '＋ Tempo point';
	add.addEventListener('click', () => {
		apply(upsertTempoPoint(state.project.tempoMap, { beat: beat.value, bpm: bpm.value, beatsPerBar: bars.value }));
		state.setStatus(`Tempo point at beat ${Number(beat.value)} · ${Number(bpm.value)} bpm.`);
	});
	body.append(list, beat, bpm, bars, add);
	function apply(points) {
		const map = normalizeTempoMap(points);
		state.setProject({ ...state.project, tempoMap: map, tempo: map[0].bpm });
	}
	function render() {
		list.replaceChildren();
		for (const point of normalizeTempoMap(state.project.tempoMap, state.project.tempo))
			list.appendChild(row(point));
	}
	function row(point) {
		const wrap = document.createElement('span');
		wrap.className = 'multitrack-tempo-row';
		wrap.dataset.beat = String(point.beat);
		const beatInput = numberEl(`Beat of tempo point ${point.beat}`, 'multitrack-tempo-beat', point.beat, 0, 1);
		const bpmInput = numberEl(`Bpm at beat ${point.beat}`, 'multitrack-tempo-bpm', point.bpm, 20, 1);
		const barsInput = numberEl(`Beats per bar at beat ${point.beat}`, 'multitrack-tempo-bars', point.beatsPerBar, 1, 1);
		if (point.beat === 0) beatInput.disabled = true;
		const edit = () => apply(replaceTempoPoint(state.project.tempoMap, point.beat,
			{ beat: beatInput.value, bpm: bpmInput.value, beatsPerBar: barsInput.value }));
		beatInput.addEventListener('change', edit);
		bpmInput.addEventListener('change', edit);
		barsInput.addEventListener('change', edit);
		wrap.append(beatInput, bpmInput, barsInput);
		if (point.beat !== 0) {
			const del = document.createElement('button');
			del.type = 'button'; del.className = 'multitrack-tool multitrack-tempo-delete'; del.textContent = '✕';
			del.setAttribute('aria-label', `Delete tempo point at beat ${point.beat}`);
			del.addEventListener('click', () => {
				apply(removeTempoPoint(state.project.tempoMap, point.beat));
				state.setStatus(`Tempo point at beat ${point.beat} removed.`);
			});
			wrap.appendChild(del);
		}
		return wrap;
	}
	state.subscribe(render);
	render();
	return panel;
}

function numberEl(label, className, value, min, step) {
	const element = document.createElement('input');
	element.type = 'number'; element.className = `multitrack-tool ${className}`;
	element.value = String(value); element.min = String(min); element.step = String(step);
	element.setAttribute('aria-label', label);
	return element;
}
