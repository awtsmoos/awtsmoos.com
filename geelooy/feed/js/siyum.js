// B"H
/**
 * @module SiyumTracker
 * @description
 * B"H — Yaakov 2026-10-13: siyum tracker. Mark a sefer or series as
 * "learning", track progress as a percentage, and celebrate at 100% with
 * yarmulke-emoji confetti. "Make a siyum" composes a completion message you
 * can share to the feed. Tracks are stored in localStorage under
 * awtsmoos-feed-siyum-tracks. A slim progress banner is injected on series
 * pages (/heichelos/:h/series/:s) when a track matches the series.
 */

import { icon, escapeHtml, escapeAttr } from './icons.js';

const STORE_KEY = 'awtsmoos-feed-siyum-tracks';
const EMOJI_BASE = 'https://awtsmoos.com/api/social/drive/public/awtsfixmvplwhac/repo-image-mirror/geelooy/feed/assets/emojis';
const CELEBRATION_EMOJIS = ['guy-cheering', 'tada', 'clapping', 'fire', 'crown', 'partying-face', 'star-eyes', 'bulb'];

function uid() {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
	return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function readStore(fallback) {
	try {
		const raw = localStorage.getItem(STORE_KEY);
		return raw ? JSON.parse(raw) : fallback;
	} catch (_) { return fallback; }
}

function writeStore(value) {
	try { localStorage.setItem(STORE_KEY, JSON.stringify(value)); return true; }
	catch (_) { return false; }
}

export function loadTracks() {
	return readStore([]);
}

export function saveTracks(tracks) {
	return writeStore(tracks);
}

export function trackProgress(track) {
	const total = Math.max(1, Number(track.total) || 1);
	return Math.min(100, Math.round((Number(track.done) || 0) / total * 100));
}

function isComplete(track) {
	return (Number(track.done) || 0) >= Math.max(1, Number(track.total) || 1);
}

/* ================= celebration ================= */

let celebrateEl = null;

function launchConfetti() {
	const canvas = document.createElement('canvas');
	canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147483003;overflow-x:clip';
	document.body.append(canvas);
	const ctx = canvas.getContext('2d');
	canvas.width = innerWidth;
	canvas.height = innerHeight;
	const imgs = CELEBRATION_EMOJIS.map(id => {
		const img = new Image();
		img.src = `${EMOJI_BASE}/${id}.png`;
		return img;
	});
	const pieces = Array.from({ length: 90 }, () => ({
		x: Math.random() * canvas.width,
		y: -40 - Math.random() * canvas.height * 0.5,
		size: 28 + Math.random() * 36,
		vy: 2 + Math.random() * 3.5,
		vx: -1.5 + Math.random() * 3,
		rot: Math.random() * Math.PI * 2,
		vr: -0.08 + Math.random() * 0.16,
		img: imgs[Math.floor(Math.random() * imgs.length)]
	}));
	let frames = 0;
	function tick() {
		frames += 1;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (const p of pieces) {
			p.x += p.vx;
			p.y += p.vy;
			p.rot += p.vr;
			if (p.y > canvas.height + 60) {
				p.y = -60;
				p.x = Math.random() * canvas.width;
			}
			ctx.save();
			ctx.translate(p.x, p.y);
			ctx.rotate(p.rot);
			try { ctx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size); } catch (_) {}
			ctx.restore();
		}
		if (frames < 60 * 9) requestAnimationFrame(tick);
		else canvas.remove();
	}
	requestAnimationFrame(tick);
}

