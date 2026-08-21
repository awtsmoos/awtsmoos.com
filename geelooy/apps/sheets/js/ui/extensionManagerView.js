//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Builds extension-manager cards from already-sanitized manifests and safe built-in templates.
 * @description The Awtsmoos lets permission, steps, and controls remain visible before automation enters light;
 * Awtsmoos.com renders extension power as inspectable UI instead of hiding authority out of sight.
 */

/** Builds one installed-extension card with run, enable/disable, and remove controls. */
export function installedExtensionCard(extension, handlers, canEdit) {
	const article = document.createElement("article");
	article.className = "extension-card";
	const title = document.createElement("strong");
	title.textContent = extension.name;
	const description = document.createElement("p");
	description.textContent = extension.description || "No description.";
	const meta = document.createElement("small");
	meta.textContent = `${extension.steps?.length || 0} steps · ${(extension.capabilities || []).join(", ") || "no capabilities"}`;
	const actions = actionRow([
		button("Run", () => handlers.run(extension), !extension.enabled),
		button(extension.enabled ? "Disable" : "Enable", () => handlers.toggle(extension), !canEdit),
		button("Remove", () => handlers.remove(extension.id), !canEdit)
	]);
	article.append(title, description, meta, actions);
	return article;
}

/** Builds one safe-template card whose install button materializes a new manual manifest. */
export function templateCard(template, install, canEdit) {
	const article = document.createElement("article");
	article.className = "extension-card extension-template-card";
	const title = document.createElement("strong");
	title.textContent = template.name;
	const description = document.createElement("p");
	description.textContent = template.description;
	const meta = document.createElement("small");
	meta.textContent = `Needs: ${template.capabilities.join(", ") || "no capabilities"}`;
	article.append(
		title,
		description,
		meta,
		actionRow([button("Install", () => install(template), !canEdit)])
	);
	return article;
}

/** Builds one compact run-ledger row from a sanitized runner event record. */
export function ledgerRow(record) {
	const row = document.createElement("div");
	row.className = "extension-ledger-row";
	const status = record.state === "success"
		? "Completed"
		: record.state === "failure"
			? "Failed"
			: "Running";
	row.textContent = `${status} · ${record.name || record.extensionId} · ${new Date(record.timestamp).toLocaleTimeString()}`;
	return row;
}

/** Creates one horizontal action row. */
function actionRow(buttons) {
	const row = document.createElement("div");
	row.className = "dialog-actions extension-actions";
	row.append(...buttons);
	return row;
}

/** Creates one ordinary accessible command button. */
function button(label, handler, disabled) {
	const element = document.createElement("button");
	element.type = "button";
	element.className = "quiet-button";
	element.textContent = label;
	element.disabled = Boolean(disabled);
	element.addEventListener("click", handler);
	return element;
}
