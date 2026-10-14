// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DebateArena
 * @description
 * Yaakov 2026-10-13: TRACK H — debate arena for the Awtsmoos feed.
 *
 * A floating "Debate arena" button opens the arena panel:
 *   - Browse debates (upcoming, live, archived) and propose a new one:
 *     proposition, two sides, number of timed rounds, minutes per round.
 *   - Live debate view: the respectful-rules card, a round timer that
 *     alternates sides, a debaters' chat, and audience kippah reactions
 *     (one tap per person per side). The audience cannot post during
 *     rounds — they react only.
 *   - Moderator tools: mute a participant, end a debate early, and
 *     declare the outcome. Finished debates are archived as posts
 *     (proposition, sides, result, kippah counts, round summary).
 *
 * The respectful rules are shown before every live debate.
 * User-facing text never exposes raw IDs or machine slugs.
 *
 * NOTE: debates persist in localStorage on this device. Sample debates
 * are clearly labeled as samples; a live arena service can replace the
 * store later without changing the UI.
 */

const LS_DEBATES = 'awtsmoos-debatearena-v1';
const LS_NAME = 'awtsmoos-debatearena-displayname-v1';

const RULES = [
	'Speak about the idea, never about the person. No name-calling, no mockery.',
	'One side speaks at a time. The audience reacts with kippahs only — no interrupting a round.',
	'Quote sources, not slogans. If you state a fact, say where it is from.',
	'The moderator\'s ruling is final. A muted speaker sits the round out.',
	'We are all here to get closer to the truth — and to Hashem.'
];

