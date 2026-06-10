// B"H
(function ectRender(root) {
  const ect = root.AwtsECT = root.AwtsECT || {};

  /**
   * B"H. Rebuilds human-view files from the chosen whole-project vessel. File
   * boundaries return as garments; the storage itself was one shared universe.
   */
  function renderProject(project, frame) {
    const doc = frame.contentDocument;
    const html = first(project.files, ".html") || "<main></main>";
    const css = Object.keys(project.files).filter(k => k.endsWith(".css")).map(k => project.files[k]).join("\n");
    doc.open();
    doc.write(`<!doctype html><html><head><style>${css}</style></head><body><main>${html}</main></body></html>`);
    doc.close();
    return doc;
  }

  function first(files, suffix) {
    const key = Object.keys(files).find(name => name.endsWith(suffix));
    return key ? files[key] : "";
  }

  function sourceText(project) {
    return Object.keys(project.files).map(name => `// FILE: ${name}\n${project.files[name]}`).join("\n\n");
  }

  ect.renderProject = renderProject;
  ect.sourceText = sourceText;
})(window);
