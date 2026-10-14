// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LiveShiurim
 * @description
 * Yaakov 2026-10-13 (TRACK D): live shiurim for the feed.
 * - Schedule a class: title, time, description (stored in localStorage).
 * - Upcoming list with live countdown + "Remind me" (browser Notification).
 * - "Join live": a modal with a PLACEHOLDER video area ("Live stream
 *   connects here" until Yaakov picks a provider) + a WORKING live chat.
 * - Past classes archive with a recordings placeholder list.
 * No third-party video SDK — the video slot is a placeholder by design.
 */

import { icon, escapeHtml, escapeAttr } from './icons.js';

const STORE_KEY = 'awtsmoos-live-shiurim';
const REMIND_KEY = 'awtsmoos-live-reminders';
const CHAT_KEY = 'awtsmoos-live-chat';

function uid() {
	return 'sh' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function load(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch (_) { return fallback; }
}

function save(key, value) {
	try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
}

function currentAlias() {
	return window.curAlias || window.currentAlias || localStorage.getItem('awtsmoos-alias') || 'Guest';
}

function countdownParts(ts) {
	let diff = Math.max(0, ts - Date.now());
	const days = Math.floor(diff / 86400000); diff -= days * 86400000;
	const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
	const mins = Math.floor(diff / 60000);
	const secs = Math.floor((diff - mins * 60000) / 1000);
	return { days, hours, mins, secs };
}

function countdownText(ts) {
	const { days, hours, mins, secs } = countdownParts(ts);
	if (days > 0) return `${days}d ${hours}h ${mins}m`;
	if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
	return `${mins}m ${secs}s`;
}

function isLive(cls) {
	const now = Date.now();
	return now >= cls.startsAt && now <= cls.startsAt + (cls.durationMin || 60) * 60000;
}

function isPast(cls) {
	return Date.now() > cls.startsAt + (cls.durationMin || 60) * 60000;
}

/* ---------------- scheduling ---------------- */

function scheduleFormHtml() {
	const min = new Date(Date.now() + 3600000).toISOString().slice(0, 16);
	return `
		<form class="live-form" data-live-schedule>
			<h3 class="live-sec-title">Schedule a live shiur</h3>
			<label class="live-label" for="live-title">Title</label>
			<input class="live-input" id="live-title" name="title" type="text" maxlength="120" required placeholder="e.g. Likutei Torah — weekly shiur">
			<label class="live-label" for="live-time">Date and time</label>
			<input class="live-input" id="live-time" name="startsAt" type="datetime-local" min="${min}" required>
			<label class="live-label" for="live-dur">Length (minutes)</label>
			<input class="live-input live-input-narrow" id="live-dur" name="durationMin" type="number" min="10" max="480" value="60">
			<label class="live-label" for="live-desc">Description</label>
			<textarea class="live-input live-textarea" id="live-desc" name="description" rows="3" maxlength="1000" placeholder="What will this shiur cover?"></textarea>
			<button class="live-primary" type="submit">Schedule shiur</button>
		</form>`;
}

/* ---------------- lists ---------------- */

function upcomingHtml(classes, reminders) {
	const upcoming = classes.filter((c) => !isPast(c)).sort((a, b) => a.startsAt - b.startsAt);
	if (!upcoming.length) return '<p class="live-empty">No shiurim scheduled yet. Schedule one above.</p>';
	return '<ul class="live-list">' + upcoming.map((c) => {
		const live = isLive(c);
		const reminded = reminders.includes(c.id);
		return `
		<li class="live-item${live ? ' is-live' : ''}" data-live-id="${escapeAttr(c.id)}">
			<div class="live-item-main">
				<span class="live-item-title" dir="auto">${escapeHtml(c.title)}</span>
				<span class="live-item-meta">${live ? 'LIVE NOW' : new Date(c.startsAt).toLocaleString()}${c.description ? ' — ' + escapeHtml(c.description) : ''}</span>
				${live ? '' : `<span class="live-countdown" data-countdown="${c.startsAt}">Starts in ${countdownText(c.startsAt)}</span>`}
			</div>
			<div class="live-item-tools">
				${live
					? `<button type="button" class="live-primary" data-live-join="${escapeAttr(c.id)}">${icon('video')} Join live</button>`
					: `<button type="button" class="feed-ic-btn" data-live-remind="${escapeAttr(c.id)}" aria-pressed="${reminded}">${icon('bell')}<span class="feed-ic-btn-label">${reminded ? 'Reminder on' : 'Remind me'}</span></button>`}
			</div>
		</li>`;
	}).join('') + '</ul>';
}

function archiveHtml(classes) {
	const past = classes.filter(isPast).sort((a, b) => b.startsAt - a.startsAt);
	if (!past.length) return '<p class="live-empty">No past shiurim yet — finished classes land here with their recordings.</p>';
	return '<ul class="live-list">' + past.map((c) => `
		<li class="live-item is-past">
			<div class="live-item-main">
				<span class="live-item-title" dir="auto">${escapeHtml(c.title)}</span>
				<span class="live-item-meta">${new Date(c.startsAt).toLocaleString()}${c.description ? ' — ' + escapeHtml(c.description) : ''}</span>
				<span class="live-recording">${icon('video', 'live-recording-ic')} Recording placeholder — the video file attaches here when Yaakov picks a provider</span>
			</div>
		</li>`).join('') + '</ul>';
}

/* ---------------- live room ---------------- */

function chatHtml(cls) {
	return `
		<section class="live-room" role="dialog" aria-label="Live shiur: ${escapeAttr(cls.title)}">
			<header class="live-room-head">
				<div>
					<h2 dir="auto">${escapeHtml(cls.title)}</h2>
					<p class="live-room-sub"><span class="live-dot" aria-hidden="true"></span> LIVE — ${escapeHtml(cls.description || 'Live shiur')}</p>
				</div>
				<button type="button" class="feed-ic-btn" data-live-leave aria-label="Leave live shiur">${icon('close')}<span class="feed-ic-btn-label">Leave</span></button>
			</header>
			<div class="live-video">
				<div class="live-video-placeholder">
					${icon('video', 'live-video-ic')}
					<p>Live stream connects here</p>
					<p class="live-video-sub">Waiting on Yaakov\u2019s video provider choice — the player mounts in this exact slot.</p>
				</div>
			</div>
			<div class="live-chat">
				<h3 class="live-sec-title">Live chat</h3>
				<ul class="live-chat-log" data-chat-log aria-live="polite"></ul>
				<form class="live-chat-form" data-chat-form>
					<input class="live-input" type="text" maxlength="400" placeholder="Say something kind\u2026" aria-label="Chat message" autocomplete="off">
					<button class="live-primary" type="submit">Send</button>
				</form>
			</div>
		</section>`;
}

function paintChat(log, clsId) {
	const msgs = load(CHAT_KEY, {})[clsId] || [];
	log.innerHTML = msgs.map((m) => `
		<li class="live-chat-msg">
			<span class="live-chat-who" dir="auto">${escapeHtml(m.who)}</span>
			<span class="live-chat-when">${new Date(m.at).toLocaleTimeString()}</span>
			<span class="live-chat-text" dir="auto">${escapeHtml(m.text)}</span>
		</li>`).join('');
	log.scrollTop = log.scrollHeight;
}

function openLiveRoom(cls, container) {
	container.innerHTML = chatHtml(cls);
	const log = container.querySelector('[data-chat-log]');
	const form = container.querySelector('[data-chat-form]');
	const input = form.querySelector('input');
	paintChat(log, cls.id);
	container.querySelector('[data-live-leave]').addEventListener('click', () => {
		container.innerHTML = '';
		container.hidden = true;
	});
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const text = input.value.trim();
		if (!text) return;
		const all = load(CHAT_KEY, {});
		const msgs = all[cls.id] || [];
		msgs.push({ who: currentAlias(), text, at: Date.now() });
		all[cls.id] = msgs.slice(-200);
		save(CHAT_KEY, all);
		input.value = '';
		paintChat(log, cls.id);
	});
	// B"H — chat polls localStorage so a second tab's messages appear too.
	const poll = setInterval(() => {
		if (!document.body.contains(log)) { clearInterval(poll); return; }
		paintChat(log, cls.id);
	}, 3000);
	container.hidden = false;
}

