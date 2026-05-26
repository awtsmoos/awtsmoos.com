/* B"H */
#include <stdio.h>
#include <stdint.h>
#include <string.h>
static const unsigned char AWTSMOOS_APP_MD2[] = {
  77, 68, 50, 0, 3, 6, 3, 97, 112, 112, 5, 115, 116, 97, 103, 101,
  3, 49, 54, 48, 4, 100, 114, 97, 119, 6, 115, 116, 97, 116, 117, 115,
  5, 114, 101, 97, 100, 121, 0, 71, 0, 4, 1, 0, 20, 1, 0, 0,
  0, 0, 0, 0, 1, 0, 80, 1, 1, 1, 0, 0, 0, 2, 0, 173,
  1, 1, 2, 0, 174, 1, 4, 90, 1, 0, 95, 1, 3, 1, 0, 1,
  3, 0, 1, 0, 105, 1, 4, 1, 0, 1, 5, 0, 0, 4, 2, 1,
  1, 0, 0, 160, 1, 90, 20, 80, 160, 1, 232, 7, 0, 3, 0
};
static const unsigned int AWTSMOOS_APP_MD2_LEN = 111;
static const unsigned char AWTSMOOS_SHELL_MD2[] = {
  77, 68, 50, 0, 3, 12, 7, 98, 114, 111, 119, 115, 101, 114, 3, 98,
  97, 114, 18, 102, 105, 108, 101, 58, 47, 47, 47, 105, 110, 100, 101, 120,
  46, 104, 116, 109, 108, 2, 103, 111, 2, 71, 111, 8, 118, 105, 101, 119,
  112, 111, 114, 116, 13, 119, 101, 98, 103, 108, 45, 115, 117, 114, 102, 97,
  99, 101, 3, 54, 52, 48, 3, 51, 54, 48, 6, 115, 116, 97, 116, 117,
  115, 19, 77, 101, 114, 107, 97, 118, 97, 32, 115, 104, 101, 108, 108, 32,
  114, 101, 97, 100, 121, 5, 115, 116, 97, 103, 101, 0, 105, 0, 7, 1,
  0, 20, 1, 0, 0, 0, 0, 0, 0, 1, 0, 98, 1, 1, 1, 0,
  0, 0, 0, 1, 0, 99, 0, 9, 1, 1, 0, 0, 1, 0, 176, 1,
  1, 2, 1, 0, 95, 1, 3, 1, 1, 1, 4, 0, 1, 0, 22, 1,
  5, 1, 0, 0, 0, 0, 1, 0, 80, 1, 6, 1, 5, 0, 0, 2,
  0, 173, 1, 1, 7, 0, 174, 1, 1, 8, 1, 0, 105, 1, 9, 1,
  5, 1, 10, 0, 0, 4, 2, 1, 11, 0, 0, 160, 1, 90, 10, 15,
  25, 232, 7, 0, 3, 0
};
static const unsigned int AWTSMOOS_SHELL_MD2_LEN = 214;

typedef struct AwtsMd2Reader { const unsigned char* data; unsigned int len; unsigned int at; } AwtsMd2Reader;
typedef struct AwtsRenderCommand { unsigned int op; unsigned int a; unsigned int b; unsigned int c; unsigned int d; } AwtsRenderCommand;
typedef struct AwtsBrowser { const unsigned char* app; unsigned int appLen; const unsigned char* shell; unsigned int shellLen; char address[2048]; AwtsRenderCommand commands[4096]; unsigned int commandCount; } AwtsBrowser;

int awts_md2_valid(const unsigned char* data, unsigned int len) { return len > 5 && data[0] == 'M' && data[1] == 'D' && data[2] == '2' && data[3] == 0; }
unsigned int awts_read_u8(AwtsMd2Reader* r) { return r->at < r->len ? r->data[r->at++] : 0; }
unsigned int awts_read_varuint(AwtsMd2Reader* r) { unsigned int value = 0; unsigned int shift = 0; while (r->at < r->len) { unsigned int b = awts_read_u8(r); value |= (b & 127u) << shift; if (!(b & 128u)) break; shift += 7; } return value; }
void awts_emit(AwtsBrowser* b, unsigned int op, unsigned int a, unsigned int c, unsigned int d) { if (b->commandCount < 4096) b->commands[b->commandCount++] = (AwtsRenderCommand){ op, a, c, d, 0 }; }
void awts_opengl_clear(float r, float g, float b, float a) { (void)r; (void)g; (void)b; (void)a; }
void awts_webgl_draw_arrays(unsigned int mode, unsigned int first, unsigned int count) { (void)mode; (void)first; (void)count; }
int awts_load_url(AwtsBrowser* browser, const char* url) { strncpy(browser->address, url, sizeof(browser->address) - 1); awts_emit(browser, 1, AWTSMOOS_APP_MD2_LEN, AWTSMOOS_SHELL_MD2_LEN, AWTSMOOS_APP_MD2[4]); return awts_md2_valid(browser->app, browser->appLen); }
int awts_run_md2(AwtsBrowser* browser) { AwtsMd2Reader r = { browser->app, browser->appLen, 5 }; unsigned int poolHint = awts_read_varuint(&r); awts_emit(browser, 2, poolHint, browser->appLen, browser->commandCount); awts_opengl_clear(0.01f, 0.02f, 0.04f, 1.0f); awts_webgl_draw_arrays(4, 0, 3); return 1; }
int main(int argc, char** argv) { AwtsBrowser browser; memset(&browser, 0, sizeof(browser)); browser.app = AWTSMOOS_APP_MD2; browser.appLen = AWTSMOOS_APP_MD2_LEN; browser.shell = AWTSMOOS_SHELL_MD2; browser.shellLen = AWTSMOOS_SHELL_MD2_LEN; if (!awts_md2_valid(browser.app, browser.appLen)) return 2; if (!awts_md2_valid(browser.shell, browser.shellLen)) return 3; awts_load_url(&browser, argc > 1 ? argv[1] : "file:///index.html"); awts_run_md2(&browser); printf("B\\\"H Merkava native browser\\nurl=%s\\napp_md2=%u shell_md2=%u commands=%u\\n", browser.address, browser.appLen, browser.shellLen, browser.commandCount); return 0; }
