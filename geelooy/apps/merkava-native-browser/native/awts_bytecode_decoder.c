/* B"H */
#include "include/awts_native_browser.h"

typedef struct Md2Reader {
  unsigned char* data;
  size_t len;
  size_t off;
} Md2Reader;

typedef struct Md2Pool {
  char values[64][128];
  unsigned int count;
} Md2Pool;

static unsigned int r_u8(Md2Reader* r) { return r->off < r->len ? r->data[r->off++] : 0; }
static void r_bytes(Md2Reader* r, unsigned char* out, size_t n) {
  for (size_t i = 0; i < n; i++) out[i] = (unsigned char)r_u8(r);
}
static unsigned int r_var(Md2Reader* r) {
  unsigned int value = 0;
  int shift = 0;
  while (r->off < r->len && shift < 28) {
    unsigned int b = r_u8(r);
    value |= (b & 0x7f) << shift;
    if (!(b & 0x80)) break;
    shift += 7;
  }
  return value;
}
static void r_text(Md2Reader* r, char* out, size_t cap) {
  unsigned int n = r_var(r);
  size_t take = n < cap - 1 ? n : cap - 1;
  for (size_t i = 0; i < take; i++) out[i] = (char)r_u8(r);
  out[take] = 0;
  for (unsigned int i = (unsigned int)take; i < n; i++) r_u8(r);
}
static Md2Reader r_slice(Md2Reader* r) {
  unsigned int n = r_var(r);
  Md2Reader out;
  out.data = r->data + r->off;
  out.len = (r->off + n <= r->len) ? n : (r->len - r->off);
  out.off = 0;
  r->off += n;
  if (r->off > r->len) r->off = r->len;
  return out;
}

static const char* native_word(unsigned int index) {
  switch (index) {
    case 0: return "";
    case 20: return "main";
    case 80: return "canvas";
    case 95: return "button";
    case 105: return "output";
    case 173: return "width";
    case 174: return "height";
    default: return "";
  }
}

static void pool_read_raw(Md2Reader* r, Md2Pool* pool) {
  pool->count = r_var(r);
  if (pool->count > 64) pool->count = 64;
  for (unsigned int i = 0; i < pool->count; i++) r_text(r, pool->values[i], sizeof(pool->values[i]));
}

static void pool_read_delta(Md2Reader* r, Md2Pool* pool) {
  pool->count = r_var(r);
  if (pool->count > 64) pool->count = 64;
  char prev[128] = {0};
  for (unsigned int i = 0; i < pool->count; i++) {
    unsigned int prefix = r_var(r);
    char suffix[128];
    r_text(r, suffix, sizeof(suffix));
    snprintf(pool->values[i], sizeof(pool->values[i]), "%.*s%s", (int)prefix, prev, suffix);
    snprintf(prev, sizeof(prev), "%s", pool->values[i]);
  }
}

static const char* read_ref(Md2Reader* r, Md2Pool* pool, char* scratch, size_t cap) {
  unsigned int type = r_u8(r);
  unsigned int idx = r_var(r);
  if (type == 0) return native_word(idx);
  if (type == 1 && idx < pool->count) return pool->values[idx];
  snprintf(scratch, cap, "");
  return scratch;
}

static void read_value(Md2Reader* r, Md2Pool* pool, char* out, size_t cap) {
  unsigned int type = r_u8(r);
  if (type == 2) { snprintf(out, cap, "true"); return; }
  if (type == 3) { snprintf(out, cap, "false"); return; }
  if (type == 4) { snprintf(out, cap, "%u", r_var(r)); return; }
  if (type == 5) { unsigned int n = r_var(r); unsigned int unit = r_var(r); snprintf(out, cap, "%u%s", n, unit == 1 ? "%%" : "px"); return; }
  if (type == 6) { unsigned int rr = r_u8(r), g = r_u8(r), b = r_u8(r); snprintf(out, cap, "rgb(%u,%u,%u)", rr,g,b); return; }
  if (type == 0 || type == 1) {
    r->off -= 1;
    char scratch[128];
    const char* s = read_ref(r, pool, scratch, sizeof(scratch));
    snprintf(out, cap, "%s", s);
    return;
  }
  snprintf(out, cap, "");
}

