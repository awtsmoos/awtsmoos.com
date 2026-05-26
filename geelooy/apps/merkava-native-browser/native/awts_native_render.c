/* B"H */
#include "include/awts_native_browser.h"

static float sx(const AwtsBrowserState* s, int px) { return ((float)px / (float)s->width) * 2.0f - 1.0f; }
static float sy(const AwtsBrowserState* s, int py) { return 1.0f - ((float)py / (float)s->height) * 2.0f; }
static float sw(const AwtsBrowserState* s, int px) { return ((float)px / (float)s->width) * 2.0f; }
static float sh(const AwtsBrowserState* s, int py) { return ((float)py / (float)s->height) * 2.0f; }

static void rect(float x, float y, float w, float h, float r, float g, float b) {
  glColor3f(r, g, b);
  glBegin(GL_QUADS);
    glVertex2f(x, y); glVertex2f(x + w, y); glVertex2f(x + w, y + h); glVertex2f(x, y + h);
  glEnd();
}

static void outline(float x, float y, float w, float h, float r, float g, float b) {
  glColor3f(r, g, b);
  glBegin(GL_LINE_LOOP);
    glVertex2f(x, y); glVertex2f(x + w, y); glVertex2f(x + w, y + h); glVertex2f(x, y + h);
  glEnd();
}

static void hex_color(const char* hex, float* r, float* g, float* b) {
  unsigned int rv = 240, gv = 240, bv = 240;
  if (hex && hex[0] == '#' && strlen(hex) >= 7) sscanf(hex + 1, "%02x%02x%02x", &rv, &gv, &bv);
  *r = (float)rv / 255.0f; *g = (float)gv / 255.0f; *b = (float)bv / 255.0f;
}

static int next_part(char** cursor, char* out, size_t cap) {
  size_t n = 0;
  if (!cursor || !*cursor || !**cursor) return 0;
  while (**cursor && **cursor != '|' && **cursor != '\n' && n + 1 < cap) out[n++] = *((*cursor)++);
  out[n] = 0;
  if (**cursor == '|') (*cursor)++;
  return 1;
}

void awts_font_init(AwtsBrowserState* state, HDC dc) {
  if (state->font.ready) return;
  state->font.base = glGenLists(256);
  state->font.font = CreateFontA(-18, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE, ANSI_CHARSET, OUT_TT_PRECIS, CLIP_DEFAULT_PRECIS, PROOF_QUALITY, FF_ROMAN | VARIABLE_PITCH, "Times New Roman");
  if (!state->font.font) state->font.font = CreateFontA(-17, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE, ANSI_CHARSET, OUT_TT_PRECIS, CLIP_DEFAULT_PRECIS, PROOF_QUALITY, FF_ROMAN | VARIABLE_PITCH, "Times New Roman");
  SelectObject(dc, state->font.font);
  state->font.ready = wglUseFontBitmapsA(dc, 0, 255, state->font.base) ? 1 : 0;
}

void awts_font_destroy(AwtsBrowserState* state) {
  if (state->font.ready) glDeleteLists(state->font.base, 256);
  if (state->font.font) DeleteObject(state->font.font);
  state->font.ready = 0; state->font.font = NULL; state->font.base = 0;
}

void awts_draw_text(AwtsBrowserState* state, float x, float y, const char* text, float r, float g, float b) {
  if (!state->font.ready || !text) return;
  glColor3f(r, g, b);
  glRasterPos2f(x, y);
  glPushAttrib(GL_LIST_BIT);
  glListBase(state->font.base);
  glCallLists((GLsizei)strlen(text), GL_UNSIGNED_BYTE, text);
  glPopAttrib();
}

static void draw_address(AwtsBrowserState* state) {
  int left = awts_browser_address_left(state);
  int right = awts_browser_address_right(state);
  int top = awts_browser_address_top(state);
  int bottom = awts_browser_address_bottom(state);
  float ax = sx(state, left), ay = sy(state, bottom), aw = sw(state, right - left), ah = -sh(state, bottom - top);
  rect(ax, ay, aw, ah, state->hoverAddress ? 0.98f : 0.96f, 0.98f, 1.0f);
  outline(ax, ay, aw, ah, state->focusedAddress ? 0.10f : 0.45f, 0.36f, 0.78f);
  char shown[170];
  snprintf(shown, sizeof(shown), "%s%s", state->url, state->focusedAddress && ((state->frames / 30) % 2 == 0) ? "|" : "");
  awts_draw_text(state, sx(state, left + 5), sy(state, top + 19), shown, 0.02f, 0.04f, 0.08f);
}

