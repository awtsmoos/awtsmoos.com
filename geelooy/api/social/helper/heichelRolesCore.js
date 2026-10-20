//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module heichelRoles
 * @description
 * A small vessel for social authority inside a heichel. Editors are the
 * current authority root used by legacy code; moderators, contributors and
 * followers are layered around that root without disturbing old callers.
 */

const { sp } = require("./_awtsmoos.constants.js");

const ROLE_NAMES = ["editors", "moderators", "contributors", "followers"];
const SETTING_DEFAULTS = {
    allowPostSubmissions: true,
    allowCommentSubmissions: true,
    requirePostApproval: true,
    requireCommentApproval: true
};

function normalizeRole(role) {
    return String(role || "").trim().toLowerCase();
}

function rolePath({ heichelId, role }) {
    return `${sp}/heichelos/${heichelId}/${normalizeRole(role)}`;
}

function settingsPath({ heichelId }) {
    return `${sp}/heichelos/${heichelId}/settings/submissions`;
}

function uniqueSortedAliases(value) {
    const items = Array.isArray(value) ? value : [];
    return [...new Set(items.filter(Boolean).map(String))]
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

function boolFromPayload(value, fallback) {
    if (value === undefined || value === null || value === "") return fallback;
    if (value === true || value === "true" || value === "yes" || value === "1") return true;
    if (value === false || value === "false" || value === "no" || value === "0") return false;
    return fallback;
}

module.exports = {
	ROLE_NAMES,
	SETTING_DEFAULTS,
	normalizeRole,
	rolePath,
	settingsPath,
	uniqueSortedAliases,
	boolFromPayload
};
