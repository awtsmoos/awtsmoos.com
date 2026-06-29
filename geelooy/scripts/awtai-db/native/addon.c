// B"H
#include <node_api.h>
#include <stdint.h>
#include "awtai_project_threaded.h"
#include "awtai_quant_dispatch.h"

static napi_value fail(napi_env env, const char *msg) {
  napi_throw_error(env, NULL, msg);
  return NULL;
}

static int32_t i32_arg(napi_env env, napi_value v, const char *name) {
  int32_t out = 0;
  if (napi_get_value_int32(env, v, &out) != napi_ok) napi_throw_error(env, NULL, name);
  return out;
}

static int32_t optional_threads(napi_env env, napi_value *args, size_t argc) {
  if (argc < 6) return 1;
  return i32_arg(env, args[5], "B'H invalid thread count");
}

static napi_value project_rows(napi_env env, napi_callback_info info) {
  size_t argc = 6;
  napi_value args[6];
  if (napi_get_cb_info(env, info, &argc, args, NULL, NULL) != napi_ok || argc < 5) {
    return fail(env, "B'H projectRows(raw,type,rows,cols,input,threads) needs at least five args");
  }
  int32_t type = i32_arg(env, args[1], "B'H invalid ggml type");
  int32_t rows = i32_arg(env, args[2], "B'H invalid rows");
  int32_t cols = i32_arg(env, args[3], "B'H invalid cols");
  int32_t threads = optional_threads(env, args, argc);
  if (!awtai_type_supported(type)) return fail(env, "B'H native addon supports Q2_K/Q3_K/Q4_K/Q6_K only");
  if (rows <= 0 || cols <= 0) return fail(env, "B'H invalid projection shape");

  napi_typedarray_type raw_type, x_type;
  size_t raw_len = 0, x_len = 0, raw_off = 0, x_off = 0;
  napi_value raw_ab, x_ab;
  void *raw_data = 0, *x_data = 0;
  napi_get_typedarray_info(env, args[0], &raw_type, &raw_len, &raw_data, &raw_ab, &raw_off);
  napi_get_typedarray_info(env, args[4], &x_type, &x_len, &x_data, &x_ab, &x_off);
  if (raw_type != napi_uint8_array) return fail(env, "B'H raw must be Uint8Array");
  if (x_type != napi_float32_array) return fail(env, "B'H input must be Float32Array");
  if ((int32_t)x_len < cols) return fail(env, "B'H input shorter than cols");
  int stride = awtai_row_bytes(type, cols);
  if (raw_len < (size_t)stride * (size_t)rows) return fail(env, "B'H raw tensor shorter than rows*stride");

  napi_value out_ab, out_ta;
  void *out_data = 0;
  if (napi_create_arraybuffer(env, (size_t)rows * sizeof(float), &out_data, &out_ab) != napi_ok) {
    return fail(env, "B'H could not allocate output arraybuffer");
  }
  awtai_project_threaded(type, (const uint8_t *)raw_data, rows, cols, (const float *)x_data, (float *)out_data, threads);
  if (napi_create_typedarray(env, napi_float32_array, rows, out_ab, 0, &out_ta) != napi_ok) {
    return fail(env, "B'H could not create output Float32Array");
  }
  return out_ta;
}

static napi_value init(napi_env env, napi_value exports) {
  napi_property_descriptor desc = { "projectRows", 0, project_rows, 0, 0, 0, napi_default, 0 };
  napi_define_properties(env, exports, 1, &desc);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
