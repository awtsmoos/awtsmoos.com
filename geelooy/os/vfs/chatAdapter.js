//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ChatAdapter
 * @description
 * Read-only VFS adapter that reveals the AI chat library as a filesystem.
 *
 * Layout:
 *   /Chats/<YYYY>/<MM>/<DD>/<chat-title-slug>/transcript.md
 *   /Chats/<YYYY>/<MM>/<DD>/<chat-title-slug>/summary.md
 *   /Chats/<YYYY>/<MM>/<DD>/<chat-title-slug>/files/            (touched-file pointers)
 *   /Chats/_labels/<label>/<chat-title-slug>                    (link -> chat folder)
 *   /Chats/_shortcuts/<name>                                    (link -> chat folder)
 *
 * ## The ChatStore interface
 *
 * The adapter never touches a backend itself. It is driven by a ChatStore:
 * any object implementing the following (all methods may be async):
 *
 *   listChats({ from, to })   -> ChatSummary[]     // from/to are ISO date strings; both optional
 *   getChat(id)               -> ChatSummary | null
 *   getTranscript(id)         -> ChatMessage[]
 *   getTouchedFiles(id)       -> TouchedFile[]
 *   searchChats(query)        -> ChatSummary[]
 *   getLabels()               -> { [label]: string[] }   // label -> chat ids
 *   getShortcuts()            -> { [name]: string }       // shortcut name -> chat id
 *   setChatLabel(id, label)   -> void
 *   clearChatLabel(id, label) -> void
 *   createChatShortcut(name, chatId) -> void
 *   deleteChatShortcut(name)  -> void
 *
 *   ChatSummary  = { id, title, slug?, createdAt, updatedAt, messageCount, summary?, labels? }
 *   ChatMessage  = { role: 'user'|'assistant'|'system', text, at?, files? }
 *   TouchedFile  = { path, label?, note? }
 *
 * Read-only by construction: write/move/copy/remove/mkdir/watch all return
 * `unsupported(...)` (the same shape as vfs/operations.js). The /Chats mount
 * is additionally declared READ_ONLY in defaultMountDefinitions.js so the
 * permissions gate (canUseMount) blocks mutations before they reach the adapter.
 *
 * Node shapes mirror vfs/node.js `vfsNode` ({ id, type, path, name, size,
 * mtime, data }) without importing it, keeping this module dependency-free
 * and unit-testable outside the OS runtime.
 *
 * A production backend binds here by passing its own ChatStore; the included
 * createMemoryChatStore is the in-browser reference implementation (memory,
 * persisted to localStorage when available).
 */

const ROOT = '/Chats';

function slugify(title) {
	return String(title || 'chat')
		.toLowerCase()
		.replace(/[^a-z0-9\u0590-\u05ff]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 64) || 'chat';
}

function pad(n) { return String(n).padStart(2, '0'); }

function dateParts(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return { y: '0000', m: '00', d: '00' };
	return { y: String(d.getUTCFullYear()), m: pad(d.getUTCMonth() + 1), d: pad(d.getUTCDate()) };
}

function chatSlug(chat) {
	return chat.slug || slugify(chat.title);
}

export function chatDatePath(chat) {
	const { y, m, d } = dateParts(chat.createdAt);
	return `${ROOT}/${y}/${m}/${d}/${chatSlug(chat)}`;
}

export function chatEntityRef(chat) {
	return `awts://entity/chat/${chat.id}`;
}

/* Minimal vfsNode-compatible builder (mirrors vfs/node.js shape). */
function node(path, type, data = {}) {
	const name = data.name || path.split('/').filter(Boolean).pop() || '/';
	return {
		id: `chat:${type}:${path}`,
		type,
		path,
		name,
		size: data.size || 0,
		mtime: data.mtime || new Date().toISOString(),
		data
	};
}

function unsupported(method, path = '') {
	return { ok: false, error: `vfs_${method}_not_implemented`, method, path };
}

function partsOf(path) {
	return String(path || ROOT)
		.replace(new RegExp(`^${ROOT}/?`), '')
		.split('/')
		.filter(Boolean)
		.map(decodeURIComponent);
}

function isDigits(s, len) { return new RegExp(`^\\d{${len}}$`).test(s); }

