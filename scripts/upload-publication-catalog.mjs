// B"H — Upload publication-catalog.awtsdb to production via SFTP (atomic: temp + rename).
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { openAwtsmoosSftp } from "/Users/awtsmoos/work/awtsmoos.com/scripts/lib/awtsmoosSshClient.mjs";
import { loadPassword } from "/Users/awtsmoos/work/awtsmoos.com/scripts/lib/safeSshPasswordStore.mjs";

const LOCAL = "/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag/publication-catalog.awtsdb";
const REMOTE_DIR = "/mnt/HC_Volume_102267213/dayuhChadash-runtime/ai/comment-rag";
const REMOTE_TMP = REMOTE_DIR + "/publication-catalog.awtsdb.upload-tmp";
const REMOTE_FINAL = REMOTE_DIR + "/publication-catalog.awtsdb";

const hash = createHash("sha256");
await new Promise((res, rej) => {
  createReadStream(LOCAL).on("data", d => hash.update(d)).on("end", res).on("error", rej);
});
const localSha = hash.digest("hex");
const localSize = (await stat(LOCAL)).size;
console.log(JSON.stringify({ step: "local", localSize, localSha }));

const password = loadPassword();
if (!password) { console.log(JSON.stringify({ error: "NO_PASSWORD_IN_KEYCHAIN" })); process.exit(2); }

const { sftp, close } = await openAwtsmoosSftp({ host: "awtsmoos.com", username: "root", port: 22, password });
try {
  await new Promise((res, rej) => {
    const ws = sftp.createWriteStream(REMOTE_TMP);
    ws.on("error", rej);
    ws.on("close", res);
    createReadStream(LOCAL).on("error", rej).pipe(ws);
  });
  const st = await new Promise((res, rej) => sftp.stat(REMOTE_TMP, (e, s) => e ? rej(e) : res(s)));
  const tmpSize = Number(st.size ?? st.attrs?.size);
  console.log(JSON.stringify({ step: "uploaded-tmp", tmpSize }));
  if (tmpSize !== localSize) { console.log(JSON.stringify({ error: "SIZE_MISMATCH", tmpSize, localSize })); process.exit(3); }
  await new Promise((res, rej) => sftp.rename(REMOTE_TMP, REMOTE_FINAL, e => e ? rej(e) : res()));
  const st2 = await new Promise((res, rej) => sftp.stat(REMOTE_FINAL, (e, s) => e ? rej(e) : res(s)));
  const finalSize = Number(st2.size ?? st2.attrs?.size);
  console.log(JSON.stringify({ step: "renamed", finalSize, ok: finalSize === localSize }));
  if (finalSize !== localSize) process.exit(4);
} finally {
  close();
}
console.log(JSON.stringify({ done: true }));
