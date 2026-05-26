/* B"H */
#include "include/awts_native_browser.h"
#include <wininet.h>

int awts_ends_with(const char* s, const char* suffix) {
  size_t a = strlen(s), b = strlen(suffix);
  return a >= b && _stricmp(s + a - b, suffix) == 0;
}

AwtsTextFile awts_read_text_file(const char* path) {
  AwtsTextFile out;
  out.data = NULL;
  out.size = 0;
  FILE* f = fopen(path, "rb");
  if (!f) return out;
  fseek(f, 0, SEEK_END);
  out.size = ftell(f);
  fseek(f, 0, SEEK_SET);
  out.data = (char*)calloc((size_t)out.size + 1, 1);
  if (out.data) fread(out.data, 1, (size_t)out.size, f);
  fclose(f);
  return out;
}

unsigned int awts_count_token(const char* text, const char* token) {
  unsigned int count = 0;
  const char* p = text;
  size_t n = strlen(token);
  while (p && *p) {
    p = strstr(p, token);
    if (!p) break;
    count++;
    p += n;
  }
  return count;
}

int awts_text_has(const char* text, const char* token) {
  return text && token && strstr(text, token) != NULL;
}

static const char* quoted_path_after(const char* text, const char* marker, char* out, size_t cap) {
  const char* p = strstr(text, marker);
  if (!p) return NULL;
  p = strchr(p, '(');
  if (!p) return NULL;
  while (*p && *p != '\'' && *p != '"') p++;
  if (!*p) return NULL;
  char q = *p++;
  size_t n = 0;
  while (*p && *p != q && n + 1 < cap) out[n++] = *p++;
  out[n] = 0;
  return out;
}

static void clean_preview(char* out, size_t cap, const char* input) {
  size_t j = 0;
  const char* src = input ? input : "";
  for (size_t i = 0; src[i] && j + 1 < cap; i++) {
    char c = src[i];
    if (c == '\r' || c == '\n' || c == '\t') c = ' ';
    if ((unsigned char)c < 32) continue;
    out[j++] = c;
  }
  out[j] = 0;
}

static void set_page(AwtsBrowserState* state, const char* kind, const char* title, const char* preview) {
  snprintf(state->pageKind, sizeof(state->pageKind), "%s", kind ? kind : "unknown");
  snprintf(state->pageTitle, sizeof(state->pageTitle), "%s", title ? title : "Untitled");
  clean_preview(state->pagePreview, sizeof(state->pagePreview), preview && *preview ? preview : "MerkavaExecutor render stream is active; native host only maps verified ops");
  state->pageSource[0] = 0;
  state->pageSourceBytes = 0;
  state->pageHasCanvas = 0;
  state->pageHasWebGl = 0;
  state->loggedExecutorRender = 0;
  state->loggedTextRender = 0;
  state->loggedWebGlOpenGl = 0;
  state->loggedWebGlOpenGl = 0;
  printf("awts-page-state kind=%s title=%s previewBytes=%u\n", state->pageKind, state->pageTitle, (unsigned int)strlen(state->pagePreview));
  fflush(stdout);
}

static void print_fs_exists(const char* path) {
  DWORD attrs = GetFileAttributesA(path);
  printf("fs.existsSync(%s)=%s\n", path, attrs == INVALID_FILE_ATTRIBUTES ? "false" : "true");
}

static void print_fs_stat(const char* path) {
  WIN32_FILE_ATTRIBUTE_DATA data;
  if (!GetFileAttributesExA(path, GetFileExInfoStandard, &data)) {
    printf("fs.statSync(%s)=error:not_found\n", path);
    return;
  }
  ULARGE_INTEGER size;
  size.LowPart = data.nFileSizeLow;
  size.HighPart = data.nFileSizeHigh;
  printf("fs.statSync(%s).size=%llu isDirectory=%s\n", path, (unsigned long long)size.QuadPart, (data.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) ? "true" : "false");
}

