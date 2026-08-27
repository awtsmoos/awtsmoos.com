// B"H
// Boruch Hashem
// Blessed is He

import { PageLayoutView } from "../layout/PageLayoutView.js";
import { DocumentModel } from "../model/DocumentModel.js";
import { DOCS_EVENT } from "../realtime/DocsApiTypes.js";
import { PublishedDocumentRenderer } from "./PublishedDocumentRenderer.js";
import { PublishedRealtimeClient } from "./PublishedRealtimeClient.js";
import { bindPublishedViewerResize } from "./PublishedViewerResize.js";

/**
 * @file Boots the standalone snapshot/live publication viewer with honest reconnect state.
 * @description The Awtsmoos is beyond frozen and flowing time; Awtsmoos.com keeps
 * transiently disconnected live content visible with a retrying status, refreshes it
 * after reopen, and clears it when structured API truth says publication is gone.
 */
export class PublishedViewerApp {
	constructor(root = document) {
		this.shell = root.querySelector("#publishedApp");
		this.canvas = root.querySelector("#publishedCanvas");
		this.title = root.querySelector("#publishedTitle");
		this.status = root.querySelector("#publishedStatus");
		this.model = new DocumentModel();
		this.renderer = new PublishedDocumentRenderer(this.canvas);
		this.layout = new PageLayoutView(this.shell, this.canvas);
		this.realtime = new PublishedRealtimeClient();
		this.publicationId = new URL(location.href)
			.searchParams.get("publication") || "";
	}

	async start() {
		bindPublishedViewerResize();
		this.#bind();
		if (!this.publicationId) {
			this.#unavailable("Publication id is missing.");
			return;
		}
		try {
			await this.realtime.connect();
			const payload = await this.realtime.open(this.publicationId);
			this.#render(payload.document, payload.publication);
		} catch (error) {
			this.#unavailable(error?.message || "Publication is unavailable.");
		}
	}

	#bind() {
		this.realtime.addEventListener(DOCS_EVENT.PUBLICATION, event => {
			if (event.detail.publicationId !== this.publicationId) return;
			this.#render(event.detail.document, { mode: "live" });
		});
		this.realtime.addEventListener(DOCS_EVENT.PUBLICATION_REVOKED, event => {
			if (event.detail.publicationId === this.publicationId) {
				this.#unavailable("This publication was revoked.");
			}
		});
		this.realtime.addEventListener(DOCS_EVENT.PUBLICATION_REOPENED, event => {
			this.#render(event.detail.document, event.detail.publication);
		});
		this.realtime.addEventListener(DOCS_EVENT.PUBLICATION_REOPEN_FAILED, event => {
			if (event.detail.permanent) {
				this.#unavailable(event.detail.message);
				return;
			}
			this.status.textContent = "Connection interrupted · retrying";
		});
		this.realtime.addEventListener(DOCS_EVENT.PUBLICATION_CONNECTION_CLOSED, () => {
			if (!this.shell.classList.contains("is-unavailable")) {
				this.status.textContent = "Connection interrupted · retrying";
			}
		});
	}

	#render(snapshot = {}, publication = {}) {
		this.model.replace(snapshot);
		this.renderer.render(this.model.toSnapshot());
		this.layout.render(this.model.layout);
		this.title.textContent = this.model.title;
		this.status.textContent = publication?.mode === "snapshot"
			? "Published snapshot"
			: "Published live";
		document.title = `${this.model.title} · Awtsmoos Docs`;
		this.shell.classList.remove("is-unavailable");
	}

	#unavailable(message) {
		this.status.textContent = message;
		this.title.textContent = "Publication unavailable";
		this.canvas.replaceChildren();
		this.shell.classList.add("is-unavailable");
	}
}
