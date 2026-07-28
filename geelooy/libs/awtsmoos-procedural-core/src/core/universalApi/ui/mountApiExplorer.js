// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { createApiExplorerModel } from "./createApiExplorerModel.js";

function element(document, name, text) {
	const node = document.createElement(name);
	if (text) node.textContent = text;
	return node;
}

/** Mounts a minimal schema-generated explorer without a second executor path. */
export function mountApiExplorer(input) {
	const { target, api } = input;
	const model = createApiExplorerModel(api.executor.registry);
	const document = target.ownerDocument;
	target.replaceChildren();
	target.classList.add("Awtsmoos-api-explorer");
	target.append(element(document, "h2", model.title));
	for (const panel of model.panels) {
		const section = element(document, "section");
		section.append(element(document, "h3", panel.id));
		for (const method of panel.methods) {
			const details = element(document, "details");
			details.append(element(document, "summary", method.label));
			details.append(element(document, "p", method.description));
			const editor = element(document, "textarea");
			editor.value = JSON.stringify(method.examples?.[0] ?? {}, null, 2);
			const dryRun = element(document, "button", "Dry run");
			const execute = element(document, "button", "Execute");
			const output = element(document, "pre");
			const invoke = async (isDryRun) => {
				const command = {
					api: api.executor.apiId,
					id: `${method.id}-${Date.now()}`,
					method: method.id,
					params: JSON.parse(editor.value),
					options: { dryRun: isDryRun }
				};
				output.textContent = JSON.stringify(await api.execute(command), null, 2);
			};
			dryRun.addEventListener("click", () => invoke(true));
			execute.addEventListener("click", () => invoke(false));
			details.append(editor, dryRun, execute, output);
			section.append(details);
		}
		target.append(section);
	}
	return model;
}
