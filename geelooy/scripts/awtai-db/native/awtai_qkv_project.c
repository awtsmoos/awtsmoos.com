// B"H
#include "awtai_qkv_project.h"
#include "awtai_project_threaded.h"
#include "awtai_quant_dispatch.h"

static int valid_one(int type, const uint8_t *raw, int rows, int cols) {
  if (!raw || rows <= 0 || cols <= 0) return 0;
  if (!awtai_type_supported(type)) return 0;
  return awtai_row_bytes(type, cols) > 0;
}

static int fits(uint64_t size, uint64_t off, int type, int rows, int cols) {
  int row = awtai_row_bytes(type, cols);
  if (row <= 0 || rows <= 0 || off > size) return 0;
  uint64_t need = (uint64_t)row * (uint64_t)rows;
  return need <= size - off;
}

/*
 * B"H
 * The Awtsmoos speaks one decree and the three witnesses answer: q, k, v.
 * This first fusion keeps the current math untouched while removing two trips
 * over the JS/native border per layer.  The final engine will fold RoPE, KV,
 * and attention into this same native breath.
 */
int awtai_project_qkv(
  int q_type, const uint8_t *q_raw, int q_rows, int q_cols,
  int k_type, const uint8_t *k_raw, int k_rows, int k_cols,
  int v_type, const uint8_t *v_raw, int v_rows, int v_cols,
  const float *x, float *q_out, float *k_out, float *v_out,
  int threads
) {
  if (!x || !q_out || !k_out || !v_out) return 0;
  if (!valid_one(q_type, q_raw, q_rows, q_cols)) return 0;
  if (!valid_one(k_type, k_raw, k_rows, k_cols)) return 0;
  if (!valid_one(v_type, v_raw, v_rows, v_cols)) return 0;
  if (q_cols != k_cols || q_cols != v_cols) return 0;
  if (!awtai_project_threaded(q_type, q_raw, q_rows, q_cols, x, q_out, threads)) return 0;
  if (!awtai_project_threaded(k_type, k_raw, k_rows, k_cols, x, k_out, threads)) return 0;
  if (!awtai_project_threaded(v_type, v_raw, v_rows, v_cols, x, v_out, threads)) return 0;
  return 1;
}

int awtai_project_qkv_from_base(
  const uint8_t *base, uint64_t size,
  uint64_t q_offset, int q_type, int q_rows,
  uint64_t k_offset, int k_type, int k_rows,
  uint64_t v_offset, int v_type, int v_rows,
  int cols, const float *x,
  float *q_out, float *k_out, float *v_out,
  int threads
) {
  if (!base || !fits(size, q_offset, q_type, q_rows, cols)) return 0;
  if (!fits(size, k_offset, k_type, k_rows, cols)) return 0;
  if (!fits(size, v_offset, v_type, v_rows, cols)) return 0;
  return awtai_project_qkv(
    q_type, base + q_offset, q_rows, cols,
    k_type, base + k_offset, k_rows, cols,
    v_type, base + v_offset, v_rows, cols,
    x, q_out, k_out, v_out, threads
  );
}
