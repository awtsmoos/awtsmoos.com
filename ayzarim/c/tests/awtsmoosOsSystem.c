//B"H
#include <stdint.h>
typedef struct {
    char magic[8];        // "Awtsmoos"
    uint32_t block_size;  // Size of each block (in bytes)
    uint32_t block_count; // Number of blocks currently used
    uint64_t file_size;   // Total file size (including header)
} FileHeader;
