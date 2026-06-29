// B"H
#include "awtai_project_threaded.h"
#include "awtai_quant_dispatch.h"
#include <pthread.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#define AW_POOL_MAX 16

typedef struct {
  int type, start, end, cols;
  const uint8_t *raw;
  const float *x;
  float *y;
} aw_job;

typedef struct {
  pthread_mutex_t mutex;
  pthread_cond_t wake;
  pthread_cond_t done;
  pthread_t tids[AW_POOL_MAX];
  int initialized, workers, requested, completed;
  uint64_t generation;
  aw_job job;
  int rows;
} aw_pool;

static aw_pool pool = { PTHREAD_MUTEX_INITIALIZER, PTHREAD_COND_INITIALIZER, PTHREAD_COND_INITIALIZER, {0}, 0, 0, 0, 0, 0, {0}, 0 };

static int clamp_threads(int threads, int rows) {
  if (threads < 1) threads = 1;
  if (threads > AW_POOL_MAX) threads = AW_POOL_MAX;
  if (threads > rows) threads = rows;
  return threads;
}

static int use_pool(void) {
  const char *value = getenv("AWTAI_PERSISTENT_POOL");
  return value && (!strcmp(value, "1") || !strcmp(value, "true") || !strcmp(value, "yes"));
}

static void *legacy_worker(void *ptr) {
  aw_job *job = (aw_job *)ptr;
  awtai_project_range(job->type, job->raw, job->start, job->end, job->cols, job->x, job->y);
  return 0;
}

static int legacy_project(int type, const uint8_t *raw, int rows, int cols, const float *x, float *y, int threads) {
  threads = clamp_threads(threads, rows);
  if (threads <= 1) return awtai_project(type, raw, rows, cols, x, y);
  pthread_t tids[AW_POOL_MAX];
  int active[AW_POOL_MAX] = {0};
  aw_job jobs[AW_POOL_MAX];
  for (int t = 0; t < threads; t++) {
    int start = (rows * t) / threads;
    int end = (rows * (t + 1)) / threads;
    jobs[t] = (aw_job){ type, start, end, cols, raw, x, y };
    active[t] = pthread_create(&tids[t], 0, legacy_worker, &jobs[t]) == 0;
    if (!active[t]) awtai_project_range(type, raw, start, end, cols, x, y);
  }
  for (int t = 0; t < threads; t++) if (active[t]) pthread_join(tids[t], 0);
  return 1;
}

static void *pool_worker(void *arg) {
  int id = (int)(intptr_t)arg;
  uint64_t seen = 0;
  for (;;) {
    pthread_mutex_lock(&pool.mutex);
    while (pool.generation == seen) pthread_cond_wait(&pool.wake, &pool.mutex);
    seen = pool.generation;
    int active = id < pool.requested;
    int requested = pool.requested;
    int rows = pool.rows;
    aw_job job = pool.job;
    pthread_mutex_unlock(&pool.mutex);
    if (active) {
      int start = (rows * id) / requested;
      int end = (rows * (id + 1)) / requested;
      awtai_project_range(job.type, job.raw, start, end, job.cols, job.x, job.y);
      pthread_mutex_lock(&pool.mutex);
      pool.completed++;
      if (pool.completed >= pool.requested) pthread_cond_signal(&pool.done);
      pthread_mutex_unlock(&pool.mutex);
    }
  }
  return 0;
}

static int ensure_pool(void) {
  pthread_mutex_lock(&pool.mutex);
  if (pool.initialized) { pthread_mutex_unlock(&pool.mutex); return pool.workers; }
  for (int i = 0; i < AW_POOL_MAX; i++) {
    if (pthread_create(&pool.tids[i], 0, pool_worker, (void *)(intptr_t)i) == 0) pool.workers++;
  }
  pool.initialized = pool.workers > 0;
  pthread_mutex_unlock(&pool.mutex);
  return pool.workers;
}

int awtai_project_pool_workers(void) { return ensure_pool(); }

static int pool_project(int type, const uint8_t *raw, int rows, int cols, const float *x, float *y, int threads) {
  threads = clamp_threads(threads, rows);
  if (threads <= 1 || ensure_pool() < threads) return awtai_project(type, raw, rows, cols, x, y);
  pthread_mutex_lock(&pool.mutex);
  pool.job = (aw_job){ type, 0, rows, cols, raw, x, y };
  pool.rows = rows;
  pool.requested = threads;
  pool.completed = 0;
  pool.generation++;
  pthread_cond_broadcast(&pool.wake);
  while (pool.completed < pool.requested) pthread_cond_wait(&pool.done, &pool.mutex);
  pthread_mutex_unlock(&pool.mutex);
  return 1;
}

int awtai_project_threaded(int type, const uint8_t *raw, int rows, int cols, const float *x, float *y, int threads) {
  if (use_pool()) return pool_project(type, raw, rows, cols, x, y, threads);
  return legacy_project(type, raw, rows, cols, x, y, threads);
}
