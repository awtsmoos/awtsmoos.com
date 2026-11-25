//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoVoiceTakeControl
 * @description
 * The Awtsmoos lets the hands keep playing while the voice is gathered;
 * Awtsmoos.com puts a small recording studio on the piano surface itself:
 * both stems (voice and piano) are kept for every take, so the singer can
 * rebalance, polish and re-export a take without ever re-recording it.
 * Every take is persisted to the device's asset store (both stems,
 * balance and polish), so the list survives a reload whole.
 */
import { AudioState } from '../audio.js';
import { MicCaptureSession, StreamPcmTap } from '../recording/micCapture.js';
import { MIC_OUTPUT_MODE_KEY, normalizeOutputMode } from '../recording/micSafety.js';
import { mixStemChannels, levelZone, classifyLevelCheck, countInBeats } from '../recording/voiceMix.js';
import { saveVoiceTake, deleteVoiceTake, updateVoiceTakeBalance, restoreVoiceTakes } from '../recording/voiceTakeStore.js';

let bound = false;
let capture = null;
let masterTap = null;
let masterTapDest = null;
let playingSource = null;
let takeSeq = 0;
const takes = [];
let selected = null;
const ui = {};
let recordStartedAt = 0;
let elapsedTimer = null;
let levelHistory = [];
let clipLatched = false;

const ZONE_COLORS = { green: '#2a2', yellow: '#e6c619', red: '#e67e19', clip: '#d33' };

