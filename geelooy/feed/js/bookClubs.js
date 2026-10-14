// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookClubs
 * @description
 * Yaakov 2026-10-13: TRACK H — book clubs for the Awtsmoos feed.
 *
 * A floating "Book clubs" button opens the clubs panel:
 *   - Create a club around a sefer or series: name, sefer, total chapters,
 *     chapters per week, start date. The reading schedule is computed
 *     automatically (one block per week with due dates).
 *   - Inside a club: reading schedule, discussion threads per chapter
 *     (posts + replies), per-member progress tracking, and a club feed
 *     of activity (joins, completed chapters, notes).
 *   - Join / leave, and a copyable invite code + link.
 *
 * User-facing text never exposes raw IDs or machine slugs.
 *
 * NOTE: clubs persist in localStorage on this device. Sample clubs are
 * clearly labeled as samples; a live club service can replace the store
 * later without changing the UI.
 */

const LS_CLUBS = 'awtsmoos-bookclubs-clubs-v1';
const LS_NAME = 'awtsmoos-bookclubs-displayname-v1';

/* B"H — sample clubs, labeled "sample" in the UI. */
const SAMPLE_CLUBS = [
	{
		id: 'sample-tanya-club', name: 'Tanya, one chapter a week', sefer: 'Tanya', sample: true,
		totalChapters: 53, perWeek: 1, startDate: '2026-10-11',
		members: [
			{ name: 'Yossi', done: [1, 2, 3], me: false },
			{ name: 'Miriam', done: [1, 2], me: false },
			{ name: 'Ari', done: [1], me: false }
		],
		threads: {
			'1': [
				{ author: 'Yossi', at: 'Oct 11', text: 'Chapter 1 hits hard — the Beinoni is a category of his own, not a failed Tzaddik.', replies: [
					{ author: 'Miriam', at: 'Oct 12', text: 'That reframed everything for me. The five parts of the soul suddenly make sense.' }
				] }
			],
			'2': [
				{ author: 'Ari', at: 'Oct 14', text: 'Question: if the Nefesh HaBehamis still desires, in what sense does the Beinoni "rule" over it?', replies: [] }
			]
		},
		feed: [
			{ at: 'Oct 11', text: 'The club started — week 1: chapter 1.' },
			{ at: 'Oct 12', text: 'Miriam finished chapter 1.' },
			{ at: 'Oct 13', text: 'Yossi finished chapter 3.' }
		]
	},
	{
		id: 'sample-tehillim-club', name: 'Tehillim a day', sefer: 'Tehillim', sample: true,
		totalChapters: 150, perWeek: 7, startDate: '2026-10-01',
		members: [
			{ name: 'Chana', done: [1, 2, 3, 4, 5, 6, 7], me: false },
			{ name: 'Dovid', done: [1, 2, 3, 4], me: false }
		],
		threads: {
			'1': [
				{ author: 'Chana', at: 'Oct 1', text: '"Ashrei ha-ish" — the commentaries read it as a blessing over the one who guards his path.', replies: [] }
			]
		},
		feed: [
			{ at: 'Oct 1', text: 'The club started — week 1: chapters 1–7.' },
			{ at: 'Oct 7', text: 'Chana finished the first week of Tehillim.' }
		]
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

function loadClubs() {
	const mine = readJson(LS_CLUBS, []);
	const samples = SAMPLE_CLUBS.map(s => JSON.parse(JSON.stringify(s)));
	return mine.concat(samples);
}

function saveMyClubs(clubs) {
	writeJson(LS_CLUBS, clubs.filter(c => !c.sample));
}

function getName() { return readJson(LS_NAME, ''); }
function setName(n) { writeJson(LS_NAME, n); }

function svgBook() {
	return '<svg class="bc-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 1 6.5 18H19v3H6.5A1.5 1.5 0 0 1 5 19.5z"/><path d="M9 7.5h7M9 11h5"/></svg>';
}

function inviteCode(id) {
	let h = 0;
	for (let i = 0; i < id.length; i++) h = ((h * 31) + id.charCodeAt(i)) >>> 0;
	return 'CLUB-' + h.toString(36).toUpperCase().padStart(6, '0');
}

/* Schedule: array of { week, chapters:[n..m], due } */
function scheduleFor(club) {
	const out = [];
	const weeks = Math.ceil(club.totalChapters / club.perWeek);
	let start;
	try { start = new Date(club.startDate + 'T12:00:00'); } catch (_) { start = new Date(); }
	if (isNaN(start.getTime())) start = new Date();
	for (let w = 0; w < weeks; w++) {
		const from = w * club.perWeek + 1;
		const to = Math.min(club.totalChapters, (w + 1) * club.perWeek);
		const due = new Date(start.getTime() + (w + 1) * 7 * 24 * 3600 * 1000);
		out.push({ week: w + 1, chapters: range(from, to), due: due.toLocaleDateString([], { month: 'short', day: 'numeric' }) });
	}
	return out;
}

function range(a, b) { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; }

function chapterLabel(chs) {
	return chs.length === 1 ? 'Chapter ' + chs[0] : 'Chapters ' + chs[0] + '–' + chs[chs.length - 1];
}

/* ------------------------------------------------------------------ */
/* panel                                                               */
/* ------------------------------------------------------------------ */

let overlay = null;
let view = { screen: 'list', clubId: null, tab: 'schedule', threadChapter: 1 };

export function initBookClubs() {
	const stage = document.getElementById('feed-stage') || document.body;
	if (stage.querySelector('.bc-fab')) return;
	const fab = document.createElement('button');
	fab.type = 'button';
	fab.className = 'bc-fab';
	fab.setAttribute('aria-label', 'Open book clubs');
	fab.title = 'Book clubs';
	fab.innerHTML = svgBook() + '<span>Book clubs</span>';
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
	overlay.className = 'bc-overlay';
	overlay.innerHTML =
		'<div class="bc-panel" role="dialog" aria-modal="true" aria-label="Book clubs">' +
			'<div class="bc-panel-head">' +
				'<h2 class="bc-panel-title">Book clubs</h2>' +
				'<button type="button" class="bc-close" aria-label="Close book clubs">✕</button>' +
			'</div>' +
			'<div class="bc-panel-body"></div>' +
		'</div>';
	document.body.append(overlay);
	overlay.querySelector('.bc-close').addEventListener('click', closePanel);
	overlay.addEventListener('click', (e) => { if (e.target === overlay) closePanel(); });
	document.addEventListener('keydown', onKey, true);
	render();
}

function body() { return overlay.querySelector('.bc-panel-body'); }

function clubById(id) { return loadClubs().find(c => c.id === id) || null; }

function persistClub(club) {
	if (club.sample) return;
	const clubs = loadClubs();
	const mine = clubs.filter(c => !c.sample).map(c => c.id === club.id ? club : c);
	if (!mine.find(c => c.id === club.id)) mine.push(club);
	saveMyClubs(mine);
}

function render() {
	if (!overlay) return;
	if (view.screen === 'club') renderClub();
	else renderList();
}

/* ------------------------------------------------------------------ */
/* club list                                                           */
/* ------------------------------------------------------------------ */

function renderList() {
	const clubs = loadClubs();
	const name = getName();
	const el = body();
	el.innerHTML =
		'<div class="bc-section">' +
			'<p class="bc-lede">Learn a sefer together, one week at a time.</p>' +
			(name ? '' :
			'<form class="bc-card" id="bc-nameform">' +
				'<label class="bc-label" for="bc-name">Your display name in clubs</label>' +
				'<div class="bc-row">' +
					'<input class="bc-input" id="bc-name" maxlength="40" placeholder="e.g. Dovid" required>' +
					'<button type="submit" class="bc-btn bc-btn-primary">Save</button>' +
				'</div>' +
			'</form>') +
			'<div class="bc-clublist">' + clubs.map(clubCard).join('') + '</div>' +
			'<details class="bc-create">' +
				'<summary class="bc-create-summary">+ Start a book club</summary>' +
				'<form class="bc-card bc-form" id="bc-createform">' +
					'<label class="bc-label">Club name<input class="bc-input" name="name" maxlength="60" required placeholder="e.g. Mishnah Berurah mornings"></label>' +
					'<label class="bc-label">Sefer / series<input class="bc-input" name="sefer" maxlength="60" required placeholder="e.g. Mesilat Yesharim"></label>' +
					'<div class="bc-grid2">' +
						'<label class="bc-label">Total chapters<input class="bc-input" type="number" name="total" min="1" max="2000" value="26" required></label>' +
						'<label class="bc-label">Chapters per week<input class="bc-input" type="number" name="perweek" min="1" max="100" value="1" required></label>' +
					'</div>' +
					'<label class="bc-label">Start date<input class="bc-input" type="date" name="start" required></label>' +
					'<button type="submit" class="bc-btn bc-btn-primary">Create club</button>' +
				'</form>' +
			'</details>' +
		'</div>';

	el.querySelector('#bc-nameform')?.addEventListener('submit', (e) => {
		e.preventDefault();
		const n = e.target.querySelector('#bc-name').value.trim();
		if (n) { setName(n); render(); }
	});
	el.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => {
		view = { screen: 'club', clubId: btn.dataset.open, tab: 'schedule', threadChapter: 1 };
		render();
	}));
	el.querySelector('#bc-createform').addEventListener('submit', (e) => {
		e.preventDefault();
		const fd = new FormData(e.target);
		const club = {
			id: 'club-' + Date.now().toString(36),
			name: fd.get('name').toString().trim(),
			sefer: fd.get('sefer').toString().trim(),
			totalChapters: Math.max(1, Number(fd.get('total')) || 1),
			perWeek: Math.max(1, Number(fd.get('perweek')) || 1),
			startDate: fd.get('start').toString(),
			members: [], threads: {}, feed: []
		};
		club.feed.push({ at: nowStamp(), text: 'The club was created.' });
		const clubs = loadClubs().filter(c => !c.sample);
		clubs.push(club);
		saveMyClubs(clubs);
		view = { screen: 'club', clubId: club.id, tab: 'schedule', threadChapter: 1 };
		render();
	});
}