export function renderTranscript(chat, messages) {
	const lines = [];
	lines.push(`# ${chat.title || 'Chat'}`);
	lines.push('');
	lines.push(`- chat id: \`${chat.id}\``);
	lines.push(`- entity: \`${chatEntityRef(chat)}\``);
	lines.push(`- path: \`${chatDatePath(chat)}\``);
	if (chat.createdAt) lines.push(`- started: ${chat.createdAt}`);
	if (chat.updatedAt) lines.push(`- updated: ${chat.updatedAt}`);
	lines.push('');
	lines.push('---');
	for (const m of messages || []) {
		const who = m.role === 'assistant' ? 'Assistant' : m.role === 'user' ? 'User' : 'System';
		lines.push('');
		lines.push(`## ${who}${m.at ? ` — ${m.at}` : ''}`);
		lines.push('');
		lines.push(String(m.text || ''));
		if (Array.isArray(m.files) && m.files.length) {
			lines.push('');
			lines.push(`_files: ${m.files.join(', ')}_`);
		}
	}
	lines.push('');
	return lines.join('\n');
}

export function renderSummary(chat) {
	return [
		`# Summary — ${chat.title || 'Chat'}`,
		'',
		`- chat id: \`${chat.id}\``,
		`- entity: \`${chatEntityRef(chat)}\``,
		`- messages: ${chat.messageCount ?? 'unknown'}`,
		'',
		chat.summary || '_No summary recorded for this chat yet._',
		''
	].join('\n');
}

function fileEntryName(i, file) {
	const base = String(file.path || 'file').split('/').filter(Boolean).pop() || 'file';
	return `${String(i).padStart(2, '0')}-${base}`;
}

export function renderTouchedFile(chat, file) {
	return [
		`# Touched file — ${file.label || file.path}`,
		'',
		`- chat: \`${chat.title || chat.id}\` (\`${chatEntityRef(chat)}\`)`,
		`- canonical path: \`${file.path}\``,
		file.note ? `- note: ${file.note}` : null,
		'',
		'_This is a read-only pointer. Open the canonical path to read or edit the file._',
		''
	].filter(Boolean).join('\n');
}

