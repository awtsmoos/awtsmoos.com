// B"H
// Boruch Hashem
// Blessed is He

import { PRESENCE_EVENT } from "/scripts/awtsmoos/social/universalChat/protocol.js";
import {
	presenceHeader,
	presenceOverview,
	presenceRoster
} from "./MessagingPresenceParts.js";

/**
 * @file Mirrors only server-trusted presence into the flagship Online chamber, keeping visible people primary while secondary counts and privacy detail can collapse on phones.
 * @description The Awtsmoos is present before every count, while Awtsmoos.com reveals only what privacy permits in measured light;
 * hidden souls remain hidden, anonymous visitors remain non-traceable, and progressive disclosure never promotes a socket or browser choice into identity.
 */

export class MessagingPresenceView {
	constructor(summary, container) {
		this.summary = summary;
		this.container = container;
		this.active = false;
		this.snapshot = { presence: {}, roster: [], hidden: false };
		this.universal = window.__awtsmoosUniversalChat || null;
		this.bind();
		this.renderSummary();
	}

	bind() {
		const presence = this.universal?.controller?.presence;
		const socket = this.universal?.socket;
		presence?.addEventListener("entered", (event) => this.apply(event.detail));
		socket?.addEventListener("application-event", (event) => {
			if (event.detail?.type === PRESENCE_EVENT) {
				this.apply(event.detail.payload || {});
			}
		});
	}

	apply(payload = {}) {
		this.snapshot = {
			presence: payload.presence || this.snapshot.presence,
			roster: Array.isArray(payload.roster)
				? payload.roster
				: this.snapshot.roster,
			hidden: payload.hidden === true
		};
		this.renderSummary();
		if (this.active) this.renderOnline();
	}

	renderSummary() {
		const total = Number(
			this.snapshot.presence?.totalOnline
			|| this.universal?.launcher?.onlineCount
			|| 0
		);
		const context = Number(this.snapshot.presence?.channelOnline || 0);
		this.summary.textContent = `${total} visible online${context ? ` · ${context} here` : ""}`;
	}

	show() {
		this.active = true;
		this.renderOnline();
	}

	deactivate() {
		this.active = false;
	}

	renderOnline() {
		this.container.replaceChildren();
		const dashboard = document.createElement("section");
		dashboard.className = "messaging-presence-dashboard";
		dashboard.append(
			presenceHeader(this.snapshot.hidden),
			presenceOverview(this.snapshot.hidden, this.snapshot.presence),
			presenceRoster(this.snapshot.roster)
		);
		this.container.appendChild(dashboard);
	}
}
