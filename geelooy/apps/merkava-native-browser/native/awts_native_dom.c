/* B"H */
#include "include/awts_native_browser.h"

static void copy_token(char* out, size_t cap, const char* start, const char* end) {
  size_t n = 0;
  while (start && start < end && n + 1 < cap) {
    char c = *start++;
    if (isalnum((unsigned char)c) || c == '-' || c == '_' || c == ':') out[n++] = c;
  }
  out[n] = 0;
}

static void copy_attr(char* out, size_t cap, const char* tag, const char* name) {
  out[0] = 0;
  const char* p = strstr(tag, name);
  if (!p) return;
  p += strlen(name);
  while (*p && *p != '=') p++;
  if (*p != '=') return;
  p++;
  while (*p == ' ') p++;
  char q = *p == '\'' || *p == '"' ? *p++ : ' ';
  size_t n = 0;
  while (*p && n + 1 < cap) {
    if ((q != ' ' && *p == q) || (q == ' ' && isspace((unsigned char)*p))) break;
    out[n++] = *p++;
  }
  out[n] = 0;
}

static int is_void_tag(const char* tag) {
  return !strcmp(tag, "canvas") || !strcmp(tag, "input") || !strcmp(tag, "br") || !strcmp(tag, "img") || !strcmp(tag, "link") || !strcmp(tag, "meta");
}

static void trim_copy_text(char* out, size_t cap, const char* start, const char* end) {
  while (start < end && isspace((unsigned char)*start)) start++;
  while (end > start && isspace((unsigned char)*(end - 1))) end--;
  size_t n = 0;
  int lastSpace = 0;
  while (start < end && n + 1 < cap) {
    char c = *start++;
    if (isspace((unsigned char)c)) {
      if (lastSpace) continue;
      c = ' ';
      lastSpace = 1;
    } else {
      lastSpace = 0;
    }
    out[n++] = c;
  }
  out[n] = 0;
}

static AwtsDomNode* push_node(AwtsDomTree* tree) {
  if (tree->count >= AWTS_DOM_NODES) return NULL;
  AwtsDomNode* n = &tree->nodes[tree->count++];
  memset(n, 0, sizeof(*n));
  return n;
}

void awts_dom_parse(AwtsDomTree* tree, const char* html) {
  memset(tree, 0, sizeof(*tree));
  tree->canvasIndex = -1;
  tree->buttonIndex = -1;
  tree->outputIndex = -1;
  int depth = 0;
  const char* p = html ? html : "";
  while (*p && tree->count < AWTS_DOM_NODES) {
    const char* lt = strchr(p, '<');
    if (!lt) break;
    if (lt > p) {
      char text[AWTS_DOM_TEXT];
      trim_copy_text(text, sizeof(text), p, lt);
      if (text[0]) {
        AwtsDomNode* node = push_node(tree);
        if (node) {
          strcpy(node->tag, "#text");
          strncpy(node->text, text, sizeof(node->text) - 1);
          node->depth = depth;
        }
      }
    }
    const char* gt = strchr(lt, '>');
    if (!gt) break;
    if (lt[1] == '!' || lt[1] == '?') { p = gt + 1; continue; }
    int closing = lt[1] == '/';
    const char* nameStart = lt + (closing ? 2 : 1);
    while (*nameStart && isspace((unsigned char)*nameStart)) nameStart++;
    const char* nameEnd = nameStart;
    while (nameEnd < gt && (isalnum((unsigned char)*nameEnd) || *nameEnd == '-' || *nameEnd == '_')) nameEnd++;
    char tag[32];
    copy_token(tag, sizeof(tag), nameStart, nameEnd);
    if (closing) {
      if (depth > 0) depth--;
      p = gt + 1;
      continue;
    }
    AwtsDomNode* node = push_node(tree);
    if (node) {
      strncpy(node->tag, tag, sizeof(node->tag) - 1);
      node->depth = depth;
      node->isVoid = is_void_tag(tag);
      char tagText[512];
      size_t len = (size_t)(gt - lt + 1);
      if (len >= sizeof(tagText)) len = sizeof(tagText) - 1;
      memcpy(tagText, lt, len);
      tagText[len] = 0;
      copy_attr(node->id, sizeof(node->id), tagText, "id");
      if (!strcmp(tag, "canvas")) tree->canvasIndex = tree->count - 1;
      if (!strcmp(tag, "button")) tree->buttonIndex = tree->count - 1;
      if (!strcmp(tag, "output")) tree->outputIndex = tree->count - 1;
    }
    if (!is_void_tag(tag) && gt > lt && *(gt - 1) != '/') depth++;
    p = gt + 1;
  }
}

void awts_dom_apply_sample_script(AwtsBrowserState* state) {
  if (!state) return;
  if (state->dom.outputIndex >= 0 && state->dom.outputIndex < state->dom.count) {
    AwtsDomNode* out = &state->dom.nodes[state->dom.outputIndex];
    snprintf(out->text, sizeof(out->text), "drawn by native DOM+WebGL bridge");
  }
  awts_scan_webgl(&state->webgl, AWTS_SAMPLE_JS);
}
