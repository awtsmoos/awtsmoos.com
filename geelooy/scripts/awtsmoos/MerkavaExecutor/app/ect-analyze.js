// B"H
(function ectAnalyze(root) {
  const ect = root.AwtsECT = root.AwtsECT || {};

  /**
   * B"H. The analyzer merges every file into one vessel: tags, selectors,
   * numbers, colors, identifiers, strings, and repeated shapes live once.
   */
  function analyze(project) {
    const text = Object.values(project.files).join("\n");
    const html = values(project.files, ".html").join("\n");
    const css = values(project.files, ".css").join("\n");
    const js = values(project.files, ".js").join("\n");
    const symbols = {
      tags: uniq(matches(html, /<\/?([a-z][\w-]*)/gi)),
      attrs: uniq(matches(html, /\s([a-z_:][-\w:.]*)=/gi)),
      ids: uniq(matches(text, /["'#]([A-Za-z][-\w]*)["']/g)),
      selectors: uniq(matches(css, /([^{}]+)\{/g).map(s => s.trim())),
      props: uniq(matches(css, /([\w-]+)\s*:/g)),
      colors: uniq(matches(css, /(#[0-9a-f]{3,8})/gi)),
      numbers: uniq(matches(text, /\b\d+(?:\.\d+)?\b/g)),
      idents: uniq(matches(js, /\b[A-Za-z_$][\w$]*\b/g)),
      strings: uniq(matches(text, /"([^"]*)"|'([^']*)'/g).map(s => s.replace(/^['"]|['"]$/g, "")))
    };
    return { originalBytes: ect.utf8Length(text), text, html, css, js, symbols, repeats: repeats(text), project };
  }

  function values(files, suffix) {
    return Object.keys(files).filter(name => name.endsWith(suffix)).map(name => files[name]);
  }

  function matches(text, regex) {
    const out = [];
    let match;
    while ((match = regex.exec(text))) out.push(match[1] || match[0]);
    return out.filter(Boolean);
  }

  function uniq(list) { return Array.from(new Set(list)).filter(Boolean); }

  function repeats(text) {
    const grams = new Map();
    const words = text.split(/\s+/).filter(Boolean);
    for (let i = 0; i < words.length - 2; i += 1) {
      const key = words.slice(i, i + 3).join(" ");
      grams.set(key, (grams.get(key) || 0) + 1);
    }
    return Array.from(grams).filter(x => x[1] > 1).slice(0, 16);
  }

  ect.analyzeProject = analyze;
})(window);
