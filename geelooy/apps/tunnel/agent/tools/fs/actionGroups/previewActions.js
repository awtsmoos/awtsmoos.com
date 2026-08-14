// B"H

const Dependencies = require("../preview/deps.js");
const LocalServer = require("../preview/localServerAction.js");
const Registry = require("../previewRegistry.js");
const Result = require("../preview/actionResult.js");

/**
 * @file Exposes durable native preview actions with truthful readiness states.
 * @description
 * The Awtsmoos does not confuse a constructed URL with a public doorway already
 * crossed. Local servers are registered durably; list and revoke mutate real state;
 * account-scoped creations identify the authorization step still required.
 */
function buildPreviewActions(context = {}) {
	const payload = context.payload || {};
	return {
		async previewSettingsGet() {
			return accountAction("previewSettingsGet", payload, "preview/settings");
		},
		async previewSettingsSet() {
			return accountAction("previewSettingsSet", payload, "preview/settings/set");
		},
		async previewList() {
			const previews = Registry.list(payload.recoveryRoot);
			return Result.expose("previewList", { ok: true, previews, count: previews.length });
		},
		async previewRevoke() {
			const previewId = payload.previewId || payload.id || "";
			const preview = Registry.stop(previewId, payload.recoveryRoot);
			return Result.expose("previewRevoke", preview
				? { ok: true, previewId, preview }
				: { ok: false, previewId, error: "preview_not_found" });
		},
		async previewCreate() {
			return proposal("previewCreate", payload, payload.kind || "file");
		},
		async previewFile() {
			return proposal("previewFile", payload, "file");
		},
		async previewFolder() {
			return proposal("previewFolder", payload, "folder");
		},
		async previewPage() {
			return payload.url
				? Result.expose("previewPage", await LocalServer.expose(payload))
				: proposal("previewPage", payload, "page", {
					html: payload.html || payload.content || "",
					css: payload.css || "",
					data: payload.data || null
				});
		},
		async previewCollection() {
			return proposal("previewCollection", payload, "collection", {
				items: payload.items || payload.files || []
			});
		},
		async previewLiveCommand() {
			return proposal("previewLiveCommand", payload, "live", {
				commandId: payload.commandId || payload.actionId || ""
			});
		},
		async previewActionResult() {
			return proposal("previewActionResult", payload, "action", {
				actionId: payload.actionId || payload.id || ""
			});
		},
		async previewExposeLocalServer() {
			return Result.expose("previewExposeLocalServer", await LocalServer.expose(payload));
		}
	};
}

function proposal(action, payload, kind, extra = {}) {
	const preview = Dependencies.Payload.createPayload(payload, kind, extra);
	const url = Dependencies.Url.previewUrl(payload, preview);
	return Result.expose(action, {
		ok: true,
		preview,
		url,
		viewUrl: url,
		created: false,
		publicVerified: false,
		authorizationRequired: true
	});
}

function accountAction(action, payload, route) {
	return Result.expose(action, {
		ok: true,
		performed: false,
		authorizationRequired: true,
		url: `${Dependencies.Url.baseUrl(payload)}/${route}`
	});
}

module.exports = {
	buildPreviewActions,
	expose: Result.expose,
	localServer: LocalServer.expose,
	previewUrl: Dependencies.Url.previewUrl
};