/** Inserts the voice-take studio beside the Record Audio button (idempotent). */
export function ensureVoiceTakeControl() {
	if (bound || typeof document === 'undefined') return null;
	const anchor = document.querySelector('#record-audio-button') || document.querySelector('#mic-button');
	if (!anchor?.parentElement) return null;
	bound = true;
	injectStyles();
	const box = document.createElement('span');
	box.id = 'voice-take-controls';
	box.className = 'voice-take-panel';
	box.style.cssText = 'display:inline-flex;gap:6px;align-items:center;flex-wrap:wrap;max-width:96vw';
	ui.record = button('🎙 Record Voice', 'voice-take-record');
	ui.check = button('🎚 Level Check', 'voice-level-check');
	ui.play = button('▶ Take', 'voice-take-play');
	ui.save = button('⬇ WAV', 'voice-take-save');
	ui.studio = button('🎼 To Studio', 'voice-take-studio');
	ui.polish = button('✨ Polish Voice', 'voice-polish');
	ui.playPolished = button('▶ Polished', 'voice-play-polished');
	ui.meter = document.createElement('span');
	ui.meter.className = 'voice-take-meter';
	ui.meter.setAttribute('aria-label', 'Microphone level');
	ui.meter.style.cssText = 'display:none;width:84px;height:12px;border:1px solid currentColor;border-radius:6px;overflow:hidden;vertical-align:middle;position:relative';
	ui.meterFill = document.createElement('span');
	ui.meterFill.className = 'voice-take-meter-fill';
	ui.meterFill.style.cssText = 'display:block;height:100%;width:0%;background:#2a2;transition:width 60ms linear';
	ui.meter.append(ui.meterFill);
	ui.clip = document.createElement('span');
	ui.clip.className = 'voice-clip-indicator';
	ui.clip.textContent = 'CLIP';
	ui.clip.style.cssText = 'display:none;color:#fff;background:#d33;border-radius:4px;padding:0 4px;font-size:10px';
	ui.elapsed = document.createElement('span');
	ui.elapsed.className = 'voice-take-elapsed';
	ui.elapsed.style.cssText = 'font-variant-numeric:tabular-nums;font-size:12px';
	ui.wave = document.createElement('canvas');
	ui.wave.className = 'voice-wave';
	ui.wave.width = 220; ui.wave.height = 34;
	ui.wave.style.cssText = 'display:none;background:rgba(0,0,0,.18);border-radius:6px';
	ui.status = document.createElement('span');
	ui.status.className = 'voice-take-status';
	ui.status.setAttribute('role', 'status');
	ui.status.style.cssText = 'font-size:12px;max-width:34em';
	ui.gain = slider('voice-mic-gain', 'Mic gain', 0, 200, 100);
	ui.voiceMix = slider('voice-mix-voice', 'Voice', 0, 150, 100);
	ui.pianoMix = slider('voice-mix-piano', 'Piano', 0, 150, 85);
	ui.countIn = document.createElement('label');
	ui.countIn.style.cssText = 'font-size:12px;display:inline-flex;gap:4px;align-items:center;min-height:40px';
	const countBox = document.createElement('input');
	countBox.type = 'checkbox'; countBox.className = 'voice-countin';
	ui.countIn.append(countBox, document.createTextNode('Count-in'));
	ui.usePolished = document.createElement('label');
	ui.usePolished.style.cssText = ui.countIn.style.cssText;
	const polishedBox = document.createElement('input');
	polishedBox.type = 'checkbox'; polishedBox.className = 'voice-use-polished';
	ui.usePolished.append(polishedBox, document.createTextNode('Export polished'));
	ui.usePolishedBox = polishedBox;
	const guide = document.createElement('span');
	guide.className = 'voice-speakers-guide';
	guide.style.cssText = 'font-size:11px;opacity:.85;max-width:34em;flex-basis:100%';
	guide.textContent = 'On speakers: keep volume moderate, mic about an arm’s length away, monitoring stays off — your voice is still recorded.';
	ui.list = document.createElement('span');
	ui.list.className = 'voice-take-list';
	ui.list.style.cssText = 'display:flex;flex-direction:column;gap:4px;width:100%';
	setActionsEnabled(false);
	ui.record.addEventListener('click', () => void toggleTake());
	ui.check.addEventListener('click', () => void levelCheck());
	ui.play.addEventListener('click', () => playBuffer(currentBuffer(false), 'Playing your take — voice and piano together…'));
	ui.playPolished.addEventListener('click', () => playBuffer(selected?.polishedBuffer, 'Playing the polished version…'));
	ui.save.addEventListener('click', () => void saveTake());
	ui.studio.addEventListener('click', () => void sendToStudio());
	ui.polish.addEventListener('click', () => void polishSelected());
	ui.gain.input.addEventListener('input', () => {
		ui.gain.out.textContent = `${ui.gain.input.value}%`;
		capture?.setInputGain(Number(ui.gain.input.value) / 100);
	});
	const remix = () => {
		if (!selected) return;
		selected.voiceGain = Number(ui.voiceMix.input.value) / 100;
		selected.pianoGain = Number(ui.pianoMix.input.value) / 100;
		selected.mixedCache = null;
		updateVoiceTakeBalance(selected.id, selected.voiceGain, selected.pianoGain);
		ui.voiceMix.out.textContent = `${ui.voiceMix.input.value}%`;
		ui.pianoMix.out.textContent = `${ui.pianoMix.input.value}%`;
	};
	ui.voiceMix.input.addEventListener('input', remix);
	ui.pianoMix.input.addEventListener('input', remix);
	box.append(ui.record, ui.check, ui.meter, ui.clip, ui.elapsed, ui.wave,
		ui.gain.wrap, ui.countIn, ui.play, ui.save, ui.studio,
		ui.voiceMix.wrap, ui.pianoMix.wrap, ui.polish, ui.playPolished, ui.usePolished,
		guide, ui.status, ui.list);
	anchor.after(box);
	void restoreSavedTakes();
	return box;
}

