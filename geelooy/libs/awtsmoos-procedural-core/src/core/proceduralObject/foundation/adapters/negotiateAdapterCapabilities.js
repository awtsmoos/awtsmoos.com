// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos joins request and capability only where their named vessels meet.
 * This Awtsmoos.com negotiation never upgrades a declaration or guesses support.
 */

import { createDiagnostic } from "../diagnostics/index.js";
import {
	ADAPTER_CAPABILITY_STATUSES,
	ADAPTER_TOPOLOGY_IDENTITY_MODES,
	assertAdapterChoice,
	normalizeAdapterNames
} from "./adapterContract.js";

function missing(required, available) {
	const availableSet = new Set(available);
	return Object.freeze(required.filter(value => !availableSet.has(value)));
}

function addDiagnostic(diagnostics, code, message, values) {
	if (!values.length) {
		return;
	}
	diagnostics.push(createDiagnostic({
		code,
		message,
		metadata: { values }
	}));
}

export function negotiateAdapterCapabilities(manifest, request = {}) {
	const requiredOperations = normalizeAdapterNames(request.operations ?? [], "Required operations");
	const acceptedStatuses = request.acceptedStatuses ?? ["implemented"];
	if (!Array.isArray(acceptedStatuses)) {
		throw new TypeError("Accepted adapter statuses must be an array.");
	}
	for (const status of acceptedStatuses) {
		assertAdapterChoice(status, ADAPTER_CAPABILITY_STATUSES, "accepted adapter status");
	}
	const claims = new Map(manifest.operations.map(claim => [claim.name, claim]));
	const supportedOperations = Object.freeze(requiredOperations
		.map(name => claims.get(name))
		.filter(claim => claim && acceptedStatuses.includes(claim.status)));
	const supportedSet = new Set(supportedOperations.map(claim => claim.name));
	const missingOperations = Object.freeze(requiredOperations.filter(name => !supportedSet.has(name)));
	const missingArtifactTypes = missing(
		normalizeAdapterNames(request.artifactTypes ?? [], "Required artifact types"),
		manifest.artifactTypes
	);
	const missingImportFormats = missing(
		normalizeAdapterNames(request.importFormats ?? [], "Required import formats"),
		manifest.importFormats
	);
	const missingExportFormats = missing(
		normalizeAdapterNames(request.exportFormats ?? [], "Required export formats"),
		manifest.exportFormats
	);
	const topologyModes = request.topologyIdentityModes ?? [];
	if (!Array.isArray(topologyModes)) {
		throw new TypeError("Topology identity modes must be an array.");
	}
	for (const mode of topologyModes) {
		assertAdapterChoice(mode, ADAPTER_TOPOLOGY_IDENTITY_MODES, "requested topology identity mode");
	}
	const deterministicAccepted = request.deterministic !== true || manifest.deterministic;
	const topologyAccepted = topologyModes.length === 0 || topologyModes.includes(manifest.topologyIdentity);
	const diagnostics = [];
	addDiagnostic(diagnostics, "ADAPTER.OPERATION_UNAVAILABLE", "Required operations are unavailable at accepted statuses.", missingOperations);
	addDiagnostic(diagnostics, "ADAPTER.ARTIFACT_UNSUPPORTED", "Required artifact types are unsupported.", missingArtifactTypes);
	addDiagnostic(diagnostics, "ADAPTER.IMPORT_UNSUPPORTED", "Required import formats are unsupported.", missingImportFormats);
	addDiagnostic(diagnostics, "ADAPTER.EXPORT_UNSUPPORTED", "Required export formats are unsupported.", missingExportFormats);
	if (!deterministicAccepted) {
		diagnostics.push(createDiagnostic({ code: "ADAPTER.DETERMINISM_UNAVAILABLE", message: "Deterministic execution is unavailable." }));
	}
	if (!topologyAccepted) {
		diagnostics.push(createDiagnostic({ code: "ADAPTER.TOPOLOGY_IDENTITY_UNAVAILABLE", message: "Requested topology identity transport is unavailable." }));
	}
	return Object.freeze({
		ok: diagnostics.length === 0,
		adapterId: manifest.id,
		adapterVersion: manifest.version,
		supportedOperations,
		missingOperations,
		missingArtifactTypes,
		missingImportFormats,
		missingExportFormats,
		deterministicAccepted,
		topologyAccepted,
		diagnostics: Object.freeze(diagnostics)
	});
}