function showCelebration(track) {
	if (celebrateEl) celebrateEl.remove();
	celebrateEl = document.createElement('div');
	celebrateEl.className = 'siyum-celebrate';
	celebrateEl.setAttribute('role', 'dialog');
	celebrateEl.setAttribute('aria-modal', 'true');
	celebrateEl.setAttribute('aria-label', 'Siyum celebration');
	celebrateEl.innerHTML = `
		<div class="siyum-celebrate-card">
			<div class="siyum-celebrate-faces" aria-hidden="true">
				${['tada', 'guy-cheering', 'crown'].map(id => `<img src="${EMOJI_BASE}/${id}.png" alt="" loading="lazy">`).join('')}
			</div>
			<h2>Mazel tov!</h2>
			<p>You completed <strong dir="auto">${escapeHtml(track.name || 'your learning')}</strong> — ${escapeHtml(String(track.total))} parts, start to finish.</p>
			<p>May your learning bring light to the world.</p>
			<div class="learn-row" style="justify-content:center;margin-top:16px">
				<button type="button" class="learn-btn primary" data-siyum="share">${icon('party')}<span>Make a siyum</span></button>
				<button type="button" class="learn-btn" data-siyum="close">Keep learning</button>
			</div>
		</div>`;
	document.body.append(celebrateEl);
	launchConfetti();
	celebrateEl.querySelector('[data-siyum="close"]').addEventListener('click', () => {
		celebrateEl.remove();
		celebrateEl = null;
	});
	celebrateEl.querySelector('[data-siyum="share"]').addEventListener('click', () => shareSiyum(track));
	document.addEventListener('keydown', function esc(e) {
		if (e.key === 'Escape' && celebrateEl) {
			celebrateEl.remove();
			celebrateEl = null;
			document.removeEventListener('keydown', esc);
		}
	});
}

/** "Make a siyum" — share the completion to the feed via the system share sheet. */
export function shareSiyum(track) {
	const text = `I just made a siyum on ${track.name || 'my learning'} — ${track.total} parts completed! Baruch Hashem. 📖`;
	const url = location.origin + '/feed/';
	const payload = { title: `Siyum: ${track.name || 'learning complete'}`, text, url };
	const done = () => {
		if (celebrateEl) { celebrateEl.remove(); celebrateEl = null; }
	};
	if (navigator.share) {
		navigator.share(payload).then(done, done).catch(() => {});
	} else {
		try { navigator.clipboard?.writeText(`${text} ${url}`); } catch (_) {}
		done();
	}
}

/* ================= hub mount ================= */

function trackCard(track) {
	const pct = trackProgress(track);
	const doneCount = Math.min(Number(track.done) || 0, Number(track.total) || 1);
	const complete = isComplete(track);
	return `
		<div class="learn-card" data-track="${escapeAttr(track.id)}">
			<h4 dir="auto">${escapeHtml(track.name || 'Untitled track')}</h4>
			<div class="learn-progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Progress for ${escapeAttr(track.name || 'track')}">
				<div class="learn-progress-fill" style="width:${pct}%"></div>
			</div>
			<div class="learn-progress-meta"><span>${doneCount} of ${escapeHtml(String(track.total))} parts</span><span>${pct}%</span></div>
			<div class="learn-row" style="margin-top:8px">
				${complete
					? `<span class="challenge-badge">${icon('trophy')}<span>Complete</span></span>
					   <button type="button" class="learn-btn" data-track-act="celebrate">${icon('party')}<span>Celebrate</span></button>
					   <button type="button" class="learn-btn" data-track-act="share">${icon('share')}<span>Make a siyum</span></button>`
					: `<button type="button" class="learn-btn" data-track-act="add">${icon('plus')}<span>Log a part</span></button>
					   <button type="button" class="learn-btn" data-track-act="undo">Undo</button>`}
				<button type="button" class="learn-btn danger" data-track-act="del">Delete</button>
			</div>
		</div>`;
}

