// B"H
import { bytesToCArray } from "./md2Reader.js";

/**
 * B"H
 * Builds a self-contained C seed that embeds Merkava MD2 bytes.
 *
 * Chapter 2: the browser is not born all at once. First it learns to recognize
 * the bytecode soul inside its own executable body, then it reports the canvas
 * bridge it will later paint through OpenGL.
 *
 * @param {Uint8Array|Buffer|number[]} bytes MD2 app bytecode.
 * @returns {string} C source text.
 */
export function buildNativeBrowserC(bytes, shellBytes = bytes) {
  return `/* B"H */\n#include <stdio.h>\n#include <stdint.h>\n#include <string.h>\n${bytesToCArray(bytes, "AWTSMOOS_APP_MD2")}\n${bytesToCArray(shellBytes, "AWTSMOOS_SHELL_MD2")}\n\ntypedef struct AwtsMd2Reader { const unsigned char* data; unsigned int len; unsigned int at; } AwtsMd2Reader;\ntypedef struct AwtsRenderCommand { unsigned int op; unsigned int a; unsigned int b; unsigned int c; unsigned int d; } AwtsRenderCommand;\ntypedef struct AwtsBrowser { const unsigned char* app; unsigned int appLen; const unsigned char* shell; unsigned int shellLen; char address[2048]; AwtsRenderCommand commands[4096]; unsigned int commandCount; } AwtsBrowser;\n\nint awts_md2_valid(const unsigned char* data, unsigned int len) { return len > 5 && data[0] == 'M' && data[1] == 'D' && data[2] == '2' && data[3] == 0; }\nunsigned int awts_read_u8(AwtsMd2Reader* r) { return r->at < r->len ? r->data[r->at++] : 0; }\nunsigned int awts_read_varuint(AwtsMd2Reader* r) { unsigned int value = 0; unsigned int shift = 0; while (r->at < r->len) { unsigned int b = awts_read_u8(r); value |= (b & 127u) << shift; if (!(b & 128u)) break; shift += 7; } return value; }\nvoid awts_emit(AwtsBrowser* b, unsigned int op, unsigned int a, unsigned int c, unsigned int d) { if (b->commandCount < 4096) b->commands[b->commandCount++] = (AwtsRenderCommand){ op, a, c, d, 0 }; }\nvoid awts_opengl_clear(float r, float g, float b, float a) { (void)r; (void)g; (void)b; (void)a; }\nvoid awts_webgl_draw_arrays(unsigned int mode, unsigned int first, unsigned int count) { (void)mode; (void)first; (void)count; }\nint awts_load_url(AwtsBrowser* browser, const char* url) { strncpy(browser->address, url, sizeof(browser->address) - 1); awts_emit(browser, 1, AWTSMOOS_APP_MD2_LEN, AWTSMOOS_SHELL_MD2_LEN, AWTSMOOS_APP_MD2[4]); return awts_md2_valid(browser->app, browser->appLen); }\nint awts_run_md2(AwtsBrowser* browser) { AwtsMd2Reader r = { browser->app, browser->appLen, 5 }; unsigned int poolHint = awts_read_varuint(&r); awts_emit(browser, 2, poolHint, browser->appLen, browser->commandCount); awts_opengl_clear(0.01f, 0.02f, 0.04f, 1.0f); awts_webgl_draw_arrays(4, 0, 3); return 1; }\nint main(int argc, char** argv) { AwtsBrowser browser; memset(&browser, 0, sizeof(browser)); browser.app = AWTSMOOS_APP_MD2; browser.appLen = AWTSMOOS_APP_MD2_LEN; browser.shell = AWTSMOOS_SHELL_MD2; browser.shellLen = AWTSMOOS_SHELL_MD2_LEN; if (!awts_md2_valid(browser.app, browser.appLen)) return 2; if (!awts_md2_valid(browser.shell, browser.shellLen)) return 3; awts_load_url(&browser, argc > 1 ? argv[1] : "file:///index.html"); awts_run_md2(&browser); printf("B\\\\\\"H Merkava native browser\\\\nurl=%s\\\\napp_md2=%u shell_md2=%u commands=%u\\\\n", browser.address, browser.appLen, browser.shellLen, browser.commandCount); return 0; }\n`;
}
