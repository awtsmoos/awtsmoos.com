#!/usr/bin/env node
// B"H — Tunnel Lane Verifier (Yaakov 2026-10-15)
// Extremely stylized beautiful CLI with line breaks. No plain text.

const https = require("node:https");
const { execSync } = require("node:child_process");

const C = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  green: "\x1b[38;2;0;255;136m", cyan: "\x1b[38;2;0;238;255m",
  gold: "\x1b[38;2;255;204;0m", red: "\x1b[38;2;255;68;68m",
  purple: "\x1b[38;2;200;100;255m", blue: "\x1b[38;2;100;150;255m"
};

const SECRET = "965e29cfea49bf116e9ede9f3deff2adcb441d2dede90e5586fb3f722e1bc16c";
const SERVER = "https://awtsmoos.com";

function header(title) {
  console.log("");
  console.log(`${C.cyan}${C.bold}╔${"═".repeat(62)}╗${C.reset}`);
  console.log(`${C.cyan}${C.bold}║${C.reset}  ${C.gold}${C.bold}✦ ${title} ✦${C.reset}${" ".repeat(Math.max(0, 54 - title.length))}${C.cyan}${C.bold}║${C.reset}`);
  console.log(`${C.cyan}${C.bold}╚${"═".repeat(62)}╝${C.reset}`);
  console.log("");
}

function pass(name, detail) {
  console.log(`  ${C.green}${C.bold}✓ PASS${C.reset}  ${C.bold}${name}${C.reset}`);
  if (detail) console.log(`           ${C.dim}${detail}${C.reset}`);
  console.log("");
}

function fail(name, detail) {
  console.log(`  ${C.red}${C.bold}✗ FAIL${C.reset}  ${C.bold}${name}${C.reset}`);
  if (detail) console.log(`           ${C.dim}${detail}${C.reset}`);
  console.log("");
}

function info(msg) {
  console.log(`  ${C.blue}ℹ${C.reset}  ${C.dim}${msg}${C.reset}`);
}

function tunnelCmd(command) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ secret: SECRET, command });
    const url = new URL(SERVER + "/api/tunnel/control/simple/cmd");
    const req = https.request({
      hostname: url.hostname, path: url.pathname, method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(postData) },
      timeout: 15000
    }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try {
          const j = JSON.parse(data);
          if (!j.ok) return resolve(null);
          // Poll for result
          let attempts = 0;
          const poll = () => {
            if (++attempts > 10) return resolve(null);
            https.get(`${SERVER}/api/tunnel/control/simple/result?secret=${SECRET}&id=${j.id}`, (r2) => {
              let d2 = "";
              r2.on("data", c => d2 += c);
              r2.on("end", () => {
                try {
                  const r = JSON.parse(d2);
                  if (r.done) return resolve(r.output);
                  setTimeout(poll, 2000);
                } catch { setTimeout(poll, 2000); }
              });
            }).on("error", () => setTimeout(poll, 2000));
          };
          setTimeout(poll, 3000);
        } catch { resolve(null); }
      });
    });
    req.on("error", () => resolve(null));
    req.on("timeout", () => { req.destroy(); resolve(null); });
    req.write(postData);
    req.end();
  });
}

async function main() {
  header("TUNNEL LANE VERIFICATION");

  let passed = 0, failed = 0;

  // Lane 1: Simple tunnel (baseline)
  info("Testing simple tunnel command execution...");
  const out1 = await tunnelCmd("echo LANE_TEST_OK && hostname");
  if (out1 && out1.includes("LANE_TEST_OK")) {
    pass("Simple Tunnel (baseline)", `Output: ${out1.trim().split("\n").join(", ")}`);
    passed++;
  } else {
    fail("Simple Tunnel (baseline)", "No response or unexpected output");
    failed++;
  }

  // Lane 2: Recovery httpServer
  info("Testing recovery httpServer lane (port 3977)...");
  const out2 = await tunnelCmd("curl -s http://localhost:3977/health 2>&1 | head -c 150");
  if (out2 && out2.includes('"ok":true')) {
    pass("Recovery httpServer lane", "HTTP 200 with valid JSON");
    passed++;
  } else {
    fail("Recovery httpServer lane", `Got: ${(out2||"null").slice(0,80)}`);
    failed++;
  }

  // Lane 3: Check lane processes
  info("Checking all lane processes are running...");
  const out3 = await tunnelCmd("ps aux | grep 'recovery/lanes' | grep -v grep | wc -l");
  const count = parseInt((out3||"0").trim(), 10);
  if (count >= 4) {
    pass("Recovery lane processes", `${count} lanes running`);
    passed++;
  } else {
    fail("Recovery lane processes", `Only ${count} running, expected 4+`);
    failed++;
  }

  // Lane 4: Simple tunnel file I/O
  info("Testing simple tunnel file read/write...");
  const out4 = await tunnelCmd("echo 'verify_test' > /tmp/lane_verify.txt && cat /tmp/lane_verify.txt && rm /tmp/lane_verify.txt && echo DONE");
  if (out4 && out4.includes("verify_test") && out4.includes("DONE")) {
    pass("Simple Tunnel file I/O", "Write, read, delete all work");
    passed++;
  } else {
    fail("Simple Tunnel file I/O", "File operations failed");
    failed++;
  }

  // Lane 5: Pairing endpoint (full tunnel)
  info("Testing pairing/state endpoint (full tunnel)...");
  const out5 = await new Promise((resolve) => {
    https.get(`${SERVER}/api/tunnel/control/pairing/state?pairingId=pair_verify_test`, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve(data));
    }).on("error", () => resolve(null));
  });
  if (out5 && out5.includes("pairing_not_found")) {
    pass("Pairing/state endpoint", "Correctly handles GET with query params");
    passed++;
  } else {
    fail("Pairing/state endpoint", "Unexpected response");
    failed++;
  }

  // Summary
  header("VERIFICATION COMPLETE");
  console.log(`  ${C.green}${C.bold}✓ Passed: ${passed}${C.reset}`);
  console.log(`  ${C.red}${C.bold}✗ Failed: ${failed}${C.reset}`);
  console.log("");
  if (failed === 0) {
    console.log(`  ${C.gold}${C.bold}✦ ALL LANES VERIFIED ✦${C.reset}`);
  } else {
    console.log(`  ${C.red}Some lanes need attention.${C.reset}`);
  }
  console.log("");
}

main().catch(e => console.error(e));
