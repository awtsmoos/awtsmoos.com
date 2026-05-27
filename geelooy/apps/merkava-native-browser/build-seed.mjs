// B"H
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import MerkavaExecutor from "../../scripts/awtsmoos/MerkavaExecutor/merkavaexecutor.cjs";
import { readMerkavaBytecode } from "./core/merkavaBytecodeReader.js";
import { buildNativeBrowserC } from "./core/nativeBrowserSource.js";
import { buildLauncherC } from "./core/launcherSource.js";
import { buildNativeHostContract } from "./core/nativeHostContract.js";
import { describeEmbeddedExecutor, executorArtifactBanner } from "./core/embeddedExecutorArtifact.js";
import { buildMerkavaExecutorRenderStream } from "./core/merkavaExecutorRenderStream.js";
import { compile } from "../../scripts/awtsmoos/compiling/index.js";
import { simulateRuntime, compileMerkavaRuntime, inspectMerkava } from "../../scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { parseHtmlNodes, collectLinked } = require("../../scripts/awtsmoos/MerkavaExecutor/merkava-binary/SourceAppCompiler.js");

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "dist");
const nativeDir = path.join(here, "native");

function readSample(name) {
  return fs.readFileSync(path.join(here, "samples", name), "utf8");
}

function cStringLiteral(value) {
  return JSON.stringify(String(value || ""));
}

function cMacroString(name, value) {
  return `#define ${name} ${cStringLiteral(value)}\n`;
}

function stopGeneratedExeIfRunning(exePath) {
  const target = path.resolve(exePath).toLowerCase();
  const script = [
    "$target = " + JSON.stringify(target),
    "Get-Process | Where-Object { $_.Path -and ($_.Path.ToLower() -eq $target) } | Stop-Process -Force"
  ].join("; ");
  try {
    execFileSync("powershell", ["-NoProfile", "-Command", script], { stdio: "ignore" });
  } catch {
    // No generated process is running, or Windows denied metadata for an unrelated process.
  }
}

