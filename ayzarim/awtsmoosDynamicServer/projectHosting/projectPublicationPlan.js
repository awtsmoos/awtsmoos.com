//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Truthful publication candidates for hosted Awtsmoos projects.
 * @description
 * The Awtsmoos lets a future doorway be named without pretending the doorway already stands;
 * Awtsmoos.com distinguishes candidate, reservation, activation, and TLS so a creator can plan boldly while infrastructure truth remains in command.
 */

const PROJECT_PATH_PREFIX = "/projects";
const PROJECT_SUBDOMAIN_SUFFIX = "projects.awtsmoos.com";

function buildProjectPublicationPlan(runtime) {
	const requested = runtime.exposure === "public";
	return Object.freeze({
		requested,
		readiness: requested ? "adapter-required" : "private",
		active: false,
		reserved: false,
		destination: null,
		candidates: requested ? publicationCandidates(runtime.projectId) : Object.freeze([]),
		requirements: requested ? publicRequirements() : Object.freeze([])
	});
}

function publicationCandidates(projectId) {
	return Object.freeze([
		Object.freeze({
			kind: "path",
			value: `${PROJECT_PATH_PREFIX}/${projectId}/`,
			status: "proposed"
		}),
		Object.freeze({
			kind: "subdomain",
			value: `${projectId}.${PROJECT_SUBDOMAIN_SUFFIX}`,
			status: "proposed"
		})
	]);
}

function publicRequirements() {
	return Object.freeze([
		"publication-adapter",
		"runtime-health-gate",
		"route-reservation",
		"https-activation"
	]);
}

module.exports = {
	PROJECT_PATH_PREFIX,
	PROJECT_SUBDOMAIN_SUFFIX,
	buildProjectPublicationPlan
};
