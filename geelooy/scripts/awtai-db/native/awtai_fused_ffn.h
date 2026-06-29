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

#endif
