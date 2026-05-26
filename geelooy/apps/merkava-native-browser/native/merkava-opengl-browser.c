/* B"H */
#include "include/awts_native_browser.h"

static AwtsBrowserState g_state;
static HWND g_hwnd = NULL;

static LRESULT CALLBACK AwtsWndProc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {
  switch (msg) {
    case WM_MOUSEMOVE:
      awts_browser_update_cursor(hwnd, &g_state, LOWORD(lp), HIWORD(lp));
      return 0;
    case WM_LBUTTONDOWN:
      awts_browser_update_cursor(hwnd, &g_state, LOWORD(lp), HIWORD(lp));
      g_state.focusedAddress = g_state.hoverAddress;
      if (g_state.focusedAddress) SetFocus(hwnd);
      awts_browser_update_window_title(hwnd, &g_state);
      return 0;
    case WM_CHAR:
      if (wp == 13) {
        awts_browser_navigate(&g_state);
        awts_browser_update_window_title(hwnd, &g_state);
        return 0;
      }
      if (wp == 8) {
        awts_browser_backspace(&g_state);
        awts_browser_update_window_title(hwnd, &g_state);
        return 0;
      }
      awts_browser_append_char(&g_state, (char)wp);
      awts_browser_update_window_title(hwnd, &g_state);
      return 0;
    case WM_KEYDOWN:
      if (wp == VK_ESCAPE) {
        g_state.running = 0;
        PostQuitMessage(0);
        return 0;
      }
      return 0;
    case WM_CLOSE:
    case WM_DESTROY:
      g_state.running = 0;
      PostQuitMessage(0);
      return 0;
  }
  return DefWindowProc(hwnd, msg, wp, lp);
}

static void awts_prepare_browser_shell_state(AwtsBrowserState* state, int smokeMode) {
  memset(state, 0, sizeof(*state));
  state->running = 1;
  state->smokeMode = smokeMode;
  state->verbose = smokeMode;
  state->width = 960;
  state->height = 540;
  state->focusedAddress = 1;
  strncpy(state->statusText, "Merkava shell ready", sizeof(state->statusText) - 1);
  awts_browser_set_url(state, "file:///index.html");
  awts_scan_webgl(&state->webgl, AWTS_SHELL_JS);
  awts_browser_navigate(state);
  awts_browser_navigate(state);
}

int awts_launch_browser(const char* bytecodePath, int smokeMode) {
  awts_prepare_browser_shell_state(&g_state, smokeMode);
  char resolvedBytecode[MAX_PATH];
  snprintf(resolvedBytecode, sizeof(resolvedBytecode), "%s", bytecodePath);
  if (!awts_load_merkava_file(&g_state, resolvedBytecode) && !strchr(bytecodePath, '\\') && !strchr(bytecodePath, '/')) {
    awts_resolve_exe_relative_path(bytecodePath, resolvedBytecode, sizeof(resolvedBytecode));
    awts_load_merkava_file(&g_state, resolvedBytecode);
  }

  if (smokeMode) {
    printf("B'H Merkava Native Browser / Runtime Executor\n");
    printf("bytecode=%s bytes=%u ok=%u section=%u version=%u\n", resolvedBytecode, g_state.bytecodeLen, g_state.bytecodeOk, g_state.section, g_state.version);
    printf("boot=embedded-executor-first host=c-vm-os-opengl-primitives stay-open=%s\n", smokeMode ? "false" : "true");
    printf("browser-shell=browser-shell.html browser-shell.js embedded=embedded_executor.merkava\n");
    printf("navigation=type-address-enter backspace-edits escape-closes\n");
    awts_print_webgl_table(&g_state.webgl);
    awts_print_runtime_report();
    fflush(stdout);
  }

  HINSTANCE hInst = GetModuleHandle(NULL);
  WNDCLASS wc;
  ZeroMemory(&wc, sizeof(wc));
  wc.style = CS_OWNDC;
  wc.lpfnWndProc = AwtsWndProc;
  wc.hInstance = hInst;
  wc.lpszClassName = "AwtsMerkavaNativeBrowser";
  wc.hCursor = LoadCursor(NULL, IDC_ARROW);
  RegisterClass(&wc);

  g_hwnd = CreateWindowEx(0, wc.lpszClassName, "B'H Merkava Browser", WS_OVERLAPPEDWINDOW | WS_VISIBLE, CW_USEDEFAULT, CW_USEDEFAULT, g_state.width, g_state.height, NULL, NULL, hInst, NULL);
  if (!g_hwnd) { printf("create_window_failed=%lu\n", GetLastError()); return 11; }
  awts_browser_update_window_title(g_hwnd, &g_state);

  HDC dc = GetDC(g_hwnd);
  PIXELFORMATDESCRIPTOR pfd;
  ZeroMemory(&pfd, sizeof(pfd));
  pfd.nSize = sizeof(pfd);
  pfd.nVersion = 1;
  pfd.dwFlags = PFD_DRAW_TO_WINDOW | PFD_SUPPORT_OPENGL | PFD_DOUBLEBUFFER;
  pfd.iPixelType = PFD_TYPE_RGBA;
  pfd.cColorBits = 32;
  pfd.cDepthBits = 24;
  pfd.iLayerType = PFD_MAIN_PLANE;
  int pf = ChoosePixelFormat(dc, &pfd);
  if (!pf || !SetPixelFormat(dc, pf, &pfd)) { printf("pixel_format_failed=%lu\n", GetLastError()); return 12; }
  HGLRC rc = wglCreateContext(dc);
  if (!rc || !wglMakeCurrent(dc, rc)) { printf("opengl_context_failed=%lu\n", GetLastError()); return 13; }

  awts_font_init(&g_state, dc);
  if (smokeMode) {
    printf("opengl_vendor=%s\n", glGetString(GL_VENDOR));
    printf("opengl_renderer=%s\n", glGetString(GL_RENDERER));
    printf("opengl_version=%s\n", glGetString(GL_VERSION));
    printf("font=times-new-roman-gdi-opengl-bitmaps ready=%d\n", g_state.font.ready);
    fflush(stdout);
  }

  MSG msg;
  DWORD start = GetTickCount();
  while (g_state.running) {
    while (PeekMessage(&msg, NULL, 0, 0, PM_REMOVE)) {
      if (msg.message == WM_QUIT) g_state.running = 0;
      TranslateMessage(&msg);
      DispatchMessage(&msg);
    }
    awts_draw_native_browser(&g_state);
    SwapBuffers(dc);
    g_state.frames++;
    if (smokeMode && GetTickCount() - start > 2800) g_state.running = 0;
    Sleep(16);
  }

  awts_font_destroy(&g_state);
  wglMakeCurrent(NULL, NULL);
  if (rc) wglDeleteContext(rc);
  ReleaseDC(g_hwnd, dc);
  DestroyWindow(g_hwnd);
  if (smokeMode) {
    printf("frames=%d loaded=%d renderer=win32-opengl browser-shell=drawn navigations=%u url=%s status=%s mode=%s\n",
      g_state.frames, g_state.loaded, g_state.navigations, g_state.url, g_state.statusText, smokeMode ? "smoke" : "interactive");
    fflush(stdout);
  }
  return g_state.loaded ? 0 : 2;
}

