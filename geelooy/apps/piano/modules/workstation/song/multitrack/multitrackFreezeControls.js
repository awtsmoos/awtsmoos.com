//B"H
/** The Awtsmoos gives every track a rest and a return: freeze, unfreeze, and shared bus sends. */
import { renderTrackFreeze } from './multitrackFreezeRender.js';
import { unfreezeTrack, isTrackFrozen } from './multitrackFreeze.js';
import { createMultitrackBus, createMultitrackSend, validateBusGraph } from './multitrackBus.js';
import { multitrackAudioStore } from './multitrackAudioStore.js';

/** Freeze/bus panel bound to the shared studio state; edits go through setProject (one history step per action). */
export function bindFreezeBusControls(state, audioStore = multitrackAudioStore) {
	const panel = document.createElement('details');
	panel.className = 'multitrack-freeze-bus';
	const summary = document.createElement('summary');
	summary.textContent = '❄ Freeze · Buses & sends';
	const body = document.createElement('div');
	body.className = 'multitrack-freeze-bus-body';
	panel.append(summary, body);
	const trackSelect = selectEl('Freeze track');
	const freezeButton = buttonEl('Freeze track', async () => {
		const track = current(); if (!track) return;
		try {
			const frozen = await renderTrackFreeze(state.project, track.id, audioStore);
			replace(frozen);
			state.setStatus(`Froze “${track.name}” — original recipe kept for unfreeze.`);
		} catch (error) { state.setStatus(error.message || 'Freeze failed.'); }
	});
	const unfreezeButton = buttonEl('Unfreeze', () => {
		const track = current(); if (!track) return;
		replace(unfreezeTrack(track));
		state.setStatus(`Unfroze “${track.name}” — original clips, MIDI and effects restored.`);
	});
	const busName = document.createElement('input');
	busName.type = 'text'; busName.placeholder = 'New bus name'; busName.setAttribute('aria-label', 'New bus name');
	const addBus = buttonEl('＋ Bus', () => {
		const bus = createMultitrackBus({ name: busName.value || 'Bus' });
		state.setProject({ ...state.project, buses: [...(state.project.buses || []), bus] });
		state.setStatus(`Added bus “${bus.name}”.`);
	});
	const busSelect = selectEl('Send destination bus');
	const sendGain = document.createElement('input');
	sendGain.type = 'range'; sendGain.min = '0'; sendGain.max = '1'; sendGain.step = '0.05'; sendGain.value = '0.5';
	sendGain.setAttribute('aria-label', 'Send gain');
	const addSend = buttonEl('Add send from track', () => {
		const track = current(); if (!track || !busSelect.value) return;
		const sends = [...(track.sends || []).filter(s => s.busId !== busSelect.value),
			createMultitrackSend({ busId: busSelect.value, gain: Number(sendGain.value) })];
		const next = { ...state.project, tracks: state.project.tracks.map(t => t.id === track.id ? { ...t, sends } : t) };
		const graph = validateBusGraph(next);
		if (!graph.ok) { state.setStatus(graph.errors.join('; ')); return; }
		state.setProject(next);
		state.setStatus(`Send added on “${track.name}”.`);
	});
	const busHighpass = document.createElement('input');
	busHighpass.type = 'range'; busHighpass.min = '0'; busHighpass.max = '2000'; busHighpass.step = '10'; busHighpass.value = '0';
	busHighpass.setAttribute('aria-label', 'Bus highpass frequency');
	const busEnabled = document.createElement('input');
	busEnabled.type = 'checkbox'; busEnabled.checked = true; busEnabled.setAttribute('aria-label', 'Bus effects enabled');
	const applyBusFx = buttonEl('Apply bus insert', () => {
		const bus = (state.project.buses || []).find(b => b.id === busSelect.value); if (!bus) return;
		const buses = state.project.buses.map(b => b.id === bus.id
			? createMultitrackBus({ ...b, enabled: busEnabled.checked, effects: { ...b.effects, highpass: Number(busHighpass.value) } }) : b);
		state.setProject({ ...state.project, buses });
		state.setStatus(`Bus “${bus.name}” insert ${busEnabled.checked ? 'on' : 'bypassed'} · highpass ${busHighpass.value} Hz.`);
	});
	body.append(trackSelect, freezeButton, unfreezeButton, busName, addBus, busSelect, sendGain, addSend, busHighpass, busEnabled, applyBusFx);
	let uiTrackId = null;
	function current() { return state.project.tracks.find(t => t.id === uiTrackId) || state.project.tracks[0] || null; }
	function replace(next) { state.setProject({ ...state.project, tracks: state.project.tracks.map(t => t.id === next.id ? next : t) }); }
	function render() {
		const track = current(); if (track) uiTrackId = track.id;
		trackSelect.replaceChildren();
		for (const candidate of state.project.tracks) {
			const option = document.createElement('option');
			option.value = candidate.id;
			option.textContent = candidate.name + (isTrackFrozen(candidate) ? ' (frozen)' : '');
			option.selected = candidate.id === uiTrackId;
			trackSelect.appendChild(option);
		}
		busSelect.replaceChildren();
		for (const bus of state.project.buses || []) {
			const option = document.createElement('option');
			option.value = bus.id; option.textContent = bus.name; busSelect.appendChild(option);
		}
		freezeButton.disabled = !track || isTrackFrozen(track);
		unfreezeButton.disabled = !track || !isTrackFrozen(track);
		addSend.disabled = !track || !(state.project.buses || []).length;
		applyBusFx.disabled = !(state.project.buses || []).length;
		const selectedBus = (state.project.buses || []).find(b => b.id === busSelect.value);
		if (selectedBus) { busHighpass.value = String(selectedBus.effects?.highpass || 0); busEnabled.checked = selectedBus.enabled !== false; }
	}
	trackSelect.addEventListener('change', () => { uiTrackId = trackSelect.value; render(); });
	busSelect.addEventListener('change', render);
	state.subscribe(render);
	render();
	return panel;
}
function selectEl(label) {
	const element = document.createElement('select');
	element.className = 'multitrack-tool'; element.setAttribute('aria-label', label);
	return element;
}
function buttonEl(text, action) {
	const element = document.createElement('button');
	element.type = 'button'; element.className = 'multitrack-tool'; element.textContent = text;
	element.addEventListener('click', action);
	return element;
}
