// B"H
#ifndef AWTAI_MMAP_PROJECT_H
#define AWTAI_MMAP_PROJECT_H
#include <stdint.h>

typedef struct { int id; float logit; } awtai_topk_item;

int awtai_mmap_f32_topk(const char *path, int rows, int cols, const float *input, int k, int window_rows, awtai_topk_item *out);
int awtai_mmap_quant_project(const char *path, uint64_t offset, int type, int rows, int cols, const float *input, float *out, int window_rows);

#endif
