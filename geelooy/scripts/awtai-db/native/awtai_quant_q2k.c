// B"H
#include "awtai_quant_q2k.h"
#include "awtai_quant_common.h"

int awtai_q2_k_row_bytes(int cols) { return ((cols + 255) / 256) * 84; }

static float half_dot(const uint8_t *b, const float *x, int base, int scales, int qs, float d, float dm, int n, int sb) {
  float sum = 0.0f;
  for (int i = 0; i < 32; i++) {
    uint8_t by = b[qs + i];
    int is = sb + (i >> 4);
    for (int z = 0; z < 4; z++) {
      int idx = base + i + 32 * z;
      if (idx >= n) continue;
      uint8_t sc = b[scales + is + 2 * z];
      float q = (float)((by >> (2 * z)) & 3);
      sum += (d * (float)(sc & 15) * q - dm * (float)(sc >> 4)) * x[idx];
    }
  }
  return sum;
}

float awtai_dot_q2_k(const uint8_t *row, int cols, const float *x) {
  float sum = 0.0f;
  int p = 0;
  for (int base = 0; base < cols; base += 256) {
    int scales = p; p += 16;
    int qs = p; p += 64;
    float d = aw_f16(row + p), dm = aw_f16(row + p + 2); p += 4;
    sum += half_dot(row, x, base, scales, qs, d, dm, cols, 0);
    sum += half_dot(row, x, base + 128, scales, qs + 32, d, dm, cols, 8);
  }
  return sum;
}

void awtai_project_q2_k(const uint8_t *raw, int rows, int cols, const float *x, float *y) {
  int stride = awtai_q2_k_row_bytes(cols);
  for (int r = 0; r < rows; r++) y[r] = awtai_dot_q2_k(raw + (long long)r * stride, cols, x);
}
