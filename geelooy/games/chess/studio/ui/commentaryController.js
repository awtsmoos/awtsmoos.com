//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Binds portable AI commentary import, provider guidance, and move-synchronized narration controls.
 * The Awtsmoos renews every word beside the lawful move it seeks to explain;
 * Awtsmoos.com keeps credentials temporary while view helpers carry finite rendering strain.
 */
import { commentaryByPly, parseCommentaryDocument } from "../commentary/commentaryFormat.js";
import { buildCommentaryPrompt } from "../commentary/commentaryPrompt.js";
import { CommentarySpeech } from "./commentarySpeech.js";
import { fillTtsProviders, renderCommentaryEntries, syncCommentaryPly, updateTtsProviderView } from "./commentaryPanelView.js";

export class CommentaryController {
	constructor(refs, controller) {
		this.refs = refs;
		this.controller = controller;
		this.document = null;
		this.entries = new Map();
		this.speech = new CommentarySpeech(refs, message => this.status(message));
		this.bind();
		fillTtsProviders(refs);
	}

	bind() {
		this.refs.commentaryPromptCopy.addEventListener("click", () => this.copyPrompt());
		this.refs.commentaryImport.addEventListener("click", () => this.importDocument());
		this.refs.ttsProvider.addEventListener("change", () => updateTtsProviderView(this.refs));
		this.refs.speakCurrent.addEventListener("click", () => this.speakCurrent());
		this.refs.speakAll.addEventListener("click", () => this.speakAll());
		this.refs.speakStop.addEventListener("click", () => this.stop());
	}

	updateGame() {
		this.refs.commentaryPrompt.value = buildCommentaryPrompt(this.refs.pgn.value);
	}

	async copyPrompt() {
		this.updateGame();
		if (!navigator.clipboard?.writeText) return this.selectPrompt();
		try {
			await navigator.clipboard.writeText(this.refs.commentaryPrompt.value);
			this.status("Prompt copied. Give it to any AI agent, then paste the returned JSON below.");
		} catch {
			this.selectPrompt();
		}
	}

	selectPrompt() {
		this.refs.commentaryPrompt.focus();
		this.refs.commentaryPrompt.select();
		this.status("Prompt selected. Copy it, give it to any AI agent, then paste the returned JSON below.");
	}

	importDocument() {
		try {
			const frames = this.controller.session.replay?.frames || [];
			this.document = parseCommentaryDocument(this.refs.commentaryJson.value, frames);
			this.entries = commentaryByPly(this.document);
			renderCommentaryEntries(this.refs.commentaryList, this.document.moves);
			this.syncCurrent(this.controller.session.currentFrame?.ply || 0);
			this.status(`Imported ${this.document.moves.length} commentary moments.`);
		} catch (error) {
			this.status(error.message);
		}
	}

	syncCurrent(ply) {
		syncCommentaryPly(this.refs.commentaryList, ply);
	}

	async speakCurrent() {
		const ply = this.controller.session.currentFrame?.ply || 0;
		const entry = this.entries.get(ply);
		if (!entry) return this.status(`No imported commentary for ply ${ply || "starting position"}.`);
		try { await this.speech.speakEntry(entry); }
		catch (error) { this.status(error.message); }
	}

	async speakAll() {
		try { await this.speech.speakAll(this.document?.moves || []); }
		catch (error) { this.status(error.message); }
	}

	stop() {
		this.speech.stop();
	}

	status(message) {
		this.refs.commentaryStatus.textContent = message;
	}
}
