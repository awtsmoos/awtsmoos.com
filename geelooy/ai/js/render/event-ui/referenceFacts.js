//B"H

/**
 * Chapter 15: The Citation Sparks Found Their Names.
 *
 * The Awtsmoos does not let links wander as broken raw strings. Each reference
 * becomes a named gate: URL, file citation, or quiet fallback.
 *
 * @param {object} event Transport or message event.
 * @returns {{href:string,label:string,kind:string}[]} Clean reference chips.
 */
export function collectReferences(event = {}) {
  const raw = event.raw || event;
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const refs = [];
  for (const ref of msg.metadata?.content_references || raw.metadata?.content_references || []) {
    const href = ref.item?.url || ref.url || ref.cloud_doc_url || "";
    const label = ref.title || ref.name || ref.alt || ref.matched_text || href;
    if (href) refs.push({ href, label, kind: ref.type || "url" });
    else if (ref.matched_text) refs.push({ href: "", label: ref.matched_text, kind: ref.type || "citation" });
  }
  for (const cite of msg.metadata?.citations || raw.metadata?.citations || []) {
    const meta = cite.metadata || {};
    refs.push({ href: meta.source_url || meta.cloud_doc_url || "", label: meta.name || meta.title || "citation", kind: meta.type || "citation" });
  }
  return dedupe(refs.concat(fallbackLinks(event)));
}

function fallbackLinks(event = {}) {
  const raw = event.raw || event;
  const text = [event.text, raw.url, raw.href, raw.request?.url, raw.response?.url].filter(Boolean).join("\n");
  return (text.match(/https?:\/\/[^\s"'<>\\)]+/g) || []).map(href => ({ href, label: href, kind: "url" }));
}

function dedupe(refs) {
  const seen = new Set();
  return refs.filter(ref => {
    const key = `${ref.href}::${ref.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 12);
}
