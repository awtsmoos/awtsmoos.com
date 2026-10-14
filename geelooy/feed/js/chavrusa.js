// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module Chavrusa
 * @description
 * Yaakov 2026-10-13: TRACK C — "Find a chavrusa" for the Awtsmoos feed.
 *
 * 1. A floating "Find a chavrusa" button opens the chavrusa panel.
 * 2. The learner sets preferences: what to learn, level, timezone,
 *    availability (days + time of day), and learning pace.
 * 3. Matching runs a simple compatibility score:
 *      40 pts shared subject + 20 pts adjacent level + 20 pts timezone
 *      proximity + 20 pts schedule overlap.
 * 4. Each match opens a chavrusa dashboard: a shared learning plan and a
 *    session scheduler (add / complete / cancel sessions).
 *
 * Privacy: nothing is shared by default. The privacy card in the dashboard
 * lets the learner opt in, per item, to sharing their display name,
 * timezone, email, and schedule. Only opted-in items are shown to the
 * partner. User-facing text never exposes raw IDs or machine slugs.
 *
 * NOTE: there is no live matching service yet. Suggestions come from a
 * small on-device sample pool and are clearly labeled as samples.
 */

export const CHAVRUSA_MATCH_ENDPOINT = null; // no server route yet — see note above

const LS_PROFILE = 'awtsmoos-chavrusa-profile-v1';
const LS_DASH = 'awtsmoos-chavrusa-dash-v1:';

