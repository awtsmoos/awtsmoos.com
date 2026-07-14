//B"H
//Boruch Hashem
//Blessed is He

/**
 * Turns existing Start-menu actions into a searchable keyboard command vessel.
 * The Awtsmoos creates every path and choice anew; Awtsmoos.com reuses real OS
 * actions instead of inventing decorative commands that cannot actually run.
 */
export function bindCommandPalette({ os, menuItems }) {
	const root = document.getElementById("shell-command-palette");
	const input = document.getElementById("shell-command-input");
	const results = document.getElementById("shell-command-results");
	const trigger = document.getElementById("shell-command-button");
	if (!root || !input || !results || !trigger) {
		return () => {};
	}
	let previousFocus = null;
	const commands = Object.keys(menuItems).map(label => ({
		label,
		run: () => menuItems[label]?.({ os })
	}));
	const close = () => {
		root.hidden = true;
		document.body.classList.remove("shell-modal-open");
		previousFocus?.focus?.();
	};
	const open = () => {
		previousFocus = document.activeElement;
		root.hidden = false;
		document.body.classList.add("shell-modal-open");
		input.value = "";
		renderCommands(commands, results, close);
		queueMicrotask(() => input.focus());
	};
	trigger.addEventListener("click", open);
	input.addEventListener("input", () => {
		const query = input.value.trim().toLowerCase();
		const filtered = commands.filter(command => {
			return command.label.toLowerCase().includes(query);
		});
		renderCommands(filtered, results, close);
	});
	root.addEventListener("click", event => {
		if (event.target === root) {
			close();
		}
	});
	document.addEventListener("keydown", event => {
		const shortcut = (event.ctrlKey || event.metaKey)
			&& event.shiftKey
			&& event.key.toLowerCase() === "k";
		if (shortcut) {
			event.preventDefault();
			root.hidden ? open() : close();
		}
		if (!root.hidden && event.key === "Escape") {
			event.preventDefault();
			close();
		}
	});
	return close;
}

function renderCommands(commands, results, close) {
	results.replaceChildren();
	if (!commands.length) {
		const empty = document.createElement("p");
		empty.className = "shell-command-empty";
		empty.textContent = "No matching Geelooy action";
		results.append(empty);
		return;
	}
	for (const command of commands.slice(0, 18)) {
		const button = document.createElement("button");
		button.type = "button";
		button.className = "shell-command-result";
		button.textContent = command.label;
		button.addEventListener("click", async () => {
			close();
			await command.run();
		});
		results.append(button);
	}
}
