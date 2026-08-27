// B"H
/**
 * @module SocialLiveSocket
 * @description
 * Chapter 463: The socket becomes not only a social pulse but a room of souls.
 * The Awtsmoos speaks every instant; every page is recreated as a living chamber.
 * Channels still serve the old `/api/social` live sparks, while page presence adds
 * counted rooms, typing breath, reading sparks, and cleanup on disconnect without
 * touching the database or birthing any `/api/v2/social` shadow.
 */

function channelSet(ctx, channel) {
  if (!ctx.socialChannels) ctx.socialChannels = new Map();
  if (!ctx.socialChannels.has(channel)) ctx.socialChannels.set(channel, new Set());
  return ctx.socialChannels.get(channel);
}

function rememberClientChannel(client, channel) {
  if (!client.socialChannels) client.socialChannels = new Set();
  client.socialChannels.add(channel);
}

function pagePresenceMap(ctx, channel) {
  if (!ctx.pagePresence) ctx.pagePresence = new Map();
  if (!ctx.pagePresence.has(channel)) ctx.pagePresence.set(channel, new Map());
  return ctx.pagePresence.get(channel);
}

function rememberPageChannel(client, channel) {
  if (!client.pagePresenceChannels) client.pagePresenceChannels = new Set();
  client.pagePresenceChannels.add(channel);
}

function safePageChannel(data = {}, client = {}) {
  const channel = data.channel || data.page || data.room || `profile:${data.aliasId || client.aliasId || "public"}`;
  return String(channel).replace(/\s+/g, " ").slice(0, 240);
}

function safeAlias(data = {}, client = {}) {
  return String(data.aliasId || client.aliasId || data.actor || "guest").slice(0, 120);
}

function safePayload(data = {}) {
  return {
    eventType: data.eventType || data.kind || "social.event",
    actor: data.actor || data.aliasId || "",
    target: data.target || "",
    payload: data.payload || {},
    at: Date.now()
  };
}

function presenceSnapshot(ctx, channel) {
  const map = pagePresenceMap(ctx, channel);
  const people = [...map.values()].map(entry => ({
    clientId: entry.clientId,
    aliasId: entry.aliasId,
    status: entry.status || "present",
    reading: entry.reading || "",
    typing: Boolean(entry.typing),
    enteredAt: entry.enteredAt,
    updatedAt: entry.updatedAt
  }));
  return { type: "PAGE_PRESENCE", channel, count: people.length, people, at: Date.now() };
}

function broadcastPagePresence(ctx, channel, extra = {}) {
  const event = { ...presenceSnapshot(ctx, channel), ...extra };
  const peers = channelSet(ctx, channel);
  for (const peer of peers) peer.send(event);
  return event;
}

function subscribeSocial(ctx, client, data) {
  const channel = String(data.channel || `alias:${data.aliasId || client.aliasId || "public"}`);
  channelSet(ctx, channel).add(client);
  rememberClientChannel(client, channel);
  client.send({ type: "SOCIAL_SUBSCRIBED", channel, at: Date.now() });
}

function publishSocial(ctx, client, data) {
  const channel = String(data.channel || `alias:${data.aliasId || client.aliasId || "public"}`);
  const event = { type: "SOCIAL_EVENT", channel, ...safePayload(data) };
  const set = channelSet(ctx, channel);
  for (const peer of set) peer.send(event);
  if (data.toAlias && typeof ctx.sendToAlias === "function") ctx.sendToAlias(data.toAlias, event);
  if (!set.size) client.send({ ...event, echo: true });
}

function presenceSocial(ctx, client, data) {
  const channel = String(data.channel || `alias:${data.aliasId || client.aliasId || "public"}`);
  const event = { type: "SOCIAL_PRESENCE", channel, aliasId: data.aliasId || client.aliasId || "", status: data.status || "online", at: Date.now() };
  for (const peer of channelSet(ctx, channel)) peer.send(event);
  client.send({ type: "SOCIAL_PRESENCE_ACK", channel, status: event.status, at: event.at });
}