export function chatAdapter(store, options = {}) {
	if (!store) throw new Error('chatAdapter requires a ChatStore');
	const root = options.root || ROOT;

	async function resolveSlug(dayParts, slug) {
		const [y, m, d] = dayParts;
		const from = `${y}-${m}-${d}T00:00:00.000Z`;
		const to = `${y}-${m}-${d}T23:59:59.999Z`;
		const chats = await store.listChats({ from, to });
		return (chats || []).find(c => chatSlug(c) === slug) || null;
	}

	async function listYears() {
		const chats = await store.listChats({});
		const years = [...new Set((chats || []).map(c => dateParts(c.createdAt).y))].sort();
		return years.map(y => node(`${root}/${y}`, 'folder', { name: y }));
	}

	async function listMonths(y) {
		const chats = await store.listChats({ from: `${y}-01-01T00:00:00.000Z`, to: `${y}-12-31T23:59:59.999Z` });
		const months = [...new Set((chats || []).map(c => dateParts(c.createdAt).m))].sort();
		return months.map(m => node(`${root}/${y}/${m}`, 'folder', { name: m }));
	}

	async function listDays(y, m) {
		const chats = await store.listChats({ from: `${y}-${m}-01T00:00:00.000Z`, to: `${y}-${m}-31T23:59:59.999Z` });
		const days = [...new Set((chats || []).map(c => dateParts(c.createdAt).d))].sort();
		return days.map(d => node(`${root}/${y}/${m}/${d}`, 'folder', { name: d }));
	}

	async function listChatsInDay(y, m, d) {
		const chats = await store.listChats({ from: `${y}-${m}-${d}T00:00:00.000Z`, to: `${y}-${m}-${d}T23:59:59.999Z` });
		return (chats || []).map(c => node(chatDatePath(c), 'folder', {
			name: chatSlug(c),
			chatId: c.id,
			entity: chatEntityRef(c),
			mtime: c.updatedAt || c.createdAt
		}));
	}

	async function listChatFolder(chat) {
		const base = chatDatePath(chat);
		return [
			node(`${base}/transcript.md`, 'file', { chatId: chat.id, entity: chatEntityRef(chat) }),
			node(`${base}/summary.md`, 'file', { chatId: chat.id, entity: chatEntityRef(chat) }),
			node(`${base}/files`, 'folder', { chatId: chat.id })
		];
	}

	async function listTouchedFiles(chat) {
		const base = chatDatePath(chat);
		const files = await store.getTouchedFiles(chat.id);
		return (files || []).map((f, i) => node(`${base}/files/${fileEntryName(i, f)}`, 'file', {
			chatId: chat.id,
			canonicalPath: f.path,
			label: f.label || null
		}));
	}

	async function listLabels() {
		const labels = await store.getLabels();
		return Object.keys(labels || {}).sort().map(l =>
			node(`${root}/_labels/${encodeURIComponent(l)}`, 'folder', { name: l, label: l }));
	}

	async function listLabelChats(label) {
		const labels = await store.getLabels();
		const ids = labels[label] || [];
		const out = [];
		for (const id of ids) {
			const chat = await store.getChat(id);
			if (!chat) continue;
			out.push(node(`${root}/_labels/${encodeURIComponent(label)}/${chatSlug(chat)}`, 'link', {
				name: chatSlug(chat),
				chatId: chat.id,
				target: chatDatePath(chat),
				entity: chatEntityRef(chat)
			}));
		}
		return out;
	}

	async function listShortcuts() {
		const shortcuts = await store.getShortcuts();
		const out = [];
		for (const name of Object.keys(shortcuts || {}).sort()) {
			const chat = await store.getChat(shortcuts[name]);
			if (!chat) continue;
			out.push(node(`${root}/_shortcuts/${encodeURIComponent(name)}`, 'link', {
				name,
				chatId: chat.id,
				target: chatDatePath(chat),
				entity: chatEntityRef(chat)
			}));
		}
		return out;
	}

	return {
		id: 'chat',

		async list(path = root) {
			const p = partsOf(path);
			if (p.length === 0) {
				return [
					...(await listYears()),
					node(`${root}/_labels`, 'folder', { name: '_labels' }),
					node(`${root}/_shortcuts`, 'folder', { name: '_shortcuts' })
				];
			}
			if (p[0] === '_labels') {
				if (p.length === 1) return listLabels();
				if (p.length === 2) return listLabelChats(decodeURIComponent(p[1]));
				return [];
			}
			if (p[0] === '_shortcuts') {
				if (p.length === 1) return listShortcuts();
				return [];
			}
			if (p.length === 1 && isDigits(p[0], 4)) return listMonths(p[0]);
			if (p.length === 2 && isDigits(p[0], 4) && isDigits(p[1], 2)) return listDays(p[0], p[1]);
			if (p.length === 3 && isDigits(p[0], 4) && isDigits(p[1], 2) && isDigits(p[2], 2)) {
				return listChatsInDay(p[0], p[1], p[2]);
			}
			if (p.length === 4) {
				const chat = await resolveSlug([p[0], p[1], p[2]], p[3]);
				if (!chat) return { ok: false, error: 'chat_not_found', path };
				return listChatFolder(chat);
			}
			if (p.length === 5 && p[4] === 'files') {
				const chat = await resolveSlug([p[0], p[1], p[2]], p[3]);
				if (!chat) return { ok: false, error: 'chat_not_found', path };
				return listTouchedFiles(chat);
			}
			return [];
		},

		async read(path) {
			const p = partsOf(path);
			if (p.length === 5 && p[4] === 'transcript.md') {
				const chat = await resolveSlug([p[0], p[1], p[2]], p[3]);
				if (!chat) return { ok: false, error: 'chat_not_found', path };
				return { ok: true, content: renderTranscript(chat, await store.getTranscript(chat.id)) };
			}
			if (p.length === 5 && p[4] === 'summary.md') {
				const chat = await resolveSlug([p[0], p[1], p[2]], p[3]);
				if (!chat) return { ok: false, error: 'chat_not_found', path };
				return { ok: true, content: renderSummary(chat) };
			}
			if (p.length === 6 && p[4] === 'files') {
				const chat = await resolveSlug([p[0], p[1], p[2]], p[3]);
				if (!chat) return { ok: false, error: 'chat_not_found', path };
				const files = await store.getTouchedFiles(chat.id);
				const file = (files || []).find((f, i) => fileEntryName(i, f) === p[5]);
				if (!file) return { ok: false, error: 'chat_file_not_found', path };
				return { ok: true, content: renderTouchedFile(chat, file) };
			}
			return { ok: false, error: 'chat_path_not_readable', path };
		},

		async stat(path) {
			const p = partsOf(path);
			if (p.length === 0) return { ok: true, node: node(root, 'folder', { name: 'Chats' }) };
			const list = await this.list(path);
			if (list && list.ok === false) return list;
			if (Array.isArray(list) && list.length === 0) {
				// Could be a file or link leaf: probe known leaf shapes.
				const parentParts = p.slice(0, -1);
				const parentPath = root + '/' + parentParts.join('/');
				const siblings = await this.list(parentPath);
				const hit = (Array.isArray(siblings) ? siblings : []).find(n => n.path === root + '/' + p.join('/'));
				if (!hit) return { ok: false, error: 'chat_path_not_found', path };
				return { ok: true, node: hit };
			}
			const type = p[p.length - 1].includes('.') || p[p.length - 2] === 'files' ? 'file' : 'folder';
			return { ok: true, node: node(root + '/' + p.join('/'), type) };
		},

		async search(query) {
			const q = String(query || '').trim();
			if (!q) return [];
			const chats = await store.searchChats(q);
			return (chats || []).map(c => node(chatDatePath(c), 'folder', {
				name: chatSlug(c),
				chatId: c.id,
				entity: chatEntityRef(c)
			}));
		},

		async write(path) { return unsupported('write', path); },
		async mkdir(path) { return unsupported('mkdir', path); },
		async remove(path) { return unsupported('remove', path); },
		async move(path) { return unsupported('move', path); },
		async copy(path) { return unsupported('copy', path); },
		async watch(path) { return unsupported('watch', path); }
	};
}

