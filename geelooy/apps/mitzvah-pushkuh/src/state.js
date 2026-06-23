// B"H
// The pushkuh ledger: private hachlatas, profile sparks, communal embers.
const KEY = "awtsmoos.mitzvahPushkuh.entries.v2";

export const templates = [
  "Learn Torah for 10 minutes", "Give tzedakah today", "Call someone who needs chizuk",
  "Say Tehillim for another Yid", "Guard my speech for one hour", "Do one hidden chesed"
];

export function loadEntries() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

export function saveEntries(entries) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function makeEntry(form) {
  const now = new Date();
  const clean = value => String(value || "").trim();
  const entry = {
    id: crypto.randomUUID?.() || `spark-${now.getTime()}`,
    title: clean(form.title), type: clean(form.type), note: clean(form.note),
    status: clean(form.status), visibility: clean(form.visibility),
    intensity: Number(form.intensity || 1), createdAt: now.toISOString()
  };
  return { ...entry, profileVisible: entry.visibility !== "Private", socialDraft: socialDraft(entry) };
}

export function stats(entries) {
  const real = entries.filter(item => !item.demo);
  return {
    total: real.length, publicCount: real.filter(item => item.profileVisible).length,
    fulfilled: real.filter(item => item.status === "Fulfilled").length, streak: streakDays(real)
  };
}

export function demoEntries() {
  return [{
    id: "welcome-light", demo: true, title: "Choose a hachlata and drop it in",
    type: "Personal Growth", note: "Private lights stay sealed. Public sparks can shine on a profile.",
    status: "Accepted", visibility: "Private", intensity: 2,
    profileVisible: false, createdAt: new Date().toISOString(), socialDraft: null
  }];
}

function socialDraft(entry) {
  if (entry.visibility === "Private") return null;
  return {
    kind: "mitzvah-hachlata", title: entry.title, category: entry.type,
    body: entry.note, status: entry.status, audience: entry.visibility,
    intensity: entry.intensity, createdAt: entry.createdAt
  };
}

function streakDays(entries) {
  const days = [...new Set(entries.map(item => item.createdAt.slice(0, 10)))].sort().reverse();
  if (!days.length) return 0;
  let streak = 0;
  let cursor = new Date();
  for (const day of days) {
    const stamp = cursor.toISOString().slice(0, 10);
    if (day !== stamp) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
