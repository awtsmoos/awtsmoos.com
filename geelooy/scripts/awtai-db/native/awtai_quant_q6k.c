// B"H
#include "awtai_quant_q6k.h"
#include "awtai_quant_common.h"

int awtai_q6_k_row_bytes(int cols) { return ((cols + 255) / 256) * 210; }

static inline float one(float d, int scale, int q, const float *x, int idx, int n) {
  return idx < n ? d * (float)scale * (float)q * x[idx] : 0.0f;
}

float awtai_dot_q6_k(const uint8_t *row, int cols, const float *x) {
  float sum = 0.0f;
  int p = 0;
  for (int base = 0; base < cols; base += 256) {
    int ql0 = p; p += 128;
    int qh0 = p; p += 64;
    int sc0 = p; p += 16;
    float d = aw_f16(row + p); p += 2;
    int ql = ql0, qh = qh0, sc = sc0;
    for (int half = 0, y = base; half < 2; half++, y += 128, ql += 64, qh += 32, sc += 8) {
      for (int l = 0; l < 32; l++) {
        uint8_t a = row[ql + l], c = row[ql + 32 + l], h = row[qh + l];
        int is = l >> 4;
        sum += one(d, aw_i8(row[sc + is]), ((a & 15) | (((h >> 0) & 3) << 4)) - 32, x, y + l, cols);
        sum += one(d, aw_i8(row[sc + is + 2]), ((c & 15) | (((h >> 2) & 3) << 4)) - 32, x, y + l + 32, cols);
        sum += one(d, aw_i8(row[sc + is + 4]), ((a >> 4) | (((h >> 4) & 3) << 4)) - 32, x, y + l + 64, cols);
        sum += one(d, aw_i8(row[sc + is + 6]), ((c >> 4) | (((h >> 6) & 3) << 4)) - 32, x, y + l + 96, cols);
      }
    }
  }
  return sum;
}

void awtai_project_q6_k(const uint8_t *raw, int rows, int cols, const float *x, float *y) {
  int stride = awtai_q6_k_row_bytes(cols);
  for (int r = 0; r < rows; r++) y[r] = awtai_dot_q6_k(raw + (long long)r * stride, cols, x);
}
