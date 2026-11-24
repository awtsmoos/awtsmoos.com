//B"H
/** The Awtsmoos speaks Standard MIDI File — the lingua franca of editable music. */

/** Seconds per quarter note from a tempo in beats per minute. */
const spq = bpm => 60 / (Number(bpm) > 0 ? Number(bpm) : 120);
const PPQ = 480;

/**
 * Writes a format-1 SMF: conductor track (tempo) plus one track per project
 * track that owns MIDI regions. Times convert seconds -> ticks at project tempo.
 */
export function encodeMidiFile(project) {
	const ticksPerSecond = PPQ / spq(project?.tempo);
	const tracks = [];
	const conductor = [];
	pushMeta(conductor, 0x51, [...u24(Math.round(1e6 * spq(project?.tempo)))]);
	conductor.push(0xff, 0x2f, 0);
	tracks.push(conductor);
	for (const track of project?.tracks || []) {
		const notes = [];
		for (const region of track.midiRegions || []) for (const note of region.notes || [])
			notes.push({ ...note, start: region.timelineStart + note.start });
		if (!notes.length) continue;
		const events = [];
		for (const note of notes) {
			const pitch = Math.max(0, Math.min(127, Math.round(note.pitch)));
			const velocity = Math.max(1, Math.min(127, Math.round(note.velocity ?? 100)));
			events.push({ tick: Math.round(note.start * ticksPerSecond), bytes: [0x90, pitch, velocity] });
			events.push({ tick: Math.round((note.start + note.duration) * ticksPerSecond), bytes: [0x80, pitch, 0] });
		}
		events.sort((a, b) => a.tick - b.tick || a.bytes[0] - b.bytes[0]);
		const body = [];
		let last = 0;
		for (const event of events) { body.push(...vlq(event.tick - last), ...event.bytes); last = event.tick; }
		body.push(0, 0xff, 0x2f, 0);
		tracks.push(body);
	}
	const out = [];
	out.push(...ascii('MThd'), ...u32(6), ...u16(1), ...u16(tracks.length), ...u16(PPQ));
	for (const body of tracks) out.push(...ascii('MTrk'), ...u32(body.length), ...body);
	return new Uint8Array(out);
}

/** Parses format 0/1 SMF bytes into {tempo, tracks:[{name, notes, sustain}]} with times in seconds. */
export function decodeMidiFile(bytes) {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	let pos = 0;
	const readAscii = n => { let s = ''; for (let i = 0; i < n; i++) s += String.fromCharCode(bytes[pos++]); return s; };
	const readU32 = () => { const v = view.getUint32(pos); pos += 4; return v; };
	const readU16 = () => { const v = view.getUint16(pos); pos += 2; return v; };
	if (readAscii(4) !== 'MThd') throw Error('Not a MIDI file.');
	pos += 4; // header length
	readU16(); // format
	const trackCount = readU16();
	const division = readU16();
	if (division & 0x8000) throw Error('SMPTE-timed MIDI files are not supported.');
	const ppq = division || PPQ;
	let microsPerQuarter = 500000;
	const rawTracks = [];
	for (let t = 0; t < trackCount; t++) {
		if (readAscii(4) !== 'MTrk') throw Error('Invalid MIDI track chunk.');
		const length = readU32();
		const end = pos + length;
		const events = [];
		let tick = 0, running = 0;
		while (pos < end) {
			let delta = 0, byte;
			do { byte = bytes[pos++]; delta = delta * 128 + (byte & 0x7f); } while (byte & 0x80);
			tick += delta;
			let status = bytes[pos];
			if (status & 0x80) { running = status; pos++; } else status = running;
			if (status === 0xff) {
				const type = bytes[pos++];
				let size = 0; do { byte = bytes[pos++]; size = size * 128 + (byte & 0x7f); } while (byte & 0x80);
				if (type === 0x51 && size === 3) microsPerQuarter = (bytes[pos] << 16) | (bytes[pos + 1] << 8) | bytes[pos + 2];
				if (type === 0x03) events.push({ tick, kind: 'name', text: new TextDecoder().decode(bytes.slice(pos, pos + size)) });
				pos += size;
			} else if (status === 0xf0 || status === 0xf7) {
				let size = 0; do { byte = bytes[pos++]; size = size * 128 + (byte & 0x7f); } while (byte & 0x80);
				pos += size;
			} else {
				const kind = status & 0xf0;
				const data1 = bytes[pos++];
				const data2 = (kind === 0xc0 || kind === 0xd0) ? 0 : bytes[pos++];
				events.push({ tick, kind, data1, data2 });
			}
		}
		pos = end;
		rawTracks.push(events);
	}
	const secondsPerTick = microsPerQuarter / 1e6 / ppq;
	const tracks = [];
	for (const events of rawTracks) {
		const open = new Map();
		const notes = [];
		const sustain = [];
		let pedalDown = null;
		let name = 'MIDI Track';
		for (const event of events) {
			if (event.kind === 'name') { name = event.text; continue; }
			const time = event.tick * secondsPerTick;
			if (event.kind === 0x90 && event.data2 > 0) open.set(event.data1, { start: time, velocity: event.data2 });
			else if (event.kind === 0x80 || (event.kind === 0x90 && event.data2 === 0)) {
				const started = open.get(event.data1);
				if (started) { notes.push({ pitch: event.data1, start: started.start, duration: Math.max(.01, time - started.start), velocity: started.velocity }); open.delete(event.data1); }
			} else if (event.kind === 0xb0 && event.data1 === 64) {
				if (event.data2 >= 64 && pedalDown === null) pedalDown = time;
				if (event.data2 < 64 && pedalDown !== null) { sustain.push({ start: pedalDown, duration: Math.max(.01, time - pedalDown) }); pedalDown = null; }
			}
		}
		if (notes.length) tracks.push({ name, notes, sustain });
	}
	return { tempo: Math.round(60e6 / microsPerQuarter), tracks };
}

/** Builds project-ready MIDI regions (one per imported track) from SMF bytes. */
export function midiFileToRegions(bytes) {
	const parsed = decodeMidiFile(bytes);
	return {
		tempo: parsed.tempo,
		regions: parsed.tracks.map(track => {
			const start = Math.min(...track.notes.map(n => n.start));
			return {
				name: track.name,
				timelineStart: start,
				notes: track.notes.map(n => ({ ...n, start: n.start - start })),
				sustain: track.sustain.filter(s => s.start >= start).map(s => ({ ...s, start: s.start - start }))
			};
		})
	};
}

function pushMeta(out, type, data) { out.push(0, 0xff, type, data.length, ...data); }
function vlq(value) {
	let v = Math.max(0, Math.round(value));
	const stack = [v & 0x7f];
	v >>= 7;
	while (v > 0) { stack.unshift((v & 0x7f) | 0x80); v >>= 7; }
	return stack;
}
const u16 = v => [(v >> 8) & 255, v & 255];
const u24 = v => [(v >> 16) & 255, (v >> 8) & 255, v & 255];
const u32 = v => [(v >>> 24) & 255, (v >> 16) & 255, (v >> 8) & 255, v & 255];
const ascii = s => [...s].map(c => c.charCodeAt(0));
