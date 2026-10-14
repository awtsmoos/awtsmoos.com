// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module Mentors
 * @description
 * Yaakov 2026-10-13: TRACK H — mentor matching for the Awtsmoos feed.
 *
 * A floating "Find a mentor" button opens the mentoring panel with two
 * sides:
 *   - Learner: request a mentor (subject, level, availability, goals).
 *     Matching scores sample mentor profiles; each match offers an intro
 *     message thread.
 *   - Mentor: opt in with display name, expertise areas, availability and
 *     a short bio. The mentor dashboard shows mentees, per-mentee progress
 *     (0–100 with a note) and session notes.
 *
 * Privacy: nothing is shared beyond what each side types in. User-facing
 * text never exposes raw IDs or machine slugs.
 *
 * NOTE: mentor profiles beyond your own live in a small on-device sample
 * pool, clearly labeled as samples, until a live matching service exists.
 */

const LS_PROFILE = 'awtsmoos-mentors-profile-v1';   // { role, name, ... }
const LS_MENTORS = 'awtsmoos-mentors-local-v1';      // mentors added on this device
const LS_INTROS = 'awtsmoos-mentors-intros-v1';       // intro threads, keyed by mentor id
const LS_MENTEES = 'awtsmoos-mentors-mentees-v1';     // mentor dashboard: [{mentorId, name, progress, note, sessions:[...]}]

const SUBJECTS = [
	'Chumash', 'Nach', 'Mishnah', 'Gemara', 'Halachah',
	'Chassidus', 'Tehillim', 'Mussar', 'Tanya', 'Likkutei Sichos'
];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];

