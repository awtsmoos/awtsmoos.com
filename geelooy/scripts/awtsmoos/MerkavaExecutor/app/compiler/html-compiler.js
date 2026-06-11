// B"H
(function htmlCompiler(root) {
  const ns = root.AwtsEctCompilerParts = root.AwtsEctCompilerParts || {};

  /**
   * B"H. HTML as a compact tree, not a tag stream.
   *
   * The old path emitted open/close tokens and sometimes collapsed shells. This
   * path parses a tiny DOM-shaped tree and emits pre-order semantic nodes:
   * tagId, attrCount, childCount, attrId/value pairs. Closing tags vanish.
   * In maximum semantic mode, visible text may be dropped while structure and
   * cross-language public slots remain reconstructable.
   */
  function parseHtml(src, pools, ops, publicSymbols) {
    const roots = buildTree(src, pools, publicSymbols);
    roots.forEach(node => emitNode(node, pools, ops));
  }

  function buildTree(src, pools, publicSymbols) {
    const roots = [];
    const stack = [];
    let index = 0;
    const text = [];
    while (index < src.length) {
      if (src[index] === "<") {
        flushText(text, pools, stack);
        const read = readNode(src, index, pools, publicSymbols);
        index = read.next;
        if (read.close) closeStack(stack, read.tag);
        else if (read.node) attach(read.node, roots, stack, read.selfClosing);
      } else { text.push(src[index]); index += 1; }
    }
    flushText(text, pools, stack);
    return roots;
  }

  function readNode(src, start, pools, publicSymbols) {
    let index = start + 1;
    let close = false;
    if (src[index] === "/") { close = true; index += 1; }
    index = ns.skipSpaces(src, index);
    const tag = ns.readName(src, index);
    index = tag.next;
    if (close) return { close: true, tag: ns.lower(tag.value), next: skipTag(src, index) };
    const node = { tag: tagId(tag.value, pools), attrs: [], children: [] };
    let selfClosing = false;
    while (index < src.length && src[index] !== ">") {
      index = ns.skipSpaces(src, index);
      if (src[index] === "/") { selfClosing = true; index += 1; continue; }
      if (src[index] === ">") break;
      const attr = ns.readName(src, index);
      index = ns.skipSpaces(src, attr.next);
      let value = "";
      if (src[index] === "=") {
        const read = ns.readQuotedOrBare(src, ns.skipSpaces(src, index + 1));
        value = read.value;
        index = read.next;
      }
      if (attr.value) node.attrs.push([attrId(attr.value, pools), attrValue(attr.value, value, pools, publicSymbols)]);
    }
    return { close: false, node, selfClosing: selfClosing || isVoidTag(tag.value), next: index + 1 };
  }

  function skipTag(src, index) { while (index < src.length && src[index] !== ">") index += 1; return index + 1; }

  function attach(node, roots, stack, selfClosing) {
    const parent = stack[stack.length - 1];
    if (parent) parent.children.push(node); else roots.push(node);
    if (!selfClosing) stack.push(node);
  }

  function closeStack(stack) { if (stack.length) stack.pop(); }

  function flushText(buffer, pools, stack) {
    const value = ns.trim(buffer.join(""));
    buffer.length = 0;
    if (!value) return;
    if (pools.__settings && pools.__settings.preserveText === false) return;
    const parent = stack[stack.length - 1];
    if (parent) parent.children.push({ text: ns.ref(pools.text, value), attrs: [], children: [] });
  }

  function emitNode(node, pools, ops) {
    if (node.text !== undefined) { ops.push([root.AwtsEctIds.ops.HTML_TEXT, node.text]); return; }
    const shell = shellPhrase(node);
    if (shell) { ops.push(shell); return; }
    const op = [root.AwtsEctIds.ops.PHRASE, phraseId("HTML_TREE_NODE"), node.tag, node.attrs.length, node.children.length];
    node.attrs.forEach(pair => { op.push(pair[0], pair[1]); });
    ops.push(op);
    node.children.forEach(child => emitNode(child, pools, ops));
  }

  function shellPhrase(node) {
    const cls = findAttr(node, "class");
    const id = findAttr(node, "id");
    if (cls >= 0 && node.children.length >= 2) return [root.AwtsEctIds.ops.PHRASE, phraseId("HTML_SHELL_CLASS_CHILDREN"), node.tag, cls, node.children.length];
    if (id >= 0 && node.children.length >= 1) return [root.AwtsEctIds.ops.PHRASE, phraseId("HTML_SHELL_ID_CHILDREN"), node.tag, id, node.children.length];
    return null;
  }

  function findAttr(node, name) {
    const wanted = attrId(name, { custom: [] });
    for (let index = 0; index < node.attrs.length; index += 1) if (node.attrs[index][0] === wanted) return node.attrs[index][1];
    return -1;
  }

  function attrValue(name, value, pools, publicSymbols) {
    if (isPublicAttr(name)) return ns.publicSlot(publicSymbols, value);
    return ns.isNumber(value) ? ns.smallNumOrRef(value, pools) : ns.ref(pools.sym, value);
  }

  function tagId(name, pools) { return ns.builtin(root.AwtsEctIds.tags, ns.lower(name), pools.custom); }
  function attrId(name, pools) { return ns.builtin(root.AwtsEctIds.attrs, name, pools.custom); }
  function isPublicAttr(name) { return name === "id" || name === "class" || ns.startsAt(name, "data-", 0); }
  function isVoidTag(name) { return "area base br col embed hr img input link meta param source track wbr".split(" ").indexOf(ns.lower(name)) >= 0; }
  function phraseId(name) { const list = root.AwtsEctIds.phrases; let id = list.indexOf(name); if (id < 0) id = list.push(name) - 1; return id; }

  ns.parseHtml = parseHtml;
})(typeof self !== "undefined" ? self : globalThis);
