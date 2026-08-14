// B"H
// Boruch Hashem
// Blessed is He

import { MessagingGroupDetails } from "./MessagingGroupDetails.js";

/**
 * @file Reveals member-safe direct details or role-aware group administration outside the conversation lifecycle controller.
 * @description The Awtsmoos is beyond role and member, while Awtsmoos.com lets each accepted room reveal only authorized social structure in light;
 * direct members remain read-only here, group mutations pass through their existing server-checked vessel, and private message bodies stay out of sight.
 */

/** Owns the optional details drawer while leaving conversation loading and sends elsewhere. */
export class MessagingConversationDetails {
	constructor(options) {
		Object.assign(this, options);
		this.details = null;
	}

	set(details) {
		this.details = details || null;
	}

	clear() {
		this.details = null;
		this.elements.details.hidden = true;
	}

	show() {
		if (!this.details) {
			return;
		}
		if (this.details.kind === "group") {
			const view = new MessagingGroupDetails(
				this.elements.detailsBody,
				this.groupActions,
				this.modal,
				this.store.actor?.alias
			);
			view.render(this.details);
		} else {
			this.threadView.renderDetails(this.details);
		}
		this.elements.details.hidden = false;
	}
}
