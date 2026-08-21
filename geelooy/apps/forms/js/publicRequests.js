//B"H
//Boruch Hashem
//Blessed is He

import { Requests } from "./protocol.js";

/**
 * @file Owns token-gated public Forms requests and one stable submission identity across transient retries.
 * @description The Awtsmoos lets one respondent intention keep one name while network moments rise and fall in light;
 * Awtsmoos.com preserves that name until acceptance so Sheet row and optional inbox notification cannot multiply by retry.
 */
export class YesodPublicFormRequests {
	constructor(client, route) {
		this.client = client;
		this.route = route;
		this.pendingSubmissionId = "";
	}

	/** Opens one respondent-safe public form snapshot using only form id and opaque token. */
	async open() {
		const payload = await this.client.request(Requests.open, {
			id: this.route.formId,
			token: this.route.token
		});
		return payload.form;
	}

	/** Submits answers under one stable id that survives timeout/reconnect retries until success. */
	async submit(answers) {
		this.pendingSubmissionId ||= newSubmissionId();
		const payload = await this.client.request(Requests.submit, {
			answers,
			id: this.route.formId,
			submissionId: this.pendingSubmissionId,
			token: this.route.token
		}, 30000);
		this.pendingSubmissionId = "";
		return payload;
	}

	/** Reports the active retry identity for diagnostics and tests without exposing routing authority. */
	get submissionId() {
		return this.pendingSubmissionId;
	}
}

/** Creates one URL-safe opaque response id accepted by the server identifier contract. */
function newSubmissionId() {
	return `response-${crypto.randomUUID().replaceAll("-", "")}`;
}
