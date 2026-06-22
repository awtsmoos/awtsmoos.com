/**
 * B"H
 * @module SocialHeichelRoutes
 * @description
 * Chapter 452: The palace gate refuses false owners.
 *
 * Creation now refuses to overwrite an existing Heichel id, and deletion now
 * verifies real authority before the palace is erased. The old endpoints remain
 * alive, but the missing permission check from the stress test is closed.
 */

var {
    createHeichel,
    getHeichel,
    getHeichelos,
    generateHeichelId,
    addHeichelEditor,
    removeHeichelEditor,
    getHeichelEditors,
    deleteHeichel,
    updateHeichel,
    er,
    verifyHeichelAuthority
} = require("./helper/index.js");

var {
    getHeichelRoleList,
    addHeichelRoleMember,
    removeHeichelRoleMember,
    getHeichelSubmissionSettings,
    updateHeichelSubmissionSettings
} = require("./helper/heichelRoles.js");

function normalizeHeichelIds(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (value && typeof value === "object") return Object.keys(value).filter(Boolean);
    return [];
}

function requestedHeichelId($i) {
    return $i.$_POST?.heichelId || $i.$_POST?.inputId || $i.$_POST?.id;
}

async function heichelExists({ $i, heichelId }) {
    if (!heichelId) return false;
    var existing = await getHeichel({ heichelId, $i, er });
    return Boolean(existing && !existing.error && !existing.code && (existing.name || existing.author || existing.description || existing.id));
}

async function detailedHeichelList({ $i, aliasId }) {
    var heichelos = normalizeHeichelIds(await getHeichelos({ $i, aliasId }));
    var results = [];
    for (var i = 0; i < heichelos.length; i++) {
        var details = await getHeichel({ heichelId: heichelos[i], $i, er });
        if (!details || details.error) continue;
        details.id = heichelos[i];
        if (details.author == aliasId) results.push(details);
    }
    return results;
}

async function heichelDetailsByIds({ $i, heichelIds }) {
    if (!Array.isArray(heichelIds)) return er("Invalid input");
    var results = [];
    for (var i = 0; i < heichelIds.length; i++) {
        var details = await getHeichel({ heichelId: heichelIds[i], $i, er });
        if (!details || details.error) continue;
        details.id = heichelIds[i];
        results.push(details);
    }
    return results;
}

async function createHeichelForAlias({ $i, aliasId }) {
    try {
        var heichelId = requestedHeichelId($i);
        if (heichelId && await heichelExists({ $i, heichelId })) {
            return er({ code: "HEICHEL_EXISTS", message: "A Heichel with this id already exists.", heichelId });
        }
        return await createHeichel({ $i, er, aliasId });
    } catch (e) {
        return er({ code: "CREATE_PROBLEM", details: e + "" });
    }
}

async function deleteHeichelForAlias({ $i, aliasId, heichelId }) {
    if (!aliasId) return er({ code: "NO_ALIAS", message: "aliasId is required to delete a Heichel." });
    var owns = await verifyHeichelAuthority({ heichelId, aliasId, $i });
    if (!owns) return er({ code: "NO_HEICHEL_AUTHORITY", message: "This alias cannot delete this Heichel.", aliasId, heichelId });
    return await deleteHeichel({ $i, heichelId, aliasId, er });
}

module.exports = ({ $i, userid } = {}) => ({
    "/heichelos/:heichel/roles/:role": async vars => {
        if ($i.request.method == "GET") return await getHeichelRoleList({ $i, heichelId: vars.heichel, role: vars.role });
        if ($i.request.method == "POST") return await addHeichelRoleMember({ $i, heichelId: vars.heichel, role: vars.role });
        if ($i.request.method == "DELETE") return await removeHeichelRoleMember({ $i, heichelId: vars.heichel, role: vars.role });
        return er({ message: "Unsupported method", code: "BAD_METHOD" });
    },
    "/heichelos/:heichel/settings/submissions": async vars => {
        if ($i.request.method == "GET") return await getHeichelSubmissionSettings({ $i, heichelId: vars.heichel });
        if ($i.request.method == "POST" || $i.request.method == "PUT") return await updateHeichelSubmissionSettings({ $i, heichelId: vars.heichel });
        return er({ message: "Unsupported method", code: "BAD_METHOD" });
    },
    "/heichelActions/generateHeichelId": async () => await generateHeichelId({ $i }),
    "/heichelos/:heichel/editors": async vars => {
        if ($i.request.method == "GET") return await getHeichelEditors({ $i, heichelId: vars.heichel });
        if ($i.request.method == "POST") return await addHeichelEditor({ $i, heichelId: vars.heichel });
        if ($i.request.method == "DELETE") return await removeHeichelEditor({ $i, heichelId: vars.heichel });
        return er({ message: "Unsupported method", code: "BAD_METHOD" });
    },
    "/heichelos/:heichel": async vars => {
        var heichelId = vars.heichel;
        var aliasId = $i.$_DELETE?.aliasId || $i.$_POST?.aliasId || $i.$_PUT?.aliasId || $i.$_GET?.aliasId;
        if ($i.request.method == "DELETE") return await deleteHeichelForAlias({ $i, heichelId, aliasId });
        if ($i.request.method == "POST") return await createHeichelForAlias({ $i, aliasId });
        if ($i.request.method == "PUT") return await updateHeichel({ vars, $i });
        return await getHeichel({ heichelId, $i, er });
    },
    "/alias/:alias/heichelos": async v => {
        if ($i.request.method == "GET") return (await detailedHeichelList({ $i, aliasId: v.alias })).map(w => w.id);
        if ($i.request.method == "POST") return await createHeichelForAlias({ $i, aliasId: v.alias });
        return er({ message: "Unsupported method", code: "BAD_METHOD" });
    },
    "/alias/:alias/heichelos/details": async v => {
        if ($i.request.method == "POST") return await heichelDetailsByIds({ $i, heichelIds: $i.$_POST.heichelIds });
        if ($i.request.method == "GET") return await detailedHeichelList({ $i, aliasId: v.alias });
        return er({ message: "Unsupported method", code: "BAD_METHOD" });
    },
    "/alias/:alias/heichelos/:heichel": async vars => {
        if ($i.request.method == "DELETE") return await deleteHeichelForAlias({ $i, heichelId: vars.heichel, aliasId: vars.alias });
        if ($i.request.method == "PUT") return await updateHeichel({ vars, $i });
        return await getHeichel({ heichelId: vars.heichel, $i, er });
    },
    "/heichelos/searchByAliasOwner/:aliasId": async v => {
        if ($i.request.method == "GET") return await detailedHeichelList({ $i, aliasId: v.aliasId });
        return er({ message: "Unsupported method", code: "BAD_METHOD" });
    },
    "/alias/:alias/heichelos/:heichel/ownership": async vars => {
        try {
            var owns = await verifyHeichelAuthority({ heichelId: vars.heichel, aliasId: vars.alias, $i });
            if (owns) return { yes: "You have permission to post to this heichel!", code: "YES" };
            return { no: "You don't have permission to post to this heichel!", code: "NO" };
        } catch (e) {
            return "OLP" + e;
        }
    }
});
