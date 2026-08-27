//B"H
/**
 * @module heichelRoles
 * @description
 * A small vessel for social authority inside a heichel. Editors are the
 * current authority root used by legacy code; moderators, contributors and
 * followers are layered around that root without disturbing old callers.
 */

const { sp } = require("./_awtsmoos.constants.js");
const { er } = require("./general.js");
const { verifyHeichelAuthority } = require("./heichel.js");

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

async function ensureAuthority({ $i, heichelId, aliasId }) {
    if (!aliasId) {
        return er({ message: "Missing aliasId", code: "MISSING_ALIAS" });
    }

    const verified = await verifyHeichelAuthority({ $i, heichelId, aliasId });
    if (!verified) {
        return er({ message: "No authority for this heichel", code: "NO_AUTH", heichelId, aliasId });
    }

    return null;
}

async function getHeichelRoleList({ $i, heichelId, role }) {
    const normalizedRole = normalizeRole(role);
    if (!ROLE_NAMES.includes(normalizedRole)) {
        return er({ message: "Unknown role", code: "BAD_ROLE", role });
    }

    const list = await $i.db.get(rolePath({ heichelId, role: normalizedRole })).catch(() => []);
    return { success: uniqueSortedAliases(list), role: normalizedRole };
}

async function addHeichelRoleMember({ $i, heichelId, role }) {
    const normalizedRole = normalizeRole(role);
    if (!ROLE_NAMES.includes(normalizedRole)) {
        return er({ message: "Unknown role", code: "BAD_ROLE", role });
    }

    const aliasId = $i.$_POST.aliasId;
    const memberAliasId = $i.$_POST.memberAliasId || $i.$_POST.editorAliasId;
    const authorityError = await ensureAuthority({ $i, heichelId, aliasId });
    if (authorityError) return authorityError;
    if (!memberAliasId) return er({ message: "Missing memberAliasId", code: "MISSING_MEMBER" });

    const path = rolePath({ heichelId, role: normalizedRole });
    const current = uniqueSortedAliases(await $i.db.get(path).catch(() => []));
    const next = uniqueSortedAliases([...current, memberAliasId]);
    const wr = await $i.db.write(path, next);

    return { success: { role: normalizedRole, added: memberAliasId, members: next, wr } };
}

async function removeHeichelRoleMember({ $i, heichelId, role }) {
    const normalizedRole = normalizeRole(role);
    if (!ROLE_NAMES.includes(normalizedRole)) {
        return er({ message: "Unknown role", code: "BAD_ROLE", role });
    }

    const aliasId = $i.$_DELETE?.aliasId || $i.$_POST?.aliasId;
    const memberAliasId = $i.$_DELETE?.memberAliasId || $i.$_DELETE?.editorAliasId || $i.$_POST?.memberAliasId;
    const authorityError = await ensureAuthority({ $i, heichelId, aliasId });
    if (authorityError) return authorityError;
    if (!memberAliasId) return er({ message: "Missing memberAliasId", code: "MISSING_MEMBER" });

    const path = rolePath({ heichelId, role: normalizedRole });
    const current = uniqueSortedAliases(await $i.db.get(path).catch(() => []));
    const next = current.filter(item => item !== memberAliasId);
    const wr = await $i.db.write(path, next);

    return { success: { role: normalizedRole, removed: memberAliasId, members: next, wr } };
}

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
    ROLE_NAMES,
    SETTING_DEFAULTS,
    getHeichelRoleList,
    addHeichelRoleMember,
    removeHeichelRoleMember,
    getHeichelSubmissionSettings,
    updateHeichelSubmissionSettings
};
