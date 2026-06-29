// B"H
#include "awtai_fused_ffn.h"
#include "awtai_project_threaded.h"
#include "awtai_quant_dispatch.h"
#include <math.h>
#include <pthread.h>
#include <stdlib.h>

typedef struct {
  int start, end, hidden, gate_type, up_type;
  const uint8_t *gate_raw;
  const uint8_t *up_raw;
  const float *x;
  float *gate;
  float *up;
} aw_ffn_job;

static int clamp_threads(int threads, int rows) {
  if (threads < 1) threads = 1;
  if (threads > 16) threads = 16;
  if (threads > rows) threads = rows;
  return threads;
}

static int fits(uint64_t size, uint64_t off, int type, int rows, int cols) {
  int row = awtai_row_bytes(type, cols);
  if (row <= 0 || rows <= 0 || off > size) return 0;
  uint64_t need = (uint64_t)row * (uint64_t)rows;
  return need <= size - off;
}

static void *gate_up_worker(void *ptr) {
  aw_ffn_job *job = (aw_ffn_job *)ptr;
  awtai_project_range(job->gate_type, job->gate_raw, job->start, job->end, job->hidden, job->x, job->gate);
  awtai_project_range(job->up_type, job->up_raw, job->start, job->end, job->hidden, job->x, job->up);
  return 0;
}

static void project_gate_up(aw_ffn_job *base, int ffn, int threads) {
  threads = clamp_threads(threads, ffn);
  if (threads <= 1) { gate_up_worker(base); return; }
  pthread_t tids[16];
  int active[16] = {0};
  aw_ffn_job jobs[16];
  for (int t = 0; t < threads; t++) {
    jobs[t] = *base;
    jobs[t].start = (ffn * t) / threads;
    jobs[t].end = (ffn * (t + 1)) / threads;
    active[t] = pthread_create(&tids[t], 0, gate_up_worker, &jobs[t]) == 0;
    if (!active[t]) gate_up_worker(&jobs[t]);
  }
  for (int t = 0; t < threads; t++) if (active[t]) pthread_join(tids[t], 0);
}

/*
 * B"H
 * Gate and up become flame, down becomes vessel, and the residual will receive
 * the answer.  This routine keeps the old math but lets callers choose whether
 * bytes came from JS buffers or from a single native mmap of the model file.
 */
int awtai_fused_ffn(int gate_type, const uint8_t *gate_raw, int up_type, const uint8_t *up_raw, int down_type, const uint8_t *down_raw, int hidden, int ffn, const float *x, float *y, int threads) {
  if (!awtai_type_supported(gate_type) || !awtai_type_supported(up_type) || !awtai_type_supported(down_type)) return 0;
  float *gate = (float *)malloc((size_t)ffn * sizeof(float));
  float *up = (float *)malloc((size_t)ffn * sizeof(float));
  if (!gate || !up) { free(gate); free(up); return 0; }
  aw_ffn_job job = { 0, ffn, hidden, gate_type, up_type, gate_raw, up_raw, x, gate, up };
  project_gate_up(&job, ffn, threads);
  for (int i = 0; i < ffn; i++) gate[i] = (gate[i] / (1.0f + expf(-gate[i]))) * up[i];
  int ok = awtai_project_threaded(down_type, down_raw, hidden, ffn, gate, y, threads);
  free(gate);
  free(up);
  return ok;
}

int awtai_fused_ffn_from_base(
  const uint8_t *base, uint64_t size,
  uint64_t gate_offset, int gate_type,
  uint64_t up_offset, int up_type,
  uint64_t down_offset, int down_type,
  int hidden, int ffn, const float *x, float *y, int threads
) {
  if (!base) return 0;
  if (!fits(size, gate_offset, gate_type, ffn, hidden)) return 0;
  if (!fits(size, up_offset, up_type, ffn, hidden)) return 0;
  if (!fits(size, down_offset, down_type, hidden, ffn)) return 0;
  return awtai_fused_ffn(
    gate_type, base + gate_offset,
    up_type, base + up_offset,
    down_type, base + down_offset,
    hidden, ffn, x, y, threads
  );
}
