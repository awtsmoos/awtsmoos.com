// B"H
#include "awtai_quant_q4k.h"
#include "awtai_quant_common.h"

int awtai_q4_k_row_bytes(int cols) { return ((cols + 255) / 256) * 144; }

static void scale_min(const uint8_t *b, int off, int j, int *s, int *m) {
  if (j < 4) { *s = b[off + j] & 63; *m = b[off + j + 4] & 63; return; }
  *s = (b[off + j + 4] & 15) | ((b[off + j - 4] >> 6) << 4);
  *m = (b[off + j + 4] >> 4) | ((b[off + j] >> 6) << 4);
}

float awtai_dot_q4_k(const uint8_t *row, int cols, const float *x) {
  float sum = 0.0f;
  int p = 0;
  for (int base = 0; base < cols; base += 256) {
    float d = aw_f16(row + p), dm = aw_f16(row + p + 2); p += 4;
    int scales = p; p += 12;
    int qs = p; p += 128;
    for (int group = 0; group < 4; group++) {
      int s0, m0, s1, m1;
      scale_min(row, scales, 2 * group, &s0, &m0);
      scale_min(row, scales, 2 * group + 1, &s1, &m1);
      for (int l = 0; l < 32; l++) {
        uint8_t q = row[qs + group * 32 + l];
        int i0 = base + group * 64 + l, i1 = i0 + 32;
        if (i0 < cols) sum += (d * (float)s0 * (float)(q & 15) - dm * (float)m0) * x[i0];
        if (i1 < cols) sum += (d * (float)s1 * (float)(q >> 4) - dm * (float)m1) * x[i1];
      }
    }
  }
  return sum;
}

void awtai_project_q4_k(const uint8_t *raw, int rows, int cols, const float *x, float *y) {
  int stride = awtai_q4_k_row_bytes(cols);
  for (int r = 0; r < rows; r++) y[r] = awtai_dot_q4_k(raw + (long long)r * stride, cols, x);
}
