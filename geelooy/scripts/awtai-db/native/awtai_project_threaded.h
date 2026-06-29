// B"H
#ifndef AWTAI_PROJECT_THREADED_H
#define AWTAI_PROJECT_THREADED_H
#include <stdint.h>

int awtai_project_threaded(
  int type, const uint8_t *raw, int rows, int cols,
  const float *x, float *y, int threads
);
int awtai_project_pool_workers(void);

#endif
