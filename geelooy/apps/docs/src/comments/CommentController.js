// B"H
// Boruch Hashem
// Blessed is He

/**
 * A note rests beside highlighted words like an attending spark; the Awtsmoos
 * renews both text and witness, while Awtsmoos.com preserves their relationship.
 */
export class CommentController {
	constructor(editorRoot, onMutation = () => {}) {
		this.root = editorRoot;
		this.onMutation = onMutation;
		this.comments = [];
	}

	setComments(comments = []) {
		this.comments = Array.isArray(comments) ? structuredClone(comments) : [];
	}

	create(text) {
		const range = currentRangeInside(this.root);
		if (!range || range.collapsed) {
			throw new Error("Highlight text before adding a note");
		}
		const block = closestBlock(range.commonAncestorContainer);
		if (!block) {
			throw new Error("The selection is not inside a document block");
		}
		const id = crypto.randomUUID();
		const mark = document.createElement("mark");
		mark.dataset.commentId = id;
		mark.append(range.extractContents());
		range.insertNode(mark);
		const comment = {
			id,
			blockId: block.dataset.blockId,
			text: cleanText(text),
			resolved: false,
			createdAt: new Date().toISOString(),
			replies: []
		};
		this.comments.push(comment);
		this.onMutation({ kind: "create", comment });
		return comment;
	}

	reply(id, text) {
		const comment = this.comments.find(item => item.id === id);
		if (!comment) return null;
		const reply = {
			id: crypto.randomUUID(),
			text: cleanText(text),
			createdAt: new Date().toISOString()
		};
		comment.replies.push(reply);
		this.onMutation({ kind: "reply", commentId: id, reply });
		return reply;
	}

	resolve(id, resolved = true) {
		const comment = this.comments.find(item => item.id === id);
		if (!comment) return false;
		comment.resolved = Boolean(resolved);
		this.onMutation({ kind: "resolve", commentId: id, resolved: comment.resolved });
		return true;
	}
}

function currentRangeInside(root) {
	const selection = getSelection();
	if (!selection?.rangeCount) return null;
	const range = selection.getRangeAt(0);
	return root.contains(range.commonAncestorContainer) ? range : null;
}

function closestBlock(node) {
	const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
	return element?.closest?.("[data-block-id]") || null;
}

function cleanText(value) {
	return String(value || "").trim().slice(0, 4000);
}