static AwtsDomNode* push_decoded_node(AwtsDomTree* tree) {
  if (tree->count >= AWTS_DOM_NODES) return NULL;
  AwtsDomNode* n = &tree->nodes[tree->count++];
  memset(n, 0, sizeof(*n));
  return n;
}

static int load_file_bytes(const char* path, unsigned char** out, size_t* len) {
  FILE* f = fopen(path, "rb");
  if (!f) return 0;
  fseek(f, 0, SEEK_END);
  long n = ftell(f);
  fseek(f, 0, SEEK_SET);
  if (n <= 0) { fclose(f); return 0; }
  unsigned char* b = (unsigned char*)malloc((size_t)n);
  if (!b) { fclose(f); return 0; }
  fread(b, 1, (size_t)n, f);
  fclose(f);
  *out = b;
  *len = (size_t)n;
  return 1;
}

int awts_decode_merkava_dom_file(AwtsBrowserState* state, const char* path) {
  unsigned char* bytes = NULL;
  size_t len = 0;
  if (!load_file_bytes(path, &bytes, &len)) return 0;
  Md2Reader r = { bytes, len, 0 };
  if (len < 5 || r_u8(&r) != 'M' || r_u8(&r) != 'D' || r_u8(&r) != '2' || r_u8(&r) != 0) { free(bytes); return 0; }
  unsigned int version = r_u8(&r);
  Md2Pool pool;
  memset(&pool, 0, sizeof(pool));
  if (version >= 4) {
    unsigned int kind = r_u8(&r);
    if (kind == 1) pool_read_delta(&r, &pool);
    else pool_read_raw(&r, &pool);
  } else {
    pool_read_raw(&r, &pool);
  }
  unsigned int selectorCount = r_var(&r);
  for (unsigned int i = 0; i < selectorCount; i++) {
    unsigned int tokCount = r_var(&r);
    for (unsigned int j = 0; j < tokCount; j++) r_var(&r);
  }
  Md2Reader body = r_slice(&r);
  memset(&state->dom, 0, sizeof(state->dom));
  state->dom.canvasIndex = state->dom.buttonIndex = state->dom.outputIndex = -1;
  unsigned int templateCount = r_var(&body);
  for (unsigned int i = 0; i < templateCount; i++) {
    char scratch[128];
    read_ref(&body, &pool, scratch, sizeof(scratch));
    read_ref(&body, &pool, scratch, sizeof(scratch));
    unsigned int ac = r_var(&body);
    for (unsigned int a = 0; a < ac; a++) {
      read_ref(&body, &pool, scratch, sizeof(scratch));
      char val[128]; read_value(&body, &pool, val, sizeof(val));
    }
  }
  unsigned int records = r_var(&body);
  for (unsigned int i = 0; i < records && body.off < body.len; i++) {
    unsigned int op = r_u8(&body);
    if (op != 1) break;
    char scratch[128];
    const char* tag = read_ref(&body, &pool, scratch, sizeof(scratch));
    const char* id = read_ref(&body, &pool, scratch, sizeof(scratch));
    read_ref(&body, &pool, scratch, sizeof(scratch));
    char text[AWTS_DOM_TEXT];
    read_value(&body, &pool, text, sizeof(text));
    AwtsDomNode* n = push_decoded_node(&state->dom);
    if (!n) break;
    snprintf(n->tag, sizeof(n->tag), "%s", tag);
    snprintf(n->id, sizeof(n->id), "%s", id);
    snprintf(n->text, sizeof(n->text), "%s", text);
    unsigned int ac = r_var(&body);
    for (unsigned int a = 0; a < ac; a++) {
      const char* attr = read_ref(&body, &pool, scratch, sizeof(scratch));
      char val[128]; read_value(&body, &pool, val, sizeof(val));
      if (!strcmp(attr, "width") || !strcmp(attr, "height")) {
        if (n->text[0]) strncat(n->text, " ", sizeof(n->text) - strlen(n->text) - 1);
      }
    }
    if (!strcmp(n->tag, "canvas")) state->dom.canvasIndex = state->dom.count - 1;
    if (!strcmp(n->tag, "button")) state->dom.buttonIndex = state->dom.count - 1;
    if (!strcmp(n->tag, "output")) state->dom.outputIndex = state->dom.count - 1;
  }
  snprintf(state->pageKind, sizeof(state->pageKind), "merkava-bytecode-dom");
  snprintf(state->pageTitle, sizeof(state->pageTitle), "%s", path);
  snprintf(state->pagePreview, sizeof(state->pagePreview), "decoded from raw MD2 bytes: nodes=%d", state->dom.count);
  unsigned int styleCount = r_var(&body);
  for (unsigned int s = 0; s < styleCount && body.off < body.len; s++) {
    unsigned int sop = r_u8(&body);
    if (sop == 7 || sop == 8) {
      if (sop == 8) { unsigned int stream = r_var(&body); for (unsigned int k = 0; k < stream; k++) { r_var(&body); Md2Reader skip = r_slice(&body); (void)skip; } }
      else { r_var(&body); Md2Reader skip = r_slice(&body); (void)skip; }
    } else if (sop == 3) {
      r_var(&body);
      unsigned int pc = r_var(&body);
      for (unsigned int p = 0; p < pc; p++) { char scratch[128]; read_ref(&body, &pool, scratch, sizeof(scratch)); char val[128]; read_value(&body, &pool, val, sizeof(val)); }
    }
  }
  while (body.off < body.len) {
    unsigned int op = r_u8(&body);
    if (op == 0) break;
    if (op == 4) {
      unsigned int kind = r_u8(&body);
      if (kind == 1) {
        char scratch[128];
        const char* target = read_ref(&body, &pool, scratch, sizeof(scratch));
        char value[AWTS_DOM_TEXT];
        read_value(&body, &pool, value, sizeof(value));
        for (int i = 0; i < state->dom.count; i++) if (!strcmp(state->dom.nodes[i].id, target)) snprintf(state->dom.nodes[i].text, sizeof(state->dom.nodes[i].text), "%s", value);
      } else if (kind == 2) {
        char scratch[128];
        const char* target = read_ref(&body, &pool, scratch, sizeof(scratch));
        (void)target;
        state->webgl.viewport = 1;
        r_var(&body); r_var(&body); r_var(&body); r_var(&body);
        state->webgl.clearColor = 1;
        r_var(&body); r_var(&body); r_var(&body); r_var(&body);
        state->webgl.clear = 1;
        state->webgl.drawArrays = 1;
        r_var(&body); r_var(&body);
        if (state->dom.outputIndex >= 0) snprintf(state->dom.nodes[state->dom.outputIndex].text, sizeof(state->dom.nodes[state->dom.outputIndex].text), "drawn by raw bytecode WebGL ops");
      } else {
        unsigned int base = r_var(&body), extra = r_var(&body), yc = r_var(&body), sum = base + extra;
        for (unsigned int y = 0; y < yc; y++) sum += r_var(&body);
        char label[128], suffix[128]; read_value(&body, &pool, label, sizeof(label)); read_value(&body, &pool, suffix, sizeof(suffix));
        unsigned int tc = r_var(&body);
        for (unsigned int t = 0; t < tc; t++) {
          char scratch[128]; const char* target = read_ref(&body, &pool, scratch, sizeof(scratch));
          for (int i = 0; i < state->dom.count; i++) if (!strcmp(state->dom.nodes[i].id, target)) snprintf(state->dom.nodes[i].text, sizeof(state->dom.nodes[i].text), "%s:%u%s%s", label, sum, suffix[0] ? ":" : "", suffix);
        }
      }
    } else if (op == 10 || op == 11) { Md2Reader skip = r_slice(&body); (void)skip; }
    else break;
  }
  if (state->dom.outputIndex >= 0 && !state->dom.nodes[state->dom.outputIndex].text[0]) snprintf(state->dom.nodes[state->dom.outputIndex].text, sizeof(state->dom.nodes[state->dom.outputIndex].text), "drawn by raw bytecode DOM");
  free(bytes);
  return state->dom.count > 0;
}
