// B"H
#ifndef AWTAI_NATIVE_ATTENTION_H
#define AWTAI_NATIVE_ATTENTION_H
#include <stdint.h>

typedef struct AwtaiAttentionSession AwtaiAttentionSession;

AwtaiAttentionSession *awtai_attention_create(int layers, int capacity, int kv_size);
void awtai_attention_destroy(AwtaiAttentionSession *s);
void awtai_attention_reset(AwtaiAttentionSession *s);
int awtai_attention_step(
  AwtaiAttentionSession *s, int layer, int pos,
  const float *q, const float *k, const float *v, float *out,
  int heads, int kv_heads, int head_dim, int kv_group,
  float rope_base, float rope_scale, int rope_is_neox
);
int awtai_attention_pages(AwtaiAttentionSession *s, int layer);

#endif
