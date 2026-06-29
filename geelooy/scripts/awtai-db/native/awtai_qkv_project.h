// B"H
#ifndef AWTAI_QKV_PROJECT_H
#define AWTAI_QKV_PROJECT_H

#include <stdint.h>

/*
 * B"H
 * Three rays leave one hidden source.  This is not yet the full native layer,
 * but it gathers q, k, and v behind one native gate so JavaScript stops
 * knocking three times at the same palace door.
 */
int awtai_project_qkv(
  int q_type, const uint8_t *q_raw, int q_rows, int q_cols,
  int k_type, const uint8_t *k_raw, int k_rows, int k_cols,
  int v_type, const uint8_t *v_raw, int v_rows, int v_cols,
  const float *x, float *q_out, float *k_out, float *v_out,
  int threads
);

int awtai_project_qkv_from_base(
  const uint8_t *base, uint64_t size,
  uint64_t q_offset, int q_type, int q_rows,
  uint64_t k_offset, int k_type, int k_rows,
  uint64_t v_offset, int v_type, int v_rows,
  int cols, const float *x,
  float *q_out, float *k_out, float *v_out,
  int threads
);

#endif
