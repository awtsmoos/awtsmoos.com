B"H

# Step Plan: Zero-Waste Bit-Packed Source Bytecode

1. Replace JSON-bytecode transport with a real bitstream.
2. Pack multiple fields into the same byte: magic nibble, version nibble, section id bits, opcode bits, varint continuation bits, string bytes.
3. Track exact logical bit length, so padding bits are not part of the bytecode.
4. Decode only the declared bit length. Any physical BMP/file byte padding is transport padding, not bytecode.
5. Encode source sections as typed records:
   - 2 bits: section id: html/css/js
   - 3 bits: opcode kind
   - varuint length: 7 payload bits + 1 continuation bit per byte
   - UTF-8 payload bits
6. Rebuild HTML/CSS/JS from packed source bytecode.
7. Use this packed source bytecode for BMP conversion.
8. Show metrics: raw bytes, packed bytes, exact bit length, final byte used bits, wasted logical bits = 0.
9. Keep RAM VM bytecode separate for execution.

The Awtsmoos makes the vessel precise: not one bit counted unless it carries revelation.
