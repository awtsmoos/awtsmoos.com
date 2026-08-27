//B"H
//Boruch Hashem
//Blessed is He

const {
	buildProjectHostingPlan
} = require("../../../ayzarim/awtsmoosDynamicServer/projectHosting/projectHostingPlan.js");
const { resolveProjectOwner } = require("./requestIdentity.js");
const { text } = require("./runtimeRequest.js");

/**
 * @file Owner-scoped declarative hosting-plan route.
 * @description
 * The Awtsmoos reveals what is ready and what still awaits a vessel in time;
 * Awtsmoos.com binds that truth to the authenticated owner before runtime and database paths align.
 */
async function projectHostingPlanResponse(info) {
	try {
		const ownerScope = await resolveProjectOwner(info);
		if (!ownerScope) {
			return failure(
				"PROJECT_HOSTING_LOGIN_REQUIRED",
				"Login or provide a valid Awtsmoos API key before requesting project hosting."
			);
		}

		const query = info.$_GET || {};
		const projectId = text(query.projectId);
		if (!projectId) {
			return failure("PROJECT_ID_REQUIRED", "Choose a project before asking for its hosting plan.");
		}

		const plan = buildProjectHostingPlan({
			projectId,
			rootPath: text(query.rootPath) || ".",
			exposure: text(query.exposure) || "private",
			ownerScope
		});
		return { BH: "B\"H", ok: true, plan };
	} catch (error) {
		return failure(
			error?.code || "PROJECT_HOSTING_PLAN_INVALID",
			error?.message || "The project hosting plan could not be created."
		);
	}
}

function failure(code, message) {
	return {
		BH: "B\"H",
		ok: false,
		error: { code, message }
	};
}

module.exports = { projectHostingPlanResponse };
