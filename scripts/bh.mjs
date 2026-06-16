#!/usr/bin/env node
// B"H
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
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
    if (args.has("--save-password")) savePassword(password);
  }

  const result = await execAwtsmoosSsh({ host, username, port, password }, remoteCommand);
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  process.exit(result.ok ? 0 : Number(result.code || 1));
}

function valueArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
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
