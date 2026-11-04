//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Owner actions for the post reader page.
 * @description When the viewing alias authored the post being read, a small
 * action row appears above the body: Edit (title, and body when the post
 * carries plain-text content) and Delete, both through the canonical
 * series-scoped post routes. Non-owners never see the row. The server gates
 * (a signed-in session plus heichel authority for the acting alias) remain
 * the real enforcement, and any refusal is shown with the server's own
 * message. Posts whose body lives in structured sections can have their
 * title edited here; the body field is then shown read-only with the
 * reason, so an edit can never silently flatten a structured post.
 */

const STYLE_ID = 'postOwnerActionsStyle';
const ROW_ID = 'postOwnerActions';

function viewerAlias() {
	return window.curAlias || window.currentAlias || '';
}

function postContext(win = window) {
	const post = win.post || {};
	const segments = win.location.pathname.split('/').filter(Boolean);
	const heichelId = post.heichel?.id || post.heichelId || segments[1] || '';
	// The bare reader URL (/heichelos/<heichel>/post/<postId>) has no series
	// segment: segments[3] there is the post id itself, never the series.
	const pathSeries = segments[2] === 'series' ? (segments[3] || '') : '';
	const seriesId = win.series?.id || post.parentSeriesId || post.seriesId || pathSeries || 'root';
	const postId = post.id || post.postId || '';
	return { post, heichelId, seriesId, postId };
}

/**
 * Ownership is the record's own testimony: canonical records carry `author`,
 * rich records may carry only `aliasId`. Either field, exactly matching the
 * viewing alias, proves the post is the viewer's.
 */
function isPostOwner(post, alias) {
	const owner = String(post?.author || post?.aliasId || '').trim();
	return Boolean(owner && alias) && owner === String(alias).trim();
}

function postUrl({ heichelId, seriesId, postId }) {
	return `/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/post/${encodeURIComponent(postId)}`;
}

function serverMessage(error) {
	if (!error) return 'The server refused this change.';
	if (typeof error === 'string') return error;
	// Server error details are sometimes structured objects (for example a
	// POST_NOT_FOUND details map). Returning one verbatim made the dialog
	// render "[object Object]"; only string fields may reach the reader.
	if (typeof error.message === 'string' && error.message) return error.message;
	if (typeof error.details === 'string' && error.details) return error.details;
	if (typeof error.code === 'string' && error.code) return error.code;
	return 'The server refused this change.';
}

async function send(url, method, fields) {
	const response = await fetch(url, {
		method,
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams(fields)
	});
	let data = null;
	try { data = await response.json(); } catch { /* non-JSON error body */ }
	if (!response.ok && !data) throw new Error(`Request failed (${response.status}).`);
	return data;
}

