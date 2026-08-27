// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Finds and replaces visible text while preserving Awtsmoos Docs rich markup.
 * @description The Awtsmoos is beyond word and occurrence; Awtsmoos.com walks only
 * finite text nodes so search may reveal or replace letters without flattening links, notes, or formatting.
 */
export class FindReplaceController {
	constructor({ canvas, editor, quickDialog, toast }) {
		Object.assign(this, { canvas, editor, quickDialog, toast });
		this.lastQuery = "";
		this.lastIndex = -1;
	}

	async open() {
		const values = await this.quickDialog.ask({
			title: "Find and replace",
			fields: [
				{ name: "find", label: "Find", value: this.lastQuery, required: true },
				{ name: "replace", label: "Replace with", placeholder: "Leave blank to find next" }
			],
			submitLabel: "Apply"
		});
		if (!values) return false;
		const query = String(values.find || "");
		const replacement = String(values.replace || "");
		return replacement
			? this.replaceAll(query, replacement)
			: this.findNext(query);
	}

	findNext(query) {
		const needle = String(query || "");
		if (!needle) return false;
		const matches = this.#matches(needle);
		if (!matches.length) {
			this.toast.show(`No matches for “${needle}”`, "neutral");
			return false;
		}
		if (needle !== this.lastQuery) this.lastIndex = -1;
		this.lastQuery = needle;
		this.lastIndex = (this.lastIndex + 1) % matches.length;
		selectMatch(matches[this.lastIndex]);
		this.toast.show(`${this.lastIndex + 1} of ${matches.length}`, "neutral");
		return true;
	}

	replaceAll(query, replacement) {
		const needle = String(query || "");
		if (!needle || !this.editor.isEditable()) return false;
		const nodes = textNodes(this.canvas);
		let count = 0;
		for (const node of nodes) {
			const result = replaceText(node.data, needle, replacement);
			if (!result.count) continue;
			node.data = result.text;
			count += result.count;
		}
		if (count) this.editor.notifyMutation();
		this.lastQuery = needle;
		this.lastIndex = -1;
		this.toast.show(`Replaced ${count} occurrence${count === 1 ? "" : "s"}`, "success");
		return count;
	}

	#matches(query) {
		const lowered = query.toLocaleLowerCase();
		const matches = [];
		for (const node of textNodes(this.canvas)) {
			const haystack = node.data.toLocaleLowerCase();
			let start = 0;
			while ((start = haystack.indexOf(lowered, start)) !== -1) {
				matches.push({ node, start, end: start + query.length });
				start += Math.max(1, query.length);
			}
		}
		return matches;
	}
}

function textNodes(root) {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	const nodes = [];
	while (walker.nextNode()) nodes.push(walker.currentNode);
	return nodes;
}

function selectMatch(match) {
	const range = document.createRange();
	range.setStart(match.node, match.start);
	range.setEnd(match.node, match.end);
	const selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
	match.node.parentElement?.scrollIntoView({ block: "center", behavior: "smooth" });
}

function replaceText(text, query, replacement) {
	const pattern = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	let count = 0;
	return {
		text: text.replace(new RegExp(pattern, "gi"), () => {
			count += 1;
			return replacement;
		}),
		count
	};
}
