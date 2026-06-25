// B"H

/** B"H: Selected-room activity only, sourced from missionTimeline. */
export function activityRows(state) {
  return (state.timeline || []).slice(-120).reverse().map(row => ({
    type: row.type || row.kind || "event",
    title: row.msg || row.claim || row.type || "Mission event",
    at: row.at || row.createdAt || row.updatedAt || "",
    detail: JSON.stringify(row, null, 2)
  }));
}
