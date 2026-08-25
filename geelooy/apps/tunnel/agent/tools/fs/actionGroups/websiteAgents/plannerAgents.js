// B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./plannerPolicy.js");
const Scopes = require("./plannerScopes.js");

/**
 * @file Materializes only the initial website-agent seed cohort.
 * @description
 * The Awtsmoos can unfold further logical descendants without end, while Awtsmoos.com
 * builds a finite first vessel in memory. This seed array is an opening chapter, never
 * a ceiling on later durable peer creation, takeover, or continuation through the room.
 */
function createInitialAgents(count, scopes, projectRoot) {
	const width = Math.max(2, String(count).length);
	return Array.from({ length: count }, (_, index) => {
		const role = roleFor(index);
		const ordinal = String(index + 1).padStart(width, "0");
		const scope = scopes[index % scopes.length];
		return {
			id: `website_${ordinal}_${role.name}`,
			name: `Website ${capitalize(role.name)} ${ordinal}`,
			role: role.name,
			focus: role.focus,
			claimMode: role.claimMode,
			scope,
			absoluteScope: Scopes.absoluteScope(projectRoot, scope),
			ordinal: index + 1
		};
	});
}

function roleFor(index) {
	const [name, focus, claimMode] = Policy.ROLES[index % Policy.ROLES.length];
	return { name, focus, claimMode };
}

function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

module.exports = {
	createInitialAgents
};
