//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DOM renderer and keyboard covenant for the futuristic Geelooy terminal.
 * @description
 * The Awtsmoos gives every key a measured act while Awtsmoos.com keeps drawing,
 * history recall, completion, and Ctrl-C separate from CSS. Local or remote,
 * interruption enters one callback and the visible command vessel stays in rhyme.
 */
export function renderCommand(options = {}) {
	const {
		root,
		history,
		onSubmit,
		onInterrupt,
		complete
	} = options;
	root.replaceChildren(shellMarkup());
	const output = root.querySelector(".awts-command-output");
	const form = root.querySelector("form");
	const input = root.querySelector("input");
	let cursor = history.commands().length;

	form.addEventListener("submit", event => {
		event.preventDefault();
		const value = input.value;
		input.value = "";
		cursor = history.commands().length + 1;
		onSubmit(value);
	});

	input.addEventListener("keydown", event => {
		if (event.key === "ArrowUp") {
			event.preventDefault();
			input.value = recall(history, --cursor, value => { cursor = value; });
			return;
		}
		if (event.key === "ArrowDown") {
			event.preventDefault();
			input.value = recall(history, ++cursor, value => { cursor = value; });
			return;
		}
		if (event.key === "l" && event.ctrlKey) {
			event.preventDefault();
			history.clear();
			draw(output, history);
			return;
		}
		if (event.key === "c" && event.ctrlKey) {
			event.preventDefault();
			input.value = "";
			onInterrupt?.();
			return;
		}
		if (event.key === "Tab") {
			event.preventDefault();
			const got = complete?.(input.value);
			if (got) {
				input.value = input.value.replace(/\S*$/, got);
			}
		}
	});

	draw(output, history);
	setTimeout(() => input.focus(), 0);
	return {
		draw: () => draw(output, history),
		focus: () => input.focus()
	};
}

function shellMarkup() {
	const wrapper = document.createDocumentFragment();
	const head = document.createElement("div");
	head.className = "awts-command-head";
	head.innerHTML = "<b>Awtsmoos Shell</b><span>remote vessels ready</span>";
	const output = document.createElement("div");
	output.className = "awts-command-output";
	output.setAttribute("aria-live", "polite");
	const form = document.createElement("form");
	form.className = "awts-command-form";
	const prompt = document.createElement("span");
	prompt.className = "awts-command-prompt";
	prompt.textContent = "$";
	const input = document.createElement("input");
	input.setAttribute("aria-label", "Awtsmoos command");
	input.autocomplete = "off";
	input.spellcheck = false;
	form.append(prompt, input);
	wrapper.append(head, output, form);
	return wrapper;
}

function recall(history, index, setCursor) {
	const list = history.commands();
	const bounded = Math.max(0, Math.min(index, list.length));
	setCursor(bounded);
	return list[bounded] || "";
}

function draw(output, history) {
	output.innerHTML = history.lines().map(ansi).join("\n");
	output.scrollTop = output.scrollHeight;
}

function ansi(line) {
	return escapeHtml(line).replace(
		/&lt;(error|info|success|muted)&gt;([\s\S]*)&lt;\/\1&gt;/g,
		'<span class="cmd-$1">$2</span>'
	);
}

function escapeHtml(value) {
	return String(value ?? "").replace(/[&<>]/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;"
	}[character]));
}
