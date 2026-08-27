//B"H
//Boruch Hashem
//Blessed is He

import {
	installedExtensionCard,
	ledgerRow,
	templateCard
} from "./extensionManagerView.js";
import {
	extensionCloseButton,
	extensionEmpty,
	extensionHeading,
	extensionSection
} from "./extensionManagerShell.js";
import {
	extensionTemplates,
	manifestFromTemplate
} from "../extensions/templates.js";

/**
 * @file Presents shared declarative extensions as inspectable, installable, runnable workbook capabilities.
 * @description The Awtsmoos lets automation stand in daylight with permissions, steps, and history revealed;
 * Awtsmoos.com gives install, run, disable, and removal one calm manager instead of a hidden script field.
 */
export class MalchusExtensionManager {
	constructor(workbook, actions, runner, onError) {
		this.workbook = workbook;
		this.actions = actions;
		this.runner = runner;
		this.onError = onError;
		this.ledger = [];
		this.dialog = document.createElement("dialog");
		this.dialog.className = "sheet-dialog extension-manager-dialog";
		document.body.append(this.dialog);
	}

	/** Binds the Extensions menu event plus live workbook/run-ledger refresh. */
	bind() {
		document.addEventListener("sheets:plugins", () => this.open());
		this.workbook.addEventListener("change", () => this.refreshIfOpen());
		this.runner.addEventListener("run", (event) => {
			this.ledger.unshift(event.detail);
			this.ledger = this.ledger.slice(0, 8);
			this.refreshIfOpen();
		});
	}

	/** Opens a freshly rendered manager so shared state is never stale on entry. */
	open() {
		this.render();
		this.dialog.showModal();
	}

	/** Renders installed extensions, safe templates, and recent execution status. */
	render() {
		const shell = document.createElement("div");
		shell.className = "extension-manager-shell motion-enter";
		shell.append(
			extensionHeading(
				"Plugins & Automations",
				"Capability-safe workbook extensions. No arbitrary JavaScript execution."
			),
			this.installedSection(),
			this.templateSection(),
			this.ledgerSection(),
			extensionCloseButton(() => this.dialog.close())
		);
		this.dialog.replaceChildren(shell);
	}

	/** Builds the currently installed shared extension list. */
	installedSection() {
		const section = extensionSection("Installed");
		const items = this.workbook.data.extensions || [];
		if (!items.length) {
			section.append(extensionEmpty("No extensions installed yet."));
		}
		const handlers = {
			remove: (id) => this.perform(() => this.actions.remove(id)),
			run: (extension) => this.perform(() => this.runner.run(extension)),
			toggle: (extension) => this.perform(() => this.actions.save({
				...extension,
				enabled: !extension.enabled
			}))
		};
		section.append(...items.map((item) => installedExtensionCard(
			item,
			handlers,
			Boolean(this.workbook.data.canEdit)
		)));
		return section;
	}

	/** Builds safe installable manual templates. */
	templateSection() {
		const section = extensionSection("Safe templates");
		section.append(...extensionTemplates().map((template) => templateCard(
			template,
			(item) => this.perform(() => this.actions.save(manifestFromTemplate(item))),
			Boolean(this.workbook.data.canEdit)
		)));
		return section;
	}

	/** Builds the latest bounded run ledger. */
	ledgerSection() {
		const section = extensionSection("Recent runs");
		section.append(...(this.ledger.length
			? this.ledger.map(ledgerRow)
			: [extensionEmpty("No automation runs in this page session.")]
		));
		return section;
	}

	/** Executes one manager operation and routes failures to the shared error surface. */
	async perform(operation) {
		try {
			await operation();
			this.render();
		} catch (error) {
			this.onError?.(error);
		}
	}

	/** Refreshes only while the modal is visible. */
	refreshIfOpen() {
		if (this.dialog.open) {
			this.render();
		}
	}
}
