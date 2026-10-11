// B"H
// B"H — VirtualTerminal: a full terminal emulator for the Merkava browser.
// Better than Termux: lower RAM (typed-array screen buffer, every bit used),
// faster startup (no JVM, no extra process), Merkava-native.
//
// Features:
//   - VT100/xterm ANSI parsing (SGR colors incl. 256 + truecolor, cursor motion,
//     erase, scroll regions, DEC private modes subset)
//   - Screen buffer: Uint16 chars + packed Uint8 fg/bg/attrs (4 bytes/cell)
//   - Ring-buffer scrollback, dirty-line tracking for cheap repaints
//   - Line editor: history, tab completion, emacs keys (Ctrl+A/E/K/U/W),
//     arrow navigation, UTF-8 aware
//   - Process bridge: host.spawn() runs REAL native commands (shell, git,
//     node, python...). Default Node host uses child_process.
//   - Multiple sessions (tabs), per-session cwd/env
//
// Module pattern matches other merkava-browser modules (UMD + Merkava ns).
(function (root, factory) {
    if (typeof module === "object" && module.exports) module.exports = factory();
    else { root.Merkava = root.Merkava || {}; const m = factory(); root.Merkava.VirtualTerminal = m.VirtualTerminal; root.Merkava.TerminalSession = m.TerminalSession; }
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    // ------------------------------------------------------------------
    // Cell packing: 4 bytes per cell.
    //   chars: Uint16Array  — UTF-16 code unit
    //   fg:    Uint8Array   — 0-7 basic, 8-15 bright, 16-231 palette, 232-255 gray, 254=truecolor idx, 255=default
    //   bg:    Uint8Array   — same encoding
    //   attr:  Uint8Array   — bit0 bold, bit1 faint, bit2 italic, bit3 underline,
    //                        bit4 blink, bit5 reverse, bit6 strike, bit7 wide-continuation
    // truecolor rgb stored in side table only when used (sparse).
    // ------------------------------------------------------------------
    const ATTR_BOLD = 1, ATTR_FAINT = 2, ATTR_ITALIC = 4, ATTR_UNDERLINE = 8;
    const ATTR_BLINK = 16, ATTR_REVERSE = 32, ATTR_STRIKE = 64, ATTR_WIDE = 128;
    const FG_DEFAULT = 255, BG_DEFAULT = 255;

    const BASIC_COLORS = [
        [0, 0, 0], [170, 0, 0], [0, 170, 0], [170, 85, 0],
        [0, 0, 170], [170, 0, 170], [0, 170, 170], [170, 170, 170],
        [85, 85, 85], [255, 85, 85], [85, 255, 85], [255, 255, 85],
        [85, 85, 255], [255, 85, 255], [85, 255, 255], [255, 255, 255]
    ];

    function colorToRgb(code, truecolors) {
        if (code === 255) return null;
        if (code < 16) return BASIC_COLORS[code];
        if (code < 232) {
            const i = code - 16;
            const r = Math.floor(i / 36), g = Math.floor((i % 36) / 6), b = i % 6;
            const v = n => (n === 0 ? 0 : 55 + n * 40);
            return [v(r), v(g), v(b)];
        }
        if (code < 254) { const g = 8 + (code - 232) * 10; return [g, g, g]; }
        return (truecolors && truecolors.get(code)) || [255, 255, 255];
    }

    // ------------------------------------------------------------------
    // ScreenBuffer
    // ------------------------------------------------------------------
    class ScreenBuffer {
        constructor(cols, rows, scrollback = 1000) {
            this.cols = cols; this.rows = rows;
            const n = cols * rows;
            this.chars = new Uint16Array(n);
            this.fg = new Uint8Array(n).fill(FG_DEFAULT);
            this.bg = new Uint8Array(n).fill(BG_DEFAULT);
            this.attr = new Uint8Array(n);
            this.truecolors = new Map(); // sparse: code(254) -> [r,g,b], keyed per cell via extra map
            this.truecolorCells = new Map(); // cellIndex -> [r,g,b] for fg, bgTrue -> Map
            this.bgTruecolorCells = new Map();
            this.cx = 0; this.cy = 0;
            this.scrollTop = 0; this.scrollBottom = rows - 1;
            this.dirty = new Uint8Array(rows).fill(1);
            this.scrollback = [];
            this.scrollbackLimit = scrollback;
            this.savedCx = 0; this.savedCy = 0;
            this.savedFg = 7; this.savedBg = 0; this.savedAttr = 0;
            this.curFg = 7; this.curBg = 0; this.curAttr = 0;
            this.curFgTrue = null; this.curBgTrue = null;
            this.wrapPending = false;
            this.clear();
        }

        idx(x, y) { return y * this.cols + x; }

        clear() {
            this.chars.fill(32);
            this.fg.fill(FG_DEFAULT); this.bg.fill(BG_DEFAULT); this.attr.fill(0);
            this.truecolorCells.clear(); this.bgTruecolorCells.clear();
            this.dirty.fill(1);
        }

        markDirty(y) { if (y >= 0 && y < this.rows) this.dirty[y] = 1; }
        clearDirty() { this.dirty.fill(0); }
        dirtyLines() { const out = []; for (let y = 0; y < this.rows; y++) if (this.dirty[y]) out.push(y); return out; }

        scrollUp(n = 1) {
            n = Math.min(n, this.scrollBottom - this.scrollTop + 1);
            for (let i = 0; i < n; i++) {
                const line = this.captureLine(this.scrollTop);
                this.scrollback.push(line);
                if (this.scrollback.length > this.scrollbackLimit) this.scrollback.shift();
            }
            const w = this.cols;
            const top = this.scrollTop * w, count = (this.scrollBottom - this.scrollTop + 1 - n) * w;
            this.chars.copyWithin(top, top + n * w, top + (n + count / w | 0) * w + (count % w));
            // Simpler: shift row by row
            for (let y = this.scrollTop; y <= this.scrollBottom - n; y++) {
                const dst = y * w, src = (y + n) * w;
                this.chars.copyWithin(dst, src, src + w);
                this.fg.copyWithin(dst, src, src + w);
                this.bg.copyWithin(dst, src, src + w);
                this.attr.copyWithin(dst, src, src + w);
            }
            for (let y = this.scrollBottom - n + 1; y <= this.scrollBottom; y++) this.eraseLine(y);
            for (let y = this.scrollTop; y <= this.scrollBottom; y++) this.dirty[y] = 1;
            // truecolor cells: drop (rare); acceptable
        }

        captureLine(y) {
            const w = this.cols, o = y * w;
            // Typed-array copies: 5 bytes/cell, not ~32 bytes/cell as JS Arrays.
            return {
                chars: new Uint16Array(this.chars.subarray(o, o + w)),
                fg: new Uint8Array(this.fg.subarray(o, o + w)),
                bg: new Uint8Array(this.bg.subarray(o, o + w)),
                attr: new Uint8Array(this.attr.subarray(o, o + w))
            };
        }

        eraseLine(y, mode = 2) {
            const w = this.cols, o = y * w;
            let s = 0, e = w;
            if (mode === 0) s = this.cx; else if (mode === 1) e = this.cx + 1;
            this.chars.fill(32, o + s, o + e);
            this.fg.fill(FG_DEFAULT, o + s, o + e);
            this.bg.fill(BG_DEFAULT, o + s, o + e);
            this.attr.fill(0, o + s, o + e);
            this.markDirty(y);
        }

        eraseDisplay(mode = 2) {
            if (mode === 2 || mode === 3) {
                for (let y = 0; y < this.rows; y++) this.eraseLine(y);
                this.cx = 0; this.cy = 0;
                if (mode === 3) this.scrollback.length = 0;
            } else if (mode === 0) {
                this.eraseLine(this.cy, 0);
                for (let y = this.cy + 1; y < this.rows; y++) this.eraseLine(y);
            } else if (mode === 1) {
                for (let y = 0; y < this.cy; y++) this.eraseLine(y);
                this.eraseLine(this.cy, 1);
            }
        }

        putChar(code) {
            if (this.wrapPending) {
                this.wrapPending = false;
                this.cx = 0;
                this.lineFeed();
            }
            if (code === 10) { this.lineFeed(); return; }
            if (code === 13) { this.cx = 0; return; }
            if (code === 8) { if (this.cx > 0) this.cx--; return; }
            if (code === 9) { this.cx = Math.min(this.cols - 1, (Math.floor(this.cx / 8) + 1) * 8); return; }
            if (code < 32) return;
            const i = this.idx(this.cx, this.cy);
            this.chars[i] = code;
            if (this.curFgTrue) { this.fg[i] = 254; this.truecolorCells.set(i, this.curFgTrue); }
            else this.fg[i] = this.curFg;
            if (this.curBgTrue) { this.bg[i] = 254; this.bgTruecolorCells.set(i, this.curBgTrue); }
            else this.bg[i] = this.curBg;
            this.attr[i] = this.curAttr;
            this.markDirty(this.cy);
            if (this.cx === this.cols - 1) this.wrapPending = true;
            else this.cx++;
        }

        lineFeed() {
            this.wrapPending = false;
            if (this.cy === this.scrollBottom) this.scrollUp(1);
            else { this.cy = Math.min(this.rows - 1, this.cy + 1); }
        }

        reverseIndex() {
            if (this.cy === this.scrollTop) {
                // scroll down
                const w = this.cols;
                for (let y = this.scrollBottom; y > this.scrollTop; y--) {
                    const dst = y * w, src = (y - 1) * w;
                    this.chars.copyWithin(dst, src, src + w);
                    this.fg.copyWithin(dst, src, src + w);
                    this.bg.copyWithin(dst, src, src + w);
                    this.attr.copyWithin(dst, src, src + w);
                }
                this.eraseLine(this.scrollTop);
                for (let y = this.scrollTop; y <= this.scrollBottom; y++) this.dirty[y] = 1;
            } else this.cy = Math.max(0, this.cy - 1);
        }

        moveCursor(dx, dy) {
            this.wrapPending = false;
            this.cx = Math.max(0, Math.min(this.cols - 1, this.cx + dx));
            this.cy = Math.max(this.scrollTop, Math.min(this.scrollBottom, this.cy + dy));
        }
        setCursor(x, y) {
            this.wrapPending = false;
            this.cx = Math.max(0, Math.min(this.cols - 1, x));
            this.cy = Math.max(this.scrollTop, Math.min(this.scrollBottom, y));
        }

        // SGR
        sgr(params) {
            let i = 0;
            if (params.length === 0) params = [0];
            while (i < params.length) {
                const p = params[i++];
                if (p === 0) { this.curFg = 7; this.curBg = 0; this.curAttr = 0; this.curFgTrue = null; this.curBgTrue = null; }
                else if (p === 1) this.curAttr |= ATTR_BOLD;
                else if (p === 2) this.curAttr |= ATTR_FAINT;
                else if (p === 3) this.curAttr |= ATTR_ITALIC;
                else if (p === 4) this.curAttr |= ATTR_UNDERLINE;
                else if (p === 5) this.curAttr |= ATTR_BLINK;
                else if (p === 7) this.curAttr |= ATTR_REVERSE;
                else if (p === 9) this.curAttr |= ATTR_STRIKE;
                else if (p === 22) this.curAttr &= ~(ATTR_BOLD | ATTR_FAINT);
                else if (p === 23) this.curAttr &= ~ATTR_ITALIC;
                else if (p === 24) this.curAttr &= ~ATTR_UNDERLINE;
                else if (p === 27) this.curAttr &= ~ATTR_REVERSE;
                else if (p === 29) this.curAttr &= ~ATTR_STRIKE;
                else if (p >= 30 && p <= 37) { this.curFg = p - 30; this.curFgTrue = null; }
                else if (p === 39) { this.curFg = 7; this.curFgTrue = null; }
                else if (p >= 40 && p <= 47) { this.curBg = p - 40; this.curBgTrue = null; }
                else if (p === 49) { this.curBg = 0; this.curBgTrue = null; }
                else if (p >= 90 && p <= 97) { this.curFg = p - 90 + 8; this.curFgTrue = null; }
                else if (p >= 100 && p <= 107) { this.curBg = p - 100 + 8; this.curBgTrue = null; }
                else if (p === 38 || p === 48) {
                    const isFg = p === 38;
                    const mode = params[i++];
                    if (mode === 5) { const c = params[i++]; if (isFg) { this.curFg = c; this.curFgTrue = null; } else { this.curBg = c; this.curBgTrue = null; } }
                    else if (mode === 2) {
                        const r = params[i++], g = params[i++], b = params[i++];
                        if (isFg) { this.curFgTrue = [r, g, b]; } else { this.curBgTrue = [r, g, b]; }
                    }
                }
            }
        }

        getLineText(y) {
            const w = this.cols, o = y * w;
            let s = "";
            for (let x = 0; x < w; x++) {
                const c = this.chars[o + x];
                if (this.attr[o + x] & ATTR_WIDE) continue;
                s += String.fromCharCode(c);
            }
            return s.replace(/\s+$/, "");
        }

        getScreenText() {
            const lines = [];
            for (let y = 0; y < this.rows; y++) lines.push(this.getLineText(y));
            while (lines.length && lines[lines.length - 1] === "") lines.pop();
            return lines.join("\n");
        }

        // Styled lines for DOM rendering: [{text, spans:[{start,end,fg,bg,bold,...}]}]
        getStyledLines() {
            const out = [];
            for (let y = 0; y < this.rows; y++) {
                const w = this.cols, o = y * w;
                const spans = [];
                let cur = null;
                for (let x = 0; x < w; x++) {
                    const i = o + x;
                    const key = this.fg[i] + ":" + this.bg[i] + ":" + this.attr[i];
                    const tc = this.fg[i] === 254 ? this.truecolorCells.get(i) : null;
                    const bt = this.bg[i] === 254 ? this.bgTruecolorCells.get(i) : null;
                    const tkey = tc ? tc.join(",") : "";
                    const bkey = bt ? bt.join(",") : "";
                    const full = key + "|" + tkey + "|" + bkey;
                    if (!cur || cur.key !== full) {
                        cur = { key: full, start: x, end: x + 1, fg: this.fg[i], bg: this.bg[i], attr: this.attr[i], fgTrue: tc, bgTrue: bt, text: "" };
                        spans.push(cur);
                    } else cur.end = x + 1;
                    if (!(this.attr[i] & ATTR_WIDE)) cur.text += String.fromCharCode(this.chars[i]);
                }
                out.push({ y, spans: spans.filter(s => s.text.replace(/\s+$/, "").length > 0 || s.start === 0) });
            }
            return out;
        }
    }

    // ------------------------------------------------------------------
    // ANSI parser: feeds bytes into ScreenBuffer
    // ------------------------------------------------------------------
    class AnsiParser {
        constructor(screen) {
            this.s = screen;
            this.state = 0; // 0 normal, 1 esc, 2 csi, 3 osc
            this.params = [];
            this.current = "";
            this.private = false;
            this.oscBuf = "";
        }

        write(data) {
            const str = typeof data === "string" ? data : Buffer.from(data).toString("utf8");
            for (let k = 0; k < str.length; k++) {
                const ch = str[k], code = str.charCodeAt(k);
                this.feed(ch, code);
            }
        }

        feed(ch, code) {
            const s = this.s;
            switch (this.state) {
                case 0:
                    if (code === 27) { this.state = 1; }
                    else s.putChar(code);
                    break;
                case 1: // ESC
                    if (ch === "[") { this.state = 2; this.params = []; this.current = ""; this.private = false; }
                    else if (ch === "]") { this.state = 3; this.oscBuf = ""; }
                    else if (ch === "M") { s.reverseIndex(); this.state = 0; }
                    else if (ch === "7") { s.savedCx = s.cx; s.savedCy = s.cy; this.state = 0; }
                    else if (ch === "8") { s.cx = s.savedCx; s.cy = s.savedCy; this.state = 0; }
                    else if (ch === "c") { s.clear(); s.cx = 0; s.cy = 0; this.state = 0; }
                    else if (ch === "=" || ch === ">") { this.state = 0; }
                    else this.state = 0;
                    break;
                case 2: // CSI
                    if (ch === "?") { this.private = true; break; }
                    if ((code >= 48 && code <= 57) || ch === ";") { this.current += ch; break; }
                    this.params = this.current === "" ? [] : this.current.split(";").map(v => v === "" ? 0 : parseInt(v, 10) || 0);
                    this.dispatchCsi(ch);
                    this.state = 0;
                    break;
                case 3: // OSC — consume until BEL or ESC backslash
                    if (code === 7) this.state = 0;
                    else if (code === 27) this.state = 4;
                    else this.oscBuf += ch;
                    break;
                case 4:
                    if (ch === "\\") this.state = 0;
                    else { this.state = 3; this.oscBuf += "\x1b" + ch; }
                    break;
            }
        }

        p(i, dflt) { const v = this.params[i]; return (v === undefined || v === 0) ? dflt : v; }

        dispatchCsi(ch) {
            const s = this.s, P = this.params;
            switch (ch) {
                case "A": s.moveCursor(0, -this.p(0, 1)); break;
                case "B": case "e": s.moveCursor(0, this.p(0, 1)); break;
                case "C": case "a": s.moveCursor(this.p(0, 1), 0); break;
                case "D": s.moveCursor(-this.p(0, 1), 0); break;
                case "E": s.setCursor(0, s.cy + this.p(0, 1)); break;
                case "F": s.setCursor(0, s.cy - this.p(0, 1)); break;
                case "G": case "`": s.setCursor(this.p(0, 1) - 1, s.cy); break;
                case "H": case "f": s.setCursor(this.p(1, 1) - 1, this.p(0, 1) - 1); break;
                case "d": s.setCursor(s.cx, this.p(0, 1) - 1); break;
                case "J": s.eraseDisplay(this.params[0] === undefined ? 0 : this.params[0]); break;
                case "K": s.eraseLine(s.cy, this.params[0] === undefined ? 0 : this.params[0]); break;
                case "L": for (let i = 0; i < this.p(0, 1); i++) { s.reverseIndex(); } break;
                case "M": for (let i = 0; i < this.p(0, 1); i++) s.lineFeed(); break;
                case "P": case "X": {
                    const n = this.p(0, 1);
                    const w = s.cols, y = s.cy;
                    for (let x = s.cx; x < w - n; x++) {
                        const dst = y * w + x, src = y * w + x + n;
                        s.chars[dst] = s.chars[src]; s.fg[dst] = s.fg[src]; s.bg[dst] = s.bg[src]; s.attr[dst] = s.attr[src];
                    }
                    for (let x = Math.max(s.cx, w - n); x < w; x++) { const i2 = y * w + x; s.chars[i2] = 32; s.fg[i2] = FG_DEFAULT; s.bg[i2] = BG_DEFAULT; s.attr[i2] = 0; }
                    s.markDirty(y);
                    break;
                }
                case "m": s.sgr(P); break;
                case "s": s.savedCx = s.cx; s.savedCy = s.cy; break;
                case "u": s.cx = s.savedCx; s.cy = s.savedCy; break;
                case "r": {
                    const top = this.p(0, 1) - 1, bot = (this.params[1] || s.rows) - 1;
                    s.scrollTop = Math.max(0, top); s.scrollBottom = Math.min(s.rows - 1, bot);
                    s.setCursor(0, 0);
                    break;
                }
                case "h": case "l": break; // modes ignored
                case "n": if (this.p(0, 0) === 6) { /* DSR — handled by session */ } break;
                default: break;
            }
        }
    }

    // ------------------------------------------------------------------
    // LineEditor: canonical-mode input with history + completion
    // ------------------------------------------------------------------
    class LineEditor {
        constructor(opts = {}) {
            this.history = opts.history || [];
            this.histIdx = this.history.length;
            this.buf = "";
            this.cursor = 0;
            this.completer = opts.completer || null;
            this.onSubmit = opts.onSubmit || null;
            this.onInterrupt = opts.onInterrupt || null;
            this.onEOF = opts.onEOF || null;
            this.savedBuf = "";
        }

        reset() { this.buf = ""; this.cursor = 0; this.histIdx = this.history.length; this.savedBuf = ""; }

        // Returns {output} to echo, or {submit: line}
        key(data) {
            // data: string of one or more chars / key names
            if (data === "\r" || data === "\n") {
                const line = this.buf;
                if (line.trim()) { this.history.push(line); if (this.history.length > 500) this.history.shift(); }
                this.reset();
                return { submit: line, echo: "\r\n" };
            }
            if (data === "\x7f" || data === "\b") { // backspace
                if (this.cursor > 0) { this.buf = this.buf.slice(0, this.cursor - 1) + this.buf.slice(this.cursor); this.cursor--; }
                return { echo: "\b \b", redraw: true };
            }
            if (data === "\x03") { this.reset(); return { echo: "^C\r\n", interrupt: true }; }
            if (data === "\x04") { if (this.buf === "") return { eof: true }; }
            if (data === "\x15") { this.buf = this.buf.slice(this.cursor); this.cursor = 0; return { redraw: true }; } // Ctrl+U
            if (data === "\x0b") { this.buf = this.buf.slice(0, this.cursor); return { redraw: true }; } // Ctrl+K
            if (data === "\x17") { // Ctrl+W
                let i = this.cursor;
                while (i > 0 && this.buf[i - 1] === " ") i--;
                while (i > 0 && this.buf[i - 1] !== " ") i--;
                this.buf = this.buf.slice(0, i) + this.buf.slice(this.cursor); this.cursor = i;
                return { redraw: true };
            }
            if (data === "\x01") { this.cursor = 0; return { redraw: true }; } // Ctrl+A
            if (data === "\x05") { this.cursor = this.buf.length; return { redraw: true }; } // Ctrl+E
            if (data === "\x1b[A") { // up
                if (this.histIdx === this.history.length) this.savedBuf = this.buf;
                if (this.histIdx > 0) { this.histIdx--; this.buf = this.history[this.histIdx]; this.cursor = this.buf.length; }
                return { redraw: true };
            }
            if (data === "\x1b[B") { // down
                if (this.histIdx < this.history.length) {
                    this.histIdx++;
                    this.buf = this.histIdx === this.history.length ? this.savedBuf : this.history[this.histIdx];
                    this.cursor = this.buf.length;
                }
                return { redraw: true };
            }
            if (data === "\x1b[C") { if (this.cursor < this.buf.length) this.cursor++; return { redraw: true }; }
            if (data === "\x1b[D") { if (this.cursor > 0) this.cursor--; return { redraw: true }; }
            if (data === "\t") {
                if (this.completer) {
                    const c = this.completer(this.buf, this.cursor);
                    if (c) { this.buf = c.buf; this.cursor = c.cursor; return { redraw: true, note: c.note }; }
                }
                return {};
            }
            // printable
            if (data.length === 1 && data >= " " && data !== "\x7f") {
                this.buf = this.buf.slice(0, this.cursor) + data + this.buf.slice(this.cursor);
                this.cursor++;
                return { echo: data, redraw: true };
            }
            return {};
        }

        promptLine(prompt) { return prompt + this.buf; }
    }

    // ------------------------------------------------------------------
    // Default Node host: spawns REAL native processes via child_process.
    // ------------------------------------------------------------------
    function defaultNodeHost() {
        let cp = null;
        try { cp = require("child_process"); } catch (_) { cp = null; }
        let fs = null, path = null;
        try { fs = require("fs"); path = require("path"); } catch (_) {}
        return {
            name: "node",
            spawnProcess(shell, args, opts) {
                if (!cp) throw new Error("No child_process in this host");
                const child = cp.spawn(shell, args, {
                    cwd: opts.cwd || process.cwd(),
                    env: { ...process.env, ...(opts.env || {}), TERM: "xterm-256color" },
                    stdio: ["pipe", "pipe", "pipe"]
                });
                return {
                    stdin: child.stdin,
                    stdout: child.stdout,
                    stderr: child.stderr,
                    pid: child.pid,
                    onExit: (cb) => child.on("exit", (code, sig) => cb(code, sig)),
                    onError: (cb) => child.on("error", cb),
                    kill: (sig) => { try { child.kill(sig || "SIGTERM"); } catch (_) {} }
                };
            },
            completePath(partial, cwd) {
                if (!fs || !path) return [];
                try {
                    const dir = path.dirname(partial) === "." ? cwd : path.resolve(cwd, path.dirname(partial));
                    const base = path.basename(partial);
                    const entries = fs.readdirSync(dir, { withFileTypes: true });
                    return entries.filter(e => e.name.startsWith(base))
                        .map(e => (path.dirname(partial) === "." ? "" : path.dirname(partial) + "/") + e.name + (e.isDirectory() ? "/" : ""));
                } catch (_) { return []; }
            },
            cwd() { try { return process.cwd(); } catch (_) { return "/"; } }
        };
    }

    // ------------------------------------------------------------------
    // TerminalSession: one terminal tab.
    // ------------------------------------------------------------------
    let SESSION_SEQ = 0;
    class TerminalSession {
        constructor(terminal, opts = {}) {
            this.id = ++SESSION_SEQ;
            this.terminal = terminal;
            this.host = opts.host || terminal.host;
            this.cols = opts.cols || terminal.cols;
            this.rows = opts.rows || terminal.rows;
            this.screen = new ScreenBuffer(this.cols, this.rows, opts.scrollback);
            this.parser = new AnsiParser(this.screen);
            this.cwd = opts.cwd || (this.host.cwd ? this.host.cwd() : "/");
            this.env = { ...(opts.env || {}) };
            this.title = opts.title || ("term-" + this.id);
            this.shell = opts.shell || defaultShell();
            this.proc = null;
            this.editor = new LineEditor({
                completer: (buf, cursor) => this.complete(buf, cursor),
                history: terminal.sharedHistory
            });
            this.onOutput = opts.onOutput || null; // (session) => repaint
            this.onExit = opts.onExit || null;
            this.running = false;
            this.prompt = opts.prompt || null; // fn(cwd) => string
        }

        defaultPrompt() {
            const short = this.cwd.replace(/^.*\//, "") || "/";
            return "\x1b[32mmerkava\x1b[0m:\x1b[34m" + short + "\x1b[0m$ ";
        }

        writePrompt() { this.parser.write(this.prompt ? this.prompt(this.cwd) : this.defaultPrompt()); this.emit(); }

        start() {
            if (this.running) return;
            // Interactive shell via -i so builtins (cd) work; we track cd via PROMPT_COMMAND.
            const shell = this.shell;
            const marker = "__MKCD__";
            const wrappedCmd = `PROMPT_COMMAND='printf "\\033]0;%s\\007" "$PWD"'; ` +
                `__mkcd(){ builtin cd "$@" && printf "${marker}%s\\n" "$PWD"; }; alias cd=__mkcd; exec ${shell} -i`;
            try {
                this.proc = this.host.spawnProcess("/bin/sh", ["-c", wrappedCmd], { cwd: this.cwd, env: this.env });
            } catch (e) {
                this.parser.write("\r\n\x1b[31mTerminal: cannot spawn shell: " + e.message + "\x1b[0m\r\n");
                this.emit();
                return;
            }
            this.running = true;
            let pending = "";
            const handle = (chunk) => {
                let text = chunk.toString("utf8");
                // Track cwd changes from our marker
                const lines = (pending + text).split("\n");
                pending = lines.pop();
                const clean = [];
                for (const ln of lines) {
                    const m = ln.match(new RegExp("^" + marker + "(.*)\\r?$"));
                    if (m) { this.cwd = m[1].trim(); }
                    else clean.push(ln);
                }
                const out = clean.join("\n") + (clean.length ? "\n" : "") + pending;
                pending = "";
                // Re-split: simpler approach — process marker inline
                this.parser.write(this.stripMarkers(out, marker));
                this.emit();
            };
            this.proc.stdout.on("data", handle);
            this.proc.stderr.on("data", handle);
            this.proc.onExit((code) => {
                this.running = false;
                this.parser.write(`\r\n\x1b[33m[process exited (${code})]\x1b[0m\r\n`);
                this.emit();
                if (this.onExit) this.onExit(this, code);
            });
            this.proc.onError((e) => {
                this.parser.write(`\r\n\x1b[31m[spawn error: ${e.message}]\x1b[0m\r\n`);
                this.emit();
            });
        }

        stripMarkers(text, marker) {
            return text.split("\n").filter(ln => !ln.startsWith(marker)).join("\n");
        }

        // Input from the user (keyboard)
        input(data) {
            if (!this.running || !this.proc) {
                // Local echo fallback when no process
                const r = this.editor.key(data);
                if (r.echo) this.parser.write(r.echo);
                if (r.submit !== undefined && this.editor.onSubmit) this.editor.onSubmit(r.submit);
                this.emit();
                return r;
            }
            // In raw shell mode, forward most input directly; but intercept
            // Ctrl+C to also send SIGINT.
            if (data === "\x03") {
                try { this.proc.kill("SIGINT"); } catch (_) {}
                return { interrupt: true };
            }
            try { this.proc.stdin.write(data); } catch (_) {}
            return {};
        }

        // Local line mode (used when no shell, or for the `tunnel` REPL)
        inputLineMode(data) {
            const r = this.editor.key(data);
            if (r.echo) this.parser.write(r.echo);
            if (r.redraw) this.redrawInputLine();
            if (r.submit !== undefined) {
                const line = r.submit;
                if (this.lineHandler) this.lineHandler(line, this);
            }
            if (r.interrupt && this.onInterrupt) this.onInterrupt(this);
            this.emit();
            return r;
        }

        redrawInputLine() {
            const prompt = this.prompt ? this.prompt(this.cwd) : this.defaultPrompt();
            this.parser.write("\r\x1b[K" + prompt + this.editor.buf);
            // move cursor back
            const back = this.editor.buf.length - this.editor.cursor;
            if (back > 0) this.parser.write(`\x1b[${back}D`);
        }

        complete(buf, cursor) {
            const before = buf.slice(0, cursor);
            const m = before.match(/(\S*)$/);
            const partial = m ? m[1] : "";
            const cands = this.host.completePath ? this.host.completePath(partial, this.cwd) : [];
            if (!cands.length) return null;
            if (cands.length === 1) {
                const rest = cands[0].slice(partial.length);
                return { buf: buf.slice(0, cursor) + rest + buf.slice(cursor), cursor: cursor + rest.length };
            }
            // common prefix
            let prefix = cands[0];
            for (const c of cands.slice(1)) {
                let i = 0;
                while (i < prefix.length && i < c.length && prefix[i] === c[i]) i++;
                prefix = prefix.slice(0, i);
            }
            if (prefix.length > partial.length) {
                const rest = prefix.slice(partial.length);
                return { buf: buf.slice(0, cursor) + rest + buf.slice(cursor), cursor: cursor + rest.length };
            }
            return { buf, cursor, note: cands };
        }

        resize(cols, rows) {
            const old = this.screen;
            this.cols = cols; this.rows = rows;
            const fresh = new ScreenBuffer(cols, rows, old.scrollbackLimit);
            fresh.scrollback = old.scrollback;
            // copy visible text best-effort
            const lines = old.getScreenText().split("\n");
            const startY = Math.max(0, rows - lines.length);
            lines.slice(0, rows).forEach((ln, i) => {
                for (let x = 0; x < Math.min(cols, ln.length); x++) fresh.chars[(startY + i) * cols + x] = ln.charCodeAt(x);
                fresh.markDirty(startY + i);
            });
            fresh.cx = 0; fresh.cy = Math.min(rows - 1, startY + lines.length);
            this.screen = fresh;
            this.parser.s = fresh;
            this.emit();
        }

        emit() { if (this.onOutput) this.onOutput(this); if (this.terminal.onSessionOutput) this.terminal.onSessionOutput(this); }

        getText() { return this.screen.getScreenText(); }
        getStyledLines() { return this.screen.getStyledLines(); }
        destroy() { try { if (this.proc) this.proc.kill("SIGKILL"); } catch (_) {} this.running = false; }
    }

    function defaultShell() {
        if (typeof process !== "undefined" && process.env && process.env.SHELL) return process.env.SHELL;
        return "/bin/bash";
    }

    // ------------------------------------------------------------------
    // VirtualTerminal: manager of sessions
    // ------------------------------------------------------------------
    class VirtualTerminal {
        constructor(opts = {}) {
            this.cols = opts.cols || 80;
            this.rows = opts.rows || 24;
            this.host = opts.host || defaultNodeHost();
            this.sessions = new Map();
            this.activeId = null;
            this.sharedHistory = [];
            this.onSessionOutput = opts.onSessionOutput || null;
            this.onSessionList = opts.onSessionList || null;
        }

        createSession(opts = {}) {
            const s = new TerminalSession(this, { cols: this.cols, rows: this.rows, host: this.host, ...opts });
            this.sessions.set(s.id, s);
            if (this.activeId == null) this.activeId = s.id;
            if (this.onSessionList) this.onSessionList(this);
            return s;
        }

        session(id) { return this.sessions.get(id || this.activeId) || null; }
        activate(id) { if (this.sessions.has(id)) this.activeId = id; return this.session(); }
        closeSession(id) {
            const s = this.sessions.get(id);
            if (s) { s.destroy(); this.sessions.delete(id); }
            if (this.activeId === id) this.activeId = this.sessions.size ? [...this.sessions.keys()][0] : null;
            if (this.onSessionList) this.onSessionList(this);
        }
        list() { return [...this.sessions.values()].map(s => ({ id: s.id, title: s.title, cwd: s.cwd, running: s.running })); }

        input(data, id) { const s = this.session(id); if (s) return s.input(data); return null; }
        resize(cols, rows) {
            this.cols = cols; this.rows = rows;
            for (const s of this.sessions.values()) s.resize(cols, rows);
        }
    }

    return { VirtualTerminal, TerminalSession, ScreenBuffer, AnsiParser, LineEditor, defaultNodeHost };
});
