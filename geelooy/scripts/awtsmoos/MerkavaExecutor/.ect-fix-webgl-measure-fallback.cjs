// B"H
const fs = require("fs");
const path = "app/browser/renderers.js";
let text = fs.readFileSync(path, "utf8");
text = text.replace(
  '    const primitives = measurePrimitives(doc);\n    if (!primitives.length) return fail(doc, "Merkava WebGL", "Measured compiled DOM produced no boxes.");',
  '    let primitives = measurePrimitives(doc);\n    const measured = primitives.length > 0;\n    if (!measured) primitives = fallbackPrimitives(doc, reconstruction.html || "<main></main>");\n    if (!primitives.length) return fail(doc, "Merkava WebGL", "Compiled DOM produced no WebGL boxes.");'
);
text = text.replace(
  '    fillOverlay(doc, primitives);\n    return { ok: true, engine: "Merkava WebGL", primitives: primitives.length };',
  '    fillOverlay(doc, primitives, measured);\n    return { ok: true, engine: "Merkava WebGL", primitives: primitives.length, measured };'
);
text = text.replace(
  '  function fillOverlay(doc, primitives) {\n    const overlay = doc.getElementById("merkavaOverlay");\n    if (!overlay) return;\n    overlay.innerHTML = \'<div class="awts-webgl-title">Merkava WebGL • measured CSS boxes: \' + primitives.length + \'</div>\' + primitives.filter(item => item.text || item.tag === "BUTTON" || item.tag === "OUTPUT" || item.tag === "H2").slice(0, 16).map(item => \'<div class="awts-gl-label" style="left:\' + item.left + \'%;top:\' + item.top + \'%"><b>\' + ect.escapeHtml(item.tag.toLowerCase()) + \'</b>\' + (item.text ? \'<span>\' + ect.escapeHtml(item.text).slice(0, 44) + \'</span>\' : \'<span>children \' + item.childCount + \'</span>\') + \'</div>\').join("");\n  }',
  '  function fillOverlay(doc, primitives, measured) {\n    const overlay = doc.getElementById("merkavaOverlay");\n    if (!overlay) return;\n    const title = measured ? "measured CSS boxes" : "compiled tree fallback";\n    overlay.innerHTML = \'<div class="awts-webgl-title">Merkava WebGL • \' + title + \': \' + primitives.length + \'</div>\' + primitives.filter(item => item.text || item.tag === "BUTTON" || item.tag === "OUTPUT" || item.tag === "H2").slice(0, 16).map(item => \'<div class="awts-gl-label" style="left:\' + item.left + \'%;top:\' + item.top + \'%"><b>\' + ect.escapeHtml(item.tag.toLowerCase()) + \'</b>\' + (item.text ? \'<span>\' + ect.escapeHtml(item.text).slice(0, 44) + \'</span>\' : \'<span>children \' + item.childCount + \'</span>\') + \'</div>\').join("");\n  }'
);
text = text.replace(
  '  function makeProgram(gl) {',
  '  function fallbackPrimitives(doc, html) {\n    const template = doc.createElement("template");\n    template.innerHTML = html || "<main></main>";\n    const nodes = [];\n    Array.from(template.content.children || []).forEach(node => collectFallback(node, 0, nodes));\n    return nodes;\n  }\n\n  function collectFallback(node, depth, list) {\n    if (!node || node.nodeType !== 1) return;\n    const index = list.length;\n    const text = directText(node).trim();\n    list.push({ x: -0.88 + depth * 0.14, y: 0.82 - index * 0.18, width: Math.max(0.25, 1.55 - depth * 0.16), height: 0.14, left: 6 + depth * 9, top: 9 + index * 10, tag: node.tagName || "X", text, childCount: node.children ? node.children.length : 0, color: [0.08 + depth * 0.08, 0.42, 0.56] });\n    Array.from(node.children || []).forEach(child => collectFallback(child, depth + 1, list));\n  }\n\n  function makeProgram(gl) {'
);
fs.writeFileSync(path, text);
console.log("installed webgl measured fallback", Buffer.byteLength(text));
