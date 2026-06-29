// B"H
#include "awtai_project_threaded.h"
#include "awtai_quant_dispatch.h"
#include <pthread.h>

typedef struct {
  int type;
  int start;
  int end;
  int cols;
  const uint8_t *raw;
  const float *x;
  float *y;
} aw_job;

static void *aw_worker(void *ptr) {
  aw_job *job = (aw_job *)ptr;
  awtai_project_range(job->type, job->raw, job->start, job->end, job->cols, job->x, job->y);
  return 0;
}

static int clamp_threads(int threads, int rows) {
  if (threads < 1) threads = 1;
  if (threads > 16) threads = 16;
  if (threads > rows) threads = rows;
  return threads;
}

int awtai_project_threaded(int type, const uint8_t *raw, int rows, int cols, const float *x, float *y, int threads) {
  threads = clamp_threads(threads, rows);
  if (threads <= 1) return awtai_project(type, raw, rows, cols, x, y);

  pthread_t tids[16];
  int active[16] = {0};
  aw_job jobs[16];
  for (int t = 0; t < threads; t++) {
    int start = (rows * t) / threads;
    int end = (rows * (t + 1)) / threads;
    jobs[t] = (aw_job){ type, start, end, cols, raw, x, y };
    active[t] = pthread_create(&tids[t], 0, aw_worker, &jobs[t]) == 0;
    if (!active[t]) awtai_project_range(type, raw, start, end, cols, x, y);
  }

  for (int t = 0; t < threads; t++) if (active[t]) pthread_join(tids[t], 0);
  return 1;
}