export async function mount(el, ctx) {
	function render() {
		const tracks = loadTracks();
		const active = tracks.filter(t => !isComplete(t));
		const doneTracks = tracks.filter(t => isComplete(t));
		el.innerHTML = `
			<h3>Siyum tracker</h3>
			<p>Mark a sefer or series as “learning” and watch the progress climb. At 100%, we celebrate — and you can share your siyum.</p>
			<div class="learn-card">
				<h4>Start tracking</h4>
				<label class="learn-label" for="siyum-name">Sefer or series name</label>
				<input class="learn-input" id="siyum-name" maxlength="120" placeholder="e.g. Masechet Berachot">
				<label class="learn-label" for="siyum-total">Total parts</label>
				<input class="learn-input" id="siyum-total" type="number" min="1" max="100000" value="10">
				<div class="learn-row" style="margin-top:10px">
					<button type="button" class="learn-btn primary" data-siyum="new">${icon('flag')}<span>Start learning</span></button>
				</div>
			</div>
			${active.length ? `<h3>In progress (${active.length})</h3>${active.map(trackCard).join('')}` : ''}
			${doneTracks.length ? `<h3>Completed (${doneTracks.length})</h3>${doneTracks.map(trackCard).join('')}` : ''}
			${!tracks.length ? `<div class="learn-empty">${icon('flag')}<p>Nothing being tracked yet. Name a sefer above and begin.</p></div>` : ''}`;
		wire();
	}

	function wire() {
		el.querySelector('[data-siyum="new"]').addEventListener('click', () => {
			const name = el.querySelector('#siyum-name').value.trim();
			const total = Math.max(1, Math.min(100000, Number(el.querySelector('#siyum-total').value) || 1));
			if (!name) {
				el.querySelector('#siyum-name').focus();
				return;
			}
			const tracks = loadTracks();
			tracks.unshift({ id: uid(), name, total, done: 0, startedAt: Date.now(), celebrated: false });
			saveTracks(tracks);
			render();
		});
		el.querySelectorAll('[data-track]').forEach(card => {
			const id = card.dataset.track;
			card.querySelectorAll('[data-track-act]').forEach(btn => {
				btn.addEventListener('click', () => {
					const tracks = loadTracks();
					const track = tracks.find(t => t.id === id);
					if (!track) return;
					const act = btn.dataset.trackAct;
					if (act === 'add') {
						track.done = Math.min(Number(track.total) || 1, (Number(track.done) || 0) + 1);
						if (isComplete(track) && !track.celebrated) {
							track.completedAt = Date.now();
							track.celebrated = true;
							saveTracks(tracks);
							showCelebration(track);
							render();
							return;
						}
					} else if (act === 'undo') {
						track.done = Math.max(0, (Number(track.done) || 0) - 1);
					} else if (act === 'del') {
						if (!confirm('Stop tracking this?')) return;
						saveTracks(tracks.filter(t => t.id !== id));
						render();
						return;
					} else if (act === 'celebrate') {
						showCelebration(track);
						return;
					} else if (act === 'share') {
						shareSiyum(track);
						return;
					}
					saveTracks(tracks);
					render();
				});
			});
		});
	}

	render();
}

/* ================= series-page progress banner ================= */

let bannerWired = false;

/** Injects a slim progress banner on /heichelos/:h/series/:s pages. */
export function initCardHooks() {
	if (bannerWired) return;
	bannerWired = true;
	try {
		const m = location.pathname.match(/^\/heichelos\/[^/]+\/series\/([^/]+)/);
		if (!m) return;
		const seriesId = decodeURIComponent(m[1]);
		const tracks = loadTracks();
		const track = tracks.find(t => t.seriesId === seriesId && !isComplete(t))
			|| tracks.find(t => (t.name || '').toLowerCase().includes(seriesId.replace(/[-_]/g, ' ').toLowerCase()));
		if (!track) return;
		const pct = trackProgress(track);
		const banner = document.createElement('div');
		banner.className = 'siyum-series-banner';
		banner.innerHTML = `
			${icon('flag')}
			<strong dir="auto">${escapeHtml(track.name)}</strong>
			<div class="learn-progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><div class="learn-progress-fill" style="width:${pct}%"></div></div>
			<span>${pct}%</span>`;
		document.body.prepend(banner);
	} catch (_) {}
}
