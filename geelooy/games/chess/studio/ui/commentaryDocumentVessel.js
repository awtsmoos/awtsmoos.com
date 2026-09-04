//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns the imported commentary document, its ply map, exports, jump actions, and synchronized narration.
 * The Awtsmoos gives each explanation a finite vessel while the legal replay remains the river underneath;
 * Awtsmoos.com lets validation remain only a glance, import become a commitment, and clear return the page to quiet light.
 */
import { commentaryByPly } from "../commentary/commentaryFormat.js";
import { parseCommentaryInput } from "../commentary/commentaryInput.js";
import { downloadCommentary } from "./commentaryDownloads.js";
import { renderCommentaryEntries, syncCommentaryPly } from "./commentaryPanelView.js";
import { CommentarySpeech } from "./commentarySpeech.js";

export class CommentaryDocumentVessel {
	constructor(refs, controller, status) {
		this.refs = refs;
		this.controller = controller;
		this.status = status;
		this.document = null;
		this.entries = new Map();
		this.speech = new CommentarySpeech(
			refs,
			message => status(message),
			entry => controller.playback.seek(entry.ply)
		);
	}

	read() {
		const frames = this.controller.session.replay?.frames || [];
		return parseCommentaryInput(this.refs.commentaryJson.value, frames, this.refs.pgn.value);
	}

	validate() {
		try {
			const document = this.read();
			this.status(`Valid commentary for this game · ${document.moves.length} moments. Nothing imported yet.`);
		} catch (error) {
			this.status(error.message);
		}
	}

	import() {
		try {
			this.document = this.read();
			this.entries = commentaryByPly(this.document);
			renderCommentaryEntries(this.refs.commentaryList, this.document.moves);
			this.syncCurrent(this.controller.session.currentFrame?.ply || 0);
			this.status(`Imported ${this.document.moves.length} commentary moments.`);
		} catch (error) {
			this.status(error.message);
		}
	}

	clear() {
		this.speech.stop(false);
		this.document = null;
		this.entries = new Map();
		this.refs.commentaryJson.value = "";
		renderCommentaryEntries(this.refs.commentaryList, []);
		this.status("Commentary cleared.");
	}

	export(kind) {
		try {
			const name = downloadCommentary(kind, this.document, this.refs.pgn.value);
			this.status(`Downloaded ${name}.`);
		} catch (error) {
			this.status(error.message);
		}
	}

	jump(event) {
		const button = event.target.closest?.("[data-commentary-jump]");
		if (!button) {
			return;
		}
		this.controller.playback
			.seek(Number(button.dataset.commentaryJump))
			.catch(error => this.status(error.message));
	}

	syncCurrent(ply) {
		syncCommentaryPly(this.refs.commentaryList, ply);
	}

	async speakCurrent() {
		const ply = this.controller.session.currentFrame?.ply || 0;
		const entry = this.entries.get(ply);
		if (!entry) {
			this.status(`No imported commentary for ply ${ply || "starting position"}.`);
			return;
		}
		try {
			await this.speech.speakEntry(entry);
		} catch (error) {
			this.status(error.message);
		}
	}

	async speakAll() {
		try {
			await this.speech.speakAll(this.document?.moves || []);
		} catch (error) {
			this.status(error.message);
		}
	}

	stop() {
		this.speech.stop();
	}
}