/* B"H — sample debates, labeled "sample" in the UI. */
const SAMPLE_DEBATES = [
	{
		id: 'sample-shabbat-tech', title: 'Should a shul livestream its davening?', sample: true,
		sideA: 'Livestreaming builds community', sideB: 'Livestreaming cheapens tefillah',
		rounds: 2, minutes: 3, status: 'upcoming',
		round: 1, turn: 'A', secondsLeft: 180, muted: [],
		messages: [], kippahs: { A: 12, B: 9 }, kippahVoters: [],
		verdict: null, archivedAt: null
	},
	{
		id: 'sample-archived', title: 'Is it better to learn one perek deeply or a whole masechta quickly?', sample: true,
		sideA: 'Depth over breadth', sideB: 'Breadth over depth',
		rounds: 2, minutes: 3, status: 'archived',
		round: 2, turn: 'A', secondsLeft: 0, muted: [],
		messages: [
			{ author: 'Reb Dovid', side: 'A', at: 'Yesterday', text: 'One sugya learned well stays with you for life; ten skimmed leave nothing.' },
			{ author: 'Yossi', side: 'B', at: 'Yesterday', text: 'But breadth gives you the map — you cannot go deep without knowing the terrain.' }
		],
		kippahs: { A: 21, B: 17 }, kippahVoters: [],
		verdict: { winner: 'A', note: 'The judges found the depth argument better sourced.' },
		archivedAt: 'Oct 13'
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

function nowStamp() {
	try {
		return new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	} catch (_) { return ''; }
}

function loadDebates() {
	const mine = readJson(LS_DEBATES, []);
	const samples = SAMPLE_DEBATES.map(s => JSON.parse(JSON.stringify(s)));
	return mine.concat(samples);
}

function saveMyDebates(debates) {
	writeJson(LS_DEBATES, debates.filter(d => !d.sample));
}

function getName() { return readJson(LS_NAME, ''); }
function setName(n) { writeJson(LS_NAME, n); }

function debateById(id) { return loadDebates().find(d => d.id === id) || null; }

function persistDebate(d) {
	if (d.sample) return;
	const debates = loadDebates();
	const mine = debates.filter(x => !x.sample).map(x => x.id === d.id ? d : x);
	if (!mine.find(x => x.id === d.id)) mine.push(d);
	saveMyDebates(mine);
}

function fmtTime(sec) {
	const m = Math.floor(sec / 60), s = sec % 60;
	return m + ':' + String(s).padStart(2, '0');
}

function svgGavel() {
	return '<svg class="db-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M9 4l7 7M7 6l7 7"/><path d="M4 20h9M12.5 13.5L20 21"/></svg>';
}

function svgKippah() {
	return '<svg class="db-kippah" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16a8 8 0 0 1 16 0z" fill="currentColor" opacity="0.9"/><path d="M4 16h16" stroke="currentColor" stroke-width="1.6"/></svg>';
}

/* ------------------------------------------------------------------ */
/* panel                                                               */
/* ------------------------------------------------------------------ */

let overlay = null;
let view = { screen: 'list', tab: 'live', debateId: null };
let timerId = null;

export function initDebateArena() {
	const stage = document.getElementById('feed-stage') || document.body;
	if (stage.querySelector('.db-fab')) return;
	const fab = document.createElement('button');
	fab.type = 'button';
	fab.className = 'db-fab';
	fab.setAttribute('aria-label', 'Open debate arena');
	fab.title = 'Debate arena';
	fab.innerHTML = svgGavel() + '<span>Debate arena</span>';
	fab.addEventListener('click', openPanel);
	stage.append(fab);
}

function closePanel() {
	stopTimer();
	if (overlay) { overlay.remove(); overlay = null; }
	document.removeEventListener('keydown', onKey, true);
}

function onKey(e) { if (e.key === 'Escape') closePanel(); }

function openPanel() {
	if (overlay) return;
	overlay = document.createElement('div');
	overlay.className = 'db-overlay';
	overlay.innerHTML =
		'<div class="db-panel" role="dialog" aria-modal="true" aria-label="Debate arena">' +
			'<div class="db-panel-head">' +
				'<h2 class="db-panel-title">Debate arena</h2>' +
				'<button type="button" class="db-close" aria-label="Close debate arena">✕</button>' +
			'</div>' +
			'<div class="db-rules-strip">' + RULES.map((r, i) => '<span class="db-rule-chip">Rule ' + (i + 1) + '</span>').join('') + '</div>' +
			'<div class="db-panel-body"></div>' +
		'</div>';
	document.body.append(overlay);
	overlay.querySelector('.db-close').addEventListener('click', closePanel);
	overlay.addEventListener('click', (e) => { if (e.target === overlay) closePanel(); });
	document.addEventListener('keydown', onKey, true);
	render();
}

function body() { return overlay.querySelector('.db-panel-body'); }

function render() {
	if (!overlay) return;
	stopTimer();
	if (view.screen === 'debate') renderDebate();
	else renderList();
}

/* ------------------------------------------------------------------ */
/* debate list                                                         */
/* ------------------------------------------------------------------ */

function renderList() {
	const debates = loadDebates();
	const name = getName();
	const el = body();
	const tabs = [['live', 'Live'], ['upcoming', 'Upcoming'], ['archived', 'Archived']];
	const shown = debates.filter(d => d.status === view.tab);

	el.innerHTML =
		'<div class="db-section">' +
			'<p class="db-lede">Formal debates with timed rounds. The audience reacts with kippahs — no interrupting.</p>' +
			(name ? '' :
			'<form class="db-card" id="db-nameform">' +
				'<label class="db-label" for="db-name">Your display name in the arena</label>' +
				'<div class="db-row">' +
					'<input class="db-input" id="db-name" maxlength="40" placeholder="e.g. Dovid" required>' +
					'<button type="submit" class="db-btn db-btn-primary">Save</button>' +
				'</div>' +
			'</form>') +
			'<div class="db-tabs" role="tablist">' +
				tabs.map(([id, label]) =>
					'<button type="button" role="tab" class="db-tab' + (view.tab === id ? ' is-active' : '') + '" data-ltab="' + id + '" aria-selected="' + (view.tab === id) + '">' + label + '</button>').join('') +
			'</div>' +
			'<div class="db-debatelist">' +
				(shown.length ? shown.map(debateCard).join('') : '<p class="db-dim">No ' + view.tab + ' debates yet.</p>') +
			'</div>' +
			'<details class="db-create">' +
				'<summary class="db-create-summary">+ Propose a debate</summary>' +
				'<form class="db-card db-form" id="db-createform">' +
					'<label class="db-label">Proposition<input class="db-input" name="title" maxlength="140" required placeholder="e.g. Should every Jew learn one blatt a day?"></label>' +
					'<div class="db-grid2">' +
						'<label class="db-label">Side A (affirming)<input class="db-input" name="sideA" maxlength="60" required placeholder="e.g. Yes — consistency wins"></label>' +
						'<label class="db-label">Side B (opposing)<input class="db-input" name="sideB" maxlength="60" required placeholder="e.g. No — quality over quantity"></label>' +
					'</div>' +
					'<div class="db-grid2">' +
						'<label class="db-label">Rounds<select class="db-input" name="rounds"><option>2</option><option>3</option><option>4</option></select></label>' +
						'<label class="db-label">Minutes per round<select class="db-input" name="minutes"><option>2</option><option selected>3</option><option>5</option></select></label>' +
					'</div>' +
					'<button type="submit" class="db-btn db-btn-primary">Propose debate</button>' +
				'</form>' +
			'</details>' +
			'<details class="db-rules">' +
				'<summary class="db-create-summary">📜 Rules of respectful debate</summary>' +
				'<ol class="db-rules-list">' + RULES.map(r => '<li>' + escapeHtml(r) + '</li>').join('') + '</ol>' +
			'</details>' +
		'</div>';

	el.querySelector('#db-nameform')?.addEventListener('submit', (e) => {
		e.preventDefault();
		const n = e.target.querySelector('#db-name').value.trim();
		if (n) { setName(n); render(); }
	});
	el.querySelectorAll('[data-ltab]').forEach(t => t.addEventListener('click', () => { view.tab = t.dataset.ltab; render(); }));
	el.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => {
		view = { screen: 'debate', debateId: btn.dataset.open };
		render();
	}));
	el.querySelector('#db-createform').addEventListener('submit', (e) => {
		e.preventDefault();
		const fd = new FormData(e.target);
		const minutes = Number(fd.get('minutes'));
		const d = {
			id: 'debate-' + Date.now().toString(36),
			title: fd.get('title').toString().trim(),
			sideA: fd.get('sideA').toString().trim(),
			sideB: fd.get('sideB').toString().trim(),
			rounds: Number(fd.get('rounds')),
			minutes,
			status: 'upcoming',
			round: 1, turn: 'A', secondsLeft: minutes * 60,
			muted: [], messages: [],
			kippahs: { A: 0, B: 0 }, kippahVoters: [],
			verdict: null, archivedAt: null,
			proposer: getName() || 'You'
		};
		const debates = loadDebates().filter(x => !x.sample);
		debates.push(d);
		saveMyDebates(debates);
		view = { screen: 'debate', debateId: d.id };
		render();
	});
}

