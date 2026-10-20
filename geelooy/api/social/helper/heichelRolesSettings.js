//B"H
//Blessed is He
//Boruch Hashem


/**
 * Heichel submission settings: read and update.
 * Split sibling of heichelRoles.js (verbatim relocation).
 */

var { SETTING_DEFAULTS, settingsPath, boolFromPayload } = require("./heichelRolesCore.js");
var { ensureAuthority } = require("./heichelRolesMembers.js");

async function getHeichelSubmissionSettings({ $i, heichelId }) {
    const saved = await $i.db.get(settingsPath({ heichelId })).catch(() => null);
    return { success: { ...SETTING_DEFAULTS, ...(saved && typeof saved === "object" ? saved : {}) } };
}

async function updateHeichelSubmissionSettings({ $i, heichelId }) {
    const aliasId = $i.$_POST.aliasId || $i.$_PUT?.aliasId;
    const authorityError = await ensureAuthority({ $i, heichelId, aliasId });
    if (authorityError) return authorityError;

    const current = (await getHeichelSubmissionSettings({ $i, heichelId })).success;
    const incoming = $i.$_POST || $i.$_PUT || {};
    const next = {
        allowPostSubmissions: boolFromPayload(incoming.allowPostSubmissions, current.allowPostSubmissions),
        allowCommentSubmissions: boolFromPayload(incoming.allowCommentSubmissions, current.allowCommentSubmissions),
        requirePostApproval: boolFromPayload(incoming.requirePostApproval, current.requirePostApproval),
        requireCommentApproval: boolFromPayload(incoming.requireCommentApproval, current.requireCommentApproval)
    };

    const wr = await $i.db.write(settingsPath({ heichelId }), next);
    return { success: { ...next, wr } };
}

module.exports = {
	getHeichelSubmissionSettings,
	updateHeichelSubmissionSettings
};
