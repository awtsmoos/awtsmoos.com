// B"H
(function radicalJs(root) {
  const ect = root.AwtsECT;
  const names = "document window getElementById querySelector addEventListener requestAnimationFrame textContent onclick createElement appendChild console log Math Array String const let var function return if for while class new await".split(" ");
  const punct = [".", "(", ")", "{", "}", ";", "=", "+", ",", "=>", "++", "[", "]"];

  /** B"H. JS is reduced first by phrase: DOM get, bind click, RAF increment, set text. */
  function parseJs(source, pools) {
    const ops = [];
    source = source.replace(/document\.getElementById\(["']([^"']+)["']\)/g, (_, id) => {
      ops.push([40, ect.rad.ref(pools.symbols, id)]);
      return " ";
    });
    source = source.replace(/addEventListener\(["']click["']/g, () => { ops.push([41]); return " "; });
    source = source.replace(/requestAnimationFrame/g, () => { ops.push([42]); return " "; });
    source = source.replace(/\.textContent\s*=/g, () => { ops.push([43]); return " "; });
    tokens(source, pools, ops);
    return collapseJs(ops);
  }

  function tokens(source, pools, ops) {
    const rx = /"([^"]*)"|'([^']*)'|\b\d+(?:\.\d+)?\b|[A-Za-z_$][\w$]*|[{}()[\].,;=+*/:<>&!-]+/g;
    let match;
    while ((match = rx.exec(source))) {
      const t = match[0];
      if (t[0] === "\"" || t[0] === "'") ops.push([20, ect.rad.ref(pools.strings, t.slice(1, -1))]);
      else if (/^\d/.test(t)) ops.push([21, ect.rad.ref(pools.nums, t)]);
      else if (/^[A-Za-z_$]/.test(t)) ops.push([22, id(names, t, pools)]);
      else ops.push([23, id(punct, t, pools)]);
    }
  }

  function collapseJs(ops) {
    const text = ops.map(o => o[0]).join(",");
    if (/40,22,23,40,22,23,21,41,42,43/.test(text)) return [[44, ops.length]];
    return ops;
  }

  function id(list, value, pools) {
    const found = list.indexOf(value);
    return found >= 0 ? found : -(ect.rad.ref(pools.custom, value) + 1);
  }

  ect.rad.parseJs = parseJs;
})(window);
