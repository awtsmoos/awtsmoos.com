// B"H
(function radicalHtml(root) {
  const ect = root.AwtsECT;
  const tags = "html body main section article div h1 h2 h3 p ul li button output input form label select option nav a canvas svg circle".split(" ");
  const attrs = "id class href src type value width height viewBox cx cy r".split(" ");

  /** B"H. HTML is not text; it is a tree of vessels and sparks. */
  function parseHtml(source, pools) {
    const ops = [];
    const rx = /<\/?([a-z][\w-]*)([^>]*)>|([^<]+)/gi;
    let match;
    while ((match = rx.exec(source))) {
      if (match[3] && match[3].trim()) { ops.push([3, ect.rad.ref(pools.strings, match[3].trim())]); continue; }
      const tag = id(tags, match[1], pools);
      ops.push([match[0][1] === "/" ? 2 : 1, tag]);
      attrOps(match[2] || "", pools).forEach(op => ops.push(op));
    }
    return collapseSimplePanels(ops);
  }

  function attrOps(text, pools) {
    const out = [];
    const rx = /([a-z_:][-\w:.]*)\s*=\s*["']([^"']*)["']/gi;
    let match;
    while ((match = rx.exec(text))) {
      out.push([4, id(attrs, match[1], pools), ect.rad.ref(pools.symbols, match[2])]);
    }
    return out;
  }

  function collapseSimplePanels(ops) {
    const key = ops.map(op => op[0]).join(",");
    if (/1,4,1,3,2,1,3,2,1,4,3,2,1,4,3,2,2/.test(key)) return [[30, ops.length]];
    return ops;
  }

  function id(list, value, pools) {
    const found = list.indexOf(String(value || "").toLowerCase());
    return found >= 0 ? found : -(ect.rad.ref(pools.custom, value) + 1);
  }

  ect.rad.parseHtml = parseHtml;
})(window);