static void print_fs_read(const char* path) {
  AwtsTextFile file = awts_read_text_file(path);
  if (!file.data) { printf("fs.readFileSync(%s)=error:not_found\n", path); return; }
  unsigned int preview = file.size < 64 ? (unsigned int)file.size : 64;
  printf("fs.readFileSync(%s).bytes=%ld preview=", path, file.size);
  for (unsigned int i = 0; i < preview; i++) {
    char c = file.data[i];
    putchar((c == '\n' || c == '\r') ? ' ' : c);
  }
  putchar('\n');
  free(file.data);
}

static void print_fs_readdir(const char* dir) {
  char pattern[MAX_PATH];
  snprintf(pattern, sizeof(pattern), "%s\\*", dir);
  WIN32_FIND_DATAA fd;
  HANDLE h = FindFirstFileA(pattern, &fd);
  unsigned int count = 0;
  if (h == INVALID_HANDLE_VALUE) { printf("fs.readdirSync(%s)=error:not_found\n", dir); return; }
  printf("fs.readdirSync(%s)=", dir);
  do {
    if (strcmp(fd.cFileName, ".") && strcmp(fd.cFileName, "..")) {
      if (count) printf(",");
      printf("%s", fd.cFileName);
      count++;
    }
  } while (FindNextFileA(h, &fd) && count < 20);
  FindClose(h);
  printf(" count=%u\n", count);
}

static int contains_any_node_core_except_fs(const char* text) {
  return strstr(text, "require(\"http\")") || strstr(text, "require('http')") ||
         strstr(text, "require(\"https\")") || strstr(text, "require('https')") ||
         strstr(text, "require(\"crypto\")") || strstr(text, "require('crypto')") ||
         strstr(text, "import http") || strstr(text, "from \"http\"") || strstr(text, "from 'http'");
}

static int execute_simple_fs_js(const char* scriptPath, const char* text) {
  int hasFs = strstr(text, "require('fs')") || strstr(text, "require(\"fs\")");
  if (!hasFs) return 0;
  char target[MAX_PATH];
  printf("native-fs-runtime=active entry=%s\n", scriptPath);
  if (quoted_path_after(text, "existsSync", target, sizeof(target))) print_fs_exists(target);
  if (quoted_path_after(text, "readFileSync", target, sizeof(target))) print_fs_read(target);
  if (quoted_path_after(text, "statSync", target, sizeof(target))) print_fs_stat(target);
  if (quoted_path_after(text, "readdirSync", target, sizeof(target))) print_fs_readdir(target);
  printf("native-fs-runtime=status:partial-pattern-executor\n");
  return 1;
}

static int awts_url_is_local_http(const char* url) {
  return awts_text_has(url, "http://localhost") || awts_text_has(url, "https://localhost") ||
         awts_text_has(url, "http://127.0.0.1") || awts_text_has(url, "https://127.0.0.1");
}

static int awts_html_wants_webgl_executor(const char* html) {
  return awts_text_has(html, "<canvas") || awts_text_has(html, "getContext(\"webgl") ||
         awts_text_has(html, "getContext('webgl") || awts_text_has(html, "drawArrays(") ||
         awts_text_has(html, "createShader(") || awts_text_has(html, "bufferData(");
}

static void awts_extract_visible_text(char* out, size_t cap, const char* html) {
  size_t j = 0;
  int inTag = 0;
  int skipScript = 0;
  int skipStyle = 0;
  int lastSpace = 1;
  const char* src = html ? html : "";
  for (size_t i = 0; src[i] && j + 1 < cap; i++) {
    if (!_strnicmp(src + i, "<script", 7)) { skipScript = 1; inTag = 1; continue; }
    if (!_strnicmp(src + i, "</script", 8)) { skipScript = 0; inTag = 1; continue; }
    if (!_strnicmp(src + i, "<style", 6)) { skipStyle = 1; inTag = 1; continue; }
    if (!_strnicmp(src + i, "</style", 7)) { skipStyle = 0; inTag = 1; continue; }
    char c = src[i];
    if (c == '<') { inTag = 1; if (!lastSpace && j + 1 < cap) { out[j++] = ' '; lastSpace = 1; } continue; }
    if (c == '>') { inTag = 0; continue; }
    if (inTag || skipScript || skipStyle) continue;
    if (c == '\r' || c == '\n' || c == '\t') c = ' ';
    if ((unsigned char)c < 32) continue;
    if (c == ' ') {
      if (lastSpace) continue;
      lastSpace = 1;
    } else {
      lastSpace = 0;
    }
    out[j++] = c;
  }
  out[j] = 0;
}

