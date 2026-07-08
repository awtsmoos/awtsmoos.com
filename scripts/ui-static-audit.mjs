// B"H
/**
 * Chapter: The watchman stops confusing alarm with wisdom.
 * The Awtsmoos reveals each surface by evidence: app shell, game canvas,
 * modal, dropdown, route, and risky width are classified before judgment.
 * This is architecture, not panic; the report tells the next repair where to go.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SURFACES = ["geelooy", "templates"];
const EXTENSIONS = new Set([".css", ".html", ".js", ".mjs"]);
const WIDTH_RISK = /width\s*:\s*100vw|calc\([^)]*100vw|max-width\s*:\s*100vw/i;
const LAYOUT_RISK = /min-width\s*:[^;]+|translateX\(|overflow\s*:|position\s*:\s*(fixed|absolute)|margin-left\s*:\s*-|left\s*:|right\s*:/i;
const CONTROL = /<button|role=["']button|<input|<textarea|<select|contenteditable|dropdown|modal|dialog|menu/i;
const FULLSCREEN_HINT = /position\s*:\s*fixed|position\s*:\s*absolute|inset\s*:\s*0|canvas|game|loading|overlay|shield|height\s*:\s*100(d)?vh/i;
const APP_SURFACE = /geelooy\/(style|email|profile|heichelos|social|apps\/tunnel-control|apps\/code)|templates\//;

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".git")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (EXTENSIONS.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

function rel(file) { return path.relative(ROOT, file).replaceAll(path.sep, "/"); }

function scan(files, regex) {
  const found = [];
  for (const file of files) {
    const relative = rel(file);
    const text = fs.readFileSync(file, "utf8");
    text.split(/\r?\n/).forEach((line, index) => {
      if (regex.test(line)) found.push({ file: relative, line: index + 1, text: line.trim().slice(0, 220) });
    });
  }
  return found;
}

function classifyWidth(match) {
  const record = `${match.file}:${match.line}: ${match.text}`;
  if (FULLSCREEN_HINT.test(match.text) || /games\//.test(match.file)) return { ...match, severity: "fullscreen-review", record };
  if (APP_SURFACE.test(match.file)) return { ...match, severity: "app-shell-risk", record };
  return { ...match, severity: "legacy-review", record };
}

const files = SURFACES.flatMap(surface => walk(path.join(ROOT, surface)));
const routes = files.filter(file => file.endsWith(".html"));
const width = scan(files, WIDTH_RISK).map(classifyWidth);
const layout = scan(files, LAYOUT_RISK);
const controls = scan(files, CONTROL);
const severe = width.filter(item => item.severity === "app-shell-risk");

console.log(`B"H UI static audit`);
console.log(`Files scanned: ${files.length}`);
console.log(`Route-like HTML files: ${routes.length}`);
console.log(`Width risks: ${width.length}`);
console.log(`App-shell width risks: ${severe.length}`);
console.log(`Layout risks: ${layout.length}`);
console.log(`Interactive/control matches: ${controls.length}`);
console.log(`Sample routes:\n${routes.slice(0, 50).map(rel).join("\n")}`);
console.log(`App-shell width risks:\n${severe.slice(0, 80).map(item => item.record).join("\n")}`);
console.log(`Fullscreen/legacy width review:\n${width.filter(item => item.severity !== "app-shell-risk").slice(0, 60).map(item => item.record).join("\n")}`);
console.log(`Sample controls:\n${controls.slice(0, 80).map(item => `${item.file}:${item.line}: ${item.text}`).join("\n")}`);

if (process.argv.includes("--strict") && severe.length) process.exit(1);