function clubCard(c) {
	const done = c.members.reduce((n, m) => n + m.done.length, 0);
	return '<article class="bc-card bc-clubcard">' +
		'<div class="bc-row"><h3 class="bc-clubcard-title">' + escapeHtml(c.name) + '</h3>' +
		(c.sample ? '<span class="bc-tag">sample</span>' : '') + '</div>' +
		'<p class="bc-meta">' + escapeHtml(c.sefer) + ' · ' + c.totalChapters + ' chapters · ' + c.perWeek + ' per week · ' + c.members.length + ' members</p>' +
		'<button type="button" class="bc-btn" data-open="' + escapeHtml(c.id) + '">Open club</button>' +
	'</article>';
}

/* ------------------------------------------------------------------ */
/* inside a club                                                        */
/* ------------------------------------------------------------------ */

function renderClub() {
	const club = clubById(view.clubId);
	const el = body();
	if (!club) { view = { screen: 'list', clubId: null }; render(); return; }
	const me = getName() || 'You';
	const member = club.members.find(m => m.name === me);
	const tabs = [['schedule', 'Schedule'], ['discuss', 'Discussion'], ['members', 'Members'], ['feed', 'Club feed']];

	el.innerHTML =
		'<div class="bc-section">' +
			'<div class="bc-row"><button type="button" class="bc-btn bc-back">← All clubs</button>' +
			(club.sample ? '<span class="bc-tag">sample club</span>' : '') + '</div>' +
			'<h3 class="bc-club-title">' + escapeHtml(club.name) + '</h3>' +
			'<p class="bc-meta">' + escapeHtml(club.sefer) + ' · ' + club.totalChapters + ' chapters · ' + club.perWeek + ' per week</p>' +
			'<div class="bc-tabs" role="tablist">' +
				tabs.map(([id, label]) =>
					'<button type="button" role="tab" class="bc-tab' + (view.tab === id ? ' is-active' : '') + '" data-tab="' + id + '" aria-selected="' + (view.tab === id) + '">' + label + '</button>').join('') +
			'</div>' +
			'<div class="bc-tabbody"></div>' +
			'<div class="bc-row bc-joinside">' +
				(member
					? '<button type="button" class="bc-btn" data-leave>Leave club</button>'
					: '<button type="button" class="bc-btn bc-btn-primary" data-join>Join club</button>') +
				'<button type="button" class="bc-btn" data-invite>Copy invite code</button>' +
			'</div>' +
		'</div>';

	el.querySelector('.bc-back').addEventListener('click', () => { view = { screen: 'club', clubId: null }; view.screen = 'list'; render(); });
	el.querySelectorAll('[data-tab]').forEach(t => t.addEventListener('click', () => { view.tab = t.dataset.tab; render(); }));
	el.querySelector('[data-join]')?.addEventListener('click', () => {
		club.members.push({ name: me, done: [], me: true });
		club.feed.push({ at: nowStamp(), text: me + ' joined the club.' });
		persistClub(club);
		render();
	});
	el.querySelector('[data-leave]')?.addEventListener('click', () => {
		club.members = club.members.filter(m => m.name !== me);
		club.feed.push({ at: nowStamp(), text: me + ' left the club.' });
		persistClub(club);
		render();
	});
	el.querySelector('[data-invite]').addEventListener('click', async (e) => {
		const code = inviteCode(club.id);
		const link = 'https://awtsmoos.org/feed/book-clubs?invite=' + code;
		try { await navigator.clipboard.writeText(link); e.target.textContent = 'Copied!'; }
		catch (_) { prompt('Copy this invite link:', link); }
		setTimeout(() => { e.target.textContent = 'Copy invite code'; }, 2000);
	});

	const tabBody = el.querySelector('.bc-tabbody');
	if (view.tab === 'schedule') renderSchedule(tabBody, club, member, me);
	else if (view.tab === 'discuss') renderDiscuss(tabBody, club, me);
	else if (view.tab === 'members') renderMembers(tabBody, club, member, me);
	else renderFeed(tabBody, club);
}

