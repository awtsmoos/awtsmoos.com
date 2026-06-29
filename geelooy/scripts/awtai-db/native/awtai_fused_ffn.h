// B"H
#ifndef AWTAI_FUSED_FFN_H
#define AWTAI_FUSED_FFN_H
#include <stdint.h>

int awtai_fused_ffn(
  int gate_type, const uint8_t *gate_raw,
  int up_type, const uint8_t *up_raw,
  int down_type, const uint8_t *down_raw,
  int hidden, int ffn, const float *x, float *y, int threads
);

int awtai_fused_ffn_from_base(
  const uint8_t *base, uint64_t size,
  uint64_t gate_offset, int gate_type,
  uint64_t up_offset, int up_type,
  uint64_t down_offset, int down_type,
  int hidden, int ffn, const float *x, float *y, int threads
);

#endif
