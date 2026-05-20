// B"H
const fs = require("fs");
const path = require("path");
const { safePath } = require("../pathGuard.js");
const { cognitionActionNames } = require("../cognitionCommandNames.js");

function safeRead(file) {
  try { return fs.readFileSync(file, "utf8"); } catch (e) { return ""; }
}

function inspectRoot(root) {
  const pkgText = safeRead(path.join(root, "package.json"));
  const indexHtml = safeRead(path.join(root, "index.html"));
  const serverJs = safeRead(path.join(root, "server.js"));
  let pkg = null;
  try { pkg = pkgText ? JSON.parse(pkgText) : null; } catch (e) {}
  return {
    root,
    hasPackageJson: !!pkgText,
    hasIndexHtml: !!indexHtml,
    hasServerJs: !!serverJs,
    packageJson: pkg,
    samples: {
      indexHtml: indexHtml.slice(0, 1200),
      serverJs: serverJs.slice(0, 1200)
    }
  };
}

function score(project) {
  let value = 70;
  const findings = [];
  if (!project.hasPackageJson && !project.hasIndexHtml) { value -= 25; findings.push("No package.json or index.html detected."); }
  if (project.packageJson?.scripts?.test) value += 8; else findings.push("No test script detected.");
  if (project.packageJson?.scripts?.dev || project.packageJson?.scripts?.start) value += 6; else findings.push("No dev/start script detected.");
  return { score: Math.max(0, Math.min(100, value)), findings };
}

function report(action, ctx) {
  const requested = ctx.payload.path || ctx.payload.p || ctx.payload.target || ".";
  const root = safePath(ctx.config, requested);
  const project = inspectRoot(root);
  return {
    ok: true,
    action,
    generatedAt: new Date().toISOString(),
    target: root,
    goal: ctx.payload.goal || null,
    project,
    architecture: score(project),
    result: {
      type: "cognition-report",
      notes: [
        "AI-native structured report generated without shell scripting.",
        "Use semantic workflow/preview tools for deeper live repair loops."
      ],
      suggestedNext: ["inspectRuntime", "launchPreview", "semanticSearch", "applyPatch"]
    }
  };
}

function buildCognitionActions(ctx) {
  const actions = {};
  for (const action of cognitionActionNames) {
    actions[action] = async () => report(action, ctx);
  }
  return actions;
}

module.exports = { buildCognitionActions, cognitionActionNames };