static void awts_set_dynamic_source(AwtsBrowserState* state, const char* html, DWORD read) {
  unsigned int copy = (unsigned int)read;
  if (copy >= sizeof(state->pageSource)) copy = sizeof(state->pageSource) - 1;
  memcpy(state->pageSource, html, copy);
  state->pageSource[copy] = 0;
  state->pageSourceBytes = copy;
  state->pageHasCanvas = awts_text_has(html, "<canvas");
  state->pageHasWebGl = awts_text_has(html, "getContext") || awts_text_has(html, "drawArrays(") || awts_text_has(html, "createShader(");
}

static int awts_write_temp_html(const char* html, char* outPath, size_t cap) {
  char tempDir[MAX_PATH];
  char tempFile[MAX_PATH];
  DWORD dirLen = GetTempPathA(sizeof(tempDir), tempDir);
  if (!dirLen || dirLen >= sizeof(tempDir)) return 0;
  if (!GetTempFileNameA(tempDir, "awt", 0, tempFile)) return 0;
  FILE* f = fopen(tempFile, "wb");
  if (!f) return 0;
  fwrite(html, 1, strlen(html), f);
  fclose(f);
  snprintf(outPath, cap, "%s", tempFile);
  return 1;
}

static int awts_compile_html_with_executor(AwtsBrowserState* state, const char* html, const char* url) {
  char htmlPath[MAX_PATH];
  char exePath[MAX_PATH];
  char exeDir[MAX_PATH];
  char helperPath[MAX_PATH];
  char command[4096];
  char line[2048];
  int inStream = 0;
  size_t used = 0;
  if (!awts_write_temp_html(html, htmlPath, sizeof(htmlPath))) {
    printf("awts-executor-compile-error stage=temp-write url=%s\n", url);
    fflush(stdout);
    return 0;
  }
  GetModuleFileNameA(NULL, exePath, sizeof(exePath));
  snprintf(exeDir, sizeof(exeDir), "%s", exePath);
  char* slash = strrchr(exeDir, '\\');
  if (slash) *slash = 0;
  snprintf(helperPath, sizeof(helperPath), "%s\\compileFetchedHtmlToRenderStream.mjs", exeDir);
  snprintf(command, sizeof(command), "node \"%s\" \"%s\" \"%s\"", helperPath, htmlPath, url);
  FILE* pipe = _popen(command, "r");
  state->dynamicRenderStream[0] = 0;
  state->dynamicRenderStreamBytes = 0;
  if (!pipe) {
    printf("awts-executor-compile-error stage=popen helper=%s url=%s\n", helperPath, url);
    DeleteFileA(htmlPath);
    fflush(stdout);
    return 0;
  }
  while (fgets(line, sizeof(line), pipe)) {
    if (strstr(line, "AWTS_EXECUTOR_RENDER_STREAM_BEGIN")) { inStream = 1; continue; }
    if (strstr(line, "AWTS_EXECUTOR_RENDER_STREAM_END")) { inStream = 0; continue; }
    if (inStream) {
      size_t len = strlen(line);
      if (used + len + 1 < sizeof(state->dynamicRenderStream)) {
        memcpy(state->dynamicRenderStream + used, line, len);
        used += len;
        state->dynamicRenderStream[used] = 0;
      }
    } else if (strstr(line, "\"ok\":true") || strstr(line, "dom")) {
      printf("awts-executor-compile-report %s", line);
    }
  }
  int exitCode = _pclose(pipe);
  DeleteFileA(htmlPath);
  state->dynamicRenderStreamBytes = (unsigned int)used;
  if (exitCode != 0 || used == 0) {
    printf("awts-executor-compile-error stage=node-exit code=%d bytes=%u url=%s helper=%s\n", exitCode, state->dynamicRenderStreamBytes, url, helperPath);
    fflush(stdout);
    return 0;
  }
  printf("awts-executor-compile-ok url=%s dom=executor-owned cHost=native-bindings-only streamBytes=%u helper=%s\n", url, state->dynamicRenderStreamBytes, helperPath);
  fflush(stdout);
  return 1;
}

