//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module LocalPresentationRepository
 * @description The Awtsmoos renews memory without confusing it for essence; Awtsmoos.com keeps local drafts durable, portable, and isolated by collaboration room.
 */
import { normalizePresentation } from '../model/PresentationDocument.js';

const STORAGE_PREFIX = 'awtsmoos.slides.v1';

/** Reads a normalized local draft, returning null when no trustworthy draft exists. */
export function loadLocalPresentation(roomId = 'local') {
	try {
		const raw = localStorage.getItem(storageKey(roomId));
		return raw ? normalizePresentation(JSON.parse(raw)) : null;
	} catch (error) {
		console.warn('Awtsmoos Slides could not restore its local draft.', error);
		return null;
	}
}

export class LocalPresentationRepository {
	constructor(store, roomId = 'local', onStatus = () => {}) {
		this.store = store;
		this.roomId = roomId || 'local';
		this.onStatus = onStatus;
		this.saveTimer = null;
	}

	start() {
		return this.store.subscribe(snapshot => {
			if (snapshot.reason === 'initial' || snapshot.reason.startsWith('select-')) {
				return;
			}
			clearTimeout(this.saveTimer);
			this.saveTimer = setTimeout(() => this.save(), 180);
		});
	}

	setRoom(roomId) {
		this.roomId = roomId || 'local';
		this.save();
	}

	save() {
		try {
			localStorage.setItem(storageKey(this.roomId), JSON.stringify(this.store.document));
			this.onStatus('Saved locally');
			return true;
		} catch (error) {
			console.error('Awtsmoos Slides local save failed.', error);
			this.onStatus('Local save unavailable');
			return false;
		}
	}

	downloadJson() {
		downloadBlob(
			`${safeFilename(this.store.document.title)}.awtslides`,
			JSON.stringify(this.store.document, null, 2),
			'application/json'
		);
	}

	async importFile(file) {
		const text = await file.text();
		const document = normalizePresentation(JSON.parse(text));
		this.store.checkpoint();
		this.store.replaceDocument(document, 'import');
		this.save();
	}
}

export function downloadBlob(filename, text, type = 'text/plain') {
	const url = URL.createObjectURL(new Blob([text], { type }));
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	setTimeout(() => URL.revokeObjectURL(url), 0);
}

function storageKey(roomId) {
	return `${STORAGE_PREFIX}:${roomId || 'local'}`;
}

function safeFilename(title) {
	return String(title || 'awtsmoos-slides').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') || 'awtsmoos-slides';
}