function injectStyles() {
	if (document.querySelector('#voice-take-styles')) return;
	const style = document.createElement('style');
	style.id = 'voice-take-styles';
	style.textContent = '@keyframes voicePulse{0%,100%{opacity:1}50%{opacity:.45}}'
		+ '.voice-take-panel{background:linear-gradient(160deg,#241b0d,#171106);border:1px solid #d59a35;'
		+ 'border-radius:14px;padding:10px 12px;color:#f5eeda;box-shadow:0 4px 18px rgba(0,0,0,.35)}'
		+ '.voice-take-panel button{background:#2a2113;color:#f0d48a;border:1px solid #d59a35;border-radius:9px;'
		+ 'font:inherit;cursor:pointer}'
		+ '.voice-take-panel button:hover:not(:disabled){background:#3a2c15;color:#ffe9a8}'
		+ '.voice-take-panel button:disabled{opacity:.45;cursor:default}'
		+ '.voice-take-panel button.voice-take-record{background:#d59a35;color:#241a05;font-weight:700}'
		+ '.voice-take-panel button.voice-take-record.recording{animation:voicePulse 1s infinite;background:#d33;color:#fff;border-color:#d33}'
		+ '.voice-take-panel input[type=range]{accent-color:#d59a35}'
		+ '.voice-take-panel input[type=checkbox]{accent-color:#d59a35;width:20px;height:20px}'
		+ '.voice-take-panel .voice-take-meter{border-color:#d59a35;background:rgba(0,0,0,.4)}'
		+ '.voice-take-panel .voice-wave{border:1px solid rgba(213,154,53,.55)}'
		+ '.voice-take-panel .voice-take-row{border-radius:8px;padding:3px 6px}'
		+ '.voice-take-panel .voice-take-row[aria-current=true]{outline:2px solid #d59a35}'
		+ '.voice-take-panel .voice-take-status{color:#f5eeda}'
		+ '.voice-take-panel .voice-speakers-guide{color:#e8cf8a}';
	document.head.append(style);
}

function slider(id, label, min, max, value) {
	const wrap = document.createElement('label');
	wrap.style.cssText = 'font-size:12px;display:inline-flex;gap:4px;align-items:center;min-height:40px';
	const input = document.createElement('input');
	input.type = 'range'; input.id = id; input.className = id;
	input.min = min; input.max = max; input.value = value;
	input.style.cssText = 'width:90px;min-height:32px';
	const out = document.createElement('span');
	out.textContent = `${value}%`;
	wrap.append(document.createTextNode(label), input, out);
	return { wrap, input, out };
}

function button(label, className) {
	const element = document.createElement('button');
	element.type = 'button';
	element.className = className;
	element.textContent = label;
	element.style.cssText = 'min-height:44px;min-width:44px;padding:6px 10px';
	return element;
}

function setActionsEnabled(on) {
	for (const b of [ui.play, ui.save, ui.studio, ui.polish]) if (b) b.disabled = !on;
	if (ui.playPolished) ui.playPolished.disabled = !(on && selected?.polishedBuffer);
}

function mode() {
	try { return normalizeOutputMode(localStorage.getItem(MIC_OUTPUT_MODE_KEY)); }
	catch (_) { return 'speakers'; }
}

function monitorWanted() {
	return Boolean(document.querySelector('#mic-playback-checkbox')?.checked);
}

function bufferRms(buffer) {
	if (!buffer?.length) return 0;
	const data = buffer.getChannelData(0);
	let sum = 0;
	for (const value of data) sum += value * value;
	return Math.sqrt(sum / data.length);
}

function channelsOf(buffer) {
	const out = [];
	for (let c = 0; c < buffer.numberOfChannels; c++) out.push(buffer.getChannelData(c));
	return out;
}

/** Renders (and caches) a take's mix at its chosen stem balance. */
function renderMix(take) {
	if (take.mixedCache) return take.mixedCache;
	const context = AudioState.context;
	const sampleRate = context.sampleRate;
	const voice = take.voice;
	const piano = take.piano;
	const start = piano?.buffer ? Math.min(voice.startContextTime, piano.startContextTime) : voice.startContextTime;
	const { channels, length } = mixStemChannels({
		voice: channelsOf(voice.buffer),
		piano: piano?.buffer ? channelsOf(piano.buffer) : [],
		voiceGain: take.voiceGain,
		pianoGain: take.pianoGain,
		voiceOffset: Math.round((voice.startContextTime - start) * sampleRate),
		pianoOffset: piano?.buffer ? Math.round((piano.startContextTime - start) * sampleRate) : 0,
		channels: Math.max(voice.buffer.numberOfChannels, piano?.buffer?.numberOfChannels || 0)
	});
	const mixed = context.createBuffer(channels.length, length, sampleRate);
	channels.forEach((data, c) => mixed.getChannelData(c).set(data));
	take.mixedCache = mixed;
	return mixed;
}

