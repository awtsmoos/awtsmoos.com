// B"H

/**
 * B"H
 * Chapter 906: The old command table surrendered its mask.
 *
 * This file remains as a compatibility vessel, but it no longer creates global
 * tunnel-call rows. It normalizes only mission-owned timeline events into room
 * activity entries that open like devtools drawers inside the selected room.
 *
 * @param {object[]} timeline Mission timeline events.
 * @returns {object[]} Activity entries.
 */
export function activityRowsFrom(timeline = []) {
  return [...timeline].sort((a, b) => stamp(b.at) - stamp(a.at)).slice(0, 120).map((event, index) => ({
    id: event.id || `${event.type || "activity"}-${index}`,
    action: event.type || event.action || "mission-activity",
    agent: event.data?.agentId || event.fromAgent || event.agentId || "room",
    status: statusFor(event),
    at: event.at || "",
    summary: event.msg || event.message || event.type || "room activity",
    payload: event
  }));
}

function statusFor(event) {
  if (event.ok === false || event.error) return "failed";
  if (event.type?.includes("completed") || event.type === "answer") return "done";
  if (event.type?.includes("created") || event.type?.includes("recorded")) return "recorded";
  return "ok";
}

function stamp(value) {
  const n = new Date(value || 0).getTime();
  return Number.isFinite(n) ? n : 0;
}
