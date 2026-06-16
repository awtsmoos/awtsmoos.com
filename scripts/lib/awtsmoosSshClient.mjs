// B"H
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { KeterClient } = require("../../ayzarim/ssh/Keter-Client.js");

/**
 * B"H
 * This wrapper turns the custom Awtsmoos SSH chariot into a promise-based
 * deployment vessel. It does not invoke OpenSSH and it does not shell out with a
 * password. The secret is passed directly to the in-repo SSH protocol client.
 */
export function connectAwtsmoosSsh(config = {}) {
  const client = new KeterClient();
  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = error => {
      if (settled) return;
      settled = true;
      try { client.end(); } catch (_) {}
      reject(error);
    };
    client.once("authenticated", () => {
      settled = true;
      resolve(client);
    });
    client.once("error", fail);
    client.connect({
      host: config.host || "awtsmoos.com",
      port: Number(config.port || 22),
      username: config.username || "root",
      password: config.password,
      privateKey: config.privateKey,
      debug: config.debug
    });
  });
}

export async function execAwtsmoosSsh(config = {}, command = "./BH.sh") {
  const client = await connectAwtsmoosSsh(config);
  try {
    return await new Promise((resolve, reject) => {
      client.exec(command, { pty: config.pty === true }, (error, result) => {
        if (error) reject(error);
        else resolve({ ok: result.code === 0 || result.code === null, ...result });
      });
    });
  } finally {
    try { client.end(); } catch (_) {}
  }
}
