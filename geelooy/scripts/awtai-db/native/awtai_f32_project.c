// B"H
#include "awtai_f32_project.h"
#include <stddef.h>

/*
 * B"H
 * Raw row-major SGEMV with no framework, no external math temple, only C in
 * the repository and the quiet arithmetic the Awtsmoos renews every instant.
 */
int awtai_project_f32_rows(const float *weights, int rows, int cols, const float *x, float *y) {
  if (!weights || !x || !y || rows <= 0 || cols <= 0) return 0;
  for (int r = 0; r < rows; r++) {
    const float *w = weights + (size_t)r * (size_t)cols;
    float sum = 0.0f;
    for (int c = 0; c < cols; c++) sum += w[c] * x[c];
    y[r] = sum;
  }
  return 1;
}