function currentBuffer(polished) {
	if (!selected) return null;
	if (polished && selected.polishedBuffer) return selected.polishedBuffer;
	if (ui.usePolishedBox?.checked && selected.polishedBuffer) return selected.polishedBuffer;
	return renderMix(selected);
}

function onLevel({ rms, peak }) {
	const zone = levelZone(peak);
	ui.meterFill.style.width = `${Math.round(Math.min(1, Math.max(rms * 3, peak * 0.85)) * 100)}%`;
	ui.meterFill.style.background = ZONE_COLORS[zone];
	if (zone === 'clip') { clipLatched = true; ui.clip.style.display = 'inline-block'; }
	levelHistory.push(rms);
	if (levelHistory.length % 3 === 0) drawWave();
}

function drawWave() {
	const ctx = ui.wave.getContext('2d');
	if (!ctx) return;
	const { width, height } = ui.wave;
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = '#e8cf8a';
	const bars = levelHistory.slice(-72);
	bars.forEach((rms, i) => {
		const h = Math.max(2, Math.min(1, rms * 4) * (height - 4));
		ctx.fillRect(i * 3, (height - h) / 2, 2, h);
	});
}

async function runCountIn() {
	const bpmInput = document.querySelector('#bpm-slider, #tempo-slider, #bpm, input[name="bpm"]');
	const beats = countInBeats(Number(bpmInput?.value) || 100, 4);
	const context = AudioState.context;
	for (let i = 0; i < beats.length; i++) {
		ui.status.textContent = `Count-in: ${beats.length - i}…`;
		const osc = context.createOscillator();
		const gain = context.createGain();
		osc.frequency.value = i === 0 ? 1320 : 880;
		gain.gain.value = 0.12;
		osc.connect(gain); gain.connect(AudioState.masterGain);
		osc.start(); osc.stop(context.currentTime + 0.06);
		const waitMs = (i + 1 < beats.length ? beats[i + 1] - beats[i] : beats[1] - beats[0] || 0.6) * 1000;
		await new Promise(resolve => setTimeout(resolve, waitMs));
	}
}

async function toggleTake() {
	if (capture?.active) return stopTake();
	if (!AudioState.context || !AudioState.masterGain) {
		ui.status.textContent = 'Start the piano first, then record your voice.';
		return;
	}
	ui.record.disabled = true;
	try {
		if (ui.countIn.querySelector('input').checked) await runCountIn();
		await startTake();
	} catch (error) {
		capture = null;
		if (masterTap) { await masterTap.stop().catch(() => {}); masterTap = null; }
		if (masterTapDest) { try { AudioState.masterGain.disconnect(masterTapDest); } catch (_) {} masterTapDest = null; }
		ui.status.textContent = error?.message || 'Microphone could not start.';
	} finally {
		ui.record.disabled = false;
	}
}

async function startTake() {
	clipLatched = false;
	ui.clip.style.display = 'none';
	levelHistory = [];
	capture = new MicCaptureSession({
		onFeedbackCut: () => { ui.status.textContent = 'Feedback stopped — monitoring muted; the take kept recording.'; },
		onLevel
	});
	const speakers = mode() === 'speakers';
	// Piano stem taps masterGain through a take-private destination:
	// the shared record stream also carries the mic record tap, so
	// tapping it would bake the voice into the "piano" stem and break
	// stem balance. masterGain carries the piano alone (monitor is
	// off by default and hard-off on speakers).
	if (AudioState.masterGain) {
		masterTapDest = AudioState.context.createMediaStreamDestination();
		AudioState.masterGain.connect(masterTapDest);
		masterTap = new StreamPcmTap(AudioState.context, masterTapDest.stream);
		await masterTap.start();
	}
	await capture.start({
		context: AudioState.context,
		mode: mode(),
		monitor: monitorWanted(),
		monitorDestination: AudioState.masterGain,
		recordDestination: AudioState.mediaStreamDestination,
		autoGainControl: true,
		inputGain: Number(ui.gain.input.value) / 100,
		duckGainNode: speakers ? AudioState.masterGain : null,
		duckDb: speakers ? -6 : 0
	});
	ui.meter.style.display = 'inline-block';
	ui.wave.style.display = 'inline-block';
	ui.record.textContent = '■ Stop Voice';
	ui.record.classList.add('recording');
	recordStartedAt = performance.now();
	ui.elapsed.textContent = '0:00';
	elapsedTimer = setInterval(() => {
		const s = Math.floor((performance.now() - recordStartedAt) / 1000);
		ui.elapsed.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
	}, 250);
	ui.status.textContent = speakers
		? '● Recording voice + piano — keep playing and singing! Playback is lowered −6 dB and monitoring is off on speakers.'
		: '● Recording voice + piano — keep playing and singing!';
}

