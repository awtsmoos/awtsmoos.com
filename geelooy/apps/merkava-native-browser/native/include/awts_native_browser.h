/* B"H */
#ifndef AWTS_NATIVE_BROWSER_H
#define AWTS_NATIVE_BROWSER_H

#include <windows.h>
#include <gl/gl.h>
#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>

#ifndef AWTS_MERKAVA_REPORT_JSON
#define AWTS_MERKAVA_REPORT_JSON "{\"BH\":\"B'H\",\"warning\":\"native report header missing\"}"
#endif
#ifndef AWTS_RENDER_MODEL_JSON
#define AWTS_RENDER_MODEL_JSON "{}"
#endif
#ifndef AWTS_NATIVE_RENDER_STREAM
#define AWTS_NATIVE_RENDER_STREAM ""
#endif
#ifndef AWTS_SAMPLE_HTML
#define AWTS_SAMPLE_HTML ""
#endif
#ifndef AWTS_SAMPLE_JS
#define AWTS_SAMPLE_JS ""
#endif
#ifndef AWTS_SHELL_HTML
#define AWTS_SHELL_HTML ""
#endif
#ifndef AWTS_SHELL_JS
#define AWTS_SHELL_JS ""
#endif

#define AWTS_MAX_PATH_TEXT 4096
#define AWTS_URL_TEXT 512
typedef struct AwtsTextFile { char* data; long size; } AwtsTextFile;

typedef struct AwtsWebGlCommandTable {
  unsigned int viewport;
  unsigned int clearColor;
  unsigned int clear;
  unsigned int drawArrays;
  unsigned int createBuffer;
  unsigned int bindBuffer;
  unsigned int bufferData;
  unsigned int createShader;
  unsigned int shaderSource;
  unsigned int compileShader;
  unsigned int createProgram;
  unsigned int linkProgram;
  unsigned int useProgram;
} AwtsWebGlCommandTable;

typedef struct AwtsFontState {
  GLuint base;
  int ready;
  HFONT font;
} AwtsFontState;

typedef struct AwtsMerkavaBytecode {
  unsigned char* bytes;
  unsigned int length;
  unsigned int ok;
  unsigned int section;
  unsigned int version;
  unsigned int poolCount;
  unsigned int selectorCount;
  unsigned int programOffset;
} AwtsMerkavaBytecode;

typedef struct AwtsMerkavaReader {
  unsigned char* bytes;
  unsigned int length;
  unsigned int at;
} AwtsMerkavaReader;

typedef struct AwtsMerkavaHostFrame {
  int ok;
  unsigned int hostBindingCount;
  unsigned int mappedRenderOps;
  char mode[64];
  char message[256];
} AwtsMerkavaHostFrame;

typedef struct AwtsBrowserState {
  int running;
  int smokeMode;
  int verbose;
  int frames;
  unsigned int bytecodeLen;
  unsigned int bytecodeOk;
  unsigned int section;
  unsigned int version;
  int loaded;
  int width;
  int height;
  int mouseX;
  int mouseY;
  int hoverAddress;
  int focusedAddress;
  unsigned int navigations;
  float pulse;
  char statusText[256];
  char url[AWTS_URL_TEXT];
  char pageKind[64];
  char pageTitle[256];
  char pagePreview[2048];
  AwtsWebGlCommandTable webgl;
  AwtsFontState font;
} AwtsBrowserState;

int awts_ends_with(const char* s, const char* suffix);
AwtsTextFile awts_read_text_file(const char* path);
unsigned int awts_count_token(const char* text, const char* token);
int awts_text_has(const char* text, const char* token);
void awts_scan_webgl(AwtsWebGlCommandTable* out, const char* text);
void awts_print_webgl_table(const AwtsWebGlCommandTable* t);
int awts_analyze_js(const char* path, int checkOnly);
int awts_analyze_html(const char* path, int checkOnly);
int awts_load_merkava_file(AwtsBrowserState* state, const char* path);
int awts_read_merkava_bytecode_file(const char* path, AwtsMerkavaBytecode* out);
void awts_free_merkava_bytecode(AwtsMerkavaBytecode* bytecode);
int awts_validate_merkava_bytecode(AwtsMerkavaBytecode* bytecode);
int awts_execute_merkava_bytecode(AwtsMerkavaBytecode* bytecode, AwtsMerkavaHostFrame* frame);
int awts_execute_merkava_bytecode_file(const char* path, AwtsMerkavaHostFrame* frame);
void awts_resolve_exe_relative_path(const char* name, char* out, size_t cap);
void awts_print_help(void);
void awts_print_runtime_report(void);
void awts_browser_set_url(AwtsBrowserState* state, const char* url);
void awts_browser_navigate(AwtsBrowserState* state);
void awts_browser_backspace(AwtsBrowserState* state);
void awts_browser_append_char(AwtsBrowserState* state, char c);
void awts_browser_update_window_title(HWND hwnd, const AwtsBrowserState* state);
int awts_browser_address_hit(const AwtsBrowserState* state, int x, int y);
int awts_browser_address_left(const AwtsBrowserState* state);
int awts_browser_address_right(const AwtsBrowserState* state);
int awts_browser_address_top(const AwtsBrowserState* state);
int awts_browser_address_bottom(const AwtsBrowserState* state);
void awts_browser_update_cursor(HWND hwnd, AwtsBrowserState* state, int x, int y);
void awts_font_init(AwtsBrowserState* state, HDC dc);
void awts_font_destroy(AwtsBrowserState* state);
void awts_draw_text(AwtsBrowserState* state, float x, float y, const char* text, float r, float g, float b);
void awts_draw_native_browser(AwtsBrowserState* state);
int awts_launch_browser(const char* bytecodePath, int smokeMode);

#endif
