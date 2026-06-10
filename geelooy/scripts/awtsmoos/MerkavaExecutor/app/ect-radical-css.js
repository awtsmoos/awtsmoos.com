// B"H
(function radicalCss(root) {
  const ect = root.AwtsECT;
  const props = "padding margin border-radius background color display gap grid-template-columns list-style font-weight font-size line-height width height transform animation opacity fill box-shadow border bottom".split(" ");
  const units = ["px", "%", "rem", "em", "deg", "fr", "s"];

  /** B"H. CSS is typed desire: selector path, property, value atom. */
  function parseCss(source, pools) {
    const ops = [];
    const rx = /([^{}]+)\{([^{}]*)\}/g;
    let match;
    while ((match = rx.exec(source))) {
      selector(match[1], pools).forEach(op => ops.push(op));
      match[2].split(";").forEach(decl => declaration(decl, pools, ops));
    }
    return collapseDeclarations(ops);
  }

  function selector(text, pools) {
    return text.trim().split(/\s+/).filter(Boolean).map(part => {
      if (part[0] === ".") return [8, ect.rad.ref(pools.symbols, part.slice(1))];
      if (part[0] === "#") return [9, ect.rad.ref(pools.symbols, part.slice(1))];
      return [10, ect.rad.ref(pools.symbols, part)];
    });
  }

  function declaration(text, pools, ops) {
    const at = text.indexOf(":");
    if (at < 1) return;
    const prop = text.slice(0, at).trim();
    const id = props.indexOf(prop);
    ops.push([11, id < 0 ? -(ect.rad.ref(pools.custom, prop) + 1) : id].concat(value(text.slice(at + 1).trim(), pools)));
  }

  function value(raw, pools) {
    const grad = raw.match(/^linear-gradient\((-?\d+)deg,\s*(#[\da-f]{3,8}),\s*(#[\da-f]{3,8})\)$/i);
    if (grad) return [6, num(pools, grad[1]), color(pools, grad[2]), color(pools, grad[3])];
    const dim = raw.match(/^(-?\d+(?:\.\d+)?)(px|%|rem|em|deg|fr|s)$/);
    if (dim) return [2, num(pools, dim[1]), units.indexOf(dim[2])];
    if (/^#[\da-f]{3,8}$/i.test(raw)) return [1, color(pools, raw)];
    if (/^-?\d+(?:\.\d+)?$/.test(raw)) return [3, num(pools, raw)];
    return [4, ect.rad.ref(pools.strings, raw.replace(/\s+/g, " "))];
  }

  function collapseDeclarations(ops) {
    const out = [];
    for (let i = 0; i < ops.length; i += 1) {
      if (ops[i][0] === 11 && ops[i + 1] && ops[i + 1][0] === 11 && ops[i + 2] && ops[i + 2][0] === 11) { out.push([31, 3]); i += 2; }
      else out.push(ops[i]);
    }
    return out;
  }

  function num(pools, value) { return ect.rad.ref(pools.nums, value); }
  function color(pools, value) { return ect.rad.ref(pools.colors, value.toLowerCase()); }
  ect.rad.parseCss = parseCss;
})(window);