async function stopTake() {
	const result = await capture.stop();
	capture = null;
	const piano = masterTap ? await masterTap.stop() : null;
	masterTap = null;
	if (masterTapDest) {
		try { AudioState.masterGain.disconnect(masterTapDest); } catch (_) { /* Already detached. */ }
		masterTapDest = null;
	}
	clearInterval(elapsedTimer);
	ui.meter.style.display = 'none';
	ui.wave.style.display = 'none';
	ui.record.textContent = '🎙 Record Voice';
	ui.record.classList.remove('recording');
	if (!result?.buffer || result.duration <= 0.05) {
		ui.status.textContent = 'That take was too short to keep.';
		return;
	}
	const take = {
		createdAt: Date.now(),
		id: ++takeSeq,
		voice: { buffer: result.buffer, startContextTime: result.startContextTime },
		piano: piano?.buffer ? { buffer: piano.buffer, startContextTime: piano.startContextTime } : null,
		voiceGain: Number(ui.voiceMix.input.value) / 100,
		pianoGain: Number(ui.pianoMix.input.value) / 100,
		duration: result.duration,
		mixedCache: null,
		polishedBuffer: null
	};
	takes.push(take);
	void saveVoiceTake(take).catch(() => { /* Store full/blocked: the take stays in this session. */ });
	selectTake(take);
	const micRms = bufferRms(result.buffer);
	ui.status.textContent = `Voice take kept — Take ${take.id} (${result.duration.toFixed(1)}s) — voice and piano stems saved: rebalance them, polish, play, save, or send to the Studio.`
		+ (micRms < 0.004 ? ` ⚠ WARNING: your voice was barely picked up (level ${micRms.toFixed(3)}). Run the Level Check, raise Mic gain, move closer — do not trust this take.` : '')
		+ (clipLatched ? ' ⚠ The voice clipped during this take — lower Mic gain a little next time.' : '')
		+ (result.feedbackCut ? ' Monitoring was cut by the feedback guard during the take.' : '');
	renderTakeList();
}

function selectTake(take) {
	selected = take;
	if (!take) { setActionsEnabled(false); return; }
	ui.voiceMix.input.value = Math.round(take.voiceGain * 100);
	ui.pianoMix.input.value = Math.round(take.pianoGain * 100);
	ui.voiceMix.out.textContent = `${Math.round(take.voiceGain * 100)}%`;
	ui.pianoMix.out.textContent = `${Math.round(take.pianoGain * 100)}%`;
	setActionsEnabled(true);
	renderTakeList();
}

function renderTakeList() {
	if (!ui.list) return;
	ui.list.innerHTML = '';
	for (const take of takes) {
		const row = document.createElement('span');
		row.className = 'voice-take-row';
		row.style.cssText = 'display:inline-flex;gap:6px;align-items:center;flex-wrap:wrap';
		row.toggleAttribute('aria-current', take === selected);
		const name = document.createElement('strong');
		name.style.fontSize = '12px';
		name.textContent = `Take ${take.id} (${take.duration.toFixed(1)}s)${take.polishedBuffer ? ' ✨' : ''}`;
		name.addEventListener('click', () => selectTake(take));
		const play = button('▶', 'voice-take-row-play');
		play.addEventListener('click', () => { selectTake(take); playBuffer(renderMix(take), `Playing Take ${take.id}…`); });
		const save = button('⬇', 'voice-take-row-save');
		save.addEventListener('click', () => { selectTake(take); void saveTake(); });
		const studio = button('🎼', 'voice-take-row-studio');
		studio.addEventListener('click', () => { selectTake(take); void sendToStudio(); });
		const del = button('🗑', 'voice-take-row-delete');
		del.addEventListener('click', () => {
			void deleteVoiceTake(take.id).catch(() => {});
			const index = takes.indexOf(take);
			if (index >= 0) takes.splice(index, 1);
			if (selected === take) selectTake(takes[takes.length - 1] || null);
			renderTakeList();
		});
		row.append(name, play, save, studio, del);
		ui.list.append(row);
	}
}