static int load_http_preview(AwtsBrowserState* state, const char* url) {
  printf("awts-net-start url=%s local=%u\n", url, awts_url_is_local_http(url));
  fflush(stdout);
  HINTERNET session = InternetOpenA("MerkavaNativeBrowser/0.6", INTERNET_OPEN_TYPE_PRECONFIG, NULL, NULL, 0);
  if (!session) { printf("awts-net-error stage=InternetOpen url=%s\n", url); fflush(stdout); return 0; }
  HINTERNET handle = InternetOpenUrlA(session, url, NULL, 0, INTERNET_FLAG_RELOAD | INTERNET_FLAG_NO_CACHE_WRITE, 0);
  if (!handle) {
    printf("awts-net-error stage=InternetOpenUrl url=%s\n", url);
    fflush(stdout);
    InternetCloseHandle(session);
    return 0;
  }
  char buffer[3072];
  DWORD read = 0;
  memset(buffer, 0, sizeof(buffer));
  InternetReadFile(handle, buffer, sizeof(buffer) - 1, &read);
  buffer[read] = 0;
  InternetCloseHandle(handle);
  InternetCloseHandle(session);
  printf("awts-net-read url=%s bytes=%lu htmlHints canvas=%u webgl=%u drawArrays=%u local=%u\n",
    url, (unsigned long)read, awts_text_has(buffer, "<canvas"),
    awts_text_has(buffer, "getContext"), awts_text_has(buffer, "drawArrays("), awts_url_is_local_http(url));
  fflush(stdout);
  if (read > 0) {
    char visible[2048];
    awts_extract_visible_text(visible, sizeof(visible), buffer);
    awts_scan_webgl(&state->webgl, buffer);
    if (awts_compile_html_with_executor(state, buffer, url)) {
      printf("awts-route-decision route=network-executor-render-stream reason=merkava-executor-compiled-html url=%s sourceBytes=%lu streamBytes=%u\n", url, (unsigned long)read, state->dynamicRenderStreamBytes);
      set_page(state, "network-executor-render-stream", url, "dom=executor-owned cHost=native-bindings-only network HTML compiled by MerkavaExecutor");
      state->dynamicRenderStreamBytes = (unsigned int)strlen(state->dynamicRenderStream);
    } else if (awts_html_wants_webgl_executor(buffer)) {
      printf("awts-route-decision route=network-webgl-dynamic reason=webgl-dom-hints url=%s sourceBytes=%lu\n", url, (unsigned long)read);
      set_page(state, "network-webgl-dynamic", url, visible[0] ? visible : "dynamic WebGL document fetched from network");
    } else {
      printf("awts-route-decision route=network-html-dynamic reason=executor-compile-failed-fallback url=%s sourceBytes=%lu\n", url, (unsigned long)read);
      set_page(state, "network-html-dynamic", url, visible[0] ? visible : "dynamic HTML document fetched from network");
    }
    awts_set_dynamic_source(state, buffer, read);
    awts_print_webgl_table(&state->webgl);
  } else {
    printf("awts-route-decision route=network-text-preview reason=no-bytes url=%s\n", url);
    set_page(state, "network", url, buffer);
  }
  fflush(stdout);
  return read > 0;
}

static int load_file_preview(AwtsBrowserState* state, const char* path, const char* label) {
  AwtsTextFile f = awts_read_text_file(path);
  if (!f.data) return 0;
  set_page(state, "file", label ? label : path, f.data);
  free(f.data);
  return 1;
}