/* ---------------- panel ---------------- */

function panelHtml() {
	return `
		<div class="live-panel" role="dialog" aria-label="Live shiurim">
			<header class="live-panel-head">
				<h2>${icon('video', 'live-panel-ic')} Live shiurim</h2>
				<button type="button" class="feed-ic-btn" data-live-close aria-label="Close live shiurim">${icon('close')}</button>
			</header>
			<div class="live-panel-body">
				<div data-live-schedule-slot></div>
				<h3 class="live-sec-title">Upcoming</h3>
				<div data-live-upcoming></div>
				<h3 class="live-sec-title">Past shiurim</h3>
				<div data-live-archive></div>
				<div class="live-room-slot" data-live-room hidden></div>
			</div>
		</div>`;
}

/**
 * Mounts the live-shiurim launcher into the feed topbar: a "Live" button
 * opening the schedule/upcoming/archive panel.
 */
export function initLiveShiurim() {
	const topbar = document.querySelector('.feed-topbar');
	if (!topbar || topbar.querySelector('.live-launch-btn')) return;

	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'feed-ic-btn live-launch-btn';
	btn.innerHTML = `${icon('video')}<span class="feed-ic-btn-label">Live</span>`;
	btn.setAttribute('aria-label', 'Live shiurim');
	topbar.appendChild(btn);

	let panel = null;
	let tick = null;

	function closePanel() {
		if (tick) { clearInterval(tick); tick = null; }
		if (panel) { panel.remove(); panel = null; }
	}

	function paintLists() {
		if (!panel) return;
		const classes = load(STORE_KEY, []);
		const reminders = load(REMIND_KEY, []);
		panel.querySelector('[data-live-upcoming]').innerHTML = upcomingHtml(classes, reminders);
		panel.querySelector('[data-live-archive]').innerHTML = archiveHtml(classes);
	}

	function checkReminders() {
		const classes = load(STORE_KEY, []);
		const reminders = load(REMIND_KEY, []);
		const now = Date.now();
		for (const c of classes) {
			if (!reminders.includes(c.id) || isPast(c)) continue;
			const ms = c.startsAt - now;
			if (ms > 0 && ms < 5 * 60000 && !c._reminded) {
				c._reminded = true;
				save(STORE_KEY, classes);
				if ('Notification' in window && Notification.permission === 'granted') {
					try { new Notification('Live shiur starting soon', { body: `${c.title} starts in ${countdownText(c.startsAt)}` }); } catch (_) {}
				}
			}
		}
	}

	function openPanel() {
		if (panel) { closePanel(); return; }
		panel = document.createElement('div');
		panel.className = 'live-wrap';
		panel.innerHTML = panelHtml();
		panel.querySelector('[data-live-schedule-slot]').innerHTML = scheduleFormHtml();
		document.body.appendChild(panel);

		paintLists();
		checkReminders();
		tick = setInterval(() => {
			paintLists();
			checkReminders();
			// Keep every countdown ticking once a second.
			panel?.querySelectorAll('[data-countdown]').forEach((el) => {
				el.textContent = 'Starts in ' + countdownText(Number(el.dataset.countdown));
			});
		}, 1000);

		panel.querySelector('[data-live-close]').addEventListener('click', closePanel);
		panel.addEventListener('click', (e) => { if (e.target === panel) closePanel(); });
		document.addEventListener('keydown', function esc(e) {
			if (e.key === 'Escape') { closePanel(); document.removeEventListener('keydown', esc); }
		});

		const form = panel.querySelector('[data-live-schedule]');
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			const data = new FormData(form);
			const startsAt = new Date(String(data.get('startsAt'))).getTime();
			if (!startsAt || Number.isNaN(startsAt)) return;
			const classes = load(STORE_KEY, []);
			classes.push({
				id: uid(),
				title: String(data.get('title') || 'Shiur').trim() || 'Shiur',
				startsAt,
				durationMin: Math.min(480, Math.max(10, Number(data.get('durationMin')) || 60)),
				description: String(data.get('description') || '').trim()
			});
			save(STORE_KEY, classes);
			form.reset();
			paintLists();
		});

		panel.addEventListener('click', (e) => {
			const remindBtn = e.target.closest('[data-live-remind]');
			const joinBtn = e.target.closest('[data-live-join]');
			if (remindBtn) {
				const id = remindBtn.dataset.liveRemind;
				let reminders = load(REMIND_KEY, []);
				if (reminders.includes(id)) {
					reminders = reminders.filter((r) => r !== id);
				} else {
					if ('Notification' in window && Notification.permission === 'default') {
						Notification.requestPermission().catch(() => {});
					}
					reminders.push(id);
				}
				save(REMIND_KEY, reminders);
				paintLists();
			}
			if (joinBtn) {
				const id = joinBtn.dataset.liveJoin;
				const cls = load(STORE_KEY, []).find((c) => c.id === id);
				if (cls) openLiveRoom(cls, panel.querySelector('[data-live-room]'));
			}
		});
	}

	btn.addEventListener('click', openPanel);
}
