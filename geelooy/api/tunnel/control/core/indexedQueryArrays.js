// B"H

/**
 * B"H
 * Chapter 1: The Awtsmoos lets scattered query sparks march in numbered order.
 * A caller may send f1, f2, path1, path2, or paths1, paths2; this tiny vessel
 * gathers those sparks without disturbing the older JSON, comma, and newline
 * rivers already flowing through the tunnel.
 *
 * @param {object} q Plain GET query map.
 * @param {string[]} prefixes Query prefixes to collect.
 * @returns {string[]} Values sorted by their numeric suffix.
 */
function indexedValues(q = {}, prefixes = []) {
  const rows = [];
  for (const [key, value] of Object.entries(q || {})) {
    for (const prefix of prefixes) {
      const match = String(key).match(new RegExp("^" + prefix + "(?:\\.|_|-)?(\\d+)$"));
      if (!match) continue;
      const n = Number(match[1]);
      if (!Number.isFinite(n)) continue;
      rows.push({ n, value });
    }
  }

  return rows
    .sort((a, b) => a.n - b.n)
    .flatMap(row => Array.isArray(row.value) ? row.value : [row.value])
    .map(value => String(value ?? ""))
    .filter(Boolean);
}

/**
 * B"H
 * Reads repeated bracket notation such as paths[]=a&paths[]=b when the host
 * parser preserves such keys. Some parsers collapse this form; indexed params
 * remain the sturdier universal grammar.
 *
 * @param {object} q Plain GET query map.
 * @param {string} name Base query name.
 * @returns {string[]} Collected values.
 */
function bracketValues(q = {}, name = "") {
  const direct = q[name + "[]"];
  if (direct === undefined) return [];
  return (Array.isArray(direct) ? direct : [direct])
    .map(value => String(value ?? ""))
    .filter(Boolean);
}

/**
 * B"H
 * Combines indexed and bracket forms into one flat ordered list. Existing
 * explicit payloads still win elsewhere; this only fills silence.
 *
 * @param {object} q Plain GET query map.
 * @param {object} options Collection options.
 * @param {string[]} options.prefixes Indexed prefixes.
 * @param {string[]} [options.brackets] Bracket base names.
 * @returns {string[]} Flat values.
 */
function flatQueryArray(q = {}, { prefixes = [], brackets = [] } = {}) {
  return [
    ...indexedValues(q, prefixes),
    ...brackets.flatMap(name => bracketValues(q, name))
  ];
}

module.exports = { indexedValues, bracketValues, flatQueryArray };