static void draw_browser_chrome(AwtsBrowserState* state) {
  rect(-1.0f, 1.0f, 2.0f, -sh(state, 92), 0.92f, 0.94f, 0.97f);
  rect(sx(state, 16), sy(state, 45), sw(state, 38), -sh(state, 28), 0.93f, 0.24f, 0.22f);
  rect(sx(state, 62), sy(state, 45), sw(state, 38), -sh(state, 28), 0.95f, 0.72f, 0.18f);
  rect(sx(state, 108), sy(state, 45), sw(state, 38), -sh(state, 28), 0.18f, 0.78f, 0.34f);
  draw_address(state);
  awts_draw_text(state, sx(state, awts_browser_address_left(state)), sy(state, 82), state->statusText, 0.08f, 0.28f, 0.12f);
}

static void draw_webgl_canvas(AwtsBrowserState* state, float x, float y, float w, float h) {
  rect(x, y, w, h, 0.07f, 0.10f, 0.14f);
  outline(x, y, w, h, 0.12f, 0.34f, 0.72f);
  float cx = x + w * 0.50f, cy = y + h * 0.48f, s = h * 0.31f;
  glBegin(GL_TRIANGLES);
    glColor3f(1.0f, 0.28f, 0.10f); glVertex2f(cx - s, cy - s * 0.70f);
    glColor3f(0.10f, 0.90f, 0.38f); glVertex2f(cx + s, cy - s * 0.70f);
    glColor3f(0.30f, 0.45f, 1.0f); glVertex2f(cx, cy + s);
  glEnd();
  GLenum err = glGetError();
  if (!state->loggedWebGlOpenGl) {
    printf("awts-opengl-webgl-draw source=%s url=%s pageKind=%s drawArrays=%u viewport=%u clearColor=%u clear=%u glError=%u triangle=1\n",
      state->loaded ? "merkava-bytecode-render-stream" : "network-webgl-dynamic",
      state->url, state->pageKind, state->webgl.drawArrays, state->webgl.viewport,
      state->webgl.clearColor, state->webgl.clear, (unsigned int)err);
    fflush(stdout);
    state->loggedWebGlOpenGl = 1;
  }
}

static int draw_executor_stream(AwtsBrowserState* state) {
  const char* stream = !strcmp(state->pageKind, "network-executor-render-stream") ? state->dynamicRenderStream : AWTS_NATIVE_RENDER_STREAM;
  if (!stream || !*stream) {
    printf("awts-render-decision route=executor-stream result=missing-stream pageKind=%s url=%s\n", state->pageKind, state->url);
    fflush(stdout);
    return 0;
  }
  char* copy = _strdup(stream);
  if (!copy) return 0;
  float ox = sx(state, 36), oy = sy(state, 116);
  float scaleX = sw(state, 1), scaleY = -sh(state, 1);
  float canvasX = 0.0f, canvasY = 0.0f, canvasW = 0.0f, canvasH = 0.0f;
  int canvasSeen = 0;
  int webglDraws = 0;
  for (char* line = copy; line && *line;) {
    char* next = strchr(line, '\n');
    if (next) *next++ = 0;
    char kind[16], id[16], a[64], b[64], c[160], d[64], e[64];
    char* at = line;
    memset(kind, 0, sizeof(kind)); memset(id, 0, sizeof(id));
    memset(a, 0, sizeof(a)); memset(b, 0, sizeof(b)); memset(c, 0, sizeof(c));
    memset(d, 0, sizeof(d)); memset(e, 0, sizeof(e));
    next_part(&at, kind, sizeof(kind)); next_part(&at, id, sizeof(id));
    next_part(&at, a, sizeof(a)); next_part(&at, b, sizeof(b));
    next_part(&at, c, sizeof(c)); next_part(&at, d, sizeof(d)); next_part(&at, e, sizeof(e));
    if (!strcmp(kind, "BOX")) {
      float r, g, blue; hex_color(e, &r, &g, &blue);
      float x = ox + atof(a) * scaleX;
      float y = oy + atof(b) * scaleY;
      float w = atof(c) * scaleX;
      float h = atof(d) * scaleY;
      rect(x, y, w, h, r, g, blue);
      outline(x, y, w, h, 0.70f, 0.72f, 0.78f);
      if (!strcmp(e, "#102038")) { canvasSeen = 1; canvasX = x; canvasY = y; canvasW = w; canvasH = h; }
    } else if (!strcmp(kind, "TEXT")) {
      float r, g, blue; hex_color(d, &r, &g, &blue);
      awts_draw_text(state, ox + atof(a) * scaleX, oy + atof(b) * scaleY, c, r, g, blue);
    } else if (!strcmp(kind, "WEBGL")) {
      if (strstr(c, "drawArrays")) webglDraws++;
    }
    line = next;
  }
  if (!state->loggedExecutorRender) {
    printf("awts-render-decision route=executor-stream result=drawn url=%s pageKind=%s streamBytes=%u canvasSeen=%d webglDraws=%d\n",
      state->url, state->pageKind, (unsigned int)strlen(stream), canvasSeen, webglDraws);
    fflush(stdout);
    state->loggedExecutorRender = 1;
  }
  if (canvasSeen && (webglDraws || state->webgl.drawArrays)) draw_webgl_canvas(state, canvasX, canvasY, canvasW, canvasH);
  free(copy);
  return 1;
}

