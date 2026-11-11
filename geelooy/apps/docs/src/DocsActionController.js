// B"H
// Boruch Hashem
// Blessed is He

import { chooseDocsSaveDestination } from "./DocsSaveDestination.js";

/**
 * @file Owns user-triggered file, share, and embedded-document actions.
 * @description The Awtsmoos is beyond click and destination; Awtsmoos.com keeps
 * larger actions away from keystroke mutations while embedded documents flow
 * through the same truthful format boundary used by local and cross-app opening.
 */
export class DocsActionController {
	constructor(parts) {
		Object.assign(this, parts);
	}

	/** Ensures a collaborative identity exists, then reveals the current share workspace. */
	async openShare() {
		try {
			await this.collaboration.ensureShared();
			this.share.open(
				this.model.id,
				this.model.access,
				this.collaboration.shareToken
			);
		} catch (error) {
			this.#liveError(error, "Sign in to share");
		}
	}

	/** Saves to the embedded OS file or to a chosen Drive destination. */
	async save() {
		try {
			const destination = await chooseDocsSaveDestination(
				this.persistence,
				this.quickDialog
			);
			if (destination === null) return null;
			const result = await this.persistence.save(destination);
			this.toast.show("Document saved", "success");
			return result;
		} catch (error) {
			this.#driveError(error, "Save failed");
			return null;
		}
	}

	/** Saves through the destination chooser even when a destination already exists. */
	async saveAs() {
		try {
			const destination = await chooseDocsSaveDestination(
				this.persistence,
				this.quickDialog,
				true
			);
			if (destination === null) return null;
			const result = await this.persistence.save(destination);
			this.toast.show("Document saved", "success");
			return result;
		} catch (error) {
			this.#driveError(error, "Save as failed");
			return null;
		}
	}

	/** Starts a fresh document, optionally seeded from a starter template. */
	async newDocument(template = "blank") {
		try {
			const starter = DOC_TEMPLATES[template] || DOC_TEMPLATES.blank;
			await this.snapshot.apply({
				title: starter.title,
				blocks: starter.blocks.map((html, index) => {
					const inner = html.replace(/^<[^>]+>/, "").replace(/<[^>]+>$/, "");
					return {
						id: `block-${index + 1}`,
						tag: html.startsWith("<h") ? html.slice(1, 3) : "p",
						html: inner
					};
				}),
				comments: [],
				semanticObjects: [],
				layout: {}
			});
			this.toast.show("New document ready", "success");
			return true;
		} catch (error) {
			this.#driveError(error, "Could not start a new document");
			return false;
		}
	}

	/** Shows the document's title and live size facts in one read-only dialog. */
	async documentProperties() {
		const blocks = Array.isArray(this.model.blocks) ? this.model.blocks : [];
		const text = blocks
			.map(block => String(block.html || "").replace(/<[^>]*>/g, " "))
			.join(" ");
		const words = text.split(/\s+/).filter(Boolean).length;
		await this.quickDialog.ask({
			title: "Document properties",
			submitLabel: "Done",
			fields: [
				{ name: "title", label: "Title", value: this.model.title || "Untitled document" },
				{ name: "words", label: "Words", value: String(words) },
				{ name: "characters", label: "Characters", value: String(text.length) },
				{ name: "blocks", label: "Paragraphs and blocks", value: String(blocks.length) },
				{ name: "revision", label: "Revision", value: String(this.model.revision || 0) },
				{ name: "updated", label: "Last updated", value: String(this.model.updatedAt || "") }
			]
		});
		return true;
	}

	/** Opens the browser file chooser and imports the selected supported document. */
	async importFile() {
		try {
			return await this.fileController.importLocal();
		} catch (error) {
			this.#driveError(error, "Could not open document");
			return false;
		}
	}

	/** Imports one dropped file through the same importer as the file chooser. */
	async importDropped(file) {
		try {
			return await this.fileController.importFile(file);
		} catch (error) {
			this.#driveError(error, "Could not import dropped file");
			return false;
		}
	}

	/** Exports the current document through one explicit destination format. */
	async exportFile(format) {
		try {
			return await this.fileController.exportAs(format);
		} catch (error) {
			this.#driveError(error, "Export failed");
			return null;
		}
	}

	/** Opens the current semantic document source inside Awtsmoos Code. */
	openInCode() {
		return this.fileController.openCurrentInCode();
	}

	/** Loads the file selected by Geelooy OS through the real source-format codecs. */
	loadEmbedded(payload) {
		if (payload?.content == null) return false;
		try {
			return this.fileController.importEmbedded(payload);
		} catch (error) {
			this.#driveError(error, "Could not open embedded document");
			return false;
		}
	}

	/** Reports persistence/import/export failures through both status and transient feedback vessels. */
	#driveError(error, fallback) {
		this.status.drive(error?.message || fallback, "warning");
		this.toast.show(error?.message || fallback, "warning");
	}

	/** Reports collaboration/share failures through the live status channel and toast surface. */
	#liveError(error, fallback) {
		this.status.live(error?.message || fallback, "warning");
		this.toast.show(error?.message || fallback, "warning");
	}
}

/** Starter documents offered by File > New from template. */
const DOC_TEMPLATES = Object.freeze({
	blank: { title: "Untitled document", blocks: ["<p><br></p>"] },
	letter: {
		title: "Letter",
		blocks: [
			"<p>Dear ,</p>",
			"<p><br></p>",
			"<p>With appreciation,</p>",
			"<p><br></p>"
		]
	},
	notes: {
		title: "Meeting notes",
		blocks: [
			"<h1>Meeting notes</h1>",
			"<p>Date: </p>",
			"<h2>Agenda</h2>",
			"<p><br></p>",
			"<h2>Decisions</h2>",
			"<p><br></p>",
			"<h2>Action items</h2>",
			"<p>☐ First follow-up</p>"
		]
	},
	essay: {
		title: "Essay",
		blocks: [
			"<h1>Essay title</h1>",
			"<p><br></p>",
			"<h2>Introduction</h2>",
			"<p><br></p>",
			"<h2>Closing</h2>",
			"<p><br></p>"
		]
	}
});
