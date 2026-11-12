// B"H — Awtsmoos Music Player app: wires the folder picker, the library,
// playlists, sorting, and the player together.
import { db } from './db.js';
import {
	isAudioName, fileToTrack, pickFolder,
	collectFromDrop, resolveTrackFile, handleNeedsPermission,
} from './library.js';
import { Player } from './player.js';
import { Visualizer } from './visualizer.js';

const $ = (id) => document.getElementById(id);
const audioEl = $('audio');
const viz = new Visualizer($('visualizer'), audioEl);

const state = {
	tracks: new Map(),
	playlists: [],
	folderHandles: [],
	view: { type: 'all', id: null },
	sort: 'name-asc',
	query: '',
	seeking: false,
};

const player = new Player(audioEl, {
	loadFile: loadTrackFile,
	onTrack: (track) => { renderNow(track); renderTracks(); renderQueue(); },
	onTime: updateTime,
	onState: updatePlayButtons,
	onQueue: renderQueue,
});

// Debug handle: the headless rendered checks drive the background handoff
// through this (player.enterBackground / enterForeground) instead of
// guessing from the UI.
window.__awtsmoosMusic = { player, viz };

function toast(msg, sticky) {
	const el = $('toast');
	el.textContent = msg;
	el.classList.add('show');
	el.classList.toggle('sticky', !!sticky);
	clearTimeout(toast.timer);
	if (!sticky) toast.timer = setTimeout(() => el.classList.remove('show', 'sticky'), 3200);
}

// Every failure gets a human-readable line, shown on screen and kept in
// Diagnostics — nothing in the add flow fails silently any more.
function errText(err) {
	if (!err) return 'Unknown error';
	if (typeof err === 'string') return err;
	return (err.name ? err.name + ': ' : '') + (err.message || String(err));
}

function logError(stage, err) {
	const text = stage + ' — ' + errText(err);
	console.warn('[music]', text, err);
	const diag = $('diag-error');
	if (diag) {
		diag.textContent = new Date().toLocaleTimeString() + ' — ' + text;
		diag.classList.add('diag-err');
		const box = $('diagnostics');
		if (box) box.open = true;
	}
	toast(text, true); // error toasts stay until tapped
}

function updateDiagSupport() {
	const el = $('diag-support');
	if (!el) return;
	el.textContent = 'Folder picker: ' + ('showDirectoryPicker' in window ? 'yes' : 'no')
		+ ' · File picker: ' + ('showOpenFilePicker' in window ? 'yes' : 'no')
		+ ' · Saved library: ' + ('indexedDB' in window ? 'yes' : 'no');
}