int main(int argc, char** argv) {
  if (argc > 1 && (!strcmp(argv[1], "--help") || !strcmp(argv[1], "-h"))) { awts_print_help(); return 0; }
  if (argc > 1 && (!strcmp(argv[1], "--version") || !strcmp(argv[1], "-v"))) { printf("merkavaapp native 0.5.0\n"); return 0; }
  if (argc > 2 && !strcmp(argv[1], "--check")) {
    if (awts_ends_with(argv[2], ".js")) return awts_analyze_js(argv[2], 1);
    if (awts_ends_with(argv[2], ".html") || awts_ends_with(argv[2], ".htm")) return awts_analyze_html(argv[2], 1);
    if (awts_ends_with(argv[2], ".merkava")) {
      AwtsBrowserState check;
      memset(&check, 0, sizeof(check));
      int ok = awts_load_merkava_file(&check, argv[2]);
      printf("B'H Merkava bytecode check\nfile=%s bytes=%u ok=%u section=%u version=%u\n", argv[2], check.bytecodeLen, check.bytecodeOk, check.section, check.version);
      return ok ? 0 : 2;
    }
    printf("--check unsupported file type: %s\n", argv[2]); return 64;
  }
  if (argc > 1 && awts_ends_with(argv[1], ".js")) return awts_analyze_js(argv[1], 0);
  if (argc > 1 && (awts_ends_with(argv[1], ".html") || awts_ends_with(argv[1], ".htm"))) return awts_analyze_html(argv[1], 0);

  if (argc > 2 && !strcmp(argv[1], "--nav-test")) {
    AwtsBrowserState test;
    memset(&test, 0, sizeof(test));
    awts_browser_set_url(&test, argv[2]);
    test.verbose = 1;
    awts_browser_navigate(&test);
    printf("nav-test url=%s status=%s navigations=%u pageKind=%s pageTitle=%s domCount=%d canvas=%d button=%d output=%d preview=%.160s\n", test.url, test.statusText, test.navigations, test.pageKind, test.pageTitle, test.dom.count, test.dom.canvasIndex, test.dom.buttonIndex, test.dom.outputIndex, test.pagePreview);
    return 0;
  }
  if (argc > 5 && !strcmp(argv[1], "--hit-test")) {
    AwtsBrowserState test;
    memset(&test, 0, sizeof(test));
    test.width = atoi(argv[2]);
    test.height = atoi(argv[3]);
    printf("hit-test x=%s y=%s address=%d left=%d right=%d top=%d bottom=%d\n",
      argv[4], argv[5], awts_browser_address_hit(&test, atoi(argv[4]), atoi(argv[5])),
      awts_browser_address_left(&test), awts_browser_address_right(&test),
      awts_browser_address_top(&test), awts_browser_address_bottom(&test));
    return 0;
  }
  int smokeMode = argc > 1 && !strcmp(argv[1], "--smoke");
  const char* bytecodePath = "embedded_executor.merkava";
  if (argc > 1 && !smokeMode) bytecodePath = argv[1];
  return awts_launch_browser(bytecodePath, smokeMode);
}
