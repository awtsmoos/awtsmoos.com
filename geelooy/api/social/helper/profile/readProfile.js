// B"H
/**
 * @module ReadProfile
 * @description
 * Chapter 52: The Awtsmoos opens the alias chamber and reveals safe public
 * identity, template choice, interests, and soft personal light.
 */

const { paths, read } = require("./paths.js");
const { memoizedRead } = require("./readCache.js");
const { cleanText, readArray, parseJsonObject } = require("./sanitize.js");
const { getTemplate, normalizeTemplateId } = require("./templates.js");

async function readAlias($i, aliasId) {
    const info = await read($i, paths.aliasInfo(aliasId), null);
    if (info) return { id: aliasId, name: cleanText(info.name || aliasId, 80), description: cleanText(info.description, 300), user: info.user || "" };
    // B"H 2026-11-20 (composer publish cluster, defect 5): established
    // aliases whose records live only in the per-user tree (34 of this
    // account's 46, including @abarbanel) have NO aliases/<id>/info
    // record, so this read returned null on every request — memo or no
    // memo — and aggregateProfile answered a SYNTHETIC identity with an
    // empty description, leaving the Alias Studio permanently unable to
    // prefill. When the signed-in session owns the alias, its per-user
    // record (/users/<userId>/aliases/<aliasId>, the same record
    // getDetailedAlias trusts) is the real identity: use it.
    const userId = String($i?.request?.user?.info?.userId || $i?.request?.user?.info?.userid || $i?.request?.user?.userId || $i?.request?.user?.userid || "").trim();
    if (!userId) return null;
    const record = await read($i, `/users/${userId}/aliases/${aliasId}`, null);
    if (!record || typeof record !== "object") return null;
    return { id: aliasId, name: cleanText(record.name || aliasId, 80), description: cleanText(record.description, 300), user: userId };
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
    // B"H 2026-11-20 (profile round 5): the identity read was the one
    // aggregate input with NO memo — every profile view re-walked it,
    // and under load its failure made aggregateProfile fall back to a
    // SYNTHETIC identity (empty name/description) even for real aliases
    // (observed live for @abarbanel). Memoize it like every other
    // section (45s, coalesced, rejections evicted — readCache law).
    return memoizedRead("identity:" + aliasId, async () => {
        const alias = await readAlias($i, aliasId);
        if (!alias) return null;
        const profile = await readProfile($i, aliasId, alias);
        return { alias, profile, activeTemplate: getTemplate(profile.templateId) };
    });
}

module.exports = { readAlias, readProfile, readProfileIdentity };