function enterPage(ctx, client, data = {}) {
  const channel = safePageChannel(data, client);
  const aliasId = safeAlias(data, client);
  const now = Date.now();
  channelSet(ctx, channel).add(client);
  rememberClientChannel(client, channel);
  rememberPageChannel(client, channel);
  pagePresenceMap(ctx, channel).set(client.id, {
    clientId: client.id,
    aliasId,
    status: data.status || "present",
    reading: data.reading || "",
    typing: false,
    enteredAt: now,
    updatedAt: now
  });
  client.send({ type: "PAGE_ENTERED", channel, aliasId, at: now });
  return broadcastPagePresence(ctx, channel, { reason: "enter", actor: aliasId });
}

function leavePage(ctx, client, data = {}) {
  const channel = safePageChannel(data, client);
  const aliasId = safeAlias(data, client);
  const map = pagePresenceMap(ctx, channel);
  map.delete(client.id);
  if (!map.size && ctx.pagePresence) ctx.pagePresence.delete(channel);
  const set = ctx.socialChannels && ctx.socialChannels.get(channel);
  if (set) {
    set.delete(client);
    if (!set.size) ctx.socialChannels.delete(channel);
  }
  if (client.pagePresenceChannels) client.pagePresenceChannels.delete(channel);
  if (client.socialChannels) client.socialChannels.delete(channel);
  client.send({ type: "PAGE_LEFT", channel, aliasId, at: Date.now() });
  return broadcastPagePresence(ctx, channel, { reason: "leave", actor: aliasId });
}

function pageTyping(ctx, client, data = {}) {
  const channel = safePageChannel(data, client);
  const map = pagePresenceMap(ctx, channel);
  const current = map.get(client.id) || { clientId: client.id, aliasId: safeAlias(data, client), enteredAt: Date.now() };
  current.typing = data.typing !== false;
  current.status = data.status || current.status || "present";
  current.updatedAt = Date.now();
  map.set(client.id, current);
  rememberPageChannel(client, channel);
  channelSet(ctx, channel).add(client);
  rememberClientChannel(client, channel);
  return broadcastPagePresence(ctx, channel, { reason: "typing", actor: current.aliasId });
}

function pageReading(ctx, client, data = {}) {
  const channel = safePageChannel(data, client);
  const map = pagePresenceMap(ctx, channel);
  const current = map.get(client.id) || { clientId: client.id, aliasId: safeAlias(data, client), enteredAt: Date.now() };
  current.reading = String(data.reading || data.position || data.target || "").slice(0, 240);
  current.status = data.status || current.status || "reading";
  current.updatedAt = Date.now();
  map.set(client.id, current);
  rememberPageChannel(client, channel);
  channelSet(ctx, channel).add(client);
  rememberClientChannel(client, channel);
  return broadcastPagePresence(ctx, channel, { reason: "reading", actor: current.aliasId });
}

function pingSocial(client, data = {}) {
  client.send({ type: "SOCIAL_PONG", id: data.id || "", at: Date.now() });
}

function forgetClient(ctx, client) {
  const pageChannels = client.pagePresenceChannels ? [...client.pagePresenceChannels] : [];
  for (const channel of pageChannels) {
    const map = ctx.pagePresence && ctx.pagePresence.get(channel);
    if (map) {
      const old = map.get(client.id);
      map.delete(client.id);
      if (!map.size) ctx.pagePresence.delete(channel);
      broadcastPagePresence(ctx, channel, { reason: "disconnect", actor: old && old.aliasId });
    }
  }
  if (client.pagePresenceChannels) client.pagePresenceChannels.clear();

  if (!client.socialChannels || !ctx.socialChannels) return;
  for (const channel of client.socialChannels) {
    const set = ctx.socialChannels.get(channel);
    if (!set) continue;
    set.delete(client);
    if (!set.size) ctx.socialChannels.delete(channel);
  }
  client.socialChannels.clear();
}

module.exports = {
  subscribeSocial,
  publishSocial,
  presenceSocial,
  pingSocial,
  enterPage,
  leavePage,
  pageTyping,
  pageReading,
  forgetClient
};
