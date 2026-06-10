// B"H
/**
 * @module WriteProfile
 * @description
 * Chapter 60: The owner may change the garment, but no stranger may seize the
 * crown. Every write is checked against alias ownership.
 */

const { er } = require("../general.js");
const { verifyAliasOwnership } = require("../alias.js");
const { paths } = require("./paths.js");
const { cleanText, readArray, parseJsonObject } = require("./sanitize.js");
const { normalizeTemplateId } = require("./templates.js");

async function ensureOwner({ $i, userid, aliasId }) {
    const owns = await verifyAliasOwnership(aliasId, $i, userid);
    return owns ? null : er({ code: "NOT_AUTHORIZED", message: "Only the alias owner can update this profile." });
}

function profileFromBody(body = {}) {
    return {
        displayName: cleanText(body.displayName || body.name, 80),
        bio: cleanText(body.bio || body.description, 500),
        location: cleanText(body.location, 80),
        website: cleanText(body.website, 180),
        avatar: cleanText(body.avatar, 400),
        banner: cleanText(body.banner, 400),
        interests: readArray(body.interests),
        templateId: normalizeTemplateId(body.templateId || "royal-dark"),
        themeOverrides: parseJsonObject(body.themeOverrides),
        updatedAt: Date.now()
    };
}

async function updateProfile({ $i, userid, aliasId }) {
    const blocked = await ensureOwner({ $i, userid, aliasId });
    if (blocked) return blocked;
    const profile = profileFromBody($i.$_POST || $i.$_PUT || {});
    await $i.db.write(paths.aliasProfile(aliasId), profile);
    return { success: profile };
}

async function updateTemplate({ $i, userid, aliasId }) {
    const blocked = await ensureOwner({ $i, userid, aliasId });
    if (blocked) return blocked;
    const current = await $i.db.get(paths.aliasProfile(aliasId)).catch(() => ({})) || {};
    const templateId = normalizeTemplateId($i.$_POST?.templateId || $i.$_PUT?.templateId);
    const profile = { ...current, templateId, updatedAt: Date.now() };
    await $i.db.write(paths.aliasProfile(aliasId), profile);
    return { success: profile };
}

module.exports = { updateProfile, updateTemplate, profileFromBody };
