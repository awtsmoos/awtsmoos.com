// B"H
#ifndef AWTAI_NATIVE_OPS_H
#define AWTAI_NATIVE_OPS_H

#include <stdint.h>

/*
 * B"H
 * Small native layer gates: mapped projection-add and mapped F32 RMSNorm.
 * The huge tensor body remains on disk/mmap; JavaScript receives only the
 * living vector it needs for this instant.
 */
int awtai_project_add_from_base(
  const uint8_t *base,
  uint64_t size,
  uint64_t offset,
  int type,
  int rows,
  int cols,
  const float *input,
  float *target,
  int threads
);

int awtai_rms_norm_f32_from_base(
  const uint8_t *base,
  uint64_t size,
  uint64_t offset,
  int hidden,
  const float *input,
  float *output,
  float eps
);

#endif