function debateCard(d) {
	const statusLabel = d.status === 'live' ? '● Live now' : d.status === 'upcoming' ? 'Upcoming' : 'Archived';
	return '<article class="db-card db-debatecard">' +
		'<div class="db-row"><h3 class="db-debatecard-title">' + escapeHtml(d.title) + '</h3>' +
		(d.sample ? '<span class="db-tag">sample</span>' : '') + '</div>' +
		'<p class="db-meta">' + escapeHtml(d.sideA) + ' <span class="db-vs">vs</span> ' + escapeHtml(d.sideB) + '</p>' +
		'<p class="db-meta">' + statusLabel + ' · ' + d.rounds + ' rounds · ' + d.minutes + ' min each</p>' +
		(d.verdict ? '<p class="db-verdict-line">Winner: ' + escapeHtml(d.verdict.winner === 'A' ? d.sideA : d.verdict.winner === 'B' ? d.sideB : 'Draw') + '</p>' : '') +
		'<button type="button" class="db-btn" data-open="' + escapeHtml(d.id) + '">' +
			(d.status === 'archived' ? 'Read archive' : 'Enter debate') + '</button>' +
	'</article>';
}

/* ------------------------------------------------------------------ */
/* live / archived debate view                                         */
/* ------------------------------------------------------------------ */

