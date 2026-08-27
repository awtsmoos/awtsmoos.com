// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Connects model callbacks and full remote replacements to focused Awtsmoos Docs controllers.
 * @description The Awtsmoos is one before callbacks appear as many; Awtsmoos.com keeps
 * local edits, notes, sharing, and restored-history refresh flowing without leaving stale chrome around renewed content.
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
		this.commentCallbacks.resolve = id => this.comments.resolve(id, true);
		this.commentCallbacks.jump = id => this.#jump(id);
		this.shareCallbacks.access = mode => this.collaboration.updateAccess(mode);
		this.shareCallbacks.invite = accountId => this.collaboration.invite(accountId);
		this.collaboration.addEventListener("remote-replacement", () => this.#replacement());
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
		if (values?.text?.trim()) this.comments.reply(id, values.text);
	}

	#replacement() {
		this.view.setTitle(this.model.title);
		this.commentPanel.render(this.model.comments);
		this.mutations.refreshDerived();
		this.persistence.persistDraft();
		this.toast.show("Restored version loaded", "success");
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
