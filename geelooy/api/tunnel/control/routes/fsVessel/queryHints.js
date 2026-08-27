// B"H

/**
 * B"H
 * Chapter 2: The query string whispered which vessel should wake.
 *
 * This module reads only the safe request query surface. It lets GET callers,
 * YAML action comments, and simple custom-action tools ask for `virtual-os`
 * without forcing the giant payload parser to grow another limb.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} Plain route hints.
 */
function routeHints($i) {
  const q = $i.paramKinds?.GET || $i.$_GET || $i.request?.query || {};

  return {
    targetVessel: q.targetVessel || q.vessel || "",
    vessel: q.vessel || "",
    target: q.target || "",
    fallback: q.fallback || "",
    fs: q.fs || "",
    root: q.root || "",
    prefer: q.prefer || ""
  };
}

/**
 * B"H
 * Adds routing hints into the payload without overwriting actual action data.
 *
 * @param {object} payload Existing action payload.
 * @param {object} hints Route hints.
 * @returns {object} Payload with metadata only.
 */
function withRouteHints(payload = {}, hints = {}) {
  return {
    ...payload,
    routeHints: hints,
    targetVessel: payload.targetVessel || hints.targetVessel || hints.vessel || "",
    fallback: payload.fallback || hints.fallback || ""
  };
}

module.exports = { routeHints, withRouteHints };
