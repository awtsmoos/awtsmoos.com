// B"H
const { isolatedJsTest } = require('../../geelooy/apps/tunnel/agent/tools/fs/isolatedJs.js');

(async () => {
  const result = await isolatedJsTest(
    { root: process.cwd(), allowSecrets: false },
    {
      testCode: 'if (2 + 3 !== 5) throw new Error("bad math"); console.log("isolated-ok");',
      timeoutMs: 20000,
      maxChars: 12000
    }
  );

  console.log(JSON.stringify({
    ok: result.ok,
    exitCode: result.exitCode,
    stdout: String(result.stdout || '').trim(),
    stderr: String(result.stderr || '').trim(),
    kept: result.kept
  }, null, 2));

  process.exit(result.ok ? 0 : 1);
})().catch(error => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