function fmtTime(sec) {
	if (!Number.isFinite(sec) || sec == null) return '0:00';
	const s = Math.round(sec);
	return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
function fmtDate(ts) {
	try { return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
	catch (err) { return ''; }
}
function fmtSize(bytes) {
	if (bytes > 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
	if (bytes > 1024) return Math.round(bytes / 1024) + ' KB';
	return bytes + ' B';
}
// ---------- loading / saving ----------
async function init() {
	// Surface every uncaught error on screen, so a failure is never silent again.
	window.addEventListener('error', (e) => logError('Something went wrong', e.error || e.message));
	window.addEventListener('unhandledrejection', (e) => logError('Something went wrong', e.reason));
	updateDiagSupport();
	try {
		const tracks = await db.getAllTracks();
		for (const t of tracks) state.tracks.set(t.id, t);
		state.playlists = await db.getAllPlaylists();
		state.folderHandles = (await db.getMeta('folderHandles')) || [];
	} catch (err) {
		console.warn('Library could not be loaded', err);
		toast('This browser could not open the saved library. Songs still play for this visit.');
	}
	wireEvents();
	try {
		renderAll();
	} catch (err) {
		logError('Showing the library failed', err);
	}
	checkReconnect();
	viz.drawIdle(true);
}

async function checkReconnect() {
	for (const t of state.tracks.values()) {
		try { if (await handleNeedsPermission(t)) { $('btn-reconnect').hidden = false; return; } }
		catch (err) { /* handle without permission API; ignore */ }
	}
}

async function saveFolderHandle(name, handle) {
	if (!handle) return;
	state.folderHandles = state.folderHandles.filter((f) => f.name !== name);
	state.folderHandles.push({ name, handle });
	try { await db.putMeta('folderHandles', state.folderHandles); } catch (err) { console.warn('Could not save folder', err); }
}

async function reconnectFolders() {
	let ok = 0;
	for (const f of state.folderHandles) {
		try {
			const p = await f.handle.requestPermission({ mode: 'read' });
			if (p === 'granted') ok++;
		} catch (err) { /* keep going */ }
	}
	if (ok) { $('btn-reconnect').hidden = true; toast('Folder reconnected — your songs are ready to play.'); }
	else toast('Permission was not granted. Try opening the folder again.');
}

// ---------- adding music ----------
async function addPicked(picked) {
	const { files, sourceName, dirHandle } = picked;
	if (!files.length) { toast('No audio files found there.'); return; }
	const total = files.length;
	const known = new Set(Array.from(state.tracks.values()).map((t) => t.name + '|' + t.size + '|' + t.lastModified));
	let added = 0, dupes = 0, done = 0;
	const failures = [];
	// Sticky progress: the old static toast vanished after 3s while a big
	// folder was still being read, so the library looked dead for minutes.
	const showProgress = () => toast('Adding ' + done + ' of ' + total + '…', true);
	showProgress();
	const processOne = async ({ file, handle }) => {
		const key = file.name + '|' + file.size + '|' + file.lastModified;
		if (known.has(key)) { dupes++; return; }
		known.add(key);
		try {
			const track = await fileToTrack(file, sourceName, handle);
			try {
				await db.putTrack(track);
			} catch (saveErr) {
				// Some browsers cannot store a folder handle — keep the file itself instead.
				const fallback = { ...track, handle: null, blob: file };
				await db.putTrack(fallback);
				track.handle = null;
				track.blob = file;
			}
			state.tracks.set(track.id, track);
			added++;
		} catch (err) {
			failures.push(file.name + ' — ' + errText(err));
		}
	};
	// Four files at a time: a phone reads metadata far faster in parallel
	// than one-by-one, and one slow file can no longer stall the whole folder.
	// Songs also appear in the list as they land instead of only at the end.
	let next = 0;
	const worker = async () => {
		for (;;) {
			const item = next < total ? files[next++] : null;
			if (!item) return;
			await processOne(item);
			done++;
			showProgress();
			if (done % 5 === 0) { try { renderAll(); } catch { /* final render below */ } }
		}
	};
	await Promise.all(Array.from({ length: Math.min(4, total) }, worker));
	try {
		if (dirHandle) await saveFolderHandle(sourceName, dirHandle);
	} catch (err) {
		logError('Saving the folder link failed', err);
	}
	try {
		renderAll();
	} catch (err) {
		logError('Showing the library failed', err);
		return;
	}
	if (failures.length) {
		logError('Could not add ' + failures.length + ' file' + (failures.length === 1 ? '' : 's'), new Error(failures.slice(0, 3).join('; ')));
	} else if (added) {
		toast(added + ' song' + (added === 1 ? '' : 's') + ' added to your library.' + (dupes ? ' (' + dupes + ' already there.)' : ''));
	} else if (dupes) {
		toast('Those songs are already in your library.');
	} else {
		toast('Nothing was added.');
	}
}

// Open folder: the system folder picker when this browser has one
// (desktop Chrome, Android Chrome 132+). On older Android there is no folder
// picker at all, so the button opens the plain file picker instead and says
// so — picking the songs inside a folder by hand always works.
function openFolder() {
	if (window.showDirectoryPicker) { openFolderAsync(); return; }
	if (/Android/i.test(navigator.userAgent)) {
		toast('This Chrome can’t open a whole folder — pick the songs inside it instead.');
		$('file-input').click();
		return;
	}
	folderInputFallback();
}

async function openFolderAsync() {
	try {
		// The scan itself used to show nothing at all until every file was
		// read — on a phone that can be a long silence for a big folder.
		const picked = await pickFolder((n) => toast('Found ' + n + ' song' + (n === 1 ? '' : 's') + ' in this folder so far…', true));
		await addPicked(picked);
	} catch (err) {
		if (err && err.name === 'AbortError') return; // user closed the picker
		logError('Opening the folder failed', err);
		folderInputFallback();
	}
}

function folderInputFallback() {
	const input = document.createElement('input');
	input.type = 'file';
	input.multiple = true;
	input.setAttribute('webkitdirectory', '');
	input.accept = 'audio/*';
	input.onchange = async () => {
		try {
			const files = Array.from(input.files || []).filter((f) => isAudioName(f.name));
			if (!files.length) {
				toast('No files chosen — this browser may not support picking a whole folder. Try Add files instead.');
				return;
			}
			const sourceName = files[0] ? (files[0].webkitRelativePath || '').split('/')[0] : 'Folder';
			await addPicked({ files: files.map((f) => ({ file: f, handle: null })), sourceName, dirHandle: null });
		} catch (err) {
			logError('Reading the chosen folder failed', err);
		}
	};
	input.click();
}

// ---------- playback ----------
async function loadTrackFile(id) {
	const track = state.tracks.get(id);
	if (!track) return null;
	try {
		const file = await resolveTrackFile(track);
		return { track, file };
	} catch (err) {
		if (err && err.message === 'permission-denied') {
			$('btn-reconnect').hidden = false;
			toast('This browser needs permission to read that folder again — tap Reconnect folder.');
		} else {
			toast('Could not open “' + track.title + '”. It may have moved — try adding it again.');
		}
		return null;
	}
}

async function playTrack(id) {
	if (!state.tracks.has(id)) return;
	if (!player.queue.includes(id) || player.queue.length === 0) player.setQueue(visibleIds(), id);
	const ok = await player.playId(id, loadTrackFile);
	if (ok) viz.start();
}

async function playAll() {
	const ids = visibleIds();
	if (!ids.length) { toast('Add some songs first.'); return; }
	player.setQueue(ids, ids[0]);
	const ok = await player.playCurrent(loadTrackFile);
	if (ok) viz.start();
}

function visibleIds() {
	return filteredTracks().map((t) => t.id);
}

// ---------- filtering / sorting ----------
function filteredTracks() {
	let list;
	if (state.view.type === 'playlist') {
		const pl = state.playlists.find((p) => p.id === state.view.id);
		list = (pl ? pl.trackIds : []).map((id) => state.tracks.get(id)).filter(Boolean);
	} else {
		list = Array.from(state.tracks.values());
	}
	const q = state.query.trim().toLowerCase();
	if (q) list = list.filter((t) => (t.title + ' ' + t.artist + ' ' + t.name).toLowerCase().includes(q));
	// Sort by the FILE name, not the parsed song title: a folder like
	// "001 …", "002 …" must list in track order, 001 first. Numeric-aware
	// so 9 comes before 10 even without zero-padding.
	const byName = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
		|| (a.title || '').localeCompare(b.title || '');
	switch (state.sort) {
		case 'name-asc': list.sort(byName); break;
		case 'name-desc': list.sort((a, b) => byName(b, a)); break;
		case 'added-desc': list.sort((a, b) => b.dateAdded - a.dateAdded); break;
		case 'added-asc': list.sort((a, b) => a.dateAdded - b.dateAdded); break;
		case 'date-desc': list.sort((a, b) => b.lastModified - a.lastModified); break;
		case 'date-asc': list.sort((a, b) => a.lastModified - b.lastModified); break;
		case 'duration-desc': list.sort((a, b) => (b.duration || 0) - (a.duration || 0)); break;
		case 'duration-asc': list.sort((a, b) => (a.duration || 0) - (b.duration || 0)); break;
	}
	return list;
}

// ---------- rendering ----------
function renderAll() {
	renderPlaylists();
	renderSources();
	renderTracks();
	renderQueue();
	updateStats();
}

function renderPlaylists() {
	const ul = $('playlist-list');
	const all = document.createElement('li');
	all.className = state.view.type === 'all' ? 'active' : '';
	all.innerHTML = '<span class="pl-name">All songs</span><span class="pl-count">' + state.tracks.size + '</span>';
	all.onclick = () => { state.view = { type: 'all', id: null }; renderAll(); };
	ul.replaceChildren(all);
	for (const pl of state.playlists) {
		const li = document.createElement('li');
		li.className = state.view.type === 'playlist' && state.view.id === pl.id ? 'active' : '';
		const name = document.createElement('span');
		name.className = 'pl-name';
		name.textContent = pl.name;
		const count = document.createElement('span');
		count.className = 'pl-count';
		count.textContent = pl.trackIds.length;
		const del = document.createElement('button');
		del.className = 'pl-del';
		del.textContent = '×';
		del.title = 'Delete playlist';
		del.setAttribute('aria-label', 'Delete playlist ' + pl.name);
		del.onclick = async (e) => {
			e.stopPropagation();
			await db.deletePlaylist(pl.id);
			state.playlists = state.playlists.filter((p) => p.id !== pl.id);
			if (state.view.id === pl.id) state.view = { type: 'all', id: null };
			renderAll();
			toast('Playlist deleted.');
		};
		li.append(name, count, del);
		li.onclick = () => { state.view = { type: 'playlist', id: pl.id }; renderAll(); };
		ul.appendChild(li);
	}
}

function renderSources() {
	const ul = $('source-list');
	const names = Array.from(new Set(Array.from(state.tracks.values()).map((t) => t.source).filter(Boolean)));
	if (!names.length) { ul.innerHTML = '<li>No folders added yet.</li>'; return; }
	ul.replaceChildren(...names.map((n) => {
		const li = document.createElement('li');
		li.innerHTML = '<span class="src-dot">●</span> ';
		li.appendChild(document.createTextNode(n));
		return li;
	}));
}

function renderTracks() {
	const list = filteredTracks();
	const title = state.view.type === 'playlist'
		? (state.playlists.find((p) => p.id === state.view.id) || { name: 'Playlist' }).name
		: 'All songs';
	$('list-title').textContent = title;
	$('track-count').textContent = list.length + ' song' + (list.length === 1 ? '' : 's');
	$('empty-state').style.display = state.tracks.size ? 'none' : 'block';
	const ol = $('track-list');
	ol.replaceChildren(...list.map((t, i) => trackRow(t, i)));
}

function trackRow(t, i) {
	const li = document.createElement('li');
	li.className = 'track-row' + (player.currentTrack && player.currentTrack.id === t.id ? ' playing' : '');
	li.dataset.id = t.id;
	const num = document.createElement('span');
	num.className = 't-num';
	num.textContent = player.currentTrack && player.currentTrack.id === t.id ? '♪' : String(i + 1);
	const name = document.createElement('div');
	name.className = 't-name';
	const title = document.createElement('span');
	title.className = 't-title';
	title.textContent = t.title || t.name;
	const sub = document.createElement('span');
	sub.className = 't-sub';
	sub.textContent = [t.artist, fmtSize(t.size)].filter(Boolean).join(' · ');
	name.append(title, sub);
	const dur = document.createElement('span');
	dur.className = 't-meta';
	dur.textContent = t.duration ? fmtTime(t.duration) : '–:–';
	const date = document.createElement('span');
	date.className = 't-meta t-date';
	date.textContent = fmtDate(t.lastModified);
	const actions = document.createElement('div');
	actions.className = 't-actions';
	const addBtn = document.createElement('button');
	addBtn.innerHTML = '+ <span>Playlist</span>';
	addBtn.title = 'Add to playlist';
	addBtn.setAttribute('aria-label', 'Add ' + t.title + ' to a playlist');
	addBtn.onclick = (e) => { e.stopPropagation(); openAddMenu(t.id, addBtn); };
	const delBtn = document.createElement('button');
	delBtn.textContent = 'Remove';
	delBtn.title = 'Remove from library';
	delBtn.setAttribute('aria-label', 'Remove ' + t.title);
	delBtn.onclick = async (e) => {
		e.stopPropagation();
		await removeTrack(t.id);
	};
	if (state.view.type === 'playlist') {
		delBtn.textContent = 'Remove from playlist';
		delBtn.onclick = async (e) => {
			e.stopPropagation();
			await removeFromPlaylist(state.view.id, t.id);
		};
	}
	actions.append(addBtn, delBtn);
	li.append(num, name, dur, date, actions);
	li.onclick = () => playTrack(t.id);
	return li;
}

function renderQueue() {
	const ol = $('queue-list');
	const ids = player.queue.slice(player.index >= 0 ? player.index : 0);
	if (!player.queue.length) { ol.innerHTML = '<li class="empty-note">Nothing queued — press Play all.</li>'; return; }
	ol.replaceChildren(...ids.map((id, i) => {
		const t = state.tracks.get(id);
		const li = document.createElement('li');
		if (i === 0) li.className = 'current';
		const name = document.createElement('span');
		name.className = 'q-name';
		name.textContent = t ? (t.title || t.name) : 'Unknown track';
		const del = document.createElement('button');
		del.className = 'q-del';
		del.textContent = '×';
		del.setAttribute('aria-label', 'Remove from queue');
		del.onclick = (e) => {
			e.stopPropagation();
			player.queue.splice(player.index + i, 1);
			renderQueue();
		};
		li.append(name, del);
		li.onclick = () => { player.index = player.index + i; player.playCurrent(loadTrackFile).then((ok) => { if (ok) viz.start(); }); };
		return li;
	}));
}

function renderNow(track) {
	track = track || player.currentTrack;
	const art = document.querySelector('.hero-art');
	if (!track) {
		$('now-state').textContent = 'Ready';
		$('now-title').textContent = 'Pick a song to begin';
		$('now-artist').textContent = 'Open a folder or add files — your music never leaves your device.';
		$('now-meta').textContent = '';
		$('mini-title').textContent = 'Nothing playing';
		$('mini-artist').textContent = 'Awtsmoos Music';
		art.classList.remove('playing');
		return;
	}
	$('now-state').textContent = player.playing ? 'Now playing' : 'Paused';
	$('now-title').textContent = track.title || track.name;
	$('now-artist').textContent = track.artist || (track.source ? 'From ' + track.source : 'My Library');
	$('now-meta').textContent = [track.duration ? fmtTime(track.duration) : '', fmtDate(track.lastModified), fmtSize(track.size)].filter(Boolean).join(' · ');
	$('mini-title').textContent = track.title || track.name;
	$('mini-artist').textContent = track.artist || 'Awtsmoos Music';
	art.classList.add('playing');
	updatePlayButtons();
}

function updatePlayButtons() {
	const playing = player.playing;
	$('btn-play').innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
	$('mini-play').innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
	$('btn-shuffle').classList.toggle('on', player.shuffle);
	$('btn-repeat').classList.toggle('on', player.repeat !== 'off');
	$('btn-repeat').title = 'Repeat: ' + player.repeat;
	$('now-state').textContent = player.currentTrack ? (playing ? 'Now playing' : 'Paused') : 'Ready';
	document.querySelector('.hero-art').classList.toggle('playing', !!player.currentTrack);
}

function updateTime() {
	const dur = player.duration || 0;
	const cur = player.currentTime || 0;
	$('time-cur').textContent = fmtTime(cur);
	$('time-total').textContent = fmtTime(dur);
	if (!state.seeking && dur) $('seek').value = String(Math.round((cur / dur) * 1000));
	$('mini-progress').style.width = dur ? ((cur / dur) * 100) + '%' : '0%';
}

function updateStats() {
	const total = state.tracks.size;
	const secs = Array.from(state.tracks.values()).reduce((a, t) => a + (t.duration || 0), 0);
	$('library-stats').textContent = total
		? total + ' song' + (total === 1 ? '' : 's') + ' · ' + state.playlists.length + ' playlist' + (state.playlists.length === 1 ? '' : 's') + ' · ' + fmtTime(secs) + ' total'
		: 'No songs yet.';
}

// ---------- playlists ----------
async function createPlaylist() {
	const name = $('new-playlist-name').value.trim();
	if (!name) { toast('Give the playlist a name first.'); return; }
	if (state.playlists.some((p) => p.name.toLowerCase() === name.toLowerCase())) { toast('That playlist already exists.'); return; }
	const pl = { id: 'pl-' + Date.now().toString(36), name, trackIds: [], created: Date.now() };
	state.playlists.push(pl);
	await db.putPlaylist(pl);
	$('new-playlist-name').value = '';
	state.view = { type: 'playlist', id: pl.id };
	renderAll();
	toast('Playlist “' + name + '” created.');
}

async function removeTrack(id) {
	const track = state.tracks.get(id);
	state.tracks.delete(id);
	await db.deleteTrack(id);
	for (const pl of state.playlists) {
		if (pl.trackIds.includes(id)) {
			pl.trackIds = pl.trackIds.filter((x) => x !== id);
			await db.putPlaylist(pl);
		}
	}
	if (player.currentTrack && player.currentTrack.id === id) { player.pause(); player.currentTrack = null; renderNow(null); }
	renderAll();
	toast('Removed “' + (track ? track.title : 'song') + '”.');
}

async function removeFromPlaylist(plId, trackId) {
	const pl = state.playlists.find((p) => p.id === plId);
	if (!pl) return;
	pl.trackIds = pl.trackIds.filter((x) => x !== trackId);
	await db.putPlaylist(pl);
	renderAll();
}

function openAddMenu(trackId, anchor) {
	const pop = $('menu-popover');
	if (!state.playlists.length) {
		toast('Create a playlist first — type a name on the left and press Create.');
		return;
	}
	pop.innerHTML = '<h3>Add to playlist</h3>';
	for (const pl of state.playlists) {
		const b = document.createElement('button');
		b.textContent = pl.name + (pl.trackIds.includes(trackId) ? ' ✓' : '');
		b.onclick = async () => {
			if (!pl.trackIds.includes(trackId)) {
				pl.trackIds.push(trackId);
				await db.putPlaylist(pl);
				renderPlaylists();
				toast('Added to “' + pl.name + '”.');
			}
			pop.hidden = true;
		};
		pop.appendChild(b);
	}
	const r = anchor.getBoundingClientRect();
	pop.style.left = Math.min(window.innerWidth - 290, Math.max(8, r.left)) + 'px';
	pop.style.top = Math.min(window.innerHeight - 220, r.bottom + 8) + 'px';
	pop.hidden = false;
}

// ---------- events ----------
// One toggle for both breakpoints: desktop hides with .collapsed, the phone
// drawer shows only with .open. The × inside the drawer uses the same toggle.
function toggleLibrary() {
	const p = $('panel-library');
	p.classList.toggle('collapsed');
	p.classList.toggle('open');
}

function wireEvents() {
	$('btn-folder').onclick = openFolder;
	$('btn-folder-empty').onclick = openFolder;
	// "Add files" is a <label> for the file input, so it needs no click handler
	// at all — the tap opens the picker natively. Keyboard: Enter/Space on it.
	$('btn-files').addEventListener('keydown', (e) => {
		if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('file-input').click(); }
	});
	$('file-input').onchange = async (e) => {
		try {
			const files = Array.from(e.target.files || []).filter((f) => isAudioName(f.name));
			if (!files.length) { toast('No audio files were chosen.'); return; }
			await addPicked({ files: files.map((f) => ({ file: f, handle: null })), sourceName: 'Chosen files', dirHandle: null });
		} catch (err) {
			logError('Adding the chosen files failed', err);
		} finally {
			e.target.value = '';
		}
	};
	$('btn-reconnect').onclick = reconnectFolders;
	$('search').oninput = (e) => { state.query = e.target.value; renderTracks(); };
	$('sort').onchange = (e) => { state.sort = e.target.value; renderTracks(); };
	$('btn-new-playlist').onclick = createPlaylist;
	$('new-playlist-name').addEventListener('keydown', (e) => { if (e.key === 'Enter') createPlaylist(); });
	$('btn-clear-library').onclick = async () => {
		if (!state.tracks.size) return;
		if (!confirm('Remove all ' + state.tracks.size + ' songs from this browser library? Your files on your device are not touched.')) return;
		player.pause();
		await db.clearTracks();
		state.tracks.clear();
		player.queue = [];
		player.index = -1;
		player.currentTrack = null;
		renderAll();
		renderNow(null);
		toast('Library cleared.');
	};
	$('btn-play-all').onclick = playAll;
	$('btn-play').onclick = async () => { const ok = await player.toggle(); if (ok && player.currentTrack) viz.start(); else if (!player.currentTrack) playAll(); };
	$('mini-play').onclick = async () => { const ok = await player.toggle(); if (ok && player.currentTrack) viz.start(); else if (!player.currentTrack) playAll(); };
	$('btn-prev').onclick = () => player.prev();
	$('btn-next').onclick = () => player.next();
	$('mini-prev').onclick = () => player.prev();
	$('mini-next').onclick = () => player.next();
	$('btn-shuffle').onclick = () => { player.shuffleQueue(!player.shuffle); updatePlayButtons(); renderQueue(); };
	$('btn-repeat').onclick = () => { player.cycleRepeat(); updatePlayButtons(); toast('Repeat: ' + player.repeat + '.'); };
	$('mini-expand').onclick = () => document.querySelector('.hero').scrollIntoView({ behavior: 'smooth', block: 'start' });
	$('toggle-library').onclick = toggleLibrary;
	$('btn-close-library').onclick = toggleLibrary;
	$('toast').onclick = () => $('toast').classList.remove('show', 'sticky');
	$('toggle-queue').onclick = () => $('panel-queue').classList.toggle('collapsed');
	$('btn-clear-queue').onclick = () => { player.queue = []; player.index = -1; renderQueue(); };

	$('seek').addEventListener('pointerdown', () => { state.seeking = true; });
	$('seek').addEventListener('input', (e) => {
		const dur = player.duration || 0;
		if (dur) $('time-cur').textContent = fmtTime((Number(e.target.value) / 1000) * dur);
	});
	$('seek').addEventListener('change', (e) => {
		const dur = player.duration || 0;
		if (dur) player.seek((Number(e.target.value) / 1000) * dur);
		state.seeking = false;
	});
	$('volume').oninput = (e) => player.setVolume(Number(e.target.value) / 100);
	$('rate').onchange = (e) => player.setRate(Number(e.target.value));
	player.setVolume(0.85);

	// Background: while the page is hidden, playback lives on the direct
	// audio element (Player.enterBackground); when it returns, playback
	// hands back to the visualizer element and the graph resumes.
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) { player.enterBackground(); }
		else { player.enterForeground(); viz.resume(); }
	});

	document.addEventListener('click', (e) => {
		if (!$('menu-popover').hidden && !e.target.closest('#menu-popover') && !e.target.closest('.t-actions')) $('menu-popover').hidden = true;
	});

	// Drag and drop a folder or files anywhere on the page.
	let dragDepth = 0;
	document.addEventListener('dragenter', (e) => {
		if (!e.dataTransfer || !Array.from(e.dataTransfer.types || []).includes('Files')) return;
		dragDepth++;
		document.body.classList.add('dragging');
		e.preventDefault();
	});
	document.addEventListener('dragleave', () => {
		dragDepth = Math.max(0, dragDepth - 1);
		if (!dragDepth) document.body.classList.remove('dragging');
	});
	document.addEventListener('dragover', (e) => { if (document.body.classList.contains('dragging')) e.preventDefault(); });
	document.addEventListener('drop', async (e) => {
		dragDepth = 0;
		document.body.classList.remove('dragging');
		if (!e.dataTransfer) return;
		e.preventDefault();
		try {
			const picked = await collectFromDrop(e.dataTransfer);
			await addPicked(picked);
		} catch (err) { console.warn('Drop failed', err); toast('Could not read those dropped files.'); }
	});
}

init();
