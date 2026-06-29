// B"H
#include <node_api.h>
#include <stdint.h>
#include <stdlib.h>
#include "awtai_quant_q2k.h"

static napi_value fail(napi_env env, const char *msg) {
  napi_throw_error(env, NULL, msg);
  return NULL;
}

static int32_t i32_arg(napi_env env, napi_value v, const char *name) {
  int32_t out = 0;
  if (napi_get_value_int32(env, v, &out) != napi_ok) napi_throw_error(env, NULL, name);
  return out;
}

static napi_value project_rows(napi_env env, napi_callback_info info) {
  size_t argc = 5;
  napi_value args[5];
  if (napi_get_cb_info(env, info, &argc, args, NULL, NULL) != napi_ok || argc < 5) {
    return fail(env, "B'H projectRows(raw,type,rows,cols,input) needs five args");
  }

  int32_t type = i32_arg(env, args[1], "B'H invalid ggml type");
  int32_t rows = i32_arg(env, args[2], "B'H invalid rows");
  int32_t cols = i32_arg(env, args[3], "B'H invalid cols");
  if (type != 10) return fail(env, "B'H native addon currently proves Q2_K only");
  if (rows <= 0 || cols <= 0) return fail(env, "B'H invalid projection shape");

  bool is_raw_ta = false, is_x_ta = false;
  napi_is_typedarray(env, args[0], &is_raw_ta);
  napi_is_typedarray(env, args[4], &is_x_ta);
  if (!is_raw_ta || !is_x_ta) return fail(env, "B'H raw and input must be typed arrays");

  napi_typedarray_type raw_type, x_type;
  size_t raw_len = 0, x_len = 0, raw_off = 0, x_off = 0;
  napi_value raw_ab, x_ab;
  void *raw_data = NULL, *x_data = NULL;
  napi_get_typedarray_info(env, args[0], &raw_type, &raw_len, &raw_data, &raw_ab, &raw_off);
  napi_get_typedarray_info(env, args[4], &x_type, &x_len, &x_data, &x_ab, &x_off);
  if (raw_type != napi_uint8_array) return fail(env, "B'H raw must be Uint8Array");
  if (x_type != napi_float32_array) return fail(env, "B'H input must be Float32Array");
  if ((int32_t)x_len < cols) return fail(env, "B'H input shorter than cols");

  int stride = awtai_q2_k_row_bytes(cols);
  if (raw_len < (size_t)stride * (size_t)rows) return fail(env, "B'H raw tensor shorter than rows*stride");

  napi_value out_ab, out_ta;
  void *out_data = NULL;
  if (napi_create_arraybuffer(env, (size_t)rows * sizeof(float), &out_data, &out_ab) != napi_ok) {
    return fail(env, "B'H could not allocate output arraybuffer");
  }

  awtai_project_q2_k((const uint8_t *)raw_data, rows, cols, (const float *)x_data, (float *)out_data);
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