function renderDebate() {
	const d = debateById(view.debateId);
	const el = body();
	if (!d) { view = { screen: 'list' }; render(); return; }
	const me = getName() || 'You';
	const isLive = d.status === 'live';
	const speaking = d.turn === 'A' ? d.sideA : d.sideB;

	el.innerHTML =
		'<div class="db-section">' +
			'<div class="db-row"><button type="button" class="db-btn db-back">← All debates</button>' +
			(d.sample ? '<span class="db-tag">sample</span>' : '') + '</div>' +
			'<h3 class="db-debate-title">' + escapeHtml(d.title) + '</h3>' +
			'<p class="db-meta">Side A: <strong>' + escapeHtml(d.sideA) + '</strong> · Side B: <strong>' + escapeHtml(d.sideB) + '</strong></p>' +

			(isLive ? liveControls(d, speaking) : '') +
			(d.status === 'archived' && d.verdict ? verdictCard(d) : '') +

			'<section class="db-card" aria-label="Debaters chat">' +
				'<h4 class="db-h4">Debaters</h4>' +
				'<ul class="db-chat" aria-live="polite">' +
					(d.messages.length
						? d.messages.filter(m => !d.muted.includes(m.author)).map(m =>
							'<li class="db-msg-side-' + m.side + '"><strong>' + escapeHtml(m.author) + '</strong> <span class="db-dim">(' + escapeHtml(m.side === 'A' ? d.sideA : d.sideB) + ') · ' + escapeHtml(m.at) + '</span><br>' + escapeHtml(m.text) + '</li>').join('')
						: '<li class="db-dim">No arguments yet. The floor is open.</li>') +
				'</ul>' +
				(isLive
					? '<form class="db-chatform" id="db-msgform">' +
						'<div class="db-row"><label class="db-label">I speak for<select class="db-input db-sidepick" name="side"><option value="A">' + escapeHtml(d.sideA) + '</option><option value="B">' + escapeHtml(d.sideB) + '</option></select></label></div>' +
						'<div class="db-row"><label class="db-label db-sr" for="db-msg">Make your argument</label>' +
						'<input class="db-input" id="db-msg" name="msg" maxlength="600" placeholder="Make your argument…" autocomplete="off">' +
						'<button type="submit" class="db-btn db-btn-primary">Argue</button></div>' +
					'</form>'
					: '<p class="db-dim">This debate is not live — the floor is closed.</p>') +
			'</section>' +

			'<section class="db-card" aria-label="Audience reactions">' +
				'<h4 class="db-h4">Audience kippahs <span class="db-dim">(react, don\'t interrupt)</span></h4>' +
				'<div class="db-row">' +
					'<button type="button" class="db-kippah-btn" data-kippah="A" ' + (d.kippahVoters.includes(me + ':A') ? 'disabled' : '') + '>' + svgKippah() + '<span>' + d.kippahs.A + ' · ' + escapeHtml(d.sideA) + '</span></button>' +
					'<button type="button" class="db-kippah-btn" data-kippah="B" ' + (d.kippahVoters.includes(me + ':B') ? 'disabled' : '') + '>' + svgKippah() + '<span>' + d.kippahs.B + ' · ' + escapeHtml(d.sideB) + '</span></button>' +
				'</div>' +
				(isLive ? '<p class="db-dim">The audience watches quietly during rounds — kippahs only.</p>' : '') +
			'</section>' +

			(isLive && !d.sample ? moderatorTools(d) : '') +
		'</div>';

	el.querySelector('.db-back').addEventListener('click', () => { view = { screen: 'list' }; render(); });

	if (d.status === 'upcoming' && !d.sample) {
		el.querySelector('[data-start]')?.addEventListener('click', () => {
			d.status = 'live';
			persistDebate(d);
			render();
		});
	}

	if (isLive) {
		startTimer(d);
		el.querySelector('[data-advround]')?.addEventListener('click', () => { advanceRound(d); render(); });
	}

	el.querySelectorAll('[data-kippah]').forEach(btn => btn.addEventListener('click', () => {
		const side = btn.dataset.kippah;
		const key = me + ':' + side;
		if (d.kippahVoters.includes(key)) return;
		d.kippahVoters.push(key);
		d.kippahs[side]++;
		persistDebate(d);
		render();
	}));

	el.querySelector('#db-msgform')?.addEventListener('submit', (e) => {
		e.preventDefault();
		const fd = new FormData(e.target);
		const v = fd.get('msg').toString().trim();
		if (!v) return;
		if (d.muted.includes(me)) { alert('You are muted for this debate.'); return; }
		d.messages.push({ author: me, side: fd.get('side').toString(), at: nowStamp(), text: v });
		persistDebate(d);
		render();
	});

	// Moderator tools
	el.querySelector('[data-enddebate]')?.addEventListener('click', () => {
		if (!confirm('End this debate now and move to the verdict?')) return;
		d.status = 'awaiting-verdict';
		persistDebate(d);
		render();
	});
	el.querySelectorAll('[data-mute]').forEach(btn => btn.addEventListener('click', () => {
		const who = btn.dataset.mute;
		if (d.muted.includes(who)) d.muted = d.muted.filter(x => x !== who);
		else d.muted.push(who);
		persistDebate(d);
		render();
	}));
	el.querySelector('#db-verdictform')?.addEventListener('submit', (e) => {
		e.preventDefault();
		const fd = new FormData(e.target);
		const winner = fd.get('winner').toString();
		d.verdict = { winner, note: fd.get('note').toString().trim().slice(0, 300) };
		d.status = 'archived';
		d.archivedAt = nowStamp();
		persistDebate(d);
		render();
	});
}

