//B"H
// Boruch Hashem
// Blessed is He

import { defineOperation } from "./OperationDescriptor.js";

/**
 * Expert governance and developer operations expressed as readable read-only data.
 *
 * The Awtsmoos renews authority and diagnostic sight without confusing them with
 * ordinary social interaction; Awtsmoos.com gives each advanced Keli enough space
 * that permission, migration rehearsal, and developer probes remain visibly in place.
 *
 * @module GovernanceDeveloperOperations
 */
export const governanceDeveloperOperations = Object.freeze([
	defineOperation({
		key: "submissionSettings",
		groups: ["admin"],
		mode: "read",
		label: "Submission settings",
		argumentMode: "field",
		argumentKey: "heichelId",
		contextAdapter: "migrationPayload",
		requirements: ["heichelId"]
	}),
	defineOperation({
		key: "editors",
		groups: ["admin"],
		mode: "read",
		label: "Space editors",
		argumentMode: "field",
		argumentKey: "heichelId",
		contextAdapter: "migrationPayload",
		requirements: ["heichelId"]
	}),
	defineOperation({
		key: "migrationDryRun",
		groups: ["admin"],
		mode: "read",
		label: "Migration dry run",
		argumentMode: "object",
		contextAdapter: "migrationPayload",
		requirements: ["heichelId", "seriesId"]
	}),
	defineOperation({
		key: "keysVerify",
		groups: ["developer"],
		mode: "read",
		label: "Verify API key",
		argumentMode: "field",
		argumentKey: "apiKey",
		defaults: { apiKey: "" }
	}),
	defineOperation({
		key: "cacheMiss",
		groups: ["developer"],
		mode: "read",
		label: "Cache miss probe"
	})
]);