void awts_scan_webgl(AwtsWebGlCommandTable* out, const char* text) {
  memset(out, 0, sizeof(*out));
  out->viewport = awts_count_token(text, "viewport(");
  out->clearColor = awts_count_token(text, "clearColor(");
  out->clear = awts_count_token(text, "clear(");
  out->drawArrays = awts_count_token(text, "drawArrays(");
  out->createBuffer = awts_count_token(text, "createBuffer(");
  out->bindBuffer = awts_count_token(text, "bindBuffer(");
  out->bufferData = awts_count_token(text, "bufferData(");
  out->createShader = awts_count_token(text, "createShader(");
  out->shaderSource = awts_count_token(text, "shaderSource(");
  out->compileShader = awts_count_token(text, "compileShader(");
  out->createProgram = awts_count_token(text, "createProgram(");
  out->linkProgram = awts_count_token(text, "linkProgram(");
  out->useProgram = awts_count_token(text, "useProgram(");
}

void awts_print_webgl_table(const AwtsWebGlCommandTable* t) {
  printf("webgl-command-table: viewport=%u clearColor=%u clear=%u drawArrays=%u createBuffer=%u bindBuffer=%u bufferData=%u createShader=%u shaderSource=%u compileShader=%u createProgram=%u linkProgram=%u useProgram=%u\n",
    t->viewport, t->clearColor, t->clear, t->drawArrays, t->createBuffer, t->bindBuffer, t->bufferData,
    t->createShader, t->shaderSource, t->compileShader, t->createProgram, t->linkProgram, t->useProgram);
}

int awts_analyze_js(const char* path, int checkOnly) {
  AwtsTextFile file = awts_read_text_file(path);
  if (!file.data) { printf("B'H Merkava JS analyzer\nfile=%s error=not_found\n", path); return 2; }
  AwtsWebGlCommandTable webgl;
  awts_scan_webgl(&webgl, file.data);
  printf("B'H Merkava JS analyzer\n");
  printf("file=%s bytes=%ld lines=%u checkOnly=%d\n", path, file.size, awts_count_token(file.data, "\n") + 1, checkOnly);
  printf("syntax-surface: functions=%u classes=%u imports=%u requires=%u awaits=%u fetch=%u\n",
    awts_count_token(file.data, "function"), awts_count_token(file.data, "class "), awts_count_token(file.data, "import "),
    awts_count_token(file.data, "require("), awts_count_token(file.data, "await "), awts_count_token(file.data, "fetch("));
  printf("browser-surface: document=%u window=%u webgl=%u canvas=%u\n",
    awts_count_token(file.data, "document"), awts_count_token(file.data, "window"), awts_count_token(file.data, "webgl"), awts_count_token(file.data, "canvas"));
  printf("fs-surface: existsSync=%u readFileSync=%u statSync=%u readdirSync=%u\n",
    awts_count_token(file.data, "existsSync("), awts_count_token(file.data, "readFileSync("), awts_count_token(file.data, "statSync("), awts_count_token(file.data, "readdirSync("));
  awts_print_webgl_table(&webgl);
  if (contains_any_node_core_except_fs(file.data)) {
    printf("node-core-detected=true\n");
    printf("native-node-status=http/https/crypto/module-loader full execution not implemented in C yet; refusing to fake success\n");
    free(file.data);
    return checkOnly ? 0 : 7;
  }
  if (!checkOnly && execute_simple_fs_js(path, file.data)) { free(file.data); return 0; }
  printf("node-core-detected=%s\n", awts_text_has(file.data, "require('fs')") || awts_text_has(file.data, "require(\"fs\")") ? "fs-only" : "false");
  printf("merkava-bytecode-path=available-via-build-pipeline native-c-vm=partial\n");
  free(file.data);
  return 0;
}

