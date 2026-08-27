// B"H
/**
 * @module ReadProfile
 * @description
 * Chapter 52: The Awtsmoos opens the alias chamber and reveals safe public
 * identity, template choice, interests, and soft personal light.
 */

const { paths, read } = require("./paths.js");
const { cleanText, readArray, parseJsonObject } = require("./sanitize.js");
const { getTemplate, normalizeTemplateId } = require("./templates.js");

async function readAlias($i, aliasId) {
    const info = await read($i, paths.aliasInfo(aliasId), null);
    if (!info) return null;
    return { id: aliasId, name: cleanText(info.name || aliasId, 80), description: cleanText(info.description, 300), user: info.user || "" };
}

async function readProfile($i, aliasId, alias) {
    const stored = await read($i, paths.aliasProfile(aliasId), {});
    const templateId = normalizeTemplateId(stored.templateId || "royal-dark");
    return {
        displayName: cleanText(stored.displayName || alias.name || aliasId, 80),
        username: aliasId,
        bio: cleanText(stored.bio || alias.description, 500),
        location: cleanText(stored.location, 80),
        website: cleanText(stored.website, 180),
        avatar: cleanText(stored.avatar, 400),
        banner: cleanText(stored.banner, 400),
        interests: readArray(stored.interests),
        templateId,
        themeOverrides: parseJsonObject(stored.themeOverrides)
    };
}

async function readProfileIdentity({ $i, aliasId }) {
    const alias = await readAlias($i, aliasId);
    if (!alias) return null;
    const profile = await readProfile($i, aliasId, alias);
    return { alias, profile, activeTemplate: getTemplate(profile.templateId) };
}

module.exports = { readAlias, readProfile, readProfileIdentity };
