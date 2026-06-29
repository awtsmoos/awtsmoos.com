// B"H
#include "awtai_quant_q3k.h"
#include "awtai_quant_common.h"
#include <string.h>

int awtai_q3_k_row_bytes(int cols) { return ((cols + 255) / 256) * 110; }

static float group_dot(const uint8_t *b, const float *x, int base, int q, int hm, int mask, int shift, float d, int n) {
  float sum = 0.0f;
  for (int l = 0; l < 16; l++) {
    int idx = base + l;
    if (idx < n) sum += d * (float)(((b[q + l] >> shift) & 3) - ((b[hm + l] & mask) ? 0 : 4)) * x[idx];
  }
  return sum;
}

static float block_dot(const uint8_t *b, const float *x, int base, int hmask, int qs, uint8_t *scales, float d, int n) {
  float sum = 0.0f;
  int is = 0, mask = 1, qoff = qs, y = base;
  for (int nn = 0; nn < 256; nn += 128) {
    int shift = 0;
    for (int j = 0; j < 4; j++) {
      sum += group_dot(b, x, y, qoff, hmask, mask, shift, d * (float)(aw_i8(scales[is++]) - 32), n); y += 16;
      sum += group_dot(b, x, y, qoff + 16, hmask + 16, mask, shift, d * (float)(aw_i8(scales[is++]) - 32), n); y += 16;
      shift += 2; mask <<= 1;
    }
    qoff += 32;
  }
  return sum;
}

float awtai_dot_q3_k(const uint8_t *row, int cols, const float *x) {
  float sum = 0.0f;
  int p = 0;
  uint8_t aux[16];
  const uint32_t km1 = 0x03030303u, km2 = 0x0f0f0f0fu;
  for (int base = 0; base < cols; base += 256) {
    int hmask = p; p += 32;
    int qs = p; p += 64;
    int scp = p; p += 12;
    float d = aw_f16(row + p); p += 2;
    memset(aux, 0, 16); memcpy(aux, row + scp, 12);
    uint32_t a0 = aw_u32(aux), a1 = aw_u32(aux + 4), a2 = aw_u32(aux + 8);
    aw_put_u32(aux + 8, ((a0 >> 4) & km2) | (((a2 >> 4) & km1) << 4));
    aw_put_u32(aux + 12, ((a1 >> 4) & km2) | (((a2 >> 6) & km1) << 4));
    aw_put_u32(aux, (a0 & km2) | (((a2 >> 0) & km1) << 4));
    aw_put_u32(aux + 4, (a1 & km2) | (((a2 >> 2) & km1) << 4));
    sum += block_dot(row, x, base, hmask, qs, aux, d, cols);
  }
  return sum;
}

void awtai_project_q3_k(const uint8_t *raw, int rows, int cols, const float *x, float *y) {
  int stride = awtai_q3_k_row_bytes(cols);
  for (int r = 0; r < rows; r++) y[r] = awtai_dot_q3_k(raw + (long long)r * stride, cols, x);
}
