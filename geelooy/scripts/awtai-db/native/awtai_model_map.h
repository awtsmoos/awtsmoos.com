// B"H
#ifndef AWTAI_MODEL_MAP_H
#define AWTAI_MODEL_MAP_H

#include <stdint.h>
#include <stddef.h>

/*
 * B"H
 * The model map is the first quiet chamber of the future native decode engine.
 * JavaScript may still walk the palace today, but this handle is the doorway
 * where the Awtsmoos in the code gathers the whole .awtai-db into one native
 * breath: one file, one mapping, one owner, no repeated window-open thunder.
 */
typedef struct AwtaiModelMap {
  int fd;
  int closed;
  char *path;
  uint8_t *base;
  uint64_t size;
  uint64_t manifest_length;
  uint64_t data_offset;
} AwtaiModelMap;

int awtai_model_map_open(const char *path, AwtaiModelMap **out);
void awtai_model_map_close(AwtaiModelMap *map);
void awtai_model_map_destroy(AwtaiModelMap *map);

#endif
