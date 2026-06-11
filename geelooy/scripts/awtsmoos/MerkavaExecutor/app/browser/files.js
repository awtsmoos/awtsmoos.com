// B"H
(function browserFiles(root) {
  const ect = root.AwtsEctBrowser;

  /**
   * B"H. Turns many uploaded garments into one project vessel. HTML, CSS, and
   * JS stay as separate files so the compiler can parse structure, not scrape
   * regex shadows from a smashed string.
   */
  ect.projectFromFiles = async function projectFromFiles(fileList) {
    const files = {};
    for (const file of Array.from(fileList || [])) files[file.name] = await file.text();
    return { title: "Uploaded Project", kind: "uploaded", files };
  };

  /** @param {{files:Record<string,string>}} project @returns {string} */
  ect.sourceText = function sourceText(project) {
    return Object.keys(project.files).map(name => `// FILE: ${name}\n${project.files[name]}`).join("\n\n");
  };

  /** @param {string} text @returns {Record<string,string>} */
  ect.parseSourceText = function parseSourceText(text) {
    const files = {}, marker = "// FILE: ", src = String(text || "");
    let index = 0;
    while (index < src.length) {
      const start = src.indexOf(marker, index);
      if (start < 0) break;
      const nameStart = start + marker.length;
      const firstBreak = src.indexOf("\n", nameStart);
      if (firstBreak < 0) break;
      const next = src.indexOf(marker, firstBreak + 1);
      const name = src.slice(nameStart, firstBreak).trim();
      files[name] = trim(src.slice(firstBreak + 1, next < 0 ? src.length : next));
      index = next < 0 ? src.length : next;
    }
    return files;
  };

  /** @param {{files:Record<string,string>}} project @param {string} suffix */
  ect.concatFiles = function concatFiles(project, suffix) {
    return Object.keys(project.files).filter(name => name.endsWith(suffix)).map(name => project.files[name]).join("\n");
  };

  /** @param {{files:Record<string,string>}} project */
  ect.syncEditorToProject = function syncEditorToProject(project) {
    const files = ect.parseSourceText(ect.el("sourceView").value);
    return { title: project.title, kind: project.kind, files: Object.keys(files).length ? files : project.files };
  };

  function trim(text) { return String(text || "").replace(/^\s+|\s+$/g, ""); }
})(window);