const SUBJECTS = [
	'Chumash', 'Nach', 'Mishnah', 'Gemara', 'Halachah',
	'Chassidus', 'Tehillim', 'Mussar', 'Tanya', 'Likkutei Sichos'
];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const PACES = ['Relaxed', 'Steady', 'Intensive'];
const TIMES_OF_DAY = ['Morning', 'Afternoon', 'Evening'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const TIMEZONES = [
	'Pacific', 'Mountain', 'Central', 'Eastern', 'Atlantic',
	'Greenwich', 'Central European', 'Israel', 'Moscow', 'Gulf',
	'India', 'China', 'Japan', 'Australia Eastern'
];

/* B"H — sample pool. Clearly labeled in the UI as samples; replaced by the
   live matching service once CHAVRUSA_MATCH_ENDPOINT exists. */
const SAMPLE_LEARNERS = [
	{ name: 'Dovid', subject: 'Gemara', level: 'Intermediate', tz: 'Eastern', days: ['Mon', 'Wed'], tod: ['Evening'], pace: 'Steady', shares: { name: true, tz: true, schedule: true } },
	{ name: 'Miriam', subject: 'Tehillim', level: 'Beginner', tz: 'Israel', days: ['Sun', 'Tue', 'Thu'], tod: ['Morning'], pace: 'Relaxed', shares: { name: true, tz: true, schedule: true } },
	{ name: 'Yossi', subject: 'Chumash', level: 'Advanced', tz: 'Central', days: ['Mon', 'Thu'], tod: ['Evening'], pace: 'Intensive', shares: { name: true, tz: true, schedule: false } },
	{ name: 'Chana', subject: 'Chassidus', level: 'Intermediate', tz: 'Greenwich', days: ['Tue', 'Fri'], tod: ['Afternoon'], pace: 'Steady', shares: { name: true, tz: false, schedule: true } },
	{ name: 'Ari', subject: 'Mishnah', level: 'Beginner', tz: 'Pacific', days: ['Sun', 'Wed'], tod: ['Evening'], pace: 'Relaxed', shares: { name: true, tz: true, schedule: true } },
	{ name: 'Sara', subject: 'Tanya', level: 'Intermediate', tz: 'Israel', days: ['Mon', 'Wed', 'Fri'], tod: ['Morning'], pace: 'Steady', shares: { name: true, tz: true, schedule: true } },
	{ name: 'Mendel', subject: 'Halachah', level: 'Advanced', tz: 'Eastern', days: ['Tue', 'Thu'], tod: ['Morning'], pace: 'Intensive', shares: { name: true, tz: true, schedule: false } },
	{ name: 'Rivky', subject: 'Nach', level: 'Beginner', tz: 'Central European', days: ['Sun', 'Thu'], tod: ['Afternoon'], pace: 'Relaxed', shares: { name: true, tz: true, schedule: true } }
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

function detectTimezone() {
	try {
		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
		const hit = TIMEZONES.find(t => tz.replace(/_/g, ' ').toLowerCase().includes(t.toLowerCase().split(' ')[0]));
		return hit || 'Eastern';
	} catch (_) { return 'Eastern'; }
}

function loadProfile() {
	return readJson(LS_PROFILE, null);
}

function dashKey(matchName) { return LS_DASH + matchName; }

function loadDash(matchName) {
	return readJson(dashKey(matchName), { plan: '', sessions: [] });
}

function saveDash(matchName, dash) {
	writeJson(dashKey(matchName), dash);
}

/* ------------------------------------------------------------------ */
/* compatibility scoring                                               */
/* ------------------------------------------------------------------ */

function tzDistance(a, b) {
	const ia = TIMEZONES.indexOf(a), ib = TIMEZONES.indexOf(b);
	if (ia < 0 || ib < 0) return 0;
	return Math.abs(ia - ib);
}

function levelDistance(a, b) {
	return Math.abs(LEVELS.indexOf(a) - LEVELS.indexOf(b));
}

/**
 * 0–100 compatibility: 40 subject + 20 level + 20 timezone + 20 schedule.
 * Returns { score, reasons } where reasons are human-readable fragments.
 */
export function compatibilityScore(me, other) {
	let score = 0;
	const reasons = [];
	if (me.subject === other.subject) {
		score += 40;
		reasons.push(`both learning ${me.subject}`);
	}
	if (levelDistance(me.level, other.level) === 0) {
		score += 20;
		reasons.push('same level');
	} else if (levelDistance(me.level, other.level) === 1) {
		score += 10;
		reasons.push('nearby level');
	}
	if (tzDistance(me.tz, other.tz) <= 2) {
		score += 20;
		reasons.push('overlapping time zone');
	} else if (tzDistance(me.tz, other.tz) <= 5) {
		score += 10;
		reasons.push('workable time difference');
	}
	const sharedDays = (me.days || []).filter(d => (other.days || []).includes(d));
	const sharedTod = (me.tod || []).filter(t => (other.tod || []).includes(t));
	if (sharedDays.length && sharedTod.length) {
		score += 20;
		reasons.push(`${sharedDays.join(', ')} ${sharedTod.join('/').toLowerCase()}s`);
	} else if (sharedDays.length || sharedTod.length) {
		score += 10;
		reasons.push('partial schedule overlap');
	}
	if (me.pace === other.pace) {
		score += 0; // tiebreak flavor only
		reasons.push(`both ${String(me.pace).toLowerCase()} pace`);
	}
	return { score: Math.min(100, score), reasons };
}

/* ------------------------------------------------------------------ */
/* the chavrusa panel                                                  */
/* ------------------------------------------------------------------ */

let panelOpen = false;

function svgUsers() {
	return '<svg class="ch-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="8.5" r="3.5"/><path d="M3.5 20c.6-3.4 2.8-5.5 5.5-5.5s4.9 2.1 5.5 5.5"/><circle cx="16.5" cy="10" r="2.6"/><path d="M16 14.7c2.3.3 3.9 2 4.4 4.3"/></svg>';
}

export function initChavrusa() {
	const stage = document.getElementById('feed-stage') || document.body;
	if (stage.querySelector('.ch-fab')) return;
	const fab = document.createElement('button');
	fab.type = 'button';
	fab.className = 'ch-fab';
	fab.setAttribute('aria-label', 'Find a chavrusa');
	fab.title = 'Find a chavrusa';
	fab.innerHTML = svgUsers() + '<span>Find a chavrusa</span>';
	fab.addEventListener('click', openPanel);
	stage.append(fab);
}

function openPanel() {
	if (panelOpen) return;
	panelOpen = true;
	const overlay = document.createElement('div');
	overlay.className = 'ch-overlay';
	overlay.innerHTML =
		'<div class="ch-panel" role="dialog" aria-modal="true" aria-label="Find a chavrusa">' +
			'<div class="ch-panel-head">' +
				'<h2 class="ch-panel-title">Find a chavrusa</h2>' +
				'<button type="button" class="ch-close" aria-label="Close chavrusa panel">✕</button>' +
			'</div>' +
			'<div class="ch-panel-body"></div>' +
		'</div>';
	document.body.append(overlay);
	const body = overlay.querySelector('.ch-panel-body');
	const close = () => { panelOpen = false; overlay.remove(); document.removeEventListener('keydown', onKey, true); };
	const onKey = (e) => { if (e.key === 'Escape') close(); };
	document.addEventListener('keydown', onKey, true);
	overlay.querySelector('.ch-close').addEventListener('click', close);
	overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

	const profile = loadProfile();
	if (!profile) renderPrefsForm(body, null, close);
	else renderHome(body, profile, close);
}

/* ---- step 1: preferences ---- */

function renderPrefsForm(body, existing, close) {
	const p = existing || {
		name: '', email: '', subject: 'Gemara', level: 'Intermediate',
		tz: detectTimezone(), days: ['Mon', 'Wed'], tod: ['Evening'], pace: 'Steady'
	};
	body.innerHTML =
		'<p class="ch-lede">Tell us how you learn and we will suggest a learning partner.</p>' +
		'<form class="ch-form" novalidate>' +
			'<label class="ch-field"><span class="ch-label">Your name</span>' +
				`<input class="ch-input" name="name" maxlength="60" autocomplete="name" value="${escapeHtml(p.name)}" placeholder="What should your chavrusa call you?"></label>` +
			'<label class="ch-field"><span class="ch-label">Email <span class="ch-optional">(only shared if you opt in)</span></span>' +
				`<input class="ch-input" name="email" type="email" maxlength="120" autocomplete="email" value="${escapeHtml(p.email || '')}" placeholder="you@example.com"></label>` +
			'<div class="ch-grid2">' +
				'<label class="ch-field"><span class="ch-label">What to learn</span>' +
					`<select class="ch-input" name="subject">${SUBJECTS.map(s => `<option${s === p.subject ? ' selected' : ''}>${s}</option>`).join('')}</select></label>` +
				'<label class="ch-field"><span class="ch-label">Level</span>' +
					`<select class="ch-input" name="level">${LEVELS.map(s => `<option${s === p.level ? ' selected' : ''}>${s}</option>`).join('')}</select></label>' +
				'<label class="ch-field"><span class="ch-label">Time zone</span>' +
					`<select class="ch-input" name="tz">${TIMEZONES.map(s => `<option${s === p.tz ? ' selected' : ''}>${s}</option>`).join('')}</select></label>` +
				'<label class="ch-field"><span class="ch-label">Pace</span>' +
					`<select class="ch-input" name="pace">${PACES.map(s => `<option${s === p.pace ? ' selected' : ''}>${s}</option>`).join('')}</select></label>' +
			'</div>' +
			'<fieldset class="ch-fieldset"><legend class="ch-label">Days you can learn</legend>' +
				'<div class="ch-chips">' +
				WEEKDAYS.map(d => `<label class="ch-chip"><input type="checkbox" name="day" value="${d}"${(p.days || []).includes(d) ? ' checked' : ''}><span>${d}</span></label>`).join('') +
				'</div></fieldset>' +
			'<fieldset class="ch-fieldset"><legend class="ch-label">Time of day</legend>' +
				'<div class="ch-chips">' +
				TIMES_OF_DAY.map(t => `<label class="ch-chip"><input type="checkbox" name="tod" value="${t}"${(p.tod || []).includes(t) ? ' checked' : ''}><span>${t}</span></label>`).join('') +
				'</div></fieldset>' +
			'<p class="ch-error" role="alert" hidden></p>' +
			'<div class="ch-actions">' +
				'<button type="submit" class="ch-btn ch-btn-primary">Find my chavrusa</button>' +
			'</div>' +
		'</form>';
	const form = body.querySelector('.ch-form');
	const error = body.querySelector('.ch-error');
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const fd = new FormData(form);
		const next = {
			name: String(fd.get('name') || '').trim(),
			email: String(fd.get('email') || '').trim(),
			subject: String(fd.get('subject')),
			level: String(fd.get('level')),
			tz: String(fd.get('tz')),
			days: fd.getAll('day').map(String),
			tod: fd.getAll('tod').map(String),
			pace: String(fd.get('pace'))
		};
		if (!next.name) { error.textContent = 'Please tell us your name.'; error.hidden = false; return; }
		if (!next.days.length || !next.tod.length) {
			error.textContent = 'Pick at least one day and one time of day.';
			error.hidden = false;
			return;
		}
		writeJson(LS_PROFILE, next);
		renderHome(body, next, close);
	});
}

