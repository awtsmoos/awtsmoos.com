// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets many corpus shapes enter one safe reading vessel without confusing their source;
 * Awtsmoos.com renders every stored value through DOM text, so depth remains inspectable while untrusted markup never gains force.
 */
const knownKeys = new Set([
	"name",
	"heading",
	"id",
	"text",
	"notes",
	"sections",
	"children"
]);

export class TiferesReeyuhContentRenderer {
	constructor(root) {
		this.root = root;
	}

	/** Replace the current reader with one safely rendered structured value. */
	render(value) {
		this.root.replaceChildren();
		this.root.append(this.createNode(value, 0));
	}

	/** Reveal a truthful empty/error message without interpreting it as markup. */
	renderMessage(message) {
		const empty = document.createElement("p");
		empty.className = "content-empty";
		empty.textContent = message;
		this.root.replaceChildren(empty);
	}

	/** Recursively translate known corpus forms and unknown JSON into native DOM vessels. */
	createNode(value, depth) {
		if (value === null || value === undefined || value === "") {
			return this.createParagraph("No text is stored for this section.");
		}
		if (Array.isArray(value)) return this.createArray(value, depth);
		if (typeof value !== "object") return this.createParagraph(String(value));
		return this.createObject(value, depth);
	}

	createArray(values, depth) {
		const stack = document.createElement("div");
		stack.className = "content-stack";
		values.forEach(value => stack.append(this.createNode(value, depth + 1)));
		return stack;
	}

	createObject(value, depth) {
		const block = document.createElement("section");
		block.className = "content-block";
		const title = value.name ?? value.heading;
		if (title) block.append(this.createTitle(title, depth));
		if (value.text !== undefined) block.append(this.createNode(value.text, depth + 1));
		if (value.notes !== undefined) block.append(this.createNotes(value.notes, depth + 1));
		const children = value.sections ?? value.children;
		if (children !== undefined) block.append(this.createNode(children, depth + 1));
		Object.entries(value).forEach(([key, child]) => {
			if (!knownKeys.has(key)) block.append(this.createDetails(key, child, depth + 1));
		});
		if (!block.children.length) block.append(this.createParagraph("This section is empty."));
		return block;
	}

	createTitle(value, depth) {
		const heading = document.createElement(depth < 2 ? "h3" : "h4");
		heading.className = "content-title";
		heading.textContent = String(value);
		return heading;
	}

	createParagraph(value) {
		const paragraph = document.createElement("p");
		paragraph.className = "content-paragraph";
		paragraph.dir = "auto";
		paragraph.textContent = String(value);
		return paragraph;
	}

	createNotes(value, depth) {
		const notes = document.createElement("aside");
		notes.className = "content-notes";
		notes.append(this.createNode(value, depth));
		return notes;
	}

	createDetails(key, value, depth) {
		const details = document.createElement("details");
		details.className = "content-details";
		const summary = document.createElement("summary");
		summary.textContent = key;
		const body = document.createElement("div");
		body.className = "content-details-body";
		body.append(this.createNode(value, depth));
		details.append(summary, body);
		return details;
	}
}
