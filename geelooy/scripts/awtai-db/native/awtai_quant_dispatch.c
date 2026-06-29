// B"H
#include "awtai_quant_dispatch.h"
#include "awtai_quant_q2k.h"
#include "awtai_quant_q3k.h"
#include "awtai_quant_q4k.h"
#include "awtai_quant_q6k.h"

int awtai_row_bytes(int type, int cols) {
  switch (type) {
    case 10: return awtai_q2_k_row_bytes(cols);
    case 11: return awtai_q3_k_row_bytes(cols);
    case 12: return awtai_q4_k_row_bytes(cols);
    case 14: return awtai_q6_k_row_bytes(cols);
    default: return 0;
  }
}

int awtai_type_supported(int type) {
  return type == 10 || type == 11 || type == 12 || type == 14;
}

float awtai_dot_row(int type, const uint8_t *row, int cols, const float *x) {
  switch (type) {
    case 10: return awtai_dot_q2_k(row, cols, x);
    case 11: return awtai_dot_q3_k(row, cols, x);
    case 12: return awtai_dot_q4_k(row, cols, x);
    case 14: return awtai_dot_q6_k(row, cols, x);
    default: return 0.0f;
  }
}

int awtai_project_range(int type, const uint8_t *raw, int start, int end, int cols, const float *x, float *y) {
  int stride = awtai_row_bytes(type, cols);
  if (!stride || start < 0 || end < start) return 0;
  for (int r = start; r < end; r++) y[r] = awtai_dot_row(type, raw + (long long)r * stride, cols, x);
  return 1;
}

int awtai_project(int type, const uint8_t *raw, int rows, int cols, const float *x, float *y) {
  return awtai_project_range(type, raw, 0, rows, cols, x, y);
}
