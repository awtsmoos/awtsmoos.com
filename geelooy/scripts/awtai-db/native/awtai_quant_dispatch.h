// B"H
#ifndef AWTAI_QUANT_DISPATCH_H
#define AWTAI_QUANT_DISPATCH_H
#include <stdint.h>

int awtai_row_bytes(int type, int cols);
int awtai_type_supported(int type);
float awtai_dot_row(int type, const uint8_t *row, int cols, const float *x);
int awtai_project_range(int type, const uint8_t *raw, int start, int end, int cols, const float *x, float *y);
int awtai_project(int type, const uint8_t *raw, int rows, int cols, const float *x, float *y);
#endif