/** Restores takes persisted on this device (stems + balance + polish). */
async function restoreSavedTakes() {
	try {
		const context = AudioState.context || new OfflineAudioContext(1, 1, 44100);
		const restored = await restoreVoiceTakes({ context });
		if (!restored.length) return;
		for (const take of restored) {
			takes.push(take);
			takeSeq = Math.max(takeSeq, take.id);
		}
		selectTake(restored[restored.length - 1]);
		ui.status.textContent = `Restored ${restored.length} saved take${restored.length === 1 ? '' : 's'} from this device — stems, balance and polish intact.`;
		renderTakeList();
	} catch (_) { /* No store on this browser: session-only takes, as before. */ }
}

async function levelCheck() {
	if (capture?.active) { ui.status.textContent = 'Stop the take before running a level check.'; return; }
	if (!AudioState.context) { ui.status.textContent = 'Start the piano first, then check your level.'; return; }
	ui.check.disabled = true;
	ui.meter.style.display = 'inline-block';
	ui.clip.style.display = 'none';
	let peak = 0, sumSq = 0, blocks = 0, clipped = 0;
	const probe = new MicCaptureSession({
		onLevel: ({ rms, peak: p }) => {
			peak = Math.max(peak, p);
			sumSq += rms * rms; blocks++;
			if (p >= 0.98) clipped++;
			onLevel({ rms, peak: p });
		}
	});
	try {
		ui.status.textContent = 'Level check: sing a note for 3 seconds…';
		await probe.start({
			context: AudioState.context, mode: mode(), monitor: false,
			autoGainControl: true, inputGain: Number(ui.gain.input.value) / 100
		});
		await new Promise(resolve => setTimeout(resolve, 3000));
		await probe.stop();
		const rms = blocks ? Math.sqrt(sumSq / blocks) : 0;
		const verdict = classifyLevelCheck({ peak, rms, clippedBlocks: clipped });
		ui.status.textContent = verdict === 'good'
			? `Level check: GOOD (peak ${peak.toFixed(2)}). You are ready to record.`
			: verdict === 'too-loud'
				? `Level check: TOO LOUD (peak ${peak.toFixed(2)}, clipping). Lower Mic gain or move back a little.`
				: `Level check: TOO QUIET (peak ${peak.toFixed(2)}). Raise Mic gain or move closer, then check again.`;
	} catch (error) {
		ui.status.textContent = error?.message || 'Level check could not start.';
	} finally {
		ui.meter.style.display = 'none';
		ui.check.disabled = false;
	}
}

