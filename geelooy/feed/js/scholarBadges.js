// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ScholarBadges
 * @description
 * Yaakov 2026-10-14 (TRACK J): verified scholar badges.
 *
 * - Badge UI: a gold verified checkmark + "Scholar" label that appears next
 *   to the author's name on feed cards, on comments, and on Q&A answers.
 * - Application flow: any reader can apply from the badge menu; the
 *   application lands in a localStorage queue. Admin approval is backend
 *   work that is out of scope — a lightweight admin view (open the feed
 *   with ?scholar-admin=1) reviews the queue and approves locally.
 * - Approved scholars are stored in localStorage and decorated
 *   automatically via a MutationObserver, so badges appear on posts,
 *   comments, and answers without touching other modules.
 *
 * Yaakov's rules honored: no !important (styling is in scholarBadges.css),
 * user-facing strings show display names only — never raw alias IDs or
 * machine slugs.
 */

const SCHOLARS_KEY = 'awtsmoos-scholars:v1';
const APPLY_KEY = 'awtsmoos-scholar-applications:v1';
const ADMIN_FLAG = 'scholar-admin';

function readJson(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		const val = raw ? JSON.parse(raw) : fallback;
		return Array.isArray(val) ? val : fallback;
	} catch (_) {
		return fallback;
	}
}

function writeJson(key, val) {
	try {
		localStorage.setItem(key, JSON.stringify(val));
	} catch (_) { /* storage is best effort */ }
}