function liveControls(d, speaking) {
	return '<section class="db-card db-livebar" aria-label="Round timer">' +
		'<div class="db-row"><h4 class="db-h4">Round ' + d.round + ' of ' + d.rounds + '</h4>' +
		'<span class="db-turn">🎙 ' + escapeHtml(speaking) + ' has the floor</span></div>' +
		'<div class="db-timer" role="timer" aria-live="polite">' + fmtTime(d.secondsLeft) + '</div>' +
		'<div class="db-row"><button type="button" class="db-btn" data-advround>Next turn / round</button>' +
		'<span class="db-dim">Timer auto-advances when it reaches zero.</span></div>' +
	'</section>';
}

function verdictCard(d) {
	const label = d.verdict.winner === 'A' ? d.sideA : d.verdict.winner === 'B' ? d.sideB : 'Draw';
	return '<section class="db-card db-verdict" aria-label="Debate outcome">' +
		'<h4 class="db-h4">🏆 Outcome: ' + escapeHtml(label) + '</h4>' +
		(d.verdict.note ? '<p class="db-verdict-note">' + escapeHtml(d.verdict.note) + '</p>' : '') +
		'<p class="db-dim">Kippahs — ' + escapeHtml(d.sideA) + ': ' + d.kippahs.A + ' · ' + escapeHtml(d.sideB) + ': ' + d.kippahs.B + '</p>' +
		(d.archivedAt ? '<p class="db-dim">Archived ' + escapeHtml(d.archivedAt) + '</p>' : '') +
	'</section>';
}

function moderatorTools(d) {
	const speakers = [...new Set(d.messages.map(m => m.author))];
	return '<section class="db-card" aria-label="Moderator tools">' +
		'<h4 class="db-h4">Moderator tools</h4>' +
		(speakers.length
			? '<div class="db-row">' + speakers.map(s =>
				'<button type="button" class="db-btn db-btn-sm" data-mute="' + escapeHtml(s) + '">' +
					(d.muted.includes(s) ? 'Unmute ' : 'Mute ') + escapeHtml(s) + '</button>').join('') + '</div>'
			: '<p class="db-dim">No speakers to moderate yet.</p>') +
		'<div class="db-row"><button type="button" class="db-btn db-danger" data-enddebate>End debate early</button></div>' +
		(d.status === 'awaiting-verdict' || true ? verdictForm(d) : '') +
	'</section>';
}

function verdictForm(d) {
	return '<form class="db-card db-verdictform" id="db-verdictform">' +
		'<h5 class="db-h5">Declare the outcome</h5>' +
		'<label class="db-label">Winner<select class="db-input" name="winner">' +
			'<option value="A">' + escapeHtml(d.sideA) + '</option>' +
			'<option value="B">' + escapeHtml(d.sideB) + '</option>' +
			'<option value="draw">Draw</option>' +
		'</select></label>' +
		'<label class="db-label">Judges\' note (optional)<textarea class="db-input db-textarea" name="note" rows="2" maxlength="300" placeholder="Why this side won…"></textarea></label>' +
		'<button type="submit" class="db-btn db-btn-primary">Archive debate with verdict</button>' +
	'</form>';
}

/* ------------------------------------------------------------------ */
/* timer                                                                */
/* ------------------------------------------------------------------ */

function startTimer(d) {
	stopTimer();
	timerId = setInterval(() => {
		const live = debateById(view.debateId);
		if (!live || live.status !== 'live' || !overlay) { stopTimer(); return; }
		live.secondsLeft = Math.max(0, live.secondsLeft - 1);
		if (live.secondsLeft === 0) {
			advanceRound(live);
			render();
			return;
		}
		persistDebate(live);
		const t = overlay.querySelector('.db-timer');
		if (t) t.textContent = fmtTime(live.secondsLeft);
	}, 1000);
}

function stopTimer() {
	if (timerId) { clearInterval(timerId); timerId = null; }
}

function advanceRound(d) {
	if (d.turn === 'A') {
		d.turn = 'B';
	} else {
		d.turn = 'A';
		d.round++;
		if (d.round > d.rounds) {
			d.status = 'awaiting-verdict';
			d.round = d.rounds;
			d.secondsLeft = 0;
			persistDebate(d);
			return;
		}
	}
	d.secondsLeft = d.minutes * 60;
	persistDebate(d);
}
