// B"H
const fsp = require("fs/promises");
const crypto = require("crypto");
const { safePath } = require("./pathGuard.js");
const { ensureGitignoreHygiene } = require("./gitIgnoreHygiene.js");

const DIR = ".awtsmoos/command-output";
const DEFAULT_PAGE_CHARS = 12000;
const MAX_PAGE_CHARS = 250000;

/**
 * B"H
 * Chapter: The command river stopped flooding the chat and became pageable.
 */
async function saveCommandOutput(config = {}, payload = {}, result = {}) {
  const maxChars = boundedPageChars(payload.maxInlineChars || payload.maxChars || DEFAULT_PAGE_CHARS);
  const stdout = String(result.stdout || "");
  const stderr = String(result.stderr || "");
  if (stdout.length <= maxChars && stderr.length <= maxChars) return result;

  await ensure(config);
  const outputId = `cmdout_${Date.now().toString(36)}_${crypto.randomBytes(6).toString("hex")}`;
  const rel = `${DIR}/${outputId}.json`;
  const record = {
    BH: "B\"H",
    outputId,
    command: result.command || payload.command || "",
    cwd: result.cwd || payload.cwd || "",
    shell: result.shell || payload.shell || "",
    createdAt: new Date().toISOString(),
    stdout,
    stderr,
    stdoutChars: stdout.length,
    stderrChars: stderr.length,
    exitCode: result.exitCode,
    ok: result.ok
  };
  await fsp.writeFile(safePath(config, rel), JSON.stringify(record), "utf8");
  const stdoutPage = sliceText(stdout, 0, maxChars);
  const stderrPage = sliceText(stderr, 0, maxChars);
  return {
    ...result,
    stdout: stdoutPage.content,
    stderr: stderrPage.content,
    outputId,
    outputRef: rel,
    stdoutChars: stdout.length,
    stderrChars: stderr.length,
    stdoutTruncated: stdoutPage.hasNextPage,
    stderrTruncated: stderrPage.hasNextPage,
    outputPaged: true,
    nextStdoutPagePayload: stdoutPage.hasNextPage ? pagePayload(outputId, "stdout", stdoutPage.nextOffsetChars, maxChars) : null,
    nextStderrPagePayload: stderrPage.hasNextPage ? pagePayload(outputId, "stderr", stderrPage.nextOffsetChars, maxChars) : null,
    aiInstructions: "Command output was paginated. Use commandOutputPage with outputId, stream=stdout/stderr, offsetChars, and maxChars to continue without rerunning the command."
  };
}

async function readCommandOutputPage(config = {}, payload = {}) {
  const outputId = cleanId(payload.outputId || payload.id || payload.resultId || "");
  if (!outputId) return { ok: false, action: "commandOutputPage", error: "missing_outputId" };
  const stream = String(payload.stream || payload.name || "stdout").toLowerCase() === "stderr" ? "stderr" : "stdout";
  const offset = Math.max(0, Math.floor(Number(payload.offsetChars || payload.offset || 0)));
  const maxChars = boundedPageChars(payload.maxChars || payload.pageChars || DEFAULT_PAGE_CHARS);
  const rel = `${DIR}/${outputId}.json`;
  const raw = await fsp.readFile(safePath(config, rel), "utf8");
  const record = JSON.parse(raw);
  const text = String(record[stream] || "");
  const page = sliceText(text, offset, maxChars);
  return {
    BH: "B\"H",
    ok: true,
    action: "commandOutputPage",
    outputId,
    outputRef: rel,
    stream,
    command: record.command,
    offsetChars: offset,
    returnedChars: page.content.length,
    totalChars: text.length,
    content: page.content,
    hasNextPage: page.hasNextPage,
    nextOffsetChars: page.nextOffsetChars,
    nextPagePayload: page.hasNextPage ? pagePayload(outputId, stream, page.nextOffsetChars, maxChars) : null
  };
}

async function ensure(config) {
  await fsp.mkdir(safePath(config, DIR), { recursive: true });
  await ensureGitignoreHygiene(config, "command-output-store");
}

function sliceText(text, offset, maxChars) {
  const content = text.slice(offset, offset + maxChars);
  const nextOffsetChars = offset + content.length < text.length ? offset + content.length : null;
  return { content, hasNextPage: nextOffsetChars !== null, nextOffsetChars };
}

function pagePayload(outputId, stream, offsetChars, maxChars) {
  return { action: "commandOutputPage", outputId, stream, offsetChars, maxChars };
}

function boundedPageChars(value) {
  const n = Number(value || DEFAULT_PAGE_CHARS);
  if (!Number.isFinite(n)) return DEFAULT_PAGE_CHARS;
  return Math.max(1000, Math.min(Math.floor(n), MAX_PAGE_CHARS));
}

function cleanId(value) {
  return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "");
}

module.exports = { DEFAULT_PAGE_CHARS, saveCommandOutput, readCommandOutputPage, sliceText };