function fileStats(files) {
  return Object.fromEntries(Object.entries(files).map(([name, source]) => [name, {
    bytes: Buffer.byteLength(source, "utf8"),
    lines: String(source).split(/\r?\n/).length,
    hasDocument: /\bdocument\b/.test(source),
    hasWebGL: /getContext\(["']webgl/.test(source),
    hasServer: /createServer|listen\(/.test(source),
    scriptTags: (String(source).match(/<script\b/gi) || []).length,
    linkTags: (String(source).match(/<link\b/gi) || []).length
  }]));
}

function buildReport({ appFiles, shellFiles, binary, shellBinary, executorArtifact, hostContract, merkava, shellMerkava, simulated, compiled, inspected }) {
  return {
    BH: "B'H",
    name: "Merkava Native Browser embedded report",
    executor: {
      publicName: "merkava",
      defaultEngine: simulated.engine,
      runtimeOk: simulated.ok,
      entry: simulated.entry,
      bytecodeKind: compiled.kind,
      inspectKind: inspected.kind,
      magic: inspected.magic,
      appBytes: binary.length,
      shellBytes: shellBinary.length,
      embeddedExecutor: executorArtifact,
      hostBindingCount: hostContract.count,
      appSection: merkava.section,
      shellSection: shellMerkava.section
    },
    sourceUnderstanding: {
      files: fileStats({ ...appFiles, ...shellFiles }),
      html: "parsed into nodes / assets / script references by Merkava source compiler",
      css: "linked and inline CSS collected for bytecode compilation",
      js: "MerkavaASTParser + bytecode compiler available at build time; native executable embeds this report",
      node: "Node-style entry points are handled by Merkava JS bytecode path in service stress tests"
    },
    runtimeResult: {
      ok: simulated.ok,
      score: simulated.score,
      input: simulated.input || simulated.virtualEnv || null,
      errors: simulated.errors || [],
      web: simulated.result?.web || null
    },
    nativePlan: {
      architecture: "C host VM obeys embedded MerkavaExecutor bytecode; browser intelligence belongs to bytecode",
      hostBindings: hostContract.flat,
      dom: "executor-owned; native DOM renderer disabled in C host",
      webgl: "executor lowers JS/WebGL semantics into bytecode ops; C maps bytecode ops to OpenGL",
      next: "boot embedded_executor.merkava first, then let it load and compile page bytecode"
    }
  };
}

const appFiles = {
  "/index.html": readSample("frontend.html"),
  "/app.js": readSample("app.js")
};
const shellFiles = {
  "/browser-shell.html": readSample("browser-shell.html"),
  "/browser-shell.js": readSample("browser-shell.js")
};

const bundle = await MerkavaExecutor.bundleEntry({ entry: "/index.html", files: appFiles });
const shellBundle = await MerkavaExecutor.bundleEntry({ entry: "/browser-shell.html", files: shellFiles });
const binary = bundle.binary;
const shellBinary = shellBundle.binary;
const executorBundle = await MerkavaExecutor.bundleSelf();
const executorBinary = executorBundle.binary;
const executorArtifact = describeEmbeddedExecutor(executorBundle);
const hostContract = buildNativeHostContract();
const merkava = readMerkavaBytecode(binary);
if (!merkava.ok) throw new Error("Merkava did not produce Merkava bytecode.");
const shellMerkava = readMerkavaBytecode(shellBinary);
if (!shellMerkava.ok) throw new Error("Merkava shell did not produce Merkava bytecode.");

const simulated = await simulateRuntime({ files: appFiles, entry: "/index.html" });
const compiled = await compileMerkavaRuntime({ files: appFiles, entry: "/index.html" });
const inspected = inspectMerkava(compiled.bytecode);
const executorRender = await buildMerkavaExecutorRenderStream({
  html: appFiles['/index.html'],
  scripts: [appFiles['/app.js']],
  url: 'file:///index.html'
});
const report = buildReport({ appFiles, shellFiles, binary, shellBinary, executorArtifact, hostContract, merkava, shellMerkava, simulated, compiled, inspected });
report.executorRender = executorRender.summary;
const linkedApp = collectLinked(appFiles['/index.html'], appFiles, '/index.html');
const rendererModel = {
  BH: "B'H",
  source: 'MerkavaExecutor.SourceAppCompiler',
  entry: '/index.html',
  nodes: parseHtmlNodes(appFiles['/index.html']),
  scripts: linkedApp.scripts.map(script => ({
    name: script.name,
    sourceBytes: Buffer.byteLength(script.source || '', 'utf8'),
    analysis: 'executed by MerkavaExecutor render stream, not native C regex'
  })),
  styles: [],
  renderStream: executorRender.summary,
  runtime: { simulatedOk: simulated.ok, engine: simulated.engine }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "sample.merkava"), Buffer.from(binary));
fs.writeFileSync(path.join(outDir, "browser-shell.merkava"), Buffer.from(shellBinary));
fs.writeFileSync(path.join(outDir, "embedded_executor.merkava"), Buffer.from(executorBinary));
fs.writeFileSync(path.join(outDir, "embedded_executor.txt"), executorArtifactBanner(executorArtifact));
fs.writeFileSync(path.join(outDir, "native-browser-seed.c"), buildNativeBrowserC(binary, shellBinary));
fs.writeFileSync(path.join(outDir, "merkavaapp-launcher.c"), buildLauncherC());
fs.writeFileSync(path.join(outDir, "merkava-runtime-report.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outDir, "diagnostic-render-model.json"), JSON.stringify(rendererModel, null, 2));
fs.writeFileSync(path.join(outDir, "executor-render-stream.txt"), executorRender.stream);
fs.copyFileSync(path.join(here, "core", "compileFetchedHtmlToRenderStream.mjs"), path.join(outDir, "compileFetchedHtmlToRenderStream.mjs"));
fs.writeFileSync(path.join(nativeDir, "merkava-runtime-report.h"), [
  '/* B\"H generated */',
  `#define AWTS_MERKAVA_REPORT_JSON ${cStringLiteral(JSON.stringify(report, null, 2))}`,
  `#define AWTS_RENDER_MODEL_JSON ${cStringLiteral(JSON.stringify(rendererModel, null, 2))}`,
  `#define AWTS_NATIVE_RENDER_STREAM ${cStringLiteral(executorRender.stream)}`,
  cMacroString('AWTS_SAMPLE_HTML', appFiles['/index.html']).trim(),
  cMacroString('AWTS_SAMPLE_JS', appFiles['/app.js']).trim(),
  cMacroString('AWTS_SHELL_HTML', shellFiles['/browser-shell.html']).trim(),
  cMacroString('AWTS_SHELL_JS', shellFiles['/browser-shell.js']).trim(),
  ''
].join('\n'));

const smokeExe = compile("B'H Merkava bytecode console smoke: JS bytecode path alive", "console");
fs.writeFileSync(path.join(outDir, "merkava-console-smoke.exe"), Buffer.from(await smokeExe.arrayBuffer()));

const finalExe = path.join(outDir, "merkavaapp.exe");
const tempExe = path.join(outDir, `merkavaapp-build-${Date.now()}-${process.pid}.exe`);
stopGeneratedExeIfRunning(finalExe);
execFileSync("gcc", [
  path.join(nativeDir, "merkava-opengl-browser.c"),
  path.join(nativeDir, "awts_native_util.c"),
  path.join(nativeDir, "awts_bytecode_decoder.c"),
  path.join(nativeDir, "awts_native_render.c"),
  "-I", nativeDir,
  "-include", path.join(nativeDir, "merkava-runtime-report.h"),
  "-o", tempExe,
  "-lopengl32", "-lgdi32", "-luser32", "-lwininet"
], { stdio: "inherit" });
fs.copyFileSync(tempExe, finalExe);
fs.copyFileSync(tempExe, path.join(outDir, "merkava-opengl-browser.exe"));
fs.rmSync(tempExe, { force: true });

console.log(JSON.stringify({
  ok: true,
  bytes: binary.length,
  shellBytes: shellBinary.length,
  executorBytes: executorBinary.length,
  hostBindings: hostContract.count,
  section: merkava.section,
  simulatedOk: simulated.ok,
  engine: simulated.engine,
  outDir,
  exe: "merkavaapp.exe",
  smokeExe: "merkava-console-smoke.exe",
  report: "merkava-runtime-report.json"
}, null, 2));
