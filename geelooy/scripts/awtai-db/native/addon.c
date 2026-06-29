// B"H
#include <node_api.h>
#include <stdint.h>
#include "awtai_f32_project.h"
#include "awtai_fused_ffn.h"
#include "awtai_project_threaded.h"
#include "awtai_quant_dispatch.h"

static napi_value fail(napi_env env, const char *msg) { napi_throw_error(env, NULL, msg); return NULL; }
static int32_t i32_arg(napi_env env, napi_value v, const char *name) { int32_t out = 0; if (napi_get_value_int32(env, v, &out) != napi_ok) napi_throw_error(env, NULL, name); return out; }
static int32_t threads_arg(napi_env env, napi_value *args, size_t argc, int index) { return argc <= (size_t)index ? 1 : i32_arg(env, args[index], "B'H invalid thread count"); }
static int get_ta(napi_env env, napi_value value, napi_typedarray_type expect, void **data, size_t *len, const char *name) {
  napi_typedarray_type type; size_t off; napi_value ab;
  if (napi_get_typedarray_info(env, value, &type, len, data, &ab, &off) != napi_ok || type != expect) { napi_throw_error(env, NULL, name); return 0; }
  return 1;
}

static napi_value project_rows(napi_env env, napi_callback_info info) {
  size_t argc = 6; napi_value args[6];
  if (napi_get_cb_info(env, info, &argc, args, NULL, NULL) != napi_ok || argc < 5) return fail(env, "B'H projectRows args");
  int type = i32_arg(env, args[1], "B'H invalid type"), rows = i32_arg(env, args[2], "B'H invalid rows"), cols = i32_arg(env, args[3], "B'H invalid cols"), threads = threads_arg(env, args, argc, 5);
  void *raw = 0, *x = 0; size_t raw_len = 0, x_len = 0;
  if (!get_ta(env, args[0], napi_uint8_array, &raw, &raw_len, "B'H raw must be Uint8Array")) return NULL;
  if (!get_ta(env, args[4], napi_float32_array, &x, &x_len, "B'H input must be Float32Array")) return NULL;
  if (!awtai_type_supported(type) || rows <= 0 || cols <= 0 || (int)x_len < cols) return fail(env, "B'H invalid projection");
  if (raw_len < (size_t)awtai_row_bytes(type, cols) * (size_t)rows) return fail(env, "B'H short raw projection");
  napi_value out_ab, out_ta; void *out = 0;
  if (napi_create_arraybuffer(env, (size_t)rows * sizeof(float), &out, &out_ab) != napi_ok) return fail(env, "B'H output alloc failed");
  awtai_project_threaded(type, raw, rows, cols, x, out, threads);
  napi_create_typedarray(env, napi_float32_array, rows, out_ab, 0, &out_ta);
  return out_ta;
}

static napi_value project_f32_rows(napi_env env, napi_callback_info info) {
  size_t argc = 4; napi_value args[4];
  if (napi_get_cb_info(env, info, &argc, args, NULL, NULL) != napi_ok || argc < 4) return fail(env, "B'H projectF32Rows args");
  int rows = i32_arg(env, args[1], "B'H f32 rows"), cols = i32_arg(env, args[2], "B'H f32 cols");
  void *w = 0, *x = 0; size_t w_len = 0, x_len = 0;
  if (!get_ta(env, args[0], napi_float32_array, &w, &w_len, "B'H weights must be Float32Array")) return NULL;
  if (!get_ta(env, args[3], napi_float32_array, &x, &x_len, "B'H input must be Float32Array")) return NULL;
  if (rows <= 0 || cols <= 0 || w_len < (size_t)rows * (size_t)cols || x_len < (size_t)cols) return fail(env, "B'H invalid f32 projection");
  napi_value out_ab, out_ta; void *out = 0;
  if (napi_create_arraybuffer(env, (size_t)rows * sizeof(float), &out, &out_ab) != napi_ok) return fail(env, "B'H f32 output alloc failed");
  if (!awtai_project_f32_rows(w, rows, cols, x, out)) return fail(env, "B'H f32 project failed");
  napi_create_typedarray(env, napi_float32_array, rows, out_ab, 0, &out_ta);
  return out_ta;
}

static napi_value fused_ffn(napi_env env, napi_callback_info info) {
  size_t argc = 10; napi_value args[10];
  if (napi_get_cb_info(env, info, &argc, args, NULL, NULL) != napi_ok || argc < 9) return fail(env, "B'H fusedFfn args");
  int gt = i32_arg(env, args[1], "B'H gate type"), ut = i32_arg(env, args[3], "B'H up type"), dt = i32_arg(env, args[5], "B'H down type"), hidden = i32_arg(env, args[6], "B'H hidden"), ffn = i32_arg(env, args[7], "B'H ffn"), threads = threads_arg(env, args, argc, 9);
  void *gr = 0, *ur = 0, *dr = 0, *x = 0; size_t gl = 0, ul = 0, dl = 0, xl = 0;
  if (!get_ta(env, args[0], napi_uint8_array, &gr, &gl, "B'H gate raw")) return NULL;
  if (!get_ta(env, args[2], napi_uint8_array, &ur, &ul, "B'H up raw")) return NULL;
  if (!get_ta(env, args[4], napi_uint8_array, &dr, &dl, "B'H down raw")) return NULL;
  if (!get_ta(env, args[8], napi_float32_array, &x, &xl, "B'H ffn input")) return NULL;
  if ((int)xl < hidden || gl < (size_t)awtai_row_bytes(gt, hidden) * (size_t)ffn || ul < (size_t)awtai_row_bytes(ut, hidden) * (size_t)ffn || dl < (size_t)awtai_row_bytes(dt, ffn) * (size_t)hidden) return fail(env, "B'H short fused ffn raw");
  napi_value out_ab, out_ta; void *out = 0;
  if (napi_create_arraybuffer(env, (size_t)hidden * sizeof(float), &out, &out_ab) != napi_ok) return fail(env, "B'H ffn alloc failed");
  if (!awtai_fused_ffn(gt, gr, ut, ur, dt, dr, hidden, ffn, x, out, threads)) return fail(env, "B'H fused ffn failed");
  napi_create_typedarray(env, napi_float32_array, hidden, out_ab, 0, &out_ta);
  return out_ta;
}

static napi_value init(napi_env env, napi_value exports) {
  napi_property_descriptor desc[] = { { "projectRows", 0, project_rows, 0, 0, 0, napi_default, 0 }, { "projectF32Rows", 0, project_f32_rows, 0, 0, 0, napi_default, 0 }, { "fusedFfn", 0, fused_ffn, 0, 0, 0, napi_default, 0 } };
  napi_define_properties(env, exports, 3, desc);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
