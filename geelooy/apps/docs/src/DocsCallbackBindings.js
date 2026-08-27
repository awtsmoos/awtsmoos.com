// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Connects model-facing callbacks to focused Awtsmoos Docs controllers.
 * @description The Awtsmoos is one before callbacks appear as many; Awtsmoos.com
 * keeps editor, notes, and sharing callbacks together without mixing them with DOM gestures.
 */
export class DocsCallbackBindings {
	constructor(parts) {
		Object.assign(this, parts);
	}

	bind() {
		this.editor.onChange = (blocks, blockId) => {
			this.mutations.editorChanged(blocks, blockId);
		};
		this.comments.onMutation = mutation => {
			this.mutations.commentChanged(mutation);
		};
		this.commentCallbacks.reply = id => this.#reply(id);
		this.commentCallbacks.resolve = id => {
			this.comments.resolve(id, true);
		};
		this.commentCallbacks.jump = id => this.#jump(id);
		this.shareCallbacks.access = mode => {
			return this.collaboration.updateAccess(mode);
		};
		this.shareCallbacks.invite = accountId => {
			return this.collaboration.invite(accountId);
		};
	}

	async #reply(id) {
		const values = await this.quickDialog.ask({
			title: "Reply to note",
			fields: [{
				name: "text",
				label: "Reply",
				placeholder: "Write a reply…",
				required: true
			}],
			submitLabel: "Reply"
		});
		if (values?.text?.trim()) {
			this.comments.reply(id, values.text);
		}
	}

	#jump(id) {
		const selector = `[data-comment-id="${CSS.escape(id)}"]`;
		const mark = this.view.canvas.querySelector(selector);
		if (!mark) {
			this.toast.show("The note anchor is no longer visible", "warning");
			return;
		}
		mark.scrollIntoView({ behavior: "smooth", block: "center" });
		mark.classList.add("is-comment-focus");
		setTimeout(() => mark.classList.remove("is-comment-focus"), 1400);
	}
}