function injectStyle() {
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
		.post-owner-actions{display:flex;gap:10px;align-items:center;margin:14px 0;padding:10px 12px;border:1px dashed rgba(127,127,127,.55);border-radius:10px;font-size:14px}
		.post-owner-actions .poa-label{opacity:.75;margin-right:auto}
		.post-owner-actions button{padding:7px 14px;border-radius:8px;border:1px solid rgba(127,127,127,.5);background:transparent;color:inherit;cursor:pointer;font:inherit}
		.post-owner-actions .poa-delete{border-color:rgba(200,60,60,.65);color:#e0655f}
		.poa-overlay{position:fixed;inset:0;z-index:1300;background:rgba(4,6,12,.66);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:28px 14px}
		.poa-panel{background:#14161f;color:#f2ead8;border:1px solid rgba(255,255,255,.16);border-radius:14px;max-width:620px;width:100%;padding:20px 22px;box-shadow:0 18px 50px rgba(0,0,0,.5)}
		.poa-panel h2{margin:0 0 10px;font-size:20px}
		.poa-panel label{display:block;margin:10px 0;font-size:14px}
		.poa-panel input,.poa-panel textarea{display:block;width:100%;margin-top:5px;padding:9px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:inherit;font:inherit;box-sizing:border-box}
		.poa-panel textarea{min-height:180px}
		.poa-row{display:flex;gap:12px;align-items:center;margin-top:14px;flex-wrap:wrap}
		.poa-row button{padding:9px 16px;border-radius:8px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:inherit;cursor:pointer;font-size:14px}
		.poa-row .poa-confirm-delete{background:rgba(160,30,30,.85);border-color:rgba(255,120,120,.6);color:#fff}
		.poa-note{font-size:13px;line-height:1.5;opacity:.85}
		.poa-error{font-size:14px;color:#ff9c9c;min-height:1.2em}
		.poa-scope{font-size:14px;line-height:1.5;background:rgba(255,80,80,.08);border:1px solid rgba(255,80,80,.3);border-radius:8px;padding:10px 12px}
	`;
	document.head.appendChild(style);
}

function makeOverlay(id) {
	closeOverlay(id);
	const overlay = document.createElement('div');
	overlay.className = 'poa-overlay';
	overlay.id = id;
	overlay.addEventListener('click', (event) => {
		if (event.target === overlay) overlay.remove();
	});
	document.body.appendChild(overlay);
	return overlay;
}

function closeOverlay(id) {
	document.getElementById(id)?.remove();
}

function openEditor(ctx) {
	const { post } = ctx;
	const overlay = makeOverlay('poaEditOverlay');
	const panel = document.createElement('div');
	panel.className = 'poa-panel';
	panel.setAttribute('role', 'dialog');
	panel.setAttribute('aria-label', 'Edit post');

	const heading = document.createElement('h2');
	heading.textContent = 'Edit post';
	panel.appendChild(heading);

	const titleLabel = document.createElement('label');
	titleLabel.textContent = 'Title';
	const titleInput = document.createElement('input');
	titleInput.type = 'text';
	titleInput.maxLength = 100;
	titleInput.value = post.title || '';
	titleLabel.appendChild(titleInput);
	panel.appendChild(titleLabel);

	const bodyLabel = document.createElement('label');
	bodyLabel.textContent = 'Body';
	const bodyInput = document.createElement('textarea');
	bodyInput.maxLength = 15784;
	const seededBody = typeof post.content === 'string' && post.content.length > 0 ? post.content : null;
	if (seededBody !== null) {
		bodyInput.value = seededBody;
	} else {
		bodyInput.value = '';
		bodyInput.disabled = true;
		bodyInput.placeholder = 'This post\u2019s body is stored as structured sections.';
	}
	bodyLabel.appendChild(bodyInput);
	panel.appendChild(bodyLabel);
	if (seededBody === null) {
		const note = document.createElement('p');
		note.className = 'poa-note';
		note.textContent = 'Only the title can be changed here — the body of this post lives in structured sections, and this editor never rewrites them into plain text.';
		panel.appendChild(note);
	}

	const error = document.createElement('p');
	error.className = 'poa-error';
	panel.appendChild(error);

	const row = document.createElement('div');
	row.className = 'poa-row';
	const save = document.createElement('button');
	save.type = 'button';
	save.textContent = 'Save changes';
	const cancel = document.createElement('button');
	cancel.type = 'button';
	cancel.textContent = 'Cancel';
	cancel.addEventListener('click', () => overlay.remove());
	save.addEventListener('click', async () => {
		save.disabled = true;
		error.textContent = '';
		try {
			const fields = { aliasId: viewerAlias(), newTitle: titleInput.value.trim() };
			if (seededBody !== null && bodyInput.value !== seededBody) {
				if (!bodyInput.value.trim()) {
					throw new Error('An empty body cannot be saved — the existing body text is kept. Add text, or cancel to leave the post unchanged.');
				}
				fields.newContent = bodyInput.value;
			}
			if (!fields.newTitle) throw new Error('A title is required.');
			const res = await send(postUrl(ctx), 'PUT', fields);
			if (res?.error) throw new Error(serverMessage(res.error));
			overlay.remove();
			showNotice('Post saved. Reloading with the updated text…');
			setTimeout(() => window.location.reload(), 700);
		} catch (e) {
			error.textContent = e.message || 'Save failed.';
			save.disabled = false;
		}
	});
	row.appendChild(save);
	row.appendChild(cancel);
	panel.appendChild(row);
	overlay.appendChild(panel);
	titleInput.focus();
}

function openDelete(ctx) {
	const { post } = ctx;
	const overlay = makeOverlay('poaDeleteOverlay');
	const panel = document.createElement('div');
	panel.className = 'poa-panel';
	panel.setAttribute('role', 'dialog');
	panel.setAttribute('aria-label', 'Delete post');

	const heading = document.createElement('h2');
	heading.textContent = 'Delete this post?';
	panel.appendChild(heading);

	const scope = document.createElement('p');
	scope.className = 'poa-scope';
	scope.textContent = `\u201C${post.title || 'Untitled post'}\u201D will be removed from its series, together with all of its comments. Your post list and the series listing update immediately. This cannot be undone.`;
	panel.appendChild(scope);

	const error = document.createElement('p');
	error.className = 'poa-error';
	panel.appendChild(error);

	const row = document.createElement('div');
	row.className = 'poa-row';
	const confirmButton = document.createElement('button');
	confirmButton.type = 'button';
	confirmButton.className = 'poa-confirm-delete';
	confirmButton.textContent = 'Delete post permanently';
	const cancel = document.createElement('button');
	cancel.type = 'button';
	cancel.textContent = 'Keep the post';
	cancel.addEventListener('click', () => overlay.remove());
	confirmButton.addEventListener('click', async () => {
		confirmButton.disabled = true;
		error.textContent = '';
		try {
			const res = await send(postUrl(ctx), 'DELETE', { aliasId: viewerAlias() });
			if (res?.error) throw new Error(serverMessage(res.error));
			overlay.remove();
			showNotice('Post deleted. Taking you back to the series…');
			const target = `/heichelos/${encodeURIComponent(ctx.heichelId)}/?view=series&series=${encodeURIComponent(ctx.seriesId)}`;
			setTimeout(() => { window.location.href = target; }, 900);
		} catch (e) {
			error.textContent = e.message || 'Delete failed.';
			confirmButton.disabled = false;
		}
	});
	row.appendChild(confirmButton);
	row.appendChild(cancel);
	panel.appendChild(row);
	overlay.appendChild(panel);
	cancel.focus();
}

function showNotice(text) {
	let row = document.getElementById(ROW_ID);
	if (!row) return;
	row.querySelectorAll('button').forEach(b => { b.disabled = true; });
	const label = row.querySelector('.poa-label');
	if (label) label.textContent = text;
}

function mount(ctx) {
	if (document.getElementById(ROW_ID)) return;
	injectStyle();
	const row = document.createElement('div');
	row.className = 'post-owner-actions';
	row.id = ROW_ID;
	const label = document.createElement('span');
	label.className = 'poa-label';
	label.textContent = 'This is your post.';
	row.appendChild(label);
	const edit = document.createElement('button');
	edit.type = 'button';
	edit.textContent = 'Edit post';
	edit.addEventListener('click', () => openEditor(ctx));
	row.appendChild(edit);
	const del = document.createElement('button');
	del.type = 'button';
	del.className = 'poa-delete';
	del.textContent = 'Delete post';
	del.addEventListener('click', () => openDelete(ctx));
	row.appendChild(del);

	const anchor = document.getElementById('realPost');
	if (anchor?.parentElement) anchor.parentElement.insertBefore(row, anchor);
	else document.body.prepend(row);

	if (new URLSearchParams(window.location.search).get('edit') === '1') {
		openEditor(ctx);
	}
}

/**
 * Waits for the reader to publish the post record and for the shell to
 * publish the viewing alias, then mounts the owner row only when the two
 * meet on the same alias. Anything else leaves the page exactly as it was.
 * The wait is generous (240 ticks ≈ 60 s): on a slow or recovering backend
 * the reader's own scripts and the session alias can arrive long after the
 * first paint, and a 12 s give-up made the owner's only Edit/Delete
 * controls silently never appear.
 */
export function initPostOwnerActions() {
	let ticks = 0;
	const timer = setInterval(() => {
		ticks++;
		const ctx = postContext();
		const alias = viewerAlias();
		if (ctx.postId && alias) {
			clearInterval(timer);
			if (isPostOwner(ctx.post, alias)) mount(ctx);
			return;
		}
		if (ticks > 240) clearInterval(timer);
	}, 250);
}

export { postContext, isPostOwner };