function renderSchedule(el, club, member, me) {
	const weeks = scheduleFor(club);
	el.innerHTML =
		'<div class="bc-weeklist">' +
			weeks.map(w => {
				const doneCount = member ? w.chapters.filter(ch => member.done.includes(ch)).length : 0;
				const allDone = doneCount === w.chapters.length;
				return '<article class="bc-card bc-week">' +
					'<div class="bc-row"><h4 class="bc-h4">Week ' + w.week + '</h4>' +
					'<span class="bc-dim">due ' + escapeHtml(w.due) + '</span></div>' +
					'<p class="bc-meta">' + chapterLabel(w.chapters) + '</p>' +
					(member
						? (allDone
							? '<span class="bc-done">✓ Done</span>'
							: '<button type="button" class="bc-btn" data-doneweek="' + w.week + '">Mark week ' + w.week + ' done (' + doneCount + '/' + w.chapters.length + ')</button>')
						: '<p class="bc-dim">Join the club to track your reading.</p>') +
				'</article>';
			}).join('') +
		'</div>';
	el.querySelectorAll('[data-doneweek]').forEach(btn => btn.addEventListener('click', () => {
		const week = weeks.find(w => w.week === Number(btn.dataset.doneweek));
		const m = clubById(view.clubId).members.find(x => x.name === me);
		if (!m) return;
		week.chapters.forEach(ch => { if (!m.done.includes(ch)) m.done.push(ch); });
		const clubNow = clubById(view.clubId);
		clubNow.feed.push({ at: nowStamp(), text: me + ' finished ' + chapterLabel(week.chapters).toLowerCase() + '.' });
		persistClub(clubNow);
		render();
	}));
}

