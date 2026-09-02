//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NesherProToolsController.js
 * @description Coordinates Pro Tools drawer intent while the reusable iframe lifecycle lives in a dedicated professional-frame vessel.
 * The Awtsmoos lets interface choice and deep editor life remain distinct vessels around one creative purpose;
 * Awtsmoos.com keeps focus, selection, and navigation readable while the frame crosses its own river with surplus.
 */
import { getNesherProTool } from './NesherProToolsCatalog.js';
import { NesherProToolsFrame } from './NesherProToolsFrame.js';

/** Coordinates the responsive Pro Tools drawer and delegates editor-frame lifecycle. */
export class NesherProToolsController {
	constructor(view) {
		this.view = view;
		this.activeTool = null;
		this.editorFrame = new NesherProToolsFrame(
			view,
			new URL('../nesher-studio/', window.location.href)
		);
	}

	/** Binds launcher, tool, recovery, standalone, and keyboard controls. */
	bind() {
		this.view.launcher.addEventListener('click', () => this.open());
		this.view.closeButton.addEventListener('click', () => this.close());
		this.view.reloadButton.addEventListener('click', () => this.reload());
		this.view.standaloneButton.addEventListener('click', () => {
			this.openStandalone();
		});
		for (const [toolId, button] of this.view.toolButtons) {
			button.addEventListener('click', () => this.openTool(toolId));
		}
		window.addEventListener('keydown', (event) => {
			if (event.key === 'Escape' && !this.view.drawer.hidden) {
				this.close();
			}
		});
		return this;
	}

	/** Reveals the drawer and optionally opens one professional capability. */
	open(toolId = null) {
		const wasHidden = this.view.drawer.hidden;
		this.view.drawer.hidden = false;
		this.view.launcher.setAttribute('aria-expanded', 'true');
		if (toolId) {
			this.openTool(toolId);
		}
		if (wasHidden) {
			this.view.closeButton.focus({ preventScroll: true });
		}
	}

	/** Hides professional depth without destroying the already-loaded editor session. */
	close() {
		this.view.drawer.hidden = true;
		this.view.launcher.setAttribute('aria-expanded', 'false');
		this.view.launcher.focus({ preventScroll: true });
	}

	/** Selects one professional capability and forwards it to the lazy frame vessel. */
	openTool(toolId) {
		const tool = getNesherProTool(toolId);
		this.activeTool = tool;
		this.reflectActiveTool(tool);
		this.editorFrame.openTool(tool);
	}

	/** Reloads professional depth while preserving the selected capability. */
	reload() {
		const fallbackTool = this.activeTool || getNesherProTool('stage');
		this.editorFrame.reload(fallbackTool);
	}

	/** Opens one professional tool independently without creating the embedded editor. */
	openStandalone(toolId = null) {
		const tool = toolId
			? getNesherProTool(toolId)
			: this.activeTool || getNesherProTool('stage');
		this.editorFrame.openStandalone(tool);
	}

	/** Mirrors selected capability into text, status, and button selection. */
	reflectActiveTool(tool) {
		this.view.title.textContent = tool.label;
		const verb = this.editorFrame.hasFrame() ? 'Opening' : 'Loading';
		this.view.status.textContent = `${verb} ${tool.label}…`;
		for (const [toolId, button] of this.view.toolButtons) {
			button.classList.toggle('active', toolId === tool.id);
		}
	}
}