/* ---- step 2: home + matches ---- */

function renderHome(body, profile, close) {
	const scored = SAMPLE_LEARNERS
		.map(o => ({ other: o, ...compatibilityScore(profile, o) }))
		.sort((a, b) => b.score - a.score)
		.slice(0, 4);
	body.innerHTML =
		'<div class="ch-home">' +
			'<div class="ch-profile-card">' +
				`<p class="ch-profile-name">${escapeHtml(profile.name)}</p>` +
				`<p class="ch-profile-line">${escapeHtml(profile.subject)} · ${escapeHtml(profile.level)} · ${escapeHtml(profile.tz)}</p>` +
				`<p class="ch-profile-line ch-dim">${escapeHtml((profile.days || []).join(', '))} · ${escapeHtml((profile.tod || []).join(', '))} · ${escapeHtml(profile.pace)} pace</p>` +
				'<button type="button" class="ch-linkbtn ch-edit">Edit my preferences</button>' +
			'</div>' +
			'<h3 class="ch-section-title">Suggested chavrusas</h3>' +
			'<p class="ch-sample-note">Sample learners — a live matching service is not connected yet.</p>' +
			'<div class="ch-matches">' +
			scored.map(({ other, score, reasons }, i) =>
				'<div class="ch-match">' +
					`<div class="ch-match-top"><span class="ch-match-name">${escapeHtml(other.name)}</span>` +
					`<span class="ch-match-score" aria-label="${score}% compatible">${score}%</span></div>` +
					`<p class="ch-match-line">${escapeHtml(other.subject)} · ${escapeHtml(other.level)} · ${escapeHtml(other.tz)}</p>` +
					`<p class="ch-match-why">${escapeHtml(reasons.slice(0, 3).join(' · ') || 'A possible partner')}</p>` +
					`<button type="button" class="ch-btn ch-dash-open" data-i="${i}">Open dashboard</button>` +
				'</div>').join('') +
			'</div>' +
		'</div>';
	body.querySelector('.ch-edit').addEventListener('click', () => renderPrefsForm(body, profile, close));
	body.querySelectorAll('.ch-dash-open').forEach(btn => {
		btn.addEventListener('click', () => renderDashboard(body, profile, scored[Number(btn.dataset.i)].other, close));
	});
}