function renderDiscuss(el, club, me) {
	const chapters = range(1, club.totalChapters);
	const ch = Math.min(Math.max(1, view.threadChapter), club.totalChapters);
	const posts = (club.threads && club.threads[String(ch)]) || [];
	el.innerHTML =
		'<div class="bc-section">' +
			'<label class="bc-label">Discussion thread for<select class="bc-input" id="bc-chaptersel">' +
				chapters.map(n => '<option value="' + n + '"' + (n === ch ? ' selected' : '') + '>Chapter ' + n + '</option>').join('') +
			'</select></label>' +
			'<div class="bc-threads">' +
				(posts.length
					? posts.map((p, pi) =>
						'<article class="bc-card bc-post">' +
							'<p class="bc-post-text">' + escapeHtml(p.text) + '</p>' +
							'<p class="bc-post-meta">' + escapeHtml(p.author) + ' · ' + escapeHtml(p.at) + '</p>' +
							(p.replies.length
								? '<ul class="bc-replies">' + p.replies.map(r =>
									'<li><strong>' + escapeHtml(r.author) + '</strong> <span class="bc-dim">' + escapeHtml(r.at) + '</span><br>' + escapeHtml(r.text) + '</li>').join('') + '</ul>'
								: '') +
							'<form class="bc-row" data-replyform="' + pi + '">' +
								'<label class="bc-label bc-sr" for="bc-reply-' + pi + '">Reply</label>' +
								'<input class="bc-input" id="bc-reply-' + pi + '" maxlength="400" placeholder="Write a reply…">' +
								'<button type="submit" class="bc-btn">Reply</button>' +
							'</form>' +
						'</article>').join('')
					: '<p class="bc-dim">No discussion yet for chapter ' + ch + ' — start it.</p>') +
			'</div>' +
			'<form class="bc-card" id="bc-postform">' +
				'<label class="bc-label" for="bc-posttext">Start a thread on chapter ' + ch + '</label>' +
				'<textarea class="bc-input bc-textarea" id="bc-posttext" rows="2" maxlength="600" placeholder="Share a thought or ask a question…"></textarea>' +
				'<button type="submit" class="bc-btn bc-btn-primary">Post</button>' +
			'</form>' +
		'</div>';

	el.querySelector('#bc-chaptersel').addEventListener('change', (e) => {
		view.threadChapter = Number(e.target.value);
		render();
	});
	el.querySelector('#bc-postform').addEventListener('submit', (e) => {
		e.preventDefault();
		const v = el.querySelector('#bc-posttext').value.trim();
		if (!v) return;
		const c = clubById(view.clubId);
		c.threads = c.threads || {};
		const key = String(ch);
		c.threads[key] = c.threads[key] || [];
		c.threads[key].push({ author: me, at: nowStamp(), text: v, replies: [] });
		c.feed.push({ at: nowStamp(), text: me + ' posted in the chapter ' + ch + ' discussion.' });
		persistClub(c);
		render();
	});
	el.querySelectorAll('[data-replyform]').forEach(form => form.addEventListener('submit', (e) => {
		e.preventDefault();
		const pi = Number(form.dataset.replyform);
		const v = form.querySelector('input').value.trim();
		if (!v) return;
		const c = clubById(view.clubId);
		c.threads[String(ch)][pi].replies.push({ author: me, at: nowStamp(), text: v });
		persistClub(c);
		render();
	}));
}

function renderMembers(el, club, member, me) {
	el.innerHTML =
		'<ul class="bc-members">' +
			club.members.map(m => {
				const pct = Math.round((m.done.length / club.totalChapters) * 100);
				return '<li class="bc-card bc-member">' +
					'<div class="bc-row"><strong>' + escapeHtml(m.name) + '</strong>' +
					(m.me ? '<span class="bc-tag">you</span>' : '') +
					'<span class="bc-dim">' + m.done.length + '/' + club.totalChapters + ' chapters · ' + pct + '%</span></div>' +
					'<div class="bc-progress"><div class="bc-progress-fill" style="width:' + pct + '%"></div></div>' +
				'</li>';
			}).join('') +
		'</ul>' +
		(member ? '' : '<p class="bc-dim">Join the club to track your own progress.</p>');
}

function renderFeed(el, club) {
	el.innerHTML =
		'<ul class="bc-feedlist">' +
			(club.feed.length
				? club.feed.slice().reverse().map(f =>
					'<li><span class="bc-dim">' + escapeHtml(f.at) + '</span> — ' + escapeHtml(f.text) + '</li>').join('')
				: '<li class="bc-dim">Nothing here yet.</li>') +
		'</ul>';
}
