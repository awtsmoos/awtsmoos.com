// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bridges the shared realtime transport lifecycle into the Awtsmoos Docs client facade.
 * @description The Awtsmoos is beyond opening and closing; Awtsmoos.com keeps
 * application events, reconnect signals, and room re-entry in one focused vessel away from request methods.
 */
export function bindDocsRealtimeEvents(owner) {
	owner.client.addEventListener("application-event", event => {
		const message = event.detail;
		owner.dispatchEvent(new CustomEvent(
			message.type,
			{ detail: message.payload || {} }
		));
	});
	owner.client.addEventListener("connection-closed", () => {
		owner.dispatchEvent(new Event("connection-closed"));
	});
	owner.client.addEventListener("connection-open", () => {
		const shouldRejoin = owner.hasOpened && owner.currentJoin;
		owner.hasOpened = true;
		owner.dispatchEvent(new Event("connection-open"));
		if (!shouldRejoin) return;
		const {
			documentId,
			token,
			displayName
		} = owner.currentJoin;
		owner.join(documentId, token, displayName).catch(() => {});
	});
}
