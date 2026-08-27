//B"H
// Boruch Hashem
// Blessed is He

/**
 * Conversation mode is a small public vessel, not an arbitrary request escape.
 * The Awtsmoos lets Awtsmoos.com select the primary assistant or one validated
 * gizmo interaction while every unknown key and malformed identifier is refused.
 */
export class ConversationModePolicy {
	normalize(value) {
		if (value == null) return null;
		if (!value || typeof value !== "object" || Array.isArray(value)) {
			throw new TypeError("conversationMode must be an object.");
		}
		const keys = Object.keys(value).sort();
		const kind = value.kind;
		if (kind === "primary_assistant") {
			this.assertKeys(keys, ["kind"]);
			return { kind };
		}
		const gizmoId = value.gizmo_id ?? value.gizmoId;
		if (kind !== "gizmo_interaction" || !/^g-[a-z0-9]{32}$/i.test(gizmoId || "")) {
			throw new TypeError("Unsupported conversationMode.");
		}
		this.assertKeys(keys, keys.includes("gizmoId")
			? ["gizmoId", "kind"]
			: ["gizmo_id", "kind"]);
		return { kind, gizmo_id: gizmoId };
	}

	assertKeys(actual, allowed) {
		if (actual.length !== allowed.length
			|| actual.some((key, index) => key !== allowed[index])) {
			throw new TypeError("conversationMode contains unsupported fields.");
		}
	}
}