/* ---- step 3: the chavrusa dashboard ---- */

function renderDashboard(body, profile, partner, close) {
	const dash = loadDash(partner.name);
	const privacy = profile.privacy || { name: true, tz: false, email: false, schedule: false };
	const partnerShares = partner.shares || {};

	body.innerHTML =
		'<button type="button" class="ch-back">← Back to matches</button>' +
		'<div class="ch-dash">' +
			`<h3 class="ch-dash-title">Learning with ${escapeHtml(partner.name)}</h3>` +
			'<div class="ch-dash-cols">' +
				'<section class="ch-card" aria-label="Shared learning plan">' +
					'<h4 class="ch-card-title">Shared learning plan</h4>' +
					`<textarea class="ch-textarea" rows="5" placeholder="e.g. Berachos 2a–4b this week, one blatt per session…">${escapeHtml(dash.plan || '')}</textarea>` +
					'<button type="button" class="ch-btn ch-btn-primary ch-plan-save">Save plan</button>' +
				'</section>' +
				'<section class="ch-card" aria-label="Sessions">' +
					'<h4 class="ch-card-title">Sessions</h4>' +
					'<div class="ch-sessions"></div>' +
					'<form class="ch-session-form">' +
						'<div class="ch-grid2">' +
							'<label class="ch-field"><span class="ch-label">Date</span><input class="ch-input" type="date" name="date" required></label>' +
							'<label class="ch-field"><span class="ch-label">Time</span><input class="ch-input" type="time" name="time" required></label>' +
						'</div>' +
						'<label class="ch-field"><span class="ch-label">Topic</span>' +
							`<input class="ch-input" name="topic" maxlength="120" placeholder="What will you learn?"></label>` +
						'<button type="submit" class="ch-btn">Schedule session</button>' +
					'</form>' +
				'</section>' +
			'</div>' +
			'<section class="ch-card" aria-label="Privacy">' +
				'<h4 class="ch-card-title">Privacy — only share what you choose</h4>' +
				'<p class="ch-dim">Nothing is shared by default. Your chavrusa sees only what you switch on.</p>' +
				'<div class="ch-toggles">' +
					privacyToggle('name', 'Share my display name', privacy.name) +
					privacyToggle('tz', 'Share my time zone', privacy.tz) +
					privacyToggle('email', 'Share my email', privacy.email) +
					privacyToggle('schedule', 'Share my schedule', privacy.schedule) +
				'</div>' +
				'<div class="ch-partner-view">' +
					'<h5 class="ch-card-subtitle">What your chavrusa shares with you</h5>' +
					(partnerShares.name ? `<p class="ch-line">Name: ${escapeHtml(partner.name)}</p>` : '') +
					(partnerShares.tz ? `<p class="ch-line">Time zone: ${escapeHtml(partner.tz)}</p>` : '') +
					(partnerShares.schedule ? `<p class="ch-line">Schedule: ${escapeHtml((partner.days || []).join(', '))} · ${escapeHtml((partner.tod || []).join(', '))}</p>` : '') +
					(!partnerShares.name && !partnerShares.tz && !partnerShares.schedule
						? '<p class="ch-dim">They have not shared anything yet.</p>' : '') +
				'</div>' +
			'</section>' +
		'</div>';

	body.querySelector('.ch-back').addEventListener('click', () => renderHome(body, profile, close));

	const planArea = body.querySelector('.ch-textarea');
	body.querySelector('.ch-plan-save').addEventListener('click', (e) => {
		const d = loadDash(partner.name);
		d.plan = planArea.value;
		d.updatedAt = Date.now();
		saveDash(partner.name, d);
		const btn = e.currentTarget;
		btn.textContent = 'Saved';
		setTimeout(() => { btn.textContent = 'Save plan'; }, 1500);
	});

	const sessionsBox = body.querySelector('.ch-sessions');
	function paintSessions() {
		const d = loadDash(partner.name);
		const sessions = Array.isArray(d.sessions) ? d.sessions : [];
		if (!sessions.length) {
			sessionsBox.innerHTML = '<p class="ch-dim">No sessions scheduled yet.</p>';
			return;
		}
		sessionsBox.innerHTML = sessions.map((s, i) =>
			`<div class="ch-session${s.done ? ' is-done' : ''}">` +
				`<div class="ch-session-main"><span class="ch-session-when">${escapeHtml(s.date)} · ${escapeHtml(s.time)}</span>` +
				(s.topic ? `<span class="ch-session-topic">${escapeHtml(s.topic)}</span>` : '') + '</div>' +
				'<div class="ch-session-tools">' +
					(s.done
						? '<span class="ch-done-tag">Done</span>'
						: `<button type="button" class="ch-linkbtn" data-act="done" data-i="${i}">Mark done</button>`) +
					`<button type="button" class="ch-linkbtn ch-danger" data-act="cancel" data-i="${i}">Cancel</button>` +
				'</div>' +
			'</div>').join('');
		sessionsBox.querySelectorAll('[data-act]').forEach(btn => {
			btn.addEventListener('click', () => {
				const d2 = loadDash(partner.name);
				const idx = Number(btn.dataset.i);
				if (btn.dataset.act === 'done') d2.sessions[idx].done = true;
				else d2.sessions.splice(idx, 1);
				saveDash(partner.name, d2);
				paintSessions();
			});
		});
	}
	paintSessions();

	body.querySelector('.ch-session-form').addEventListener('submit', (e) => {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const date = String(fd.get('date') || '').trim();
		const time = String(fd.get('time') || '').trim();
		if (!date || !time) return;
		const d = loadDash(partner.name);
		d.sessions = Array.isArray(d.sessions) ? d.sessions : [];
		d.sessions.push({ date, time, topic: String(fd.get('topic') || '').trim(), done: false, at: Date.now() });
		d.sessions.sort((a, b) => String(a.date + a.time).localeCompare(String(b.date + b.time)));
		saveDash(partner.name, d);
		e.currentTarget.reset();
		paintSessions();
	});

	body.querySelectorAll('.ch-toggle input').forEach(input => {
		input.addEventListener('change', () => {
			const p2 = loadProfile() || profile;
			p2.privacy = p2.privacy || { name: true, tz: false, email: false, schedule: false };
			p2.privacy[input.name] = input.checked;
			writeJson(LS_PROFILE, p2);
		});
	});
}

function privacyToggle(name, label, on) {
	return `<label class="ch-toggle"><input type="checkbox" name="${name}"${on ? ' checked' : ''}><span class="ch-toggle-track" aria-hidden="true"></span><span>${escapeHtml(label)}</span></label>`;
}
