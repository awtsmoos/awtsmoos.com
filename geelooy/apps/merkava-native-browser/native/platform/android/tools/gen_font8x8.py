from PIL import Image, ImageDraw, ImageFont

# Try a clean monospace-ish bitmap rendering
font = ImageFont.load_default(size=16)

glyphs = {}
for cp in range(32, 127):
    ch = chr(cp)
    # render large then downscale for clean 8x8
    big = Image.new('L', (32, 32), 0)
    d = ImageDraw.Draw(big)
    d.text((2, 2), ch, font=font, fill=255)
    bbox = big.getbbox()
    if bbox is None:
        glyphs[cp] = [0]*8
        continue
    cell = big.crop(bbox)
    # scale to fit 8x8 preserving aspect
    w, h = cell.size
    scale = min(8.0/w, 8.0/h)
    nw, nh = max(1,int(w*scale)), max(1,int(h*scale))
    cell = cell.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new('L', (8, 8), 0)
    canvas.paste(cell, ((8-nw)//2, (8-nh)//2))
    px = canvas.load()
    rows = []
    for y in range(8):
        byte = 0
        for x in range(8):
            if px[x, y] > 100:
                byte |= (0x80 >> x)
        rows.append(byte)
    glyphs[cp] = rows

# show samples
for cp in [ord('H'), ord('e'), ord('l'), ord('o'), ord('M'), ord('a'), ord(' '), ord('!')]:
    print(f"--- {chr(cp)!r} (U+{cp:04X}) ---")
    for r in glyphs[cp]:
        print(f"{r:08b}".replace('0','.').replace('1','#'))
