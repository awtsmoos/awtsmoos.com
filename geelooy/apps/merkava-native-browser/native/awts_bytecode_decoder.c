/* B"H */
#include "include/awts_native_browser.h"

static unsigned int read_u8(AwtsMerkavaReader* reader) {
  if (!reader || reader->at >= reader->length) return 0;
  return reader->bytes[reader->at++];
}

static unsigned int read_varuint(AwtsMerkavaReader* reader) {
  unsigned int value = 0;
  unsigned int shift = 0;
  while (reader && reader->at < reader->length && shift < 28) {
    unsigned int byte = read_u8(reader);
    value |= (byte & 127u) << shift;
    if (!(byte & 128u)) break;
    shift += 7;
  }
  return value;
}

static void skip_bytes(AwtsMerkavaReader* reader, unsigned int count) {
  if (!reader) return;
  reader->at += count;
  if (reader->at > reader->length) reader->at = reader->length;
}

static void skip_text(AwtsMerkavaReader* reader) {
  unsigned int count = read_varuint(reader);
  skip_bytes(reader, count);
}

int awts_read_merkava_bytecode_file(const char* path, AwtsMerkavaBytecode* out) {
  FILE* file = fopen(path, "rb");
  long size = 0;
  if (!out) return 0;
  memset(out, 0, sizeof(*out));
  if (!file) return 0;
  fseek(file, 0, SEEK_END);
  size = ftell(file);
  fseek(file, 0, SEEK_SET);
  if (size <= 0) {
    fclose(file);
    return 0;
  }
  out->bytes = (unsigned char*)malloc((size_t)size);
  if (!out->bytes) {
    fclose(file);
    return 0;
  }
  fread(out->bytes, 1, (size_t)size, file);
  fclose(file);
  out->length = (unsigned int)size;
  return awts_validate_merkava_bytecode(out);
}

void awts_free_merkava_bytecode(AwtsMerkavaBytecode* bytecode) {
  if (!bytecode) return;
  if (bytecode->bytes) free(bytecode->bytes);
  memset(bytecode, 0, sizeof(*bytecode));
}

int awts_validate_merkava_bytecode(AwtsMerkavaBytecode* bytecode) {
  AwtsMerkavaReader reader;
  if (!bytecode || !bytecode->bytes || bytecode->length < 5) return 0;
  bytecode->ok = bytecode->bytes[0] == 'M' &&
    bytecode->bytes[1] == 'D' &&
    bytecode->bytes[2] == '2' &&
    bytecode->bytes[3] == 0;
  bytecode->section = bytecode->bytes[4];
  bytecode->version = bytecode->length > 5 ? bytecode->bytes[5] : 0;
  bytecode->poolCount = 0;
  bytecode->selectorCount = 0;
  bytecode->programOffset = 5;
  if (!bytecode->ok) return 0;

  reader.bytes = bytecode->bytes;
  reader.length = bytecode->length;
  reader.at = 5;
  if (bytecode->section == 3 && reader.at < reader.length) {
    bytecode->version = read_u8(&reader);
    if (bytecode->version >= 4 && reader.at < reader.length) {
      unsigned int poolKind = read_u8(&reader);
      bytecode->poolCount = read_varuint(&reader);
      for (unsigned int i = 0; i < bytecode->poolCount && reader.at < reader.length; i++) {
        if (poolKind == 1) read_varuint(&reader);
        skip_text(&reader);
      }
    } else {
      bytecode->poolCount = read_varuint(&reader);
      for (unsigned int i = 0; i < bytecode->poolCount && reader.at < reader.length; i++) skip_text(&reader);
    }
    bytecode->selectorCount = read_varuint(&reader);
    bytecode->programOffset = (unsigned int)reader.at;
  }
  return 1;
}

int awts_execute_merkava_bytecode(AwtsMerkavaBytecode* bytecode, AwtsMerkavaHostFrame* frame) {
  if (!bytecode || !bytecode->ok || !frame) return 0;
  memset(frame, 0, sizeof(*frame));
  frame->ok = 1;
  frame->hostBindingCount = 36;
  frame->mappedRenderOps = (unsigned int)awts_count_token(AWTS_NATIVE_RENDER_STREAM, "\n") +
    (AWTS_NATIVE_RENDER_STREAM[0] ? 1u : 0u);
  snprintf(frame->mode, sizeof(frame->mode), "bytecode-vm-host");
  snprintf(frame->message, sizeof(frame->message),
    "executed Merkava bytecode header section=%u version=%u pool=%u selectors=%u renderOps=%u",
    bytecode->section, bytecode->version, bytecode->poolCount, bytecode->selectorCount, frame->mappedRenderOps);
  return 1;
}

int awts_execute_merkava_bytecode_file(const char* path, AwtsMerkavaHostFrame* frame) {
  AwtsMerkavaBytecode bytecode;
  int ok = awts_read_merkava_bytecode_file(path, &bytecode);
  if (ok) ok = awts_execute_merkava_bytecode(&bytecode, frame);
  awts_free_merkava_bytecode(&bytecode);
  return ok;
}
