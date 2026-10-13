# B"H
"""
merkava_sdk.py — Agent-friendly Python SDK for Merkava page runs.

Resolution order (first available wins):
  1. CLI  — `merkava-shot` on PATH (or MERKAVA_SHOT_BIN), runs locally.
  2. Live API — POST https://awtsmoos.com/api/merkava/run (nothing installed).

Install (one line):
    curl -fsSL https://awtsmoos.com/api/tunnel/install/runtime/merkava-shot.tar.gz -o /tmp/ms.tgz \\
      && mkdir -p ~/.local/share/merkava-shot && tar -xzf /tmp/ms.tgz -C ~/.local/share/merkava-shot --strip-components=3 \\
      && curl -fsSL https://awtsmoos.com/api/tunnel/install/merkava-shot.sh | bash
    # then: pip install --user /path/to/merkava_sdk.py  (or just import it)

Copy-paste usage:
    from merkava_sdk import screenshot, run_page

    # Screenshot a URL (returns dict with png: bytes)
    r = screenshot("https://awtsmoos.com", device="iphone14")
    open("shot.png", "wb").write(r["png"])

    # Run with interactions + assertions
    r = run_page(html="<h1>hi</h1>", actions="assert:visible:h1;assert:text:h1:hi")
    print(r["assertions"])   # [{'op': 'assert', 'ok': True, ...}]
    print(r["final_dom"])    # {'title': ..., 'textLength': ..., 'jsExecuted': False}

    # Check the live API directly (no local install)
    r = run_page(url="https://example.com", via="live-api")

NOTE: the renderer executes no page JS. console_logs / js_errors are always
empty; the fields exist so the interface is stable when JS execution lands.
"""

import json
import os
import shutil
import subprocess
import urllib.request

LIVE_API = os.environ.get("MERKAVA_API", "https://awtsmoos.com/api/merkava")
CLI_BIN = os.environ.get("MERKAVA_SHOT_BIN") or shutil.which("merkava-shot")

DEVICES = ("iphone14", "iphoneSE", "pixel8", "android", "tablet", "desktop", "fhd")


def _cli_run(opts, timeout=60):
    """Run via the local merkava-shot CLI."""
    args = [CLI_BIN]
    if opts.get("url"):
        args += ["--url", opts["url"]]
    if opts.get("html"):
        args += ["--html", opts["html"]]
    if opts.get("device"):
        args += ["--device", opts["device"]]
    if opts.get("viewport"):
        args += ["--viewport", opts["viewport"]]
    actions = opts.get("actions")
    out = opts.get("out", "/tmp/merkava-sdk-shot.png")
    if actions:
        a = actions if isinstance(actions, str) else ";".join(actions)
        # Guarantee a screenshot lands at our known path.
        if not any(s.strip().startswith("shot") for s in a.split(";")):
            a = a + ";shot:" + out
        args += ["--interact", a]
    args += ["--fast", "--out", out]
    p = subprocess.run(args, capture_output=True, text=True, timeout=timeout)
    out = opts.get("out", "/tmp/merkava-sdk-shot.png")
    with open(out, "rb") as f:
        png = f.read()
    return {"ok": p.returncode == 0, "png": png, "via": "cli",
            "stdout": p.stdout[-2000:], "stderr": p.stderr[-500:]}


def _api_run(opts, timeout=60):
    """Run via the live HTTPS API (nothing installed)."""
    req = urllib.request.Request(
        LIVE_API + "/run",
        data=json.dumps(opts).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as res:
        j = json.loads(res.read().decode("utf-8"))
    if not j.get("ok"):
        raise RuntimeError("live api: %s" % j.get("error", "unknown"))
    import base64
    j["png"] = base64.b64decode(j.pop("screenshot_png"))
    j["via"] = "live-api"
    # normalize keys to the local shape
    j["consoleLogs"] = j.pop("console_logs", [])
    j["jsErrors"] = j.pop("js_errors", [])
    j["finalDom"] = j.pop("final_dom_state", {})
    j["timingsMs"] = j.pop("timings_ms", {})
    return j


def run_page(html=None, url=None, css=None, js=None, device=None, viewport=None,
             actions=None, timeout=60, via="auto", out="/tmp/merkava-sdk-shot.png"):
    """Run a page. Returns dict with png (bytes), assertions, finalDom, ..."""
    if not html and not url:
        raise ValueError("need html or url")
    opts = {"html": html, "url": url, "css": css, "js": js, "device": device,
            "viewport": viewport, "actions": actions, "timeoutMs": timeout * 1000,
            "out": out}
    opts = {k: v for k, v in opts.items() if v is not None}
    if via in ("auto", "cli") and CLI_BIN:
        try:
            return _cli_run(opts, timeout)
        except Exception as e:
            if via == "cli":
                raise
            last = e
    else:
        last = None
    try:
        return _api_run(opts, timeout)
    except Exception as e:
        if last is not None:
            raise RuntimeError("cli failed (%s); live api failed (%s)" % (last, e))
        raise


def screenshot(url, device=None, **kw):
    """Screenshot a URL. Returns dict with png (bytes)."""
    return run_page(url=url, device=device, **kw)


def devices(via="auto"):
    """List viewport presets."""
    if via in ("auto", "cli") and CLI_BIN:
        p = subprocess.run([CLI_BIN, "--devices"], capture_output=True, text=True, timeout=30)
        return p.stdout
    with urllib.request.urlopen(LIVE_API + "/devices", timeout=30) as res:
        return json.loads(res.read().decode("utf-8"))["devices"]


def run_js(js=None, html=None, url=None, file=None, timeout=60, via="auto"):
    """Execute JS with the real Merkava VM. Returns dict with consoleLogs,
    jsErrors[{kind,name,message,file,line,estimated}], scriptsRun, ..."""
    if via in ("auto", "cli") and CLI_BIN:
        args = [CLI_BIN, "run-js"]
        if url:
            args.append(url)
        if js:
            args += ["--js", js]
        if html:
            args += ["--html", html]
        if file:
            args += ["--js-file", file]
        try:
            p = subprocess.run(args, capture_output=True, text=True, timeout=timeout)
            return {"ok": p.returncode == 0, "via": "cli",
                    "stdout": p.stdout, "stderr": p.stderr[-500:]}
        except Exception as e:
            if via == "cli":
                raise
            last = e
    else:
        last = None
    body = {"js": js, "html": html, "url": url, "file": file,
            "timeoutMs": timeout * 1000}
    body = {k: v for k, v in body.items() if v is not None}
    try:
        req = urllib.request.Request(
            LIVE_API + "/run-js",
            data=json.dumps(body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=timeout) as res:
            j = json.loads(res.read().decode("utf-8"))
        j["consoleLogs"] = j.pop("console_logs", [])
        j["jsErrors"] = j.pop("js_errors", [])
        j["scriptsRun"] = j.pop("scripts_run", 0)
        j["via"] = "live-api"
        return j
    except Exception as e:
        if last is not None:
            raise RuntimeError("cli failed (%s); live api failed (%s)" % (last, e))
        raise