/* B"H — sample mentor pool, labeled "sample" in the UI. */
const SAMPLE_MENTORS = [
	{ id: 'sm-dovid', name: 'Reb Dovid', sample: true, expertise: ['Gemara', 'Halachah'], levels: ['Beginner', 'Intermediate'], days: ['Sun', 'Wed'], tod: 'Evening', bio: 'Learning daf yomi for 12 years; loves walking beginners through their first sugya.' },
	{ id: 'sm-miriam', name: 'Miriam', sample: true, expertise: ['Tehillim', 'Mussar'], levels: ['Beginner'], days: ['Mon', 'Thu'], tod: 'Morning', bio: 'Teaches Tehillim with the classic commentaries; gentle pace, lots of encouragement.' },
	{ id: 'sm-yossi', name: 'Yossi', sample: true, expertise: ['Chumash', 'Nach'], levels: ['Intermediate', 'Advanced'], days: ['Tue'], tod: 'Evening', bio: 'Nach enthusiast — we learn with maps, timelines, and the mefarshim.' },
	{ id: 'sm-chana', name: 'Chana', sample: true, expertise: ['Chassidus', 'Tanya'], levels: ['Intermediate'], days: ['Sun', 'Thu'], tod: 'Afternoon', bio: 'Studying Tanya chapter by chapter; happy to go slow and deep.' },
	{ id: 'sm-ari', name: 'Ari', sample: true, expertise: ['Mishnah', 'Halachah'], levels: ['Beginner', 'Intermediate'], days: ['Wed', 'Fri'], tod: 'Morning', bio: 'Practical halachah with sources; we learn the Mishnah Berurah together.' }
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

function nowStamp() {
	try {
		return new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	} catch (_) { return ''; }
}

function allMentors() {
	const local = readJson(LS_MENTORS, []);
	return SAMPLE_MENTORS.concat(local);
}

function scoreMatch(req, m) {
	let score = 0;
	if (m.expertise.includes(req.subject)) score += 45;
	if (m.levels.includes(req.level)) score += 25;
	const overlap = (req.days || []).filter(d => m.days.includes(d)).length;
	score += Math.min(20, overlap * 10);
	if (req.tod && m.tod === req.tod) score += 10;
	return score;
}

function svgMentor() {
	return '<svg class="mt-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.7-3.6 3.3-5.6 6.5-5.6s5.8 2 6.5 5.6"/><path d="M17.5 3.5l1.2 2.4 2.6.4-1.9 1.9.5 2.6-2.4-1.2-2.4 1.2.5-2.6-1.9-1.9 2.6-.4z" stroke-width="1.2"/></svg>';
}

/* ------------------------------------------------------------------ */
/* panel                                                               */
/* ------------------------------------------------------------------ */

let overlay = null;
let view = { tab: 'learner', matchId: null, threadId: null };

export function initMentors() {
	const stage = document.getElementById('feed-stage') || document.body;
	if (stage.querySelector('.mt-fab')) return;
	const fab = document.createElement('button');
	fab.type = 'button';
	fab.className = 'mt-fab';
	fab.setAttribute('aria-label', 'Find a mentor');
	fab.title = 'Find a mentor';
	fab.innerHTML = svgMentor() + '<span>Find a mentor</span>';
	fab.addEventListener('click', openPanel);
	stage.append(fab);
}

function closePanel() {
	if (overlay) { overlay.remove(); overlay = null; }
	document.removeEventListener('keydown', onKey, true);
}

function onKey(e) { if (e.key === 'Escape') closePanel(); }

function openPanel() {
	if (overlay) return;
	overlay = document.createElement('div');
	overlay.className = 'mt-overlay';
	overlay.innerHTML =
		'<div class="mt-panel" role="dialog" aria-modal="true" aria-label="Mentor matching">' +
			'<div class="mt-panel-head">' +
				'<h2 class="mt-panel-title">Mentors</h2>' +
				'<button type="button" class="mt-close" aria-label="Close mentors">✕</button>' +
			'</div>' +
			'<div class="mt-tabs" role="tablist">' +
				'<button type="button" class="mt-tab" role="tab" data-tab="learner">I want a mentor</button>' +
				'<button type="button" class="mt-tab" role="tab" data-tab="mentor">I am a mentor</button>' +
			'</div>' +
			'<div class="mt-panel-body"></div>' +
		'</div>';
	document.body.append(overlay);
	overlay.querySelector('.mt-close').addEventListener('click', closePanel);
	overlay.addEventListener('click', (e) => { if (e.target === overlay) closePanel(); });
	overlay.querySelectorAll('.mt-tab').forEach(t => t.addEventListener('click', () => {
		view = { tab: t.dataset.tab, matchId: null, threadId: null };
		render();
	}));
	document.addEventListener('keydown', onKey, true);
	render();
}

function body() { return overlay.querySelector('.mt-panel-body'); }

function paintTabs() {
	overlay.querySelectorAll('.mt-tab').forEach(t => {
		const active = t.dataset.tab === view.tab;
		t.classList.toggle('is-active', active);
		t.setAttribute('aria-selected', active ? 'true' : 'false');
	});
}

function render() {
	if (!overlay) return;
	paintTabs();
	if (view.tab === 'mentor') renderMentorSide();
	else renderLearnerSide();
}

/* ------------------------------------------------------------------ */
/* learner side                                                        */
/* ------------------------------------------------------------------ */

function renderLearnerSide() {
	const el = body();
	const profile = readJson(LS_PROFILE, {});
	const req = profile.request || null;

	if (view.threadId) { renderThread(el); return; }

	let matchesHtml = '';
	if (req) {
		const scored = allMentors()
			.map(m => ({ m, score: scoreMatch(req, m) }))
			.filter(x => x.score > 0)
			.sort((a, b) => b.score - a.score);
		matchesHtml =
			'<div class="mt-matches">' +
				'<h3 class="mt-h3">Your matches</h3>' +
				(req.goals ? '<p class="mt-dim">Your goals: ' + escapeHtml(req.goals) + '</p>' : '') +
				(scored.length
					? scored.map(x => matchCard(x.m, x.score)).join('')
					: '<p class="mt-dim">No mentors match yet — try widening your availability.</p>') +
				'<button type="button" class="mt-linkbtn" data-editreq>Change my request</button>' +
			'</div>';
	}

	el.innerHTML =
		'<div class="mt-section">' +
			'<p class="mt-lede">Tell us what you want to learn, and we will suggest mentors. Sample mentors are labeled.</p>' +
			(matchesHtml || requestForm(req)) +
		'</div>';

	el.querySelector('#mt-reqform')?.addEventListener('submit', (e) => {
		e.preventDefault();
		const fd = new FormData(e.target);
		const days = DAYS.filter(d => fd.get('day-' + d));
		const request = {
			subject: fd.get('subject').toString(),
			level: fd.get('level').toString(),
			tod: fd.get('tod').toString(),
			days,
			goals: fd.get('goals').toString().trim().slice(0, 300)
		};
		writeJson(LS_PROFILE, Object.assign({}, readJson(LS_PROFILE, {}), { request }));
		view.matchId = null;
		render();
	});

	el.querySelector('[data-editreq]')?.addEventListener('click', () => {
		el.innerHTML = '<div class="mt-section">' + requestForm(req) + '</div>';
		el.querySelector('#mt-reqform')?.addEventListener('submit', (e) => {
			e.preventDefault();
			const fd = new FormData(e.target);
			const days = DAYS.filter(d => fd.get('day-' + d));
			writeJson(LS_PROFILE, Object.assign({}, readJson(LS_PROFILE, {}), {
				request: {
					subject: fd.get('subject').toString(),
					level: fd.get('level').toString(),
					tod: fd.get('tod').toString(),
					days,
					goals: fd.get('goals').toString().trim().slice(0, 300)
				}
			}));
			render();
		});
	});

	el.querySelectorAll('[data-intro]').forEach(btn => btn.addEventListener('click', () => {
		view.threadId = btn.dataset.intro;
		render();
	}));
}

function requestForm(req) {
	const r = req || { subject: 'Gemara', level: 'Beginner', tod: 'Evening', days: [], goals: '' };
	return '<form class="mt-card" id="mt-reqform">' +
		'<h3 class="mt-h3">Request a mentor</h3>' +
		'<div class="mt-grid2">' +
			'<label class="mt-label">Subject<select class="mt-input" name="subject">' + SUBJECTS.map(s => `<option${s === r.subject ? ' selected' : ''}>${escapeHtml(s)}</option>`).join('') + '</select></label>' +
			'<label class="mt-label">My level<select class="mt-input" name="level">' + LEVELS.map(s => `<option${s === r.level ? ' selected' : ''}>${escapeHtml(s)}</option>`).join('') + '</select></label>' +
		'</div>' +
		'<label class="mt-label">Preferred time of day<select class="mt-input" name="tod">' + ['Morning', 'Afternoon', 'Evening'].map(s => `<option${s === r.tod ? ' selected' : ''}>${escapeHtml(s)}</option>`).join('') + '</select></label>' +
		'<fieldset class="mt-fieldset"><legend class="mt-legend">Days I am free</legend><div class="mt-chips">' +
			DAYS.map(d => '<label class="mt-chip"><input type="checkbox" name="day-' + d + '"' + (r.days.includes(d) ? ' checked' : '') + '> ' + d + '</label>').join('') +
		'</div></fieldset>' +
		'<label class="mt-label">My goals (optional)<textarea class="mt-input mt-textarea" name="goals" rows="2" maxlength="300" placeholder="e.g. Finish the first chapter of Tanya by spring">' + escapeHtml(r.goals) + '</textarea></label>' +
		'<button type="submit" class="mt-btn mt-btn-primary">Find my matches</button>' +
	'</form>';
}

function matchCard(m, score) {
	return '<article class="mt-card mt-match">' +
		'<div class="mt-row"><h4 class="mt-h4">' + escapeHtml(m.name) + '</h4>' +
		(m.sample ? '<span class="mt-tag">sample</span>' : '') +
		'<span class="mt-score">' + score + '% match</span></div>' +
		'<p class="mt-dim">Teaches: ' + m.expertise.map(escapeHtml).join(', ') + ' · Levels: ' + m.levels.map(escapeHtml).join(', ') + '</p>' +
		'<p class="mt-bio">' + escapeHtml(m.bio) + '</p>' +
		'<p class="mt-dim">Free: ' + m.days.map(escapeHtml).join(', ') + ' ' + escapeHtml(m.tod).toLowerCase() + '</p>' +
		'<button type="button" class="mt-btn" data-intro="' + escapeHtml(m.id) + '">Send an intro message</button>' +
	'</article>';
}

function renderThread(el) {
	const mentor = allMentors().find(m => m.id === view.threadId);
	if (!mentor) { view.threadId = null; render(); return; }
	const intros = readJson(LS_INTROS, {});
	const thread = intros[mentor.id] || [];
	el.innerHTML =
		'<div class="mt-section">' +
			'<button type="button" class="mt-btn mt-back">← Back to matches</button>' +
			'<h3 class="mt-h3">Intro to ' + escapeHtml(mentor.name) + '</h3>' +
			'<ul class="mt-chat" aria-live="polite">' +
				(thread.length
					? thread.map(m => '<li class="' + (m.mine ? 'mine' : '') + '"><strong>' + escapeHtml(m.author) + '</strong> <span class="mt-dim">' + escapeHtml(m.at) + '</span><br>' + escapeHtml(m.text) + '</li>').join('')
					: '<li class="mt-dim">No messages yet — say hello and share what you want to learn.</li>') +
			'</ul>' +
			'<form class="mt-row" id="mt-introform">' +
				'<label class="mt-label mt-sr" for="mt-intromsg">Intro message</label>' +
				'<input class="mt-input" id="mt-intromsg" maxlength="500" placeholder="Write your intro…" autocomplete="off">' +
				'<button type="submit" class="mt-btn mt-btn-primary">Send</button>' +
			'</form>' +
			'<button type="button" class="mt-btn" data-accept="' + escapeHtml(mentor.id) + '">Accept as my mentor</button>' +
		'</div>';

	el.querySelector('.mt-back').addEventListener('click', () => { view.threadId = null; render(); });
	el.querySelector('#mt-introform').addEventListener('submit', (e) => {
		e.preventDefault();
		const input = el.querySelector('#mt-intromsg');
		const v = input.value.trim();
		if (!v) return;
		const all = readJson(LS_INTROS, {});
		const t = all[mentor.id] || [];
		t.push({ author: 'You', at: nowStamp(), text: v, mine: true });
		all[mentor.id] = t;
		writeJson(LS_INTROS, all);
		render();
	});
	el.querySelector('[data-accept]').addEventListener('click', () => {
		const mentees = readJson(LS_MENTEES, []);
		if (!mentees.some(x => x.mentorId === mentor.id)) {
			mentees.push({ mentorId: mentor.id, name: mentor.name, progress: 0, note: '', sessions: [] });
			writeJson(LS_MENTEES, mentees);
		}
		view.threadId = null;
		render();
	});
}

/* ------------------------------------------------------------------ */
/* mentor side                                                         */
/* ------------------------------------------------------------------ */

function renderMentorSide() {
	const el = body();
	const me = readJson(LS_PROFILE, {}).mentor || null;
	const mentees = readJson(LS_MENTEES, []);

	el.innerHTML =
		'<div class="mt-section">' +
			(me ? mentorDashboard(me, mentees) : mentorOptIn()) +
		'</div>';

	el.querySelector('#mt-optinform')?.addEventListener('submit', (e) => {
		e.preventDefault();
		const fd = new FormData(e.target);
		const expertise = SUBJECTS.filter(s => fd.get('exp-' + s));
		if (!expertise.length) { alert('Please choose at least one area of expertise.'); return; }
		const levels = LEVELS.filter(l => fd.get('lvl-' + l));
		const days = DAYS.filter(d => fd.get('day-' + d));
		const mentor = {
			id: 'local-' + Date.now().toString(36),
			name: fd.get('name').toString().trim().slice(0, 40) || 'Mentor',
			expertise, levels: levels.length ? levels : LEVELS.slice(),
			days, tod: fd.get('tod').toString(),
			bio: fd.get('bio').toString().trim().slice(0, 300),
			sample: false
		};
		const local = readJson(LS_MENTORS, []);
		local.push(mentor);
		writeJson(LS_MENTORS, local);
		writeJson(LS_PROFILE, Object.assign({}, readJson(LS_PROFILE, {}), { mentor }));
		render();
	});

	el.querySelector('[data-unlist]')?.addEventListener('click', () => {
		const profile = readJson(LS_PROFILE, {});
		const local = readJson(LS_MENTORS, []).filter(m => m.id !== (profile.mentor || {}).id);
		writeJson(LS_MENTORS, local);
		delete profile.mentor;
		writeJson(LS_PROFILE, profile);
		render();
	});

	// Dashboard interactions
	el.querySelectorAll('[data-prog]').forEach(range => range.addEventListener('change', () => {
		const list = readJson(LS_MENTEES, []);
		const m = list.find(x => x.mentorId === range.dataset.prog);
		if (m) { m.progress = Number(range.value); writeJson(LS_MENTEES, list); render(); }
	}));
	el.querySelectorAll('[data-noteform]').forEach(form => form.addEventListener('submit', (e) => {
		e.preventDefault();
		const id = form.dataset.noteform;
		const list = readJson(LS_MENTEES, []);
		const m = list.find(x => x.mentorId === id);
		const note = form.querySelector('input').value.trim();
		if (m && note) {
			m.sessions.push({ at: nowStamp(), text: note });
			writeJson(LS_MENTEES, list);
			render();
		}
	}));
	el.querySelectorAll('[data-remove-mentee]').forEach(btn => btn.addEventListener('click', () => {
		writeJson(LS_MENTEES, readJson(LS_MENTEES, []).filter(x => x.mentorId !== btn.dataset.removeMentee));
		render();
	}));
}

function mentorOptIn() {
	return '<form class="mt-card" id="mt-optinform">' +
		'<h3 class="mt-h3">Become a mentor</h3>' +
		'<p class="mt-lede">Share what you know. Only what you type here is ever shown to learners.</p>' +
		'<label class="mt-label">Display name<input class="mt-input" name="name" maxlength="40" required placeholder="e.g. Reb Dovid"></label>' +
		'<fieldset class="mt-fieldset"><legend class="mt-legend">Areas of expertise</legend><div class="mt-chips">' +
			SUBJECTS.map(s => '<label class="mt-chip"><input type="checkbox" name="exp-' + escapeHtml(s) + '"> ' + escapeHtml(s) + '</label>').join('') +
		'</div></fieldset>' +
		'<fieldset class="mt-fieldset"><legend class="mt-legend">Levels you teach</legend><div class="mt-chips">' +
			LEVELS.map(l => '<label class="mt-chip"><input type="checkbox" name="lvl-' + l + '" checked> ' + l + '</label>').join('') +
		'</div></fieldset>' +
		'<fieldset class="mt-fieldset"><legend class="mt-legend">Days you are free</legend><div class="mt-chips">' +
			DAYS.map(d => '<label class="mt-chip"><input type="checkbox" name="day-' + d + '"> ' + d + '</label>').join('') +
		'</div></fieldset>' +
		'<label class="mt-label">Preferred time of day<select class="mt-input" name="tod"><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label>' +
		'<label class="mt-label">Short bio<textarea class="mt-input mt-textarea" name="bio" rows="2" maxlength="300" placeholder="A sentence or two about your learning…"></textarea></label>' +
		'<button type="submit" class="mt-btn mt-btn-primary">List me as a mentor</button>' +
	'</form>';
}

function mentorDashboard(me, mentees) {
	return '<div class="mt-card">' +
		'<div class="mt-row"><h3 class="mt-h3">Mentor dashboard</h3>' +
		'<button type="button" class="mt-linkbtn mt-danger" data-unlist>Stop listing me</button></div>' +
		'<p class="mt-dim">Listed as <strong>' + escapeHtml(me.name) + '</strong> · ' + me.expertise.map(escapeHtml).join(', ') + '</p>' +
	'</div>' +
	'<h3 class="mt-h3">My mentees (' + mentees.length + ')</h3>' +
	(mentees.length
		? mentees.map(m =>
			'<article class="mt-card">' +
				'<div class="mt-row"><h4 class="mt-h4">' + escapeHtml(m.name) + '</h4>' +
				'<button type="button" class="mt-linkbtn mt-danger" data-remove-mentee="' + escapeHtml(m.mentorId) + '">Remove</button></div>' +
				'<label class="mt-label">Progress: ' + m.progress + '%<input type="range" class="mt-range" min="0" max="100" step="5" value="' + m.progress + '" data-prog="' + escapeHtml(m.mentorId) + '"></label>' +
				'<div class="mt-progress"><div class="mt-progress-fill" style="width:' + m.progress + '%"></div></div>' +
				'<h5 class="mt-h5">Session notes</h5>' +
				'<ul class="mt-sessions">' + (m.sessions.length
					? m.sessions.map(s => '<li><span class="mt-dim">' + escapeHtml(s.at) + '</span> — ' + escapeHtml(s.text) + '</li>').join('')
					: '<li class="mt-dim">No session notes yet.</li>') + '</ul>' +
				'<form class="mt-row" data-noteform="' + escapeHtml(m.mentorId) + '">' +
					'<label class="mt-label mt-sr" for="mt-note-' + escapeHtml(m.mentorId) + '">Add a session note</label>' +
					'<input class="mt-input" id="mt-note-' + escapeHtml(m.mentorId) + '" maxlength="300" placeholder="Add a session note…">' +
					'<button type="submit" class="mt-btn">Add</button>' +
				'</form>' +
			'</article>').join('')
		: '<p class="mt-dim">No mentees yet. When a learner accepts you as their mentor, they will appear here.</p>');
}