/** Gentle voice polish on a COPY: 80 Hz high-pass, soft compression, a touch of generated-impulse reverb; piano passes at its balance. */
async function polishSelected() {
	if (!selected) return;
	ui.polish.disabled = true;
	try {
		const take = selected;
		const mix = renderMix(take);
		const sr = mix.sampleRate;
		const offline = new OfflineAudioContext(mix.numberOfChannels, mix.length, sr);
		const voiceSrc = offline.createBufferSource();
		// Rebuild a voice-only buffer at the mix offset for the polish chain.
		const voiceOnly = offline.createBuffer(mix.numberOfChannels, mix.length, sr);
		const start = take.piano?.buffer ? Math.min(take.voice.startContextTime, take.piano.startContextTime) : take.voice.startContextTime;
		const offset = Math.round((take.voice.startContextTime - start) * sr);
		for (let c = 0; c < mix.numberOfChannels; c++) {
			const src = take.voice.buffer.getChannelData(Math.min(c, take.voice.buffer.numberOfChannels - 1));
			voiceOnly.getChannelData(c).set(src, offset);
		}
		voiceSrc.buffer = voiceOnly;
		const hp = offline.createBiquadFilter();
		hp.type = 'highpass'; hp.frequency.value = 80;
		const comp = offline.createDynamicsCompressor();
		comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.18;
		const dry = offline.createGain(); dry.gain.value = 0.92 * take.voiceGain;
		const verb = offline.createConvolver(); verb.buffer = makeImpulse(offline, 1.4, 2.4);
		const wet = offline.createGain(); wet.gain.value = 0.16 * take.voiceGain;
		voiceSrc.connect(hp); hp.connect(comp);
		comp.connect(dry); dry.connect(offline.destination);
		comp.connect(verb); verb.connect(wet); wet.connect(offline.destination);
		if (take.piano?.buffer) {
			const pianoSrc = offline.createBufferSource();
			const pianoBuf = offline.createBuffer(mix.numberOfChannels, mix.length, sr);
			const pOff = Math.round((take.piano.startContextTime - start) * sr);
			for (let c = 0; c < mix.numberOfChannels; c++) {
				const src = take.piano.buffer.getChannelData(Math.min(c, take.piano.buffer.numberOfChannels - 1));
				const scaled = Float32Array.from(src, v => v * take.pianoGain);
				pianoBuf.getChannelData(c).set(scaled, pOff);
			}
			pianoSrc.buffer = pianoBuf;
			pianoSrc.connect(offline.destination);
			pianoSrc.start();
		}
		voiceSrc.start();
		take.polishedBuffer = await offline.startRendering();
		void saveVoiceTake(take).catch(() => { /* Polish stays in this session if the store refuses. */ });
		ui.playPolished.disabled = false;
		ui.status.textContent = `Take ${take.id} polished — original untouched. ▶ Polished to A/B against ▶ Take; tick "Export polished" to save/send the polished version.`;
		renderTakeList();
	} catch (error) {
		ui.status.textContent = 'Polish failed: ' + (error?.message || error);
	} finally {
		ui.polish.disabled = !selected;
	}
}

function makeImpulse(context, seconds, decay) {
	const rate = context.sampleRate;
	const length = Math.round(rate * seconds);
	const impulse = context.createBuffer(2, length, rate);
	for (let c = 0; c < 2; c++) {
		const data = impulse.getChannelData(c);
		for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
	}
	return impulse;
}

function playBuffer(buffer, message) {
	if (!buffer || !AudioState.context) return;
	playingSource?.stop();
	playingSource = AudioState.context.createBufferSource();
	playingSource.buffer = buffer;
	playingSource.connect(AudioState.masterGain);
	playingSource.start();
	ui.status.textContent = message;
}

async function takeWavBlob() {
	const { encodeMultitrackWav } = await import('../workstation/song/multitrack/multitrackWavEncoder.js');
	return new Blob([encodeMultitrackWav(currentBuffer(false), { bitsPerSample: 16 })], { type: 'audio/wav' });
}

async function saveTake() {
	if (!selected) return;
	const { downloadBlob } = await import('../recording/download.js');
	downloadBlob(await takeWavBlob(), `BH-Voice-Piano-Take-${selected.id}-${Date.now()}.wav`);
	ui.status.textContent = `Take ${selected.id} downloaded as WAV — at your chosen Voice/Piano balance.`;
}

async function sendToStudio() {
	if (!selected) return;
	try {
		const { editRecordingInStudio } = await import('../recording/editInStudio.js');
		await editRecordingInStudio({ blob: await takeWavBlob(), filename: `BH-Voice-Piano-Take-${selected.id}-${Date.now()}.wav` });
		ui.status.textContent = `Take ${selected.id} — at your chosen balance — is in the Studio as a clip on its own track.`;
	} catch (error) {
		ui.status.textContent = error?.message || 'Could not open the Studio.';
	}
}
