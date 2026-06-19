// B"H
const crypto = require("crypto");
const { readStore, writeStore } = require("./store.js");

const MAX_EVENTS_PER_CONVERSATION = 300;
const MAX_CONVERSATIONS_PER_USER = 80;

/**
 * B"H
 * Chapter 489: The chat received a ledger with rooms.
 *
 * A preview is not alone, and an action is not a loose spark. Each one belongs
 * to a conversation vessel: named by the user, dated by the server, and ready to
 * gather previews, commands, filesystem reads, proxy openings, and final links
 * into one remembered path.
 *
 * @param {string} userId Owner id.
 * @param {object} input Conversation hints.
 * @returns {object} Conversation record.
 */
function ensureConversation(userId, input = {}) {
  const store = readStore();
  const bucket = userBucket(store, userId);
  const id = cleanId(input.conversationId) || idFromName(input.conversationName) || dateId();
  const existing = bucket.conversations[id] || null;
  const now = Date.now();
  bucket.conversations[id] = {
    id,
    name: cleanName(input.conversationName || existing?.name || defaultName(now)),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    lastAction: existing?.lastAction || "",
    events: existing?.events || []
  };
  prune(bucket);
  writeStore(store);
  return bucket.conversations[id];
}

/**
 * B"H
 * Chapter 490: Every action became a footprint.
 *
 * @param {string} userId Owner id.
 * @param {object} input Event data.
 * @returns {object} Stored event and conversation.
 */
function recordConversationEvent(userId, input = {}) {
  const store = readStore();
  const bucket = userBucket(store, userId);
  const convo = ensureInStore(bucket, input);
  const event = {
    id: "evt_" + crypto.randomBytes(8).toString("hex"),
    at: Date.now(),
    kind: input.kind || "action",
    action: input.action || "",
    title: input.title || input.action || input.kind || "Action",
    ok: input.ok !== false,
    tunnelName: input.tunnelName || "",
    targetVessel: input.targetVessel || "",
    path: input.path || input.url || "",
    previewId: input.previewId || "",
    viewUrl: input.viewUrl || "",
    peruta: input.peruta || null,
    summary: input.summary || ""
  };
  convo.events.unshift(event);
  convo.events = convo.events.slice(0, MAX_EVENTS_PER_CONVERSATION);
  convo.updatedAt = event.at;
  convo.lastAction = event.action || event.kind;
  prune(bucket);
  writeStore(store);
  return { ok: true, conversation: publicConversation(convo), event };
}

function listConversations(userId) {
  const store = readStore();
  const bucket = userBucket(store, userId);
  return Object.values(bucket.conversations)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map(publicConversation);
}

function getConversation(userId, id) {
  const store = readStore();
  const convo = userBucket(store, userId).conversations[String(id || "")];
  return convo ? publicConversation(convo, true) : null;
}

function attachConversationToPreview(preview, input = {}) {
  return {
    ...preview,
    conversationId: cleanId(input.conversationId) || idFromName(input.conversationName) || preview.conversationId || "",
    conversationName: cleanName(input.conversationName || preview.conversationName || "")
  };
}

function userBucket(store, userId) {
  store.conversationHistory = store.conversationHistory || { users: {} };
  const users = store.conversationHistory.users;
  users[userId] = users[userId] || { conversations: {} };
  users[userId].conversations = users[userId].conversations || {};
  return users[userId];
}

function ensureInStore(bucket, input) {
  const id = cleanId(input.conversationId) || idFromName(input.conversationName) || dateId();
  const now = Date.now();
  bucket.conversations[id] = bucket.conversations[id] || {
    id,
    name: cleanName(input.conversationName || defaultName(now)),
    createdAt: now,
    updatedAt: now,
    lastAction: "",
    events: []
  };
  if (input.conversationName) bucket.conversations[id].name = cleanName(input.conversationName);
  return bucket.conversations[id];
}

function publicConversation(convo, includeEvents = false) {
  return {
    id: convo.id,
    name: convo.name,
    createdAt: convo.createdAt,
    updatedAt: convo.updatedAt,
    lastAction: convo.lastAction,
    eventCount: convo.events?.length || 0,
    events: includeEvents ? convo.events || [] : (convo.events || []).slice(0, 8)
  };
}

function prune(bucket) {
  const ordered = Object.values(bucket.conversations).sort((a, b) => b.updatedAt - a.updatedAt);
  bucket.conversations = Object.fromEntries(ordered.slice(0, MAX_CONVERSATIONS_PER_USER).map(x => [x.id, x]));
}

function cleanId(value) {
  return String(value || "").trim().replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function cleanName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 120);
}

function idFromName(value) {
  const clean = cleanId(value);
  return clean ? "chat_" + clean.toLowerCase() : "";
}

function defaultName(at) {
  return "Conversation " + new Date(at).toISOString().slice(0, 16).replace("T", " ");
}

function dateId() {
  return "chat_" + new Date().toISOString().slice(0, 10) + "_" + crypto.randomBytes(4).toString("hex");
}

module.exports = {
  attachConversationToPreview,
  ensureConversation,
  getConversation,
  listConversations,
  recordConversationEvent
};
