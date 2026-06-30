// B"H
#include "awtai_native_ops.h"
#include "awtai_project_threaded.h"
#include "awtai_quant_dispatch.h"
#include <math.h>
#include <stdint.h>
#include <stdlib.h>

static int fits(uint64_t size, uint64_t offset, int type, int rows, int cols) {
  int stride = awtai_row_bytes(type, cols);
  if (stride <= 0 || rows <= 0 || cols <= 0) return 0;
  uint64_t bytes = (uint64_t)stride * (uint64_t)rows;
  return offset <= size && bytes <= size - offset;
}

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
) {
  if (!base || !input || !target || !fits(size, offset, type, rows, cols)) return 0;
  float *tmp = (float *)malloc((size_t)rows * sizeof(float));
  if (!tmp) return 0;
  int ok = awtai_project_threaded(type, base + offset, rows, cols, input, tmp, threads);
  if (ok) for (int i = 0; i < rows; i++) target[i] += tmp[i];
  free(tmp);
  return ok;
}

int awtai_rms_norm_f32_from_base(
  const uint8_t *base,
  uint64_t size,
  uint64_t offset,
  int hidden,
  const float *input,
  float *output,
  float eps
) {
  if (!base || !input || !output || hidden <= 0) return 0;
  uint64_t bytes = (uint64_t)hidden * sizeof(float);
  if (offset > size || bytes > size - offset) return 0;
  const float *weight = (const float *)(base + offset);
  double ss = 0.0;
  for (int i = 0; i < hidden; i++) ss += (double)input[i] * (double)input[i];
  float inv = 1.0f / sqrtf((float)(ss / (double)hidden) + eps);
  for (int i = 0; i < hidden; i++) output[i] = input[i] * inv * weight[i];
  return 1;
}
