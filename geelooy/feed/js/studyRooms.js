// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudyRooms
 * @description
 * Yaakov 2026-10-13: TRACK H — virtual study rooms for the Awtsmoos feed.
 *
 * A floating "Study rooms" button opens the community study panel:
 *   - Browse rooms (topic + the text being learned) and create your own.
 *   - Inside a room: the current text, participant list with presence,
 *     shared notes, and a live text chat.
 *   - "Raise hand" turn-taking: hands queue in order; the host (or anyone)
 *     can pass the speaking turn down the queue.
 *
 * NOTE: text chat + presence only. No video/audio SDK integration.
 *
 * Rooms, notes, chat and the hand queue persist in localStorage on this
 * device. Sample rooms are clearly labeled as samples; a live room service
 * can replace them later without changing the UI.
 */

const LS_ROOMS = 'awtsmoos-studyrooms-rooms-v1';
const LS_NAME = 'awtsmoos-studyrooms-displayname-v1';

const SUBJECTS = [
	'Chumash', 'Nach', 'Mishnah', 'Gemara', 'Halachah',
	'Chassidus', 'Tehillim', 'Mussar', 'Tanya', 'Likkutei Sichos'
];

/* B"H — sample rooms, labeled "sample" in the UI. */
const SAMPLE_ROOMS = [
	{
		id: 'sample-tanya-ch1', name: 'Tanya Chapter 1 Circle', subject: 'Tanya',
		schedule: 'Sun + Wed evenings', sample: true,
		currentText: 'Chapter 1 — what the Tzaddik is, and who the Beinoni is. We are up to the Alter Rebbe\'s opening description of the five parts of the soul.',
		participants: [
			{ name: 'Yossi', presence: 'online', me: false },
			{ name: 'Miriam', presence: 'online', me: false },
			{ name: 'Ari', presence: 'away', me: false }
		],
		notes: [
			{ author: 'Yossi', at: 'Yesterday', text: 'Key line: the Beinoni is not a Tzaddik who sins — he is a different category entirely.' },
			{ author: 'Miriam', at: 'Today', text: 'Question for next time: how does the Nefesh HaElokis "rule" while the Nefesh HaBehamis still desires?' }
		],
		chat: [
			{ author: 'Yossi', at: '18:02', text: 'Starting in 5 minutes — chapter 1, paragraph 3.' },
			{ author: 'Miriam', at: '18:04', text: 'Ready! I have my notes from last week.' }
		],
		hands: []
	},
	{
		id: 'sample-daf', name: 'Daily Daf Seder', subject: 'Gemara',
		schedule: 'Every morning', sample: true,
		currentText: 'Brachot 2a — "Me\'ematai korin et Shema be\'arvit?" We are up to the Mishnah\'s dispute about the latest time for the evening Shema.',
		participants: [
			{ name: 'Dovid', presence: 'online', me: false },
			{ name: 'Mendel', presence: 'online', me: false },
			{ name: 'Chana', presence: 'away', me: false }
		],
		notes: [
			{ author: 'Dovid', at: 'Monday', text: 'Tosafot asks why the Mishnah opens with the evening Shema instead of the morning one.' }
		],
		chat: [
			{ author: 'Mendel', at: '07:30', text: 'Seder starts — Brachot 2a, Rashi "me\'ematai".' }
		],
		hands: []
	}
];

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function escapeHtml(s) {
	return String(s ?? '').replace(/[&<>"']/g, c => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	}[c]));
}

function readJson(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		const parsed = JSON.parse(raw);
		return parsed === null || parsed === undefined ? fallback : parsed;
	} catch (_) { return fallback; }
}

function writeJson(key, value) {
	try { localStorage.setItem(key, JSON.stringify(value)); }
	catch (_) { /* quota / private mode — the feed still works */ }
}

function nowTime() {
	try {
		return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	} catch (_) { return ''; }
}

function loadRooms() {
	const mine = readJson(LS_ROOMS, []);
	const mineIds = new Set(mine.map(r => r.id));
	// Sample rooms are always available (deep copies so samples stay pristine).
	const samples = SAMPLE_ROOMS.map(s => JSON.parse(JSON.stringify(s)));
	return { rooms: mine.filter(r => !mineIds.has(r.id)).concat(mine).concat(samples), mineIds };
}

function saveMyRooms(all) {
	const mine = all.filter(r => !r.sample);
	writeJson(LS_ROOMS, mine);
}

function getName() { return readJson(LS_NAME, ''); }
function setName(n) { writeJson(LS_NAME, n); }

function svgRoom() {
	return '<svg class="sr-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 5h16v11H4z"/><path d="M4 19h16M8 21h8"/></svg>';
}

/* ------------------------------------------------------------------ */
/* panel                                                               */
/* ------------------------------------------------------------------ */

let overlay = null;
let view = { screen: 'list', roomId: null };

export function initStudyRooms() {
	const stage = document.getElementById('feed-stage') || document.body;
	if (stage.querySelector('.sr-fab')) return;
	const fab = document.createElement('button');
	fab.type = 'button';
	fab.className = 'sr-fab';
	fab.setAttribute('aria-label', 'Open study rooms');
	fab.title = 'Study rooms';
	fab.innerHTML = svgRoom() + '<span>Study rooms</span>';
	fab.addEventListener('click', openPanel);
	stage.append(fab);
}

function closePanel() {
	if (overlay) { overlay.remove(); overlay = null; }
	document.removeEventListener('keydown', onKey, true);
}

function onKey(e) { if (e.key === 'Escape') closePanel(); }

function openPanel() {
	if (overlay) { overlay.querySelector('.sr-panel')?.focus?.(); return; }
	overlay = document.createElement('div');
	overlay.className = 'sr-overlay';
	overlay.innerHTML =
		'<div class="sr-panel" role="dialog" aria-modal="true" aria-label="Study rooms">' +
			'<div class="sr-panel-head">' +
				'<h2 class="sr-panel-title">Study rooms</h2>' +
				'<button type="button" class="sr-close" aria-label="Close study rooms">✕</button>' +
			'</div>' +
			'<div class="sr-panel-body"></div>' +
		'</div>';
	document.body.append(overlay);
	overlay.querySelector('.sr-close').addEventListener('click', closePanel);
	overlay.addEventListener('click', (e) => { if (e.target === overlay) closePanel(); });
	document.addEventListener('keydown', onKey, true);
	render();
}

function body() { return overlay.querySelector('.sr-panel-body'); }

function render() {
	if (!overlay) return;
	if (view.screen === 'room') renderRoom();
	else renderList();
}

function roomById(id) {
	const { rooms } = loadRooms();
	return rooms.find(r => r.id === id) || null;
}

function persistRoom(room) {
	if (room.sample) return; // samples stay read-only except the session copy
	const { rooms } = loadRooms();
	const mine = rooms.filter(r => !r.sample).map(r => r.id === room.id ? room : r);
	if (!mine.find(r => r.id === room.id)) mine.push(room);
	saveMyRooms(mine);
}

/* ------------------------------------------------------------------ */
/* room list                                                           */
/* ------------------------------------------------------------------ */

function renderList() {
	const { rooms, mineIds } = loadRooms();
	const name = getName();
	const el = body();
	el.innerHTML =
		'<div class="sr-section">' +
			'<div class="sr-row sr-headrow">' +
				'<p class="sr-lede">Learn together, live. Text chat and presence only — no video or audio.</p>' +
			'</div>' +
			(name ? '' :
			'<form class="sr-card sr-namecard">' +
				'<label class="sr-label" for="sr-name">Your display name in rooms</label>' +
				'<div class="sr-row">' +
					'<input class="sr-input" id="sr-name" name="name" maxlength="40" placeholder="e.g. Dovid" required>' +
					'<button type="submit" class="sr-btn sr-btn-primary">Save</button>' +
				'</div>' +
			'</form>') +
			'<div class="sr-roomlist">' +
				rooms.map(r => roomCard(r, mineIds.has(r.id))).join('') +
			'</div>' +
			'<details class="sr-create" ' + (rooms.length ? '' : 'open') + '>' +
				'<summary class="sr-create-summary">+ Create a study room</summary>' +
				'<form class="sr-card sr-form">' +
					'<label class="sr-label">Room name<input class="sr-input" name="name" maxlength="60" required placeholder="e.g. Chumash Rashi Circle"></label>' +
					'<label class="sr-label">Subject<select class="sr-input" name="subject">' + SUBJECTS.map(s => `<option>${escapeHtml(s)}</option>`).join('') + '</select></label>' +
					'<label class="sr-label">Text being learned<textarea class="sr-input sr-textarea" name="text" rows="3" maxlength="600" required placeholder="Paste or describe the passage you are up to…"></textarea></label>' +
					'<label class="sr-label">Schedule note<input class="sr-input" name="schedule" maxlength="80" placeholder="e.g. Tue + Thu evenings"></label>' +
					'<button type="submit" class="sr-btn sr-btn-primary">Create room</button>' +
				'</form>' +
			'</details>' +
		'</div>';
	el.querySelector('.sr-namecard')?.addEventListener('submit', (e) => {
		e.preventDefault();
		const n = new FormData(e.target).get('name').toString().trim();
		if (n) { setName(n); render(); }
	});
	el.querySelectorAll('[data-join]').forEach(btn => {
		btn.addEventListener('click', () => joinRoom(btn.dataset.join));
	});
	el.querySelector('.sr-form').addEventListener('submit', (e) => {
		e.preventDefault();
		const fd = new FormData(e.target);
		const room = {
			id: 'room-' + Date.now().toString(36),
			name: fd.get('name').toString().trim(),
			subject: fd.get('subject').toString(),
			schedule: fd.get('schedule').toString().trim(),
			currentText: fd.get('text').toString().trim(),
			participants: [], notes: [], chat: [], hands: [], host: getName()
		};
		const { rooms } = loadRooms();
		const mine = rooms.filter(r => !r.sample);
		mine.push(room);
		saveMyRooms(mine);
		view = { screen: 'room', roomId: room.id };
		render();
	});
}

function roomCard(r, mine) {
	const online = r.participants.filter(p => p.presence === 'online').length;
	return '<article class="sr-card sr-roomcard">' +
		'<div class="sr-roomcard-top">' +
			'<h3 class="sr-roomcard-title">' + escapeHtml(r.name) + '</h3>' +
			(r.sample ? '<span class="sr-tag">sample</span>' : '') +
			(mine ? '<span class="sr-tag sr-tag-mine">mine</span>' : '') +
		'</div>' +
		'<p class="sr-meta">' + escapeHtml(r.subject) + (r.schedule ? ' · ' + escapeHtml(r.schedule) : '') + ' · <span class="sr-online">' + online + ' online</span></p>' +
		'<p class="sr-text-clamp">' + escapeHtml(r.currentText) + '</p>' +
		'<button type="button" class="sr-btn" data-join="' + escapeHtml(r.id) + '">Join room</button>' +
	'</article>';
}

function joinRoom(id) {
	const room = roomById(id);
	if (!room) return;
	const me = getName() || 'You';
	if (!room.participants.some(p => p.name === me)) {
		room.participants.push({ name: me, presence: 'online', me: true });
	}
	room.chat.push({ author: '—', at: nowTime(), text: me + ' joined the room.', sys: true });
	persistRoom(room);
	view = { screen: 'room', roomId: id };
	render();
}

/* ------------------------------------------------------------------ */
/* inside a room                                                        */
/* ------------------------------------------------------------------ */

function renderRoom() {
	const room = roomById(view.roomId);
	const el = body();
	if (!room) { view = { screen: 'list', roomId: null }; render(); return; }
	const me = getName() || 'You';
	const myHand = room.hands.indexOf(me);
	const speaker = room.hands[0] || null;
	el.innerHTML =
		'<div class="sr-section sr-roomview">' +
			'<div class="sr-row sr-headrow">' +
				'<button type="button" class="sr-btn sr-back">← All rooms</button>' +
				(room.sample ? '<span class="sr-tag">sample room</span>' : '') +
			'</div>' +
			'<h3 class="sr-room-title">' + escapeHtml(room.name) + '</h3>' +
			'<p class="sr-meta">' + escapeHtml(room.subject) + (room.schedule ? ' · ' + escapeHtml(room.schedule) : '') + '</p>' +

			'<section class="sr-card" aria-label="Current text">' +
				'<h4 class="sr-card-title">Current text</h4>' +
				'<p class="sr-current-text">' + escapeHtml(room.currentText) + '</p>' +
				(room.sample ? '' :
				'<form class="sr-textform">' +
					'<label class="sr-label sr-sr" for="sr-textedit">Update the current text</label>' +
					'<div class="sr-row"><input class="sr-input" id="sr-textedit" maxlength="600" value="' + escapeHtml(room.currentText) + '">' +
					'<button type="submit" class="sr-btn">Update</button></div>' +
				'</form>') +
			'</section>' +

			'<section class="sr-card" aria-label="Discussion order">' +
				'<h4 class="sr-card-title">Discussion order</h4>' +
				(speaker
					? '<p class="sr-speaker">🎙 <strong>' + escapeHtml(speaker) + '</strong> has the floor.</p>'
					: '<p class="sr-dim">No one is speaking. Raise your hand to take a turn.</p>') +
				(room.hands.length
					? '<ol class="sr-hands">' + room.hands.map((h, i) =>
						'<li class="sr-hand' + (i === 0 ? ' is-speaker' : '') + '"><span>' + (i + 1) + '. ' + escapeHtml(h) + '</span>' +
						(i === 0 && !room.sample ? '<button type="button" class="sr-linkbtn" data-pass>Pass turn →</button>' : '') +
						'</li>').join('') + '</ol>'
					: '') +
				'<button type="button" class="sr-btn ' + (myHand >= 0 ? 'sr-btn-active' : '') + '" data-raise>' +
					(myHand >= 0 ? '✋ Lower my hand' : '✋ Raise hand') + '</button>' +
			'</section>' +

			'<section class="sr-card" aria-label="Participants">' +
				'<h4 class="sr-card-title">Participants (' + room.participants.length + ')</h4>' +
				'<ul class="sr-parts">' + room.participants.map(p =>
					'<li><span class="sr-presence sr-' + escapeHtml(p.presence) + '" aria-hidden="true"></span>' +
					escapeHtml(p.name) + (p.me ? ' <span class="sr-tag">you</span>' : '') +
					(p.presence !== 'online' ? ' <span class="sr-dim">(' + escapeHtml(p.presence) + ')</span>' : '') +
					'</li>').join('') + '</ul>' +
			'</section>' +

			'<section class="sr-card" aria-label="Shared notes">' +
				'<h4 class="sr-card-title">Shared notes</h4>' +
				'<ul class="sr-notes">' + room.notes.map(n =>
					'<li><p class="sr-note-text">' + escapeHtml(n.text) + '</p>' +
					'<p class="sr-note-meta">' + escapeHtml(n.author) + ' · ' + escapeHtml(n.at) + '</p></li>').join('') + '</ul>' +
				'<form class="sr-row sr-noteform">' +
					'<label class="sr-label sr-sr" for="sr-note">Add a shared note</label>' +
					'<input class="sr-input" id="sr-note" maxlength="500" placeholder="Add a shared note…">' +
					'<button type="submit" class="sr-btn">Add</button>' +
				'</form>' +
			'</section>' +

			'<section class="sr-card" aria-label="Room chat">' +
				'<h4 class="sr-card-title">Live chat <span class="sr-dim">(text only)</span></h4>' +
				'<ul class="sr-chat" aria-live="polite">' + room.chat.map(m =>
					m.sys
						? '<li class="sr-chat-sys">' + escapeHtml(m.text) + '</li>'
						: '<li><strong>' + escapeHtml(m.author) + '</strong> <span class="sr-dim">' + escapeHtml(m.at) + '</span><br>' + escapeHtml(m.text) + '</li>').join('') + '</ul>' +
				'<form class="sr-row sr-chatform">' +
					'<label class="sr-label sr-sr" for="sr-chatmsg">Send a chat message</label>' +
					'<input class="sr-input" id="sr-chatmsg" maxlength="500" placeholder="Write a message…" autocomplete="off">' +
					'<button type="submit" class="sr-btn sr-btn-primary">Send</button>' +
				'</form>' +
			'</section>' +
		'</div>';

	el.querySelector('.sr-back').addEventListener('click', () => { view = { screen: 'list', roomId: null }; render(); });

	const textForm = el.querySelector('.sr-textform');
	if (textForm) textForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const v = e.target.querySelector('#sr-textedit').value.trim();
		if (v) { room.currentText = v; persistRoom(room); render(); }
	});

	el.querySelector('[data-raise]').addEventListener('click', () => {
		const i = room.hands.indexOf(me);
		if (i >= 0) room.hands.splice(i, 1);
		else room.hands.push(me);
		persistRoom(room);
		render();
	});

	el.querySelector('[data-pass]')?.addEventListener('click', () => {
		const done = room.hands.shift();
		if (done) room.chat.push({ author: '—', at: nowTime(), text: done + ' finished their turn.', sys: true });
		persistRoom(room);
		render();
	});

	el.querySelector('.sr-noteform').addEventListener('submit', (e) => {
		e.preventDefault();
		const input = e.target.querySelector('#sr-note');
		const v = input.value.trim();
		if (!v) return;
		room.notes.push({ author: me, at: nowTime(), text: v });
		persistRoom(room);
		render();
	});

	el.querySelector('.sr-chatform').addEventListener('submit', (e) => {
		e.preventDefault();
		const input = e.target.querySelector('#sr-chatmsg');
		const v = input.value.trim();
		if (!v) return;
		room.chat.push({ author: me, at: nowTime(), text: v });
		persistRoom(room);
		render();
		const list = el.querySelector('.sr-chat');
		if (list) list.scrollTop = list.scrollHeight;
	});
}
