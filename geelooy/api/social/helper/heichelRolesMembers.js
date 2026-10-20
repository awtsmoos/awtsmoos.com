//B"H
//Blessed is He
//Boruch Hashem


/**
 * Heichel role membership: authority check, list, add and remove.
 * Split sibling of heichelRoles.js (verbatim relocation).
 */

const { er } = require("./general.js");
const { verifyHeichelAuthority } = require("./heichel.js");
var { ROLE_NAMES, normalizeRole, rolePath, uniqueSortedAliases } = require("./heichelRolesCore.js");

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

module.exports = {
	ensureAuthority,
	getHeichelRoleList,
	addHeichelRoleMember,
	removeHeichelRoleMember
};