int awts_analyze_html(const char* path, int checkOnly) {
  AwtsTextFile file = awts_read_text_file(path);
  if (!file.data) { printf("B'H Merkava HTML analyzer\nfile=%s error=not_found\n", path); return 2; }
  AwtsWebGlCommandTable webgl;
  awts_scan_webgl(&webgl, file.data);
  printf("B'H Merkava HTML analyzer\n");
  printf("file=%s bytes=%ld lines=%u checkOnly=%d\n", path, file.size, awts_count_token(file.data, "\n") + 1, checkOnly);
  printf("html-surface: scriptTags=%u linkTags=%u canvasTags=%u styleTags=%u\n",
    awts_count_token(file.data, "<script"), awts_count_token(file.data, "<link"), awts_count_token(file.data, "<canvas"), awts_count_token(file.data, "<style"));
  awts_print_webgl_table(&webgl);
  printf("dom-status=merkava-render-stream-required-no-waiting-fallback webgl-status=command-table-plus-opengl-smoke\n");
  free(file.data);
  return 0;
}

void awts_resolve_exe_relative_path(const char* name, char* out, size_t cap) {
  char exe[MAX_PATH];
  DWORD n = GetModuleFileNameA(NULL, exe, MAX_PATH);
  if (!n || n >= MAX_PATH) {
    snprintf(out, cap, "%s", name);
    return;
  }
  char* slash = strrchr(exe, '\\');
  if (slash) slash[1] = 0;
  snprintf(out, cap, "%s%s", exe, name);
}

int awts_load_merkava_file(AwtsBrowserState* state, const char* path) {
  AwtsMerkavaBytecode bytecode;
  int ok = awts_read_merkava_bytecode_file(path, &bytecode);
  state->bytecodeLen = bytecode.length;
  state->bytecodeOk = bytecode.ok;
  state->section = bytecode.section;
  state->version = bytecode.version;
  state->loaded = ok ? 1 : 0;
  awts_free_merkava_bytecode(&bytecode);
  return state->loaded;
}

void awts_print_help(void) {
  printf("B'H Merkava Native Browser / Runtime Executor\n");
  printf("Usage:\n");
  printf("  merkavaapp.exe                     boot embedded_executor.merkava and stay open\n");
  printf("  merkavaapp.exe --smoke             open browser shell briefly for tests\n");
  printf("  merkavaapp.exe sample.merkava      load Merkava bytecode\n");
  printf("  merkavaapp.exe --check file.js     parse/analyze JS/HTML/bytecode without launching browser\n");
  printf("  merkavaapp.exe file.js             run supported native JS patterns; report unsupported APIs\n");
  printf("  merkavaapp.exe file.html           analyze HTML entry, linked scripts, WebGL hints\n");
  printf("Native navigation: type URL/file path, Backspace edits, Enter navigates.\n");
}

void awts_print_runtime_report(void) {
  printf("---- embedded Merkava runtime report ----\n");
  printf("%s\n", AWTS_MERKAVA_REPORT_JSON);
  printf("---- native capabilities ----\n");
  printf("host=c-vm-os-opengl-primitives browser-intelligence=embedded-MerkavaExecutor-bytecode console=stdout bytecode-loader=fs\n");
  printf("navigation=host-binding-surface file/http-classification native-wininet-preview window-title-status\n");
  printf("diagnostic-render-model=temporary bytes=%u final-runtime=raw-merkava-bytecode\n", (unsigned int)strlen(AWTS_RENDER_MODEL_JSON));
  printf("node-native=fs-partial-pattern-executor http/https/crypto/module-loader not complete\n");
}

void awts_browser_set_url(AwtsBrowserState* state, const char* url) {
  strncpy(state->url, url && *url ? url : "file:///index.html", sizeof(state->url) - 1);
  state->url[sizeof(state->url) - 1] = 0;
}

