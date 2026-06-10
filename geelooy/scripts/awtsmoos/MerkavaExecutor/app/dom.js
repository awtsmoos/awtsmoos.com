// B"H
(function forgeDom(root) {
  const forge = root.MerkavaForge = root.MerkavaForge || {};

  /**
   * Renders JSON UI like a tiny Seder Hishtalshelus: thought descends into tags,
   * attributes become garments, and the Awtsmoos lets structure appear without
   * scattering document.createElement everywhere.
   * @param {object|string} node JSON node or text.
   * @returns {Node} A real DOM node.
   */
  function renderNode(node) {
    if (typeof node === "string") return document.createTextNode(node);
    const el = document.createElement(node.tag || "div");
    Object.entries(node.attrs || {}).forEach(function dress(entry) {
      const key = entry[0];
      const value = entry[1];
      if (key === "class") el.className = value;
      else if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2), value);
      else el.setAttribute(key, value);
    });
    (node.children || []).map(renderNode).forEach(function append(child) {
      el.appendChild(child);
    });
    return el;
  }

  /**
   * Replaces a mount with a freshly rendered vessel. The old form dissolves; the
   * same place receives a sharper revelation.
   * @param {HTMLElement} mount Destination element.
   * @param {object} schema UI schema.
   */
  function replaceWithSchema(mount, schema) {
    mount.innerHTML = "";
    mount.appendChild(renderNode(schema));
  }

  forge.renderNode = renderNode;
  forge.replaceWithSchema = replaceWithSchema;
})(window);