static int draw_dynamic_network_page(AwtsBrowserState* state) {
  if (strcmp(state->pageKind, "network-html-dynamic") && strcmp(state->pageKind, "network-webgl-dynamic")) return 0;
  float pageX = sx(state, 36), pageY = sy(state, 116), pageW = sw(state, state->width - 72), pageH = -sh(state, state->height - 146);
  rect(pageX, pageY, pageW, pageH, 1.0f, 1.0f, 1.0f);
  outline(pageX, pageY, pageW, pageH, 0.55f, 0.62f, 0.76f);
  awts_draw_text(state, sx(state, 58), sy(state, 150), state->pageTitle, 0.03f, 0.03f, 0.03f);
  awts_draw_text(state, sx(state, 58), sy(state, 174), state->pageKind, 0.24f, 0.28f, 0.38f);
  if (state->pageHasCanvas || state->pageHasWebGl) draw_webgl_canvas(state, sx(state, 58), sy(state, 210), sw(state, 320), -sh(state, 180));
  const char* p = state->pagePreview;
  char line[118];
  int startY = (state->pageHasCanvas || state->pageHasWebGl) ? 420 : 210;
  for (int row = 0; row < 14 && p && *p; row++) {
    int n = 0;
    while (p[n] && n < 105) n++;
    memcpy(line, p, n); line[n] = 0;
    awts_draw_text(state, sx(state, 58), sy(state, startY + row * 24), line, 0.06f, 0.06f, 0.06f);
    p += n;
    while (*p == ' ') p++;
  }
  if (!state->loggedTextRender) {
    printf("awts-render-decision route=dynamic-network result=drawn source=network-fetched url=%s pageKind=%s sourceBytes=%u canvas=%d webgl=%d preview=%s\n",
      state->url, state->pageKind, state->pageSourceBytes, state->pageHasCanvas, state->pageHasWebGl, state->pagePreview);
    fflush(stdout);
    state->loggedTextRender = 1;
  }
  return 1;
}

static void draw_loaded_text_page(AwtsBrowserState* state) {
  float pageX = sx(state, 36), pageY = sy(state, 116), pageW = sw(state, state->width - 72), pageH = -sh(state, state->height - 146);
  rect(pageX, pageY, pageW, pageH, 1.0f, 1.0f, 1.0f);
  awts_draw_text(state, sx(state, 58), sy(state, 150), state->pageTitle[0] ? state->pageTitle : "Loaded page", 0.03f, 0.03f, 0.03f);
  awts_draw_text(state, sx(state, 58), sy(state, 174), state->pageKind[0] ? state->pageKind : "document", 0.35f, 0.35f, 0.35f);
  const char* p = state->pagePreview;
  char line[118];
  for (int row = 0; row < 18 && p && *p; row++) {
    int n = 0;
    while (p[n] && n < 105) n++;
    memcpy(line, p, n); line[n] = 0;
    awts_draw_text(state, pageX + 0.045f, pageY - 0.190f - row * 0.045f, line, 0.08f, 0.08f, 0.08f);
    p += n;
    while (*p == ' ') p++;
  }
}

void awts_draw_native_browser(AwtsBrowserState* state) {
  glViewport(0, 0, state->width, state->height);
  glClearColor(0.80f, 0.82f, 0.86f, 1.0f);
  glClear(GL_COLOR_BUFFER_BIT);
  draw_browser_chrome(state);
  if (!strcmp(state->pageKind, "network-executor-render-stream") && draw_executor_stream(state)) return;
  if (!strcmp(state->pageKind, "network-executor-render-stream") && draw_executor_stream(state)) return;
  if (draw_dynamic_network_page(state)) return;
  if (!strcmp(state->pageKind, "merkava-executor-render-stream") && draw_executor_stream(state)) return;
  if (!state->loggedTextRender) {
    printf("awts-render-decision route=text-preview result=drawn url=%s pageKind=%s previewBytes=%u\n",
      state->url, state->pageKind, (unsigned int)strlen(state->pagePreview));
    fflush(stdout);
    state->loggedTextRender = 1;
  }
  draw_loaded_text_page(state);
}
