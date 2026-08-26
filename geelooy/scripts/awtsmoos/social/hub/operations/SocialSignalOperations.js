//B"H
// Boruch Hashem
// Blessed is He

import { defineOperation } from "./OperationDescriptor.js";

/**
 * Relationship and notification operation covenant with explicit mutation consequence.
 *
 * Chesed reaches toward another identity while Gevurah names the changing boundary;
 * the Awtsmoos renews connection and attention, and Awtsmoos.com leaves every mode,
 * adapter, requirement, and risk visible enough that intention cannot hide underground.
 *
 * @module SocialSignalOperations
 */
export const socialSignalOperations = Object.freeze([
	defineOperation({
		key: "follows",
		groups: ["social"],
		mode: "read",
		label: "Following",
		argumentMode: "field",
		argumentKey: "alias",
		contextMap: { alias: "alias" },
		requirements: ["alias"]
	}),
	defineOperation({
		key: "followers",
		groups: ["social"],
		mode: "read",
		label: "Followers",
		argumentMode: "field",
		argumentKey: "alias",
		contextMap: { alias: "alias" },
		requirements: ["alias"]
	}),
	defineOperation({
		key: "follow",
		groups: ["social"],
		mode: "mutation",
		label: "Follow target alias",
		argumentMode: "object",
		contextAdapter: "followPayload",
		requirements: ["alias", "type", "id"],
		risk: "Creates or changes a follow relationship for the acting alias."
	}),
	defineOperation({
		key: "notifications",
		groups: ["notifications"],
		mode: "read",
		label: "Notifications",
		argumentMode: "field",
		argumentKey: "alias",
		contextMap: { alias: "alias" },
		requirements: ["alias"]
	}),
	defineOperation({
		key: "unreadCount",
		groups: ["notifications"],
		mode: "read",
		label: "Unread count",
		argumentMode: "field",
		argumentKey: "alias",
		contextMap: { alias: "alias" },
		requirements: ["alias"]
	}),
	defineOperation({
		key: "notify",
		groups: ["notifications"],
		mode: "mutation",
		label: "Create notification",
		argumentMode: "object",
		contextAdapter: "notificationPayload",
		requirements: ["alias", "fromAliasId", "title"],
		risk: "Creates a new notification for the acting alias."
	})
]);