/**
 * Reference ChatStore: in-memory, optionally persisted to localStorage.
 * Shape of seed: { chats: [{ summary, transcript, touchedFiles }], labels, shortcuts }
 */
export function createMemoryChatStore(seed = {}) {
	const chats = new Map();
	const transcripts = new Map();
	const touched = new Map();
	let labels = {};
	let shortcuts = {};
	const LS_KEY = 'awtsmoos.chats.v1';

	function persist() {
		try {
			if (typeof localStorage === 'undefined') return;
			localStorage.setItem(LS_KEY, JSON.stringify({
				chats: [...chats.values()],
				transcripts: [...transcripts.entries()],
				touched: [...touched.entries()],
				labels, shortcuts
			}));
		} catch { /* storage unavailable: stay in-memory */ }
	}

	function restore() {
		try {
			if (typeof localStorage === 'undefined') return false;
			const raw = localStorage.getItem(LS_KEY);
			if (!raw) return false;
			const data = JSON.parse(raw);
			for (const c of data.chats || []) chats.set(c.id, c);
			for (const [id, t] of data.transcripts || []) transcripts.set(id, t);
			for (const [id, f] of data.touched || []) touched.set(id, f);
			labels = data.labels || {};
			shortcuts = data.shortcuts || {};
			return true;
		} catch { return false; }
	}

	function ingest(s) {
		for (const entry of s.chats || []) {
			const summary = entry.summary || entry;
			if (!summary || !summary.id) continue;
			chats.set(summary.id, { ...summary });
			transcripts.set(summary.id, entry.transcript || []);
			touched.set(summary.id, entry.touchedFiles || []);
		}
		if (s.labels) labels = { ...s.labels };
		if (s.shortcuts) shortcuts = { ...s.shortcuts };
	}

	if (!restore()) ingest(seed); else if ((seed.chats || []).length) ingest(seed);

	function inRange(chat, from, to) {
		const at = chat.createdAt || '';
		if (from && at < from) return false;
		if (to && at > to) return false;
		return true;
	}

	return {
		async listChats({ from, to } = {}) {
			return [...chats.values()].filter(c => inRange(c, from, to))
				.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
		},
		async getChat(id) { return chats.get(id) || null; },
		async getTranscript(id) { return transcripts.get(id) || []; },
		async getTouchedFiles(id) { return touched.get(id) || []; },
		async searchChats(query) {
			const q = String(query || '').toLowerCase();
			return [...chats.values()].filter(c =>
				String(c.title || '').toLowerCase().includes(q) ||
				String(c.summary || '').toLowerCase().includes(q));
		},
		async getLabels() { return { ...labels }; },
		async getShortcuts() { return { ...shortcuts }; },
		async setChatLabel(id, label) {
			const l = String(label || '').trim();
			if (!l || !chats.has(id)) return;
			labels[l] = [...new Set([...(labels[l] || []), id])];
			persist();
		},
		async clearChatLabel(id, label) {
			const l = String(label || '').trim();
			if (!l || !labels[l]) return;
			labels[l] = labels[l].filter(x => x !== id);
			if (!labels[l].length) delete labels[l];
			persist();
		},
		async createChatShortcut(name, chatId) {
			const n = String(name || '').trim();
			if (!n || !chats.has(chatId)) return;
			shortcuts[n] = chatId;
			persist();
		},
		async deleteChatShortcut(name) {
			delete shortcuts[String(name || '').trim()];
			persist();
		},
		/* Reference-only helper, not part of the ChatStore interface. */
		_seedChat(entry) { ingest({ chats: [entry] }); persist(); }
	};
}
