// B"H
#include "awtai_f32_project.h"
#include <Accelerate/Accelerate.h>

/**
 * Accelerate-backed row-major SGEMV.
 *
 * This function is the test gate for a bigger doctrine: keep .awtai-db as the
 * only model, but allow disposable dequantized slabs to call the machine's own
 * vector thunder.
 */
int awtai_project_f32_rows(const float *weights, int rows, int cols, const float *x, float *y) {
  if (!weights || !x || !y || rows <= 0 || cols <= 0) return 0;
  cblas_sgemv(CblasRowMajor, CblasNoTrans, rows, cols, 1.0f, weights, cols, x, 1, 0.0f, y, 1);
  return 1;
}
