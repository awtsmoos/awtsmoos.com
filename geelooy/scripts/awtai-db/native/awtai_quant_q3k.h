// B"H
#ifndef AWTAI_QUANT_Q3K_H
#define AWTAI_QUANT_Q3K_H
#include <stdint.h>
float awtai_dot_q3_k(const uint8_t *row, int cols, const float *x);
void awtai_project_q3_k(const uint8_t *raw, int rows, int cols, const float *x, float *y);
int awtai_q3_k_row_bytes(int cols);
#endif