void awts_browser_navigate(AwtsBrowserState* state) {
  state->navigations++;
  const char* url = state->url;
  printf("awts-nav-start id=%u url=%s currentKind=%s embeddedExecutorBytes=%u loaded=%d\n", state->navigations, url, state->pageKind, state->bytecodeLen, state->loaded);
  fflush(stdout);
  if (!strncmp(url, "http://", 7) || !strncmp(url, "https://", 8)) {
    int ok = load_http_preview(state, url);
    snprintf(state->statusText, sizeof(state->statusText), "%s: %s", ok ? "network loaded" : "network failed", url);
  } else {
    const char* path = url;
    if (!strncmp(url, "file://", 7)) path = url + 7;
    if (!strcmp(path, "/") || !strcmp(path, "/index.html") || !strcmp(path, "index.html")) {
      char samplePath[MAX_PATH];
      awts_resolve_exe_relative_path("sample.merkava", samplePath, sizeof(samplePath));
      int loaded = awts_load_merkava_file(state, samplePath);
      printf("awts-bytecode-load target=sample.merkava path=%s ok=%d bytes=%u section=%u version=%u\n", samplePath, loaded, state->bytecodeLen, state->section, state->version);
      fflush(stdout);
      snprintf(state->statusText, sizeof(state->statusText), loaded ? "loaded MerkavaExecutor render stream: /index.html" : "missing MerkavaExecutor bytecode: /index.html");
      snprintf(state->pageKind, sizeof(state->pageKind), "merkava-executor-render-stream");
      snprintf(state->pageTitle, sizeof(state->pageTitle), "/index.html");
      snprintf(state->pagePreview, sizeof(state->pagePreview), "render ops generated by MerkavaExecutor; C only maps them to OpenGL");
      awts_scan_webgl(&state->webgl, AWTS_SAMPLE_JS);
    } else if (!strcmp(path, "/browser-shell.html") || !strcmp(path, "browser-shell.html")) {
      snprintf(state->statusText, sizeof(state->statusText), "loaded embedded shell: /browser-shell.html");
      set_page(state, "embedded-html", "/browser-shell.html", AWTS_SHELL_HTML);
      awts_scan_webgl(&state->webgl, AWTS_SHELL_JS);
    } else {
      int ok = load_file_preview(state, path, url);
      snprintf(state->statusText, sizeof(state->statusText), "%s: %s", ok ? "loaded" : "missing", url);
    }
  }
  printf("awts-nav-final id=%u url=%s status=%s pageKind=%s title=%s loaded=%d bytecodeOk=%u previewBytes=%u\n",
    state->navigations, state->url, state->statusText, state->pageKind, state->pageTitle,
    state->loaded, state->bytecodeOk, (unsigned int)strlen(state->pagePreview));
  awts_print_webgl_table(&state->webgl);
  if (state->verbose || state->smokeMode) {
    printf("navigation[%u]=%s status=%s\n", state->navigations, state->url, state->statusText);
  }
  fflush(stdout);
}

void awts_browser_backspace(AwtsBrowserState* state) {
  size_t n = strlen(state->url);
  if (n > 0) state->url[n - 1] = 0;
}

void awts_browser_append_char(AwtsBrowserState* state, char c) {
  size_t n = strlen(state->url);
  if (n + 1 < sizeof(state->url) && c >= 32 && c < 127) {
    state->url[n] = c;
    state->url[n + 1] = 0;
  }
}

int awts_browser_address_hit(const AwtsBrowserState* state, int x, int y) {
  return x >= awts_browser_address_left(state) && x <= awts_browser_address_right(state) &&
         y >= awts_browser_address_top(state) && y <= awts_browser_address_bottom(state);
}

int awts_browser_address_left(const AwtsBrowserState* state) { (void)state; return 170; }
int awts_browser_address_right(const AwtsBrowserState* state) { return state->width - 60; }
int awts_browser_address_top(const AwtsBrowserState* state) { (void)state; return 36; }
int awts_browser_address_bottom(const AwtsBrowserState* state) { (void)state; return 64; }

void awts_browser_update_cursor(HWND hwnd, AwtsBrowserState* state, int x, int y) {
  state->mouseX = x;
  state->mouseY = y;
  state->hoverAddress = awts_browser_address_hit(state, x, y);
  SetCursor(LoadCursor(NULL, state->hoverAddress ? IDC_IBEAM : IDC_ARROW));
}

void awts_browser_update_window_title(HWND hwnd, const AwtsBrowserState* state) {
  char title[768];
  snprintf(title, sizeof(title), "B'H Merkava Browser | %s | %s", state->url, state->statusText);
  SetWindowTextA(hwnd, title);
}
