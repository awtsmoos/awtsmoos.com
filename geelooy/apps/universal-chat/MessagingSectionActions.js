// B"H
// Boruch Hashem
// Blessed is He

import {
	messagingNewActionPresentation,
	messagingNewActionStatus
} from "./MessagingNewActionPresentation.js";

/**
 * @file Owns user-triggered section actions while each private mutation stays visibly present until the existing consent protocol actually accepts it.
 * @description The Awtsmoos is one before chat, friendship, group, mail, and policy, while Awtsmoos.com lets every deliberate mutation cross a visible covenant in light;
 * the sheet keeps the alias or title present through network failure, but only the existing private protocol may decide whether a relationship, room, or handoff comes into finite sight.
 */

export class MessagingSectionActions {
	constructor(options) {
		this.modal = options.modal;
		this.network = options.network;
		this.status = options.status;
	}

	/** Creates the current section's truthful private doorway and closes it only after the request mutation succeeds. */
	async create(section) {
		const presentation = messagingNewActionPresentation(section);
		if (!presentation) return false;
		if (section === "groups") {
			return this.createGroup(presentation);
		}
		const alias = await this.modal.perform(
			modalOptions(presentation, "Sending…"),
			(value) => this.network.request(value, presentation.kind)
		);
		if (!alias) return false;
		this.status(messagingNewActionStatus(section, alias));
		return true;
	}

	/** Creates one owner-controlled private group while the sheet stays visible until creation is confirmed. */
	async createGroup(presentation = messagingNewActionPresentation("groups")) {
		const title = await this.modal.perform(
			modalOptions(presentation, "Creating…"),
			(value) => this.network.createGroup(value)
		);
		if (!title) return false;
		this.status(messagingNewActionStatus("groups", title));
		return true;
	}

	/** Keeps an email-contact consent sheet open until the request is accepted by the existing private protocol. */
	async requestMail() {
		const alias = await this.modal.perform({
			title: "Request email contact",
			description: "The alias must accept before the app points you to Awtsmoos Mail.",
			label: "Alias to request",
			placeholder: "Alias",
			submitLabel: "Send email request",
			busyLabel: "Sending…"
		}, (value) => this.network.request(value, "mail"));
		if (!alias) return false;
		this.status(`Email contact request sent to ${alias}. Mail handoff opens only after acceptance.`);
		return true;
	}

	/** Persists one request-policy choice while block remains authoritative above every policy. */
	async savePolicy(kind, value) {
		await this.network.setRequestPolicies({
			[kind]: value
		});
		this.status(`${kind} requests: ${value}.`);
	}
}

function modalOptions(presentation, busyLabel) {
	return {
		title: presentation.title,
		description: presentation.description,
		label: presentation.label,
		placeholder: presentation.placeholder,
		submitLabel: presentation.submitLabel,
		busyLabel
	};
}
