// B"H
/**
 * @module SocialHubIndex
 * @description Chapter 469: The hub runs HTTP panels, WebSocket sparks, and now
 * page-presence life from one altar, always within `/api/social`, never
 * backsliding into v2. The page itself becomes a room.
 */

import { socialApi } from "./api.js";
import { state, setBusy, setError, setResult } from "./state.js";
import { render } from "./render.js";
import { connectSocialSocket, publishSocialSocket, liveState } from "./socket.js";
import { mountPresenceBadge } from "../live/presenceBadge.js";

const root = document.getElementById("BH_SOCIAL_HUB");
const groups = {
    overview: ["meta", "openapi", "v2Gone", "routeHealth"],
    live: ["liveSubscribe", "livePresence", "livePublish", "liveReplay"],
    search: ["search", "discover"],
    feed: ["feedHome", "feed", "trending", "events"],
    discover: ["discover", "recommendations"],
    profile: ["profile", "activity", "history", "analytics"],
    graph: ["graph"],
    social: ["follows", "followers", "follow"],
    notifications: ["notifications", "unreadCount", "notify"],
    admin: ["submissionSettings", "editors", "migrationDryRun"],
    developer: ["openapi", "keysVerify", "cacheMiss", "routeHealth"]
};
function channel() { return `alias:${state.alias || "ikar"}`; }
function pageChannel() { return `page:${location.pathname || "/social/"}`; }
async function runKey(key) {
    const alias = state.alias || "ikar";
    const targetAlias = state.targetAlias || alias;
    const q = state.query || alias;
    const ch = channel();
    const map = {
        meta: () => socialApi.meta(), openapi: () => socialApi.openapi(), v2Gone: () => socialApi.v2Gone(),
        routeHealth: () => socialApi.routeHealth().then(body => ({ ok: true, status: 200, body: { ok: true, data: body } })),
        search: () => socialApi.search({ aliases: alias, q }), discover: () => socialApi.discoverHeichelos({ q }),
        feedHome: () => socialApi.feedHome(alias), feed: () => socialApi.feed({ aliases: alias }), trending: () => socialApi.trending({ aliases: alias }), events: () => socialApi.events({ aliases: alias }),
        recommendations: () => socialApi.recommendations(alias), profile: () => socialApi.profile(alias), activity: () => socialApi.activity(alias), history: () => socialApi.history(alias), analytics: () => socialApi.analytics(alias), graph: () => socialApi.graph(alias),
        follows: () => socialApi.follows(alias), followers: () => socialApi.followers(alias), follow: () => socialApi.follow({ alias, type: "alias", id: targetAlias }),
        notifications: () => socialApi.notifications(alias), unreadCount: () => socialApi.unreadCount(alias), notify: () => socialApi.notify({ alias, fromAliasId: targetAlias, title: `Hub note ${new Date().toLocaleTimeString()}` }),
        submissionSettings: () => socialApi.submissionSettings(state.heichelId), editors: () => socialApi.editors(state.heichelId), migrationDryRun: () => socialApi.migrationDryRun({ heichelId: state.heichelId, seriesId: state.seriesId }),
        keysVerify: () => socialApi.keysVerify(""), cacheMiss: () => socialApi.cacheMiss(),
        liveSubscribe: () => socialApi.liveSubscribe({ alias, channel: ch }), livePresence: () => socialApi.livePresence({ alias, channel: ch }), livePublish: () => socialApi.livePublish({ alias, channel: ch, text: state.query || "B'H hub spark" }), liveReplay: () => socialApi.liveReplay({ channel: ch })
    };
    const result = await (map[key] || map.meta)();
    setResult(key, result);
    return result;
}
async function runActive() {
    setBusy(true); setError(""); repaint();
    try { for (const key of groups[state.active] || []) await runKey(key); }
    catch (error) { setError(error.message || String(error)); }
    finally { setBusy(false); repaint(); }
}
async function runAll() {
    setBusy(true); setError(""); repaint();
    try { for (const key of [...new Set(Object.values(groups).flat())]) await runKey(key); }
    catch (error) { setError(error.message || String(error)); }
    finally { setBusy(false); repaint(); }
}
function connectLive() {
    connectSocialSocket({ alias: state.alias || "ikar", channel: channel() });
    repaint();
}
function publishLive() {
    if (!liveState.connected) connectLive();
    setTimeout(() => {
        publishSocialSocket({ alias: state.alias || "ikar", channel: channel(), text: state.query || "B'H hub spark" });
        repaint();
    }, 120);
}
function repaint() { render(root, { repaint, runActive, runAll, connectLive, publishLive }); }
window.addEventListener("BH_SOCIAL_SOCKET", repaint);
mountPresenceBadge({ aliasId: state.alias || "ikar", channel: pageChannel() });
repaint();
runActive();
