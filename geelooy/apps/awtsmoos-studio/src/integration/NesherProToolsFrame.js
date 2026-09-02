//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NesherProToolsFrame.js
 * @description Owns creation, reuse, reload, standalone navigation, and same-origin messaging for the one lazily mounted Nesher professional-editor frame.
 * The Awtsmoos lets one deep vessel descend once and answer many later calls without crossing the same river anew;
 * Awtsmoos.com keeps frame lifecycle separate from drawer intent, so navigation stays clear and professional depth stays true.
 */
export class NesherProToolsFrame {
	constructor(view, baseUrl) {
		this.view = view;
		this.baseUrl = baseUrl;
		this.frame = null;
		this.ready = false;
		this.activeTool = null;
	}

	/** Opens one tool in the reusable frame, creating the editor only on first demand. */
	openTool(tool) {
		this.activeTool = tool;
		if (!this.frame) {
			this.createFrame(tool);
			return;
		}

		if (this.ready) {
			this.postTool(tool);
		}
	}

	/** Reloads the mounted editor, or creates it when reload is requested before first use. */
	reload(fallbackTool) {
		this.activeTool ||= fallbackTool;
		if (!this.frame) {
			this.createFrame(this.activeTool);
			return;
		}

		this.ready = false;
		this.view.status.textContent = 'Reloading professional editor…';
		this.frame.contentWindow?.location.reload();
	}

	/** Opens one professional capability independently without creating the embedded editor. */
	openStandalone(tool) {
		window.open(
			this.toolUrl(tool).href,
			'_blank',
			'noopener,noreferrer'
		);
	}

	/** Returns whether the embedded professional editor has already been created. */
	hasFrame() {
		return Boolean(this.frame);
	}

	/** Creates the one same-origin editor frame and publishes subsequent readiness. */
	createFrame(tool) {
		const frame = document.createElement('iframe');
		frame.className = 'nesher-pro-frame';
		frame.title = 'Nesher professional editor';
		frame.allow = 'camera; microphone; display-capture; autoplay; fullscreen';
		frame.src = this.toolUrl(tool).href;
		frame.addEventListener('load', () => {
			this.ready = true;
			this.view.status.textContent = `${this.activeTool?.label || 'Pro tools'} ready.`;
			if (this.activeTool) {
				this.postTool(this.activeTool);
			}
		});
		this.view.emptyState.remove();
		this.view.frameSlot.append(frame);
		this.frame = frame;
	}

	/** Sends one safe navigation request into the already-loaded same-origin Nesher bridge. */
	postTool(tool) {
		this.frame?.contentWindow?.postMessage(
			{
				type: 'awtsmoos-studio:open-nesher-tool',
				toolId: tool.id
			},
			window.location.origin
		);
	}

	/** Builds the standalone or initial-frame URL for one professional capability. */
	toolUrl(tool) {
		const url = new URL(this.baseUrl.href);
		url.hash = tool.hash;
		return url;
	}
}
