// B"H
#include "awtai_model_map.h"
#include <fcntl.h>
#include <stdlib.h>
#include <string.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <unistd.h>

static uint64_t le64(const uint8_t *p) {
  uint64_t v = 0;
  for (int i = 7; i >= 0; i--) v = (v << 8) | p[i];
  return v;
}

static char *copy_path(const char *path) {
  size_t n = strlen(path);
  char *out = (char *)malloc(n + 1);
  if (!out) return NULL;
  memcpy(out, path, n + 1);
  return out;
}

static int valid_header(const uint8_t *base) {
  return memcmp(base, "AWTDB001", 8) == 0;
}

/*
 * B"H
 * One mmap, one native breath.  The JS world used to knock on the gate for
 * every tensor-window; here the gate opens once, and the hidden letters of the
 * model rest under a single pointer until the session is done.
 */
int awtai_model_map_open(const char *path, AwtaiModelMap **out) {
  if (!path || !out) return 0;
  *out = NULL;
  int fd = open(path, O_RDONLY);
  if (fd < 0) return 0;

  struct stat st;
  if (fstat(fd, &st) != 0 || st.st_size < 16) {
    close(fd);
    return 0;
  }

  uint64_t size = (uint64_t)st.st_size;
  uint8_t *base = mmap(NULL, (size_t)size, PROT_READ, MAP_PRIVATE, fd, 0);
  if (base == MAP_FAILED) {
    close(fd);
    return 0;
  }

  if (!valid_header(base)) {
    munmap(base, (size_t)size);
    close(fd);
    return 0;
  }

  uint64_t manifest_length = le64(base + 8);
  uint64_t data_offset = 16 + manifest_length;
  if (data_offset > size) {
    munmap(base, (size_t)size);
    close(fd);
    return 0;
  }

  AwtaiModelMap *map = (AwtaiModelMap *)calloc(1, sizeof(*map));
  if (!map) {
    munmap(base, (size_t)size);
    close(fd);
    return 0;
  }

  map->fd = fd;
  map->path = copy_path(path);
  map->base = base;
  map->size = size;
  map->manifest_length = manifest_length;
  map->data_offset = data_offset;
  *out = map;
  return 1;
}

void awtai_model_map_close(AwtaiModelMap *map) {
  if (!map || map->closed) return;
  if (map->base && map->size) munmap(map->base, (size_t)map->size);
  if (map->fd >= 0) close(map->fd);
  map->base = NULL;
  map->fd = -1;
  map->closed = 1;
}

void awtai_model_map_destroy(AwtaiModelMap *map) {
  if (!map) return;
  awtai_model_map_close(map);
  free(map->path);
  free(map);
}
