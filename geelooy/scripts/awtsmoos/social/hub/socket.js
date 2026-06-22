// B"H
/**
 * @module SocialHubSocket
 * @description
 * Chapter 460: The hub does not only poll the river; it stands inside it.
 * WebSocket events are collected into a small live log and mirrored into the UI.
 */

export const liveState = {
    connected: false,
    status: "idle",
    channel: "social:public",
    messages: [],
    socket: null
};

function push(message) {
    liveState.messages = [{ at: Date.now(), ...message }, ...liveState.messages].slice(0, 40);
    window.dispatchEvent(new CustomEvent("BH_SOCIAL_SOCKET", { detail: liveState }));
}

export function connectSocialSocket({ alias = "ikar", channel = "social:public" } = {}) {
    if (liveState.socket && liveState.socket.readyState <= 1) return liveState;
    const proto = location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${location.host}`);
    liveState.socket = ws;
    liveState.channel = channel;
    liveState.status = "connecting";
    push({ type: "SOCKET_CONNECTING", channel });
    ws.onopen = () => {
        liveState.connected = true;
        liveState.status = "connected";
        ws.send(JSON.stringify({ type: "LOGIN", aliasId: alias }));
        ws.send(JSON.stringify({ type: "SOCIAL_SUBSCRIBE", aliasId: alias, channel }));
        ws.send(JSON.stringify({ type: "SOCIAL_PRESENCE", aliasId: alias, channel, status: "online" }));
        ws.send(JSON.stringify({ type: "SOCIAL_PING", id: `hub-${Date.now()}` }));
        push({ type: "SOCKET_OPEN", channel, aliasId: alias });
    };
    ws.onmessage = event => {
        try { push(JSON.parse(event.data)); }
        catch { push({ type: "SOCKET_TEXT", text: event.data }); }
    };
    ws.onerror = () => {
        liveState.status = "error";
        push({ type: "SOCKET_ERROR", channel });
    };
    ws.onclose = () => {
        liveState.connected = false;
        liveState.status = "closed";
        push({ type: "SOCKET_CLOSED", channel });
    };
    return liveState;
}

export function publishSocialSocket({ alias = "ikar", channel = liveState.channel, text = "B'H live spark" } = {}) {
    if (!liveState.socket || liveState.socket.readyState !== 1) return false;
    liveState.socket.send(JSON.stringify({ type: "SOCIAL_PUBLISH", aliasId: alias, actor: alias, channel, kind: "hub.spark", payload: { text } }));
    return true;
}
