
// B"H

const { readStore, writeStore } = require("./store.js");

function recordUsage(entry) {
  const store = readStore();

  store.usage = store.usage || [];

  store.usage.push({
    at: Date.now(),
    userId: entry.userId || null,
    keyId: entry.keyId || null,
    action: entry.action || "unknown",
    path: entry.path || null,
    bytes: Number(entry.bytes || 0),
    ok: entry.ok !== false
  });

  while (store.usage.length > 5000) {
    store.usage.shift();
  }

  writeStore(store);
}

function usageSummary(userId) {
  const store = readStore();
  const all = (store.usage || []).filter(u => u.userId === userId);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const today = all.filter(u => u.at >= todayStart.getTime());

  return {
    totalRequests: all.length,
    todayRequests: today.length,
    todayBytes: today.reduce((a, b) => a + Number(b.bytes || 0), 0),
    last: all.slice(-50).reverse()
  };
}

module.exports = {
  recordUsage,
  usageSummary
};
