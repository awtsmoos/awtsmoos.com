#!/usr/bin/env node
// B"H
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execAwtsmoosSsh } from "./lib/awtsmoosSshClient.mjs";
import { deletePassword, loadPassword, savePassword, secretDescriptor } from "./lib/safeSshPasswordStore.mjs";

const args = new Set(process.argv.slice(2));
const host = valueArg("--host") || process.env.AWTSMOOS_BH_HOST || "awtsmoos.com";
const username = valueArg("--user") || process.env.AWTSMOOS_BH_USER || "root";
const port = Number(valueArg("--port") || process.env.AWTSMOOS_BH_PORT || 22);
const remoteCommand = valueArg("--command") || process.env.AWTSMOOS_BH_COMMAND || "./BH.sh";

/**
 * B"H
 * `npm run bh` used to awaken OpenSSH through a shell script. Now it rides the
 * in-repo Awtsmoos SSH chariot and asks the operating system to hold the secret.
 */
async function main() {
  if (args.has("--credential-info")) return console.log(JSON.stringify({ ok: true, descriptor: secretDescriptor() }, null, 2));
  if (args.has("--forget-password")) return console.log(JSON.stringify(deletePassword(), null, 2));
  if (args.has("--set-password")) {
    const password = await promptPassword("SSH password to save safely: ");
    const saved = savePassword(password);
    return console.log(JSON.stringify({ ok: true, saved }, null, 2));
  }
  if (args.has("--dry-run")) return console.log(JSON.stringify({ ok: true, dryRun: true, host, username, port, remoteCommand, credential: secretDescriptor() }, null, 2));

  let password = loadPassword();
  if (!password) {
    password = await promptPassword(`SSH password for ${username}@${host}: `);
    if (!args.has("--no-save-password")) {
      const saved = savePassword(password);
      console.log(JSON.stringify({ ok: true, passwordSaved: true, saved }, null, 2));
    }
  }

  // B"H CSS Guarantee hook (opt-in via CSS_GUARANTEE_MODE) — additive, fail-open
  await runCssGuaranteeHook();

  const result = await execAwtsmoosSsh({ host, username, port, password }, remoteCommand);
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  process.exit(result.ok ? 0 : Number(result.code || 1));
}

function valueArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

// B"H CSS Guarantee hook (opt-in via CSS_GUARANTEE_MODE)
// Runs only when CSS_GUARANTEE_MODE is set in the environment; unset = skip
// entirely with zero behavior change.
// - fail-open: findings reported, deploy always continues.
// - fail-closed: blocking findings ABORT the deploy (exit 3) before SSH.
async function runCssGuaranteeHook() {
  const mode = process.env.CSS_GUARANTEE_MODE;
  if (!mode) return;
  try {
    const scriptsDir = dirname(fileURLToPath(import.meta.url));
    const pipelineUrl = pathToFileURL(join(
      scriptsDir, "..", "geelooy", "apps", "tunnel", "css-guarantee", "pipeline.mjs"
    )).href;
    const { runPipeline, formatPipelineReport } = await import(pipelineUrl);
    const collected = [];
    let totalFound = 0;
    const walk = (dir) => {
      let entries;
      try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const entry of entries) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "node_modules" || entry.name === ".git") continue;
          walk(full);
        } else if (entry.isFile() && /\.css$/i.test(entry.name)) {
          totalFound++;
          if (collected.length < 50) collected.push(full);
        }
      }
    };
    walk(join(scriptsDir, "..", "geelooy"));
    if (totalFound > collected.length) {
      console.log(`B"H CSS Guarantee: found ${totalFound} css files under geelooy/; analyzing first ${collected.length} (perf cap).`);
    }
    const cssSources = collected.map((file) => {
      try { return { path: file, content: readFileSync(file, "utf8") }; }
      catch { return null; }
    }).filter(Boolean);
    const result = await runPipeline({ cssSources, mode: process.env.CSS_GUARANTEE_MODE });
    console.log(formatPipelineReport(result));
    if (result.blocked) {
      if (mode === "fail-closed") {
        console.error('B"H CSS Guarantee: BLOCKED — fail-closed mode, aborting deploy before SSH. Fix the findings above or set CSS_GUARANTEE_MODE=fail-open.');
        process.exit(3);
      }
      console.error('B"H CSS Guarantee: blocking findings detected, but fail-open mode — deploy continues.');
    }
  } catch (error) {
    console.error('B"H CSS Guarantee hook skipped (fail-open):', error && error.message ? error.message : error);
  }
}

async function promptPassword(label) {
  const rl = createInterface({ input, output });
  const wasRaw = input.isTTY && input.isRaw;
  if (input.isTTY) input.setRawMode(true);
  let password = "";
  output.write(label);
  await new Promise(resolve => {
    const onData = char => {
      const value = String(char);
      if (value === "\u0003") process.exit(130);
      if (value === "\r" || value === "\n") {
        input.off("data", onData);
        output.write("\n");
        resolve();
        return;
      }
      if (value === "\b" || value === "\u007f") password = password.slice(0, -1);
      else password += value;
    };
    input.on("data", onData);
  });
  if (input.isTTY) input.setRawMode(wasRaw || false);
  rl.close();
  return password;
}

main().catch(error => {
  console.error("B\"H bh ssh failed:", error.message);
  process.exit(1);
});
