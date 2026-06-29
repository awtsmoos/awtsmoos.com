// B"H
#include "awtai_quant_q2k.h"

static float f16(const uint8_t *p) {
  uint32_t h = (uint32_t)p[0] | ((uint32_t)p[1] << 8);
  uint32_t s = (h >> 15) & 1, e = (h >> 10) & 31, f = h & 1023;
  union { uint32_t u; float f; } out;
  if (!e) {
    if (!f) { out.u = s << 31; return out.f; }
    while ((f & 1024) == 0) { f <<= 1; e--; }
    e++; f &= 1023;
  } else if (e == 31) {
    out.u = (s << 31) | 0x7f800000u | (f << 13);
    return out.f;
  }
  e = e + (127 - 15);
  out.u = (s << 31) | (e << 23) | (f << 13);
  return out.f;
}

int awtai_q2_k_row_bytes(int cols) {
  return ((cols + 255) / 256) * 84;
}

static float dot_half(
  const uint8_t *b,
  const float *x,
  int base,
  int scales,
  int qs,
  float d,
  float dm,
  int n,
  int scale_base
) {
  float sum = 0.0f;
  for (int i = 0; i < 32; i++) {
    uint8_t by = b[qs + i];
    int is = scale_base + (i >> 4);
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
    float d = f16(row + p);
    float dm = f16(row + p + 2);
    p += 4;
    sum += dot_half(row, x, base, scales, qs, d, dm, cols, 0);
    sum += dot_half(row, x, base + 128, scales, qs + 32, d, dm, cols, 8);
  }
  return sum;
}

void awtai_project_q2_k(const uint8_t *raw, int rows, int cols, const float *x, float *y) {
  int stride = awtai_q2_k_row_bytes(cols);
  for (int r = 0; r < rows; r++) y[r] = awtai_dot_q2_k(raw + (long long)r * stride, cols, x);
}