function escapeHtml(s) {
	return String(s ?? '').replace(/[&<>"']/g, c => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	}[c]));
}

function currentAlias() {
	return window.curAlias || window.currentAlias ||
		document.body?.dataset?.aliasId ||
		localStorage.getItem('awtsmoos-alias') || 'anonymous';
}

/** @returns {Array<{aliasId, aliasName, approvedAt}>} */
export function getScholars() {
	return readJson(SCHOLARS_KEY, []);
}

/** @returns {Array<{aliasId, aliasName, credentials, areas, sample, appliedAt, status}>} */
export function getApplications() {
	return readJson(APPLY_KEY, []);
}

function norm(s) {
	return String(s || '').trim().toLowerCase();
}

export function isScholar(aliasId, aliasName) {
	const a = norm(aliasId), n = norm(aliasName);
	if (!a && !n) return false;
	return getScholars().some(s => (a && norm(s.aliasId) === a) || (n && norm(s.aliasName) === n));
}

/**
 * Badge HTML for an approved scholar.
 * @param {string} [name] Display name, used only for the accessible label.
 */
export function renderScholarBadge(name) {
	const label = name ? `Verified scholar: ${name}` : 'Verified scholar';
	return `<span class="scholar-badge" role="img" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">` +
		`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
		`<path d="M12 2.5 14.5 5l3.5-.5 1 3.4 3 2-1.6 3.1 1.6 3.1-3 2-1 3.4-3.5-.5L12 23.5 9.5 21l-3.5.5-1-3.4-3-2L3.6 13 2 9.9l3-2 1-3.4 3.5.5z" transform="scale(0.92) translate(1,0.4)"/>` +
		`<path d="m8.8 12.2 2.3 2.3 4.2-4.6"/></svg>` +
		`<span class="scholar-badge-label">Scholar</span></span>`;
}

function hasBadge(el) {
	return !!el.querySelector(':scope > .scholar-badge, :scope + .scholar-badge');
}

function aliasIdOfAuthorLink(link) {
	const href = link.getAttribute('href') || '';
	const m = href.match(/^\/@(.+)$/);
	return m ? decodeURIComponent(m[1]) : '';
}

/** Decorate one feed card's author row. */
function decorateCard(card) {
	const authorLink = card.querySelector('.feed-card-author');
	if (!authorLink || hasBadge(authorLink)) return;
	const aliasId = card.dataset.aliasId || aliasIdOfAuthorLink(authorLink);
	const name = authorLink.textContent.trim();
	if (isScholar(aliasId, name)) {
		authorLink.insertAdjacentHTML('afterend', renderScholarBadge(name));
	}
}

/** Decorate one comment head (matches by display name). */
function decorateComment(head) {
	const nameEl = head.querySelector('.feed-comment-author');
	if (!nameEl || hasBadge(nameEl)) return;
	const name = nameEl.textContent.trim();
	if (isScholar('', name)) {
		nameEl.insertAdjacentHTML('afterend', renderScholarBadge(name));
	}
}

/** Q&A answers: answers render with author names — hook any [data-scholar-name]. */
function decorateScholarNameEl(el) {
	if (hasBadge(el)) return;
	const name = (el.dataset.scholarName || el.textContent || '').trim();
	if (name && isScholar('', name)) {
		el.insertAdjacentHTML('afterend', renderScholarBadge(name));
	}
}

export function decorateScholars(root = document) {
	root.querySelectorAll('.feed-card[data-post-id]').forEach(decorateCard);
	root.querySelectorAll('.feed-comment-head').forEach(decorateComment);
	root.querySelectorAll('[data-scholar-name]').forEach(decorateScholarNameEl);
}

/* ------------------------------------------------------------------ */
/* application flow                                                    */
/* ------------------------------------------------------------------ */

let applyModal = null;

function closeApplyModal() {
	if (applyModal) {
		document.removeEventListener('keydown', applyModal._onKey);
		applyModal.remove();
		applyModal = null;
	}
	document.body.classList.remove('sb-open');
}

export function openScholarApplication(prefill = {}) {
	closeApplyModal();
	const aliasId = currentAlias();
	const apps = getApplications();
	const pending = apps.find(a => norm(a.aliasId) === norm(aliasId) && a.status === 'pending');

	applyModal = document.createElement('div');
	applyModal.className = 'sb-modal';
	applyModal.setAttribute('role', 'dialog');
	applyModal.setAttribute('aria-modal', 'true');
	applyModal.setAttribute('aria-label', 'Apply for a verified scholar badge');
	applyModal.innerHTML = `
		<div class="sb-backdrop" data-sb-close></div>
		<div class="sb-panel" role="document">
			<header class="sb-head">
				<h2>Become a verified scholar</h2>
				<button type="button" class="sb-close" data-sb-close aria-label="Close application">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
				</button>
			</header>
			<div class="sb-body">
				${pending ? `<p class="sb-status">Your application from ${escapeHtml(new Date(pending.appliedAt).toLocaleDateString())} is still under review. We will update you here.</p>` : `
				<p class="sb-lede">Verified scholars get a gold badge beside their name on posts, comments, and answers. Tell us about your learning so the community can trust the badge.</p>
				<form class="sb-form" data-sb-form>
					<label class="sb-field">
						<span class="sb-label">Your display name</span>
						<input class="sb-input" name="aliasName" type="text" required maxlength="80"
							value="${escapeHtml(prefill.aliasName || '')}" placeholder="How the community knows you">
					</label>
					<label class="sb-field">
						<span class="sb-label">Credentials</span>
						<textarea class="sb-input" name="credentials" rows="3" required maxlength="600"
							placeholder="Semichah, kollel, degrees, years of learning — whatever backs the badge.">${escapeHtml(prefill.credentials || '')}</textarea>
					</label>
					<label class="sb-field">
						<span class="sb-label">Areas of expertise</span>
						<input class="sb-input" name="areas" type="text" maxlength="200"
							value="${escapeHtml(prefill.areas || '')}" placeholder="e.g. Chassidus, Halachah, Tanach">
					</label>
					<label class="sb-field">
						<span class="sb-label">A post or answer you are proud of (link, optional)</span>
						<input class="sb-input" name="sample" type="url" maxlength="300"
							value="${escapeHtml(prefill.sample || '')}" placeholder="https://awtsmoos.com/…">
					</label>
					<button type="submit" class="sb-btn sb-btn-primary">Submit application</button>
					<p class="sb-note">Applications are reviewed by the Awtsmoos team. The badge appears once approved.</p>
				</form>`}
			</div>
		</div>`;
	document.body.append(applyModal);
	document.body.classList.add('sb-open');

	applyModal.querySelectorAll('[data-sb-close]').forEach(el => el.addEventListener('click', closeApplyModal));
	applyModal._onKey = (e) => { if (e.key === 'Escape') closeApplyModal(); };
	document.addEventListener('keydown', applyModal._onKey);

	const form = applyModal.querySelector('[data-sb-form]');
	if (form) {
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			const fd = new FormData(form);
			const apps2 = getApplications();
			apps2.push({
				aliasId,
				aliasName: String(fd.get('aliasName') || '').trim(),
				credentials: String(fd.get('credentials') || '').trim(),
				areas: String(fd.get('areas') || '').trim(),
				sample: String(fd.get('sample') || '').trim(),
				appliedAt: Date.now(),
				status: 'pending'
			});
			writeJson(APPLY_KEY, apps2);
			closeApplyModal();
			openScholarApplication({ aliasName: String(fd.get('aliasName') || '') });
		});
	}
}

/* ------------------------------------------------------------------ */
/* admin review (local queue; backend approval is a later track)       */
/* ------------------------------------------------------------------ */

let adminPanel = null;

function closeAdminPanel() {
	if (adminPanel) { adminPanel.remove(); adminPanel = null; }
	document.body.classList.remove('sb-open');
}

export function openScholarAdmin() {
	closeAdminPanel();
	const apps = getApplications().filter(a => a.status === 'pending');

	adminPanel = document.createElement('div');
	adminPanel.className = 'sb-modal';
	adminPanel.setAttribute('role', 'dialog');
	adminPanel.setAttribute('aria-modal', 'true');
	adminPanel.setAttribute('aria-label', 'Scholar applications review');
	adminPanel.innerHTML = `
		<div class="sb-backdrop" data-sb-close></div>
		<div class="sb-panel sb-panel-wide" role="document">
			<header class="sb-head">
				<h2>Scholar applications <span class="sb-count">${apps.length} pending</span></h2>
				<button type="button" class="sb-close" data-sb-close aria-label="Close review">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
				</button>
			</header>
			<div class="sb-body">
				${apps.length ? apps.map((a, i) => `
					<article class="sb-app" data-sb-app="${i}">
						<header class="sb-app-head">
							<strong>${escapeHtml(a.aliasName || 'Unnamed applicant')}</strong>
							<time>${escapeHtml(new Date(a.appliedAt).toLocaleString())}</time>
						</header>
						<dl class="sb-app-facts">
							<div><dt>Areas</dt><dd>${escapeHtml(a.areas || '—')}</dd></div>
							<div><dt>Credentials</dt><dd>${escapeHtml(a.credentials || '—')}</dd></div>
							${a.sample ? `<div><dt>Sample</dt><dd><a href="${escapeHtml(a.sample)}" target="_blank" rel="noopener">${escapeHtml(a.sample)}</a></dd></div>` : ''}
						</dl>
						<div class="sb-app-actions">
							<button type="button" class="sb-btn sb-btn-primary" data-sb-approve="${i}">Approve &amp; badge</button>
							<button type="button" class="sb-btn" data-sb-reject="${i}">Decline</button>
						</div>
					</article>`).join('') : '<p class="sb-empty">No pending applications. The queue lives in this browser until the admin backend lands.</p>'}
			</div>
		</div>`;
	document.body.append(adminPanel);
	document.body.classList.add('sb-open');

	adminPanel.querySelectorAll('[data-sb-close]').forEach(el => el.addEventListener('click', closeAdminPanel));
	adminPanel.querySelectorAll('[data-sb-approve]').forEach(btn => {
		btn.addEventListener('click', () => {
			const list = getApplications().filter(a => a.status === 'pending');
			const app = list[Number(btn.dataset.sbApprove)];
			if (!app) return;
			const scholars = getScholars();
			if (!scholars.some(s => norm(s.aliasId) === norm(app.aliasId))) {
				scholars.push({ aliasId: app.aliasId, aliasName: app.aliasName, approvedAt: Date.now() });
				writeJson(SCHOLARS_KEY, scholars);
			}
			const all = getApplications();
			const orig = all.find(a => a.appliedAt === app.appliedAt && norm(a.aliasId) === norm(app.aliasId));
			if (orig) orig.status = 'approved';
			writeJson(APPLY_KEY, all);
			decorateScholars();
			openScholarAdmin();
		});
	});
	adminPanel.querySelectorAll('[data-sb-reject]').forEach(btn => {
		btn.addEventListener('click', () => {
			const list = getApplications().filter(a => a.status === 'pending');
			const app = list[Number(btn.dataset.sbReject)];
			if (!app) return;
			const all = getApplications();
			const orig = all.find(a => a.appliedAt === app.appliedAt && norm(a.aliasId) === norm(app.aliasId));
			if (orig) orig.status = 'declined';
			writeJson(APPLY_KEY, all);
			openScholarAdmin();
		});
	});
}

/* ------------------------------------------------------------------ */
/* init                                                                */
/* ------------------------------------------------------------------ */

/** "Scholar" entry point: a button beside the tours launcher. */
export function initScholarBadges() {
	decorateScholars();
	const river = document.getElementById('feed-river');
	if (river) {
		const mo = new MutationObserver((muts) => {
			for (const m of muts) {
				m.addedNodes.forEach(n => {
					if (n.nodeType !== 1) return;
					if (n.matches?.('.feed-card[data-post-id]')) decorateCard(n);
					else n.querySelectorAll && n.querySelectorAll('.feed-card[data-post-id]').forEach(decorateCard);
					if (n.matches?.('.feed-comment-head')) decorateComment(n);
					else n.querySelectorAll && n.querySelectorAll('.feed-comment-head').forEach(decorateComment);
				});
			}
		});
		mo.observe(river, { childList: true, subtree: true });
	}

	const topbar = document.querySelector('.feed-topbar');
	if (topbar) {
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'feed-ic-btn sb-apply-btn';
		btn.setAttribute('aria-label', 'Apply for a verified scholar badge');
		btn.title = 'Apply for a verified scholar badge';
		btn.innerHTML = `
			<svg class="feed-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
			<span class="feed-ic-btn-label">Scholar</span>`;
		btn.addEventListener('click', () => openScholarApplication());
		topbar.append(btn);
	}

	if (new URLSearchParams(location.search).get(ADMIN_FLAG) === '1') {
		openScholarAdmin();
	}
}
