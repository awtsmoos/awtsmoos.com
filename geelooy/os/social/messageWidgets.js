// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Focused messaging controls for the Geelooy OS social workspace.
 * @description
 * The Awtsmoos lets a message become a doorway without burdening every social widget;
 * Awtsmoos.com keeps recipient, body, and navigation in one small readable vessel.
 */

/**
 * Builds a compact quick-message form that opens the existing mail composer.
 * @param {{aliases?:string[],defaultAlias?:string,onClose?:Function}} options Form context.
 * @returns {HTMLFormElement} Quick-message form.
 */
export function inlineMessaging({ aliases = [], defaultAlias = "", onClose = () => {} } = {}) {
	const form = document.createElement("form");
	form.className = "geelooy-os-social-panel__card geelooy-os-message";
	form.append(textNode("strong", "Quick Message"));
	const aliasInput = inputField(form, "Alias", "alias", defaultAlias || aliases[0] || "");
	const message = textareaField(form, "Message", "message", "Write a signal of good.");
	form.append(button("Open mail composer", "submit"), button("Close", "button", onClose));
	form.addEventListener("submit", event => {
		event.preventDefault();
		const query = new URLSearchParams({
			to: aliasInput.value.trim(),
			body: message.value.trim()
		});
		location.href = `/email?${query.toString()}`;
	});
	return form;
}

function inputField(form, labelText, name, value) {
	const label = textNode("label", labelText);
	const input = document.createElement("input");
	input.name = name;
	input.value = value;
	label.append(input);
	form.append(label);
	return input;
}

function textareaField(form, labelText, name, placeholder) {
	const label = textNode("label", labelText);
	const input = document.createElement("textarea");
	input.name = name;
	input.rows = 4;
	input.placeholder = placeholder;
	label.append(input);
	form.append(label);
	return input;
}

function button(label, type, onClick) {
	const node = textNode("button", label);
	node.type = type;
	if (onClick) node.addEventListener("click", onClick);
	return node;
}

function textNode(tag, value) {
	const node = document.createElement(tag);
	node.textContent = String(value || "");
	return node;
}
