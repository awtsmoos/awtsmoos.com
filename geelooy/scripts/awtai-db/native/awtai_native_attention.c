// B"H
#include "awtai_native_attention.h"
#include <math.h>
#include <stdlib.h>
#include <string.h>

typedef struct { int count, capacity; int *pos; float *k; float *v; } AwtaiAttentionLayer;
struct AwtaiAttentionSession { int layers, capacity, kv_size; AwtaiAttentionLayer *layer; };

static void zero(float *x, int n) { for (int i = 0; i < n; i++) x[i] = 0.0f; }
static int ok_layer(AwtaiAttentionSession *s, int layer) { return s && layer >= 0 && layer < s->layers; }

AwtaiAttentionSession *awtai_attention_create(int layers, int capacity, int kv_size) {
  if (layers <= 0 || capacity <= 0 || kv_size <= 0) return 0;
  AwtaiAttentionSession *s = (AwtaiAttentionSession *)calloc(1, sizeof(*s));
  if (!s) return 0;
  s->layers = layers; s->capacity = capacity; s->kv_size = kv_size;
  s->layer = (AwtaiAttentionLayer *)calloc((size_t)layers, sizeof(*s->layer));
  if (!s->layer) { free(s); return 0; }
  for (int i = 0; i < layers; i++) {
    AwtaiAttentionLayer *l = &s->layer[i];
    l->capacity = capacity;
    l->pos = (int *)calloc((size_t)capacity, sizeof(int));
    l->k = (float *)calloc((size_t)capacity * (size_t)kv_size, sizeof(float));
    l->v = (float *)calloc((size_t)capacity * (size_t)kv_size, sizeof(float));
    if (!l->pos || !l->k || !l->v) { awtai_attention_destroy(s); return 0; }
  }
  return s;
}

void awtai_attention_destroy(AwtaiAttentionSession *s) {
  if (!s) return;
  for (int i = 0; i < s->layers; i++) { free(s->layer[i].pos); free(s->layer[i].k); free(s->layer[i].v); }
  free(s->layer); free(s);
}

void awtai_attention_reset(AwtaiAttentionSession *s) {
  if (!s) return;
  for (int i = 0; i < s->layers; i++) s->layer[i].count = 0;
}

static void rotate(float *x, int heads, int head_dim, int pos, float base, float scale, int neox) {
  int half = head_dim / 2; if (base <= 0) base = 10000.0f;
  for (int h = 0; h < heads; h++) for (int i = 0; i < half; i++) {
    float theta = (float)pos * scale * powf(base, -2.0f * (float)i / (float)head_dim);
    float c = cosf(theta), s = sinf(theta);
    int off = h * head_dim, a = neox ? off + i : off + 2 * i, b = neox ? off + i + half : off + 2 * i + 1;
    float first = x[a], second = x[b]; x[a] = first * c - second * s; x[b] = first * s + second * c;
  }
}

static int append(AwtaiAttentionSession *s, int layer, int pos, const float *k, const float *v) {
  AwtaiAttentionLayer *l = &s->layer[layer];
  if (l->count >= l->capacity) return 0;
  int slot = l->count++;
  l->pos[slot] = pos;
  memcpy(l->k + (size_t)slot * s->kv_size, k, (size_t)s->kv_size * sizeof(float));
  memcpy(l->v + (size_t)slot * s->kv_size, v, (size_t)s->kv_size * sizeof(float));
  return 1;
}

static void attend(AwtaiAttentionSession *s, int layer, const float *q, float *out, int heads, int kv_heads, int head_dim, int kv_group) {
  AwtaiAttentionLayer *l = &s->layer[layer]; float scale = 1.0f / sqrtf((float)head_dim);
  float *scores = (float *)malloc((size_t)l->count * sizeof(float)); if (!scores) return;
  zero(out, heads * head_dim);
  for (int h = 0; h < heads; h++) {
    int kvh = h / kv_group; if (kvh >= kv_heads) kvh = kv_heads - 1;
    float max = -3.402823466e+38F, sum = 0.0f;
    for (int p = 0; p < l->count; p++) {
      float dot = 0.0f; const float *kp = l->k + (size_t)p * s->kv_size + kvh * head_dim;
      for (int d = 0; d < head_dim; d++) dot += q[h * head_dim + d] * kp[d];
      scores[p] = dot * scale; if (scores[p] > max) max = scores[p];
    }
    for (int p = 0; p < l->count; p++) { scores[p] = expf(scores[p] - max); sum += scores[p]; }
    if (sum == 0.0f) sum = 1.0f;
    for (int p = 0; p < l->count; p++) {
      const float *vp = l->v + (size_t)p * s->kv_size + kvh * head_dim; float w = scores[p] / sum;
      for (int d = 0; d < head_dim; d++) out[h * head_dim + d] += w * vp[d];
    }
  }
  free(scores);
}

int awtai_attention_step(AwtaiAttentionSession *s, int layer, int pos, const float *q, const float *k, const float *v, float *out, int heads, int kv_heads, int head_dim, int kv_group, float rope_base, float rope_scale, int rope_is_neox) {
  if (!ok_layer(s, layer) || !q || !k || !v || !out || heads <= 0 || kv_heads <= 0 || head_dim <= 0 || kv_group <= 0) return 0;
  int hidden = heads * head_dim, kv_size = kv_heads * head_dim; if (kv_size != s->kv_size) return 0;
  float *qr = (float *)malloc((size_t)hidden * sizeof(float)); float *kr = (float *)malloc((size_t)kv_size * sizeof(float));
  if (!qr || !kr) { free(qr); free(kr); return 0; }
  memcpy(qr, q, (size_t)hidden * sizeof(float)); memcpy(kr, k, (size_t)kv_size * sizeof(float));
  rotate(qr, heads, head_dim, pos, rope_base, rope_scale, rope_is_neox); rotate(kr, kv_heads, head_dim, pos, rope_base, rope_scale, rope_is_neox);
  int ok = append(s, layer, pos, kr, v); if (ok) attend(s, layer, qr, out, heads, kv_heads, head_dim, kv_group);
  free(qr); free(kr); return ok;
}

int awtai_attention_pages(AwtaiAttentionSession *s, int layer) { return ok_layer(s, layer) ? s->layer[layer].count : 0; }
