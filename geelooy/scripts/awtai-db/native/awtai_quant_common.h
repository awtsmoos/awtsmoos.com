// B"H
#ifndef AWTAI_QUANT_COMMON_H
#define AWTAI_QUANT_COMMON_H
#include <stdint.h>

static inline int8_t aw_i8(uint8_t x) { return x > 127 ? (int8_t)(x - 256) : (int8_t)x; }
static inline uint32_t aw_u32(const uint8_t *p) {
  return (uint32_t)p[0] | ((uint32_t)p[1] << 8) | ((uint32_t)p[2] << 16) | ((uint32_t)p[3] << 24);
}
static inline void aw_put_u32(uint8_t *p, uint32_t v) {
  p[0] = v & 255; p[1] = (v >> 8) & 255; p[2] = (v >> 16) & 255; p[3] = (v >> 24) & 255;
}
static inline float aw_f16(const uint8_t *p) {
  uint32_t h = (uint32_t)p[0] | ((uint32_t)p[1] << 8);
  uint32_t s = (h >> 15) & 1, e = (h >> 10) & 31, f = h & 1023;
  union { uint32_t u; float f; } out;
  if (!e) {
    if (!f) { out.u = s << 31; return out.f; }
    while ((f & 1024) == 0) { f <<= 1; e--; }
    e++; f &= 1023;
  } else if (e == 31) { out.u = (s << 31) | 0x7f800000u | (f << 13); return out.f; }
  e += 112;
  out.u = (s << 31) | (e << 23) | (f << 13);
  return out.f;
}
#endif
