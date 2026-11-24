//B"H
/** The Awtsmoos guards the singer from the howl of the room while the song plays on. */
import {
	MIC_OUTPUT_MODE_KEY,
	canEnableMonitor,
	normalizeOutputMode
} from './multitrackMicSafety.js';
import { MultitrackMicTake } from './multitrackMicRecord.js';

const DUCK_KEY = 'awtsmoos.micDuckDb';

/**
 * Simultaneous voice recording for the Studio: arm a track, press
 * Record, and sing over the playing arrangement. Monitoring is off by
 * default, impossible on speakers, and cut by the feedback guard.
 */
export function bindMicControls(state) {
	const panel = document.createElement('details');
	panel.className = 'multitrack-mic';
	const summary = document.createElement('summary');
	summary.textContent = '🎙 Record voice over playback';
	const body = document.createElement('div');
	body.className = 'multitrack-mic-body';
	panel.append(summary, body);

	const mode = document.createElement('select');
	mode.className = 'multitrack-tool multitrack-mic-mode';
	mode.setAttribute('aria-label', 'Listening on headphones or speakers');
	mode.append(option('headphones', '🎧 Headphones'), option('speakers', '🔊 Speakers'));
	mode.value = normalizeOutputMode(localStorage.getItem(MIC_OUTPUT_MODE_KEY));
	const arm = document.createElement('select');
	arm.className = 'multitrack-tool multitrack-mic-arm';
	arm.setAttribute('aria-label', 'Track to record voice onto');
	const newTrack = button('＋ Vocal track', 'multitrack-mic-new-track');
	const monitor = document.createElement('input');
	monitor.type = 'checkbox';
	monitor.className = 'multitrack-mic-monitor';
	monitor.checked = false;
	const monitorLabel = document.createElement('label');
	monitorLabel.className = 'multitrack-mic-monitor-label';
	monitorLabel.append(monitor, document.createTextNode(' Hear myself (headphones only)'));
	const duck = document.createElement('input');
	duck.type = 'checkbox';
	duck.className = 'multitrack-mic-duck';
	duck.checked = true;
	const duckDb = document.createElement('select');
	duckDb.className = 'multitrack-tool multitrack-mic-duck-db';
	duckDb.setAttribute('aria-label', 'Playback ducking while recording, decibels');
	duckDb.append(option('-3', '−3 dB'), option('-6', '−6 dB'), option('-12', '−12 dB'));
	duckDb.value = localStorage.getItem(DUCK_KEY) || '-6';
	const duckLabel = document.createElement('label');
	duckLabel.className = 'multitrack-mic-duck-label';
	duckLabel.append(duck, document.createTextNode(' Lower playback while recording '), duckDb);
	const record = button('● Record voice', 'multitrack-mic-record');
	const notice = document.createElement('div');
	notice.className = 'multitrack-mic-notice';
	notice.setAttribute('role', 'alert');

	const take = new MultitrackMicTake(state, {
		onFeedbackCut: () => {
			monitor.checked = false;
			notice.textContent = 'Feedback stopped — monitoring was muted to protect your ears and speakers. '
				+ 'The recording itself kept rolling. Move away from the speakers or use headphones, then tick “Hear myself” to try again.';
			refresh();
		}
	});

	function refresh() {
		const speakers = mode.value === 'speakers';
		if (speakers && monitor.checked) monitor.checked = false;
		monitor.disabled = speakers;
		monitorLabel.title = speakers
			? 'Monitoring is off on speakers: your voice through the speakers would feed back into the microphone.'
			: 'Monitoring plays your voice back as you sing. The feedback guard cuts it if the room starts to howl.';
		record.textContent = take.recording ? '■ Stop take' : '● Record voice';
		record.classList.toggle('is-recording', take.recording);
		arm.replaceChildren(...state.project.tracks.filter(track => track.kind !== 'midi')
			.map(track => option(track.id, `Arm: ${track.name}`)));
		if (take.armedTrackId) arm.value = take.armedTrackId;
		if (arm.value) take.armedTrackId = arm.value;
	}
	mode.addEventListener('change', () => {
		localStorage.setItem(MIC_OUTPUT_MODE_KEY, mode.value);
		if (take.capture.active) take.capture.mode = mode.value, take.capture.setMonitor(monitor.checked);
		notice.textContent = mode.value === 'speakers'
			? 'Speakers mode: monitoring is forced off and echo cancellation is on, so the arrangement does not feed back into your voice.'
			: 'Headphones mode: monitoring is allowed; echo cancellation stays on.';
		refresh();
	});
	arm.addEventListener('change', () => { take.armedTrackId = arm.value; });
	newTrack.addEventListener('click', () => {
		take.armedTrackId = null;
		take.resolveTrack(true);
		refresh();
	});
	monitor.addEventListener('change', () => {
		if (monitor.checked && !canEnableMonitor(mode.value)) {
			monitor.checked = false;
			notice.textContent = 'Monitoring needs headphones — on speakers it would feed back into the microphone.';
			return;
		}
		if (take.capture.feedbackCut && monitor.checked) take.capture.rearmMonitor();
		else if (take.capture.active) take.capture.setMonitor(monitor.checked);
	});
	duckDb.addEventListener('change', () => localStorage.setItem(DUCK_KEY, duckDb.value));
	record.addEventListener('click', async () => {
		record.disabled = true;
		try {
			if (take.recording) await take.stop();
			else {
				notice.textContent = '';
				await take.start({
					mode: mode.value,
					monitor: monitor.checked,
					duckDb: duck.checked ? Number(duckDb.value) : 0,
					autoGainControl: true
				});
			}
		} catch (error) {
			notice.textContent = error?.message || 'Microphone take failed.';
			state.setStatus(notice.textContent);
		} finally {
			record.disabled = false;
			refresh();
		}
	});
	body.append(mode, arm, newTrack, monitorLabel, duckLabel, record, notice);
	state.subscribe(refresh);
	refresh();
	panel.take = take;
	return panel;
}

function option(value, label) {
	const element = document.createElement('option');
	element.value = value;
	element.textContent = label;
	return element;
}

function button(label, className) {
	const element = document.createElement('button');
	element.type = 'button';
	element.className = `multitrack-tool ${className}`;
	element.textContent = label;
	return element;
}
