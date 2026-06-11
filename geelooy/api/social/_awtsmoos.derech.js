// B"H
/**
 * @module SocialApiDerech
 * @description
 * Chapter 189: The social API gate opens to the recursive entity universe and
 * the Node OS filesystem layer. Old APIs remain mounted; new APIs add safer,
 * richer alternate views over the same living data.
 */

const aliases = require("./_awtsmoos.alias.js");
const heichelos = require("./_awtsmoos.heichel.js");
const counters = require("./_awtsmoos.counter.js");
const posts = require("./_awtsmoos.posts.js");
const mail = require("./_awtsmoos.mail.js");
const comments = require("./_awtsmoos.comments.js");
const series = require("./_awtsmoos.series.js");
const fileSystem = require("./_awtsmoos.fileSystem.js");
const nodeOs = require("./_awtsmoos.nodeOs.js");
const keys = require("./_awtsmoos.keys.js");
const graph = require("./_awtsmoos.graph.js");
const content = require("./_awtsmoos.content.js");
const entities = require("./_awtsmoos.entities.js");
const assets = require("./_awtsmoos.assets.js");
const editor = require("./_awtsmoos.editor.js");
const governance = require("./_awtsmoos.governance.js");
const notifications = require("./_awtsmoos.notifications.js");
const packed = require("./_awtsmoos.packed.js");
const platform = require("./_awtsmoos.platform.js");
const migrations = require("./_awtsmoos.migrations.js");
const profile = require("./_awtsmoos.profile.js");
const { verifyApiKey } = require("./helper/apiKeys.js");
const { loggedIn } = require("./helper/general.js");

async function resolveUser($i) {
    if (loggedIn($i)) return $i.request.user.info.userId;
    const apiKeyIdentity = await verifyApiKey({ $i });
    if (!apiKeyIdentity?.success?.userId) return null;
    const userid = apiKeyIdentity.success.userId;
    $i.request.user = { info: { userId: userid }, apiKey: apiKeyIdentity.success.key };
    return userid;
}

async function fetchProxy($i, vars) {
    try {
        const decoded = Buffer.from(vars.url, "base64").toString("utf8");
        const url = decodeURIComponent(decoded);
        const response = await $i.fetch(url);
        return await response.text();
    } catch (e) {
        return { BH: "B\"H", error: { message: "Issue", code: "PROBLEM", details: e + "" } };
    }
}

module.exports = async $i => {
    const userid = await resolveUser($i);
    const vessel = { $i, userid };
    await $i.use({
        "/": async () => ({ BH: "yes", session: $i.request.user }),
        "/fetch/:url": async vars => await fetchProxy($i, vars),
        ...aliases(vessel),
        ...heichelos(vessel),
        ...posts(vessel),
        ...counters(vessel),
        ...mail(vessel),
        ...fileSystem({ $i }),
        ...nodeOs(vessel),
        ...keys(vessel),
        ...graph(vessel),
        ...content(vessel),
        ...entities(vessel),
        ...assets(vessel),
        ...editor(vessel),
        ...governance(vessel),
        ...profile(vessel),
        ...notifications(vessel),
        ...packed(vessel),
        ...platform(vessel),
        ...migrations(vessel),
        ...comments(vessel),
        ...series(vessel)
    });
};
