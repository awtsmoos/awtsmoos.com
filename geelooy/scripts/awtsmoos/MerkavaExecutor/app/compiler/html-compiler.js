// B"H
(function htmlCompiler(root) {
  const ns = root.AwtsEctCompilerParts = root.AwtsEctCompilerParts || {};

  /**
   * B"H. HTML becomes a tree-token river. Built-in tags and attrs are IDs,
   * public ids/classes are marked for JS/CSS linking, and common structural
   * shapes are represented as generic phrase calls instead of angle-bracket ash.
   */
  function parseHtml(src, pools, ops, publicSymbols) {
    const tokens = tokenizeHtml(src, pools, publicSymbols);
    recipeOps(tokens, pools).forEach(op => ops.push(op));
  }

  function tokenizeHtml(src, pools, publicSymbols) {
    let index = 0;
    const text = [];
    const out = [];
    while (index < src.length) {
      if (src[index] === "<") {
        flushText(text, pools, out);
        index = readTag(src, index, pools, out, publicSymbols);
      } else {
        text.push(src[index]);
        index += 1;
      }
    }
    flushText(text, pools, out);
    return out;
  }

  function readTag(src, start, pools, out, publicSymbols) {
    const ids = root.AwtsEctIds;
    let index = start + 1;
    let close = false;
    if (src[index] === "/") { close = true; index += 1; }
    index = ns.skipSpaces(src, index);
    const tag = ns.readName(src, index);
    index = tag.next;
    if (tag.value) out.push([close ? ids.ops.HTML_CLOSE : ids.ops.HTML_OPEN, ns.builtin(ids.tags, ns.lower(tag.value), pools.custom)]);
    while (index < src.length && src[index] !== ">") {
      index = ns.skipSpaces(src, index);
      if (src[index] === ">" || src[index] === "/") { index += 1; continue; }
      const attr = ns.readName(src, index);
      index = ns.skipSpaces(src, attr.next);
      let value = "";
      if (src[index] === "=") {
        const read = ns.readQuotedOrBare(src, ns.skipSpaces(src, index + 1));
        value = read.value;
        index = read.next;
      }
      if (attr.value) {
        if (isPublicAttr(attr.value)) addPublic(value, publicSymbols);
        out.push([ids.ops.HTML_ATTR, ns.builtin(ids.attrs, attr.value, pools.custom), attrValue(attr.value, value, pools)]);
      }
    }
    return index + 1;
  }

  function recipeOps(tokens) {
    const out = [];
    for (let index = 0; index < tokens.length; index += 1) {
      const shell = matchShell(tokens, index);
      if (shell) { out.push(shell.op); index = shell.end; continue; }
      out.push(tokens[index]);
    }
    return out;
  }

  function matchShell(tokens, start) {
    const ids = root.AwtsEctIds;
    if (!tokens[start] || tokens[start][0] !== ids.ops.HTML_OPEN) return null;
    const tag = tokens[start][1];
    const cls = attrAfter(tokens, start, "class");
    const id = attrAfter(tokens, start, "id");
    const childCount = countChildOpen(tokens, start);
    if (cls >= 0 && childCount >= 2) return { op: [ids.ops.PHRASE, phraseId("HTML_SHELL_CLASS_CHILDREN"), tag, cls, childCount], end: closeAt(tokens, start, tag) };
    if (id >= 0 && childCount >= 1) return { op: [ids.ops.PHRASE, phraseId("HTML_SHELL_ID_CHILDREN"), tag, id, childCount], end: closeAt(tokens, start, tag) };
    return null;
  }

  function attrAfter(tokens, start, name) {
    const ids = root.AwtsEctIds;
    const attrId = ns.builtin(ids.attrs, name, []);
    for (let index = start + 1; index < Math.min(tokens.length, start + 10); index += 1) {
      const token = tokens[index];
      if (token && token[0] === ids.ops.HTML_ATTR && token[1] === attrId) return token[2];
      if (token && token[0] === ids.ops.HTML_OPEN) return -1;
    }
    return -1;
  }

  function countChildOpen(tokens, start) {
    const ids = root.AwtsEctIds;
    let count = 0;
    for (let index = start + 1; index < Math.min(tokens.length, start + 64); index += 1) {
      if (tokens[index][0] === ids.ops.HTML_OPEN) count += 1;
      if (tokens[index][0] === ids.ops.HTML_CLOSE && count > 0) return count;
    }
    return count;
  }

  function closeAt(tokens, start, tag) {
    const ids = root.AwtsEctIds;
    for (let index = start + 1; index < Math.min(tokens.length, start + 96); index += 1) {
      if (tokens[index][0] === ids.ops.HTML_CLOSE && tokens[index][1] === tag) return index;
    }
    return start;
  }

  function flushText(buffer, pools, out) {
    const text = ns.trim(buffer.join(""));
    buffer.length = 0;
    if (text) out.push([root.AwtsEctIds.ops.HTML_TEXT, ns.ref(pools.text, text)]);
  }

  function attrValue(name, value, pools) { return ns.isNumber(value) ? ns.smallNumOrRef(value, pools) : ns.ref(pools.sym, value); }
  function isPublicAttr(name) { return name === "id" || name === "class" || ns.startsAt(name, "data-", 0); }
  function addPublic(value, publicSymbols) { ns.splitSpaces(String(value || "")).forEach(item => { if (item) publicSymbols[item] = true; }); }
  function phraseId(name) { const list = root.AwtsEctIds.phrases; let id = list.indexOf(name); if (id < 0) id = list.push(name) - 1; return id; }

  ns.parseHtml = parseHtml;
})(typeof self !== "undefined" ? self : globalThis);
