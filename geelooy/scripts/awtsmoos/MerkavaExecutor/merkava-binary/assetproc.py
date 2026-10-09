#!/usr/bin/env python3
# B"H - Merkava asset processor: images (multi-res + optimize), fonts (subset).
# Usage: assetproc.py <cmd> [args...]
#   imginfo <file>                    -> JSON {w,h,mode,format}
#   imgvar <in> <out> <maxw> <fmt>     -> resized+optimized variant
#   fontsubset <in> <out> <textfile>   -> subset TTF to glyphs in textfile
#   imgconvert <in> <out>              -> convert (e.g. webp->png)
import sys, json, os

def cmd_imginfo(path):
    from PIL import Image
    im = Image.open(path)
    print(json.dumps({"w": im.width, "h": im.height, "mode": im.mode, "format": im.format}))

def cmd_imgvar(inp, out, maxw, fmt):
    from PIL import Image
    maxw = int(maxw)
    im = Image.open(inp)
    if im.width > maxw:
        im = im.resize((maxw, int(im.height * maxw / im.width)), Image.LANCZOS)
    kw = {"optimize": True}
    if fmt == "png":
        if im.mode in ("RGBA", "LA"):
            im.save(out, "PNG", optimize=True)
        else:
            im.convert("RGB").save(out, "PNG", optimize=True)
    elif fmt == "webp":
        im.save(out, "WEBP", quality=82, method=6)
    elif fmt == "jpeg":
        im.convert("RGB").save(out, "JPEG", quality=82, optimize=True)
    else:
        raise SystemExit(f"unknown fmt {fmt}")
    print(json.dumps({"out": out, "bytes": os.path.getsize(out)}))

def cmd_fontsubset(inp, out, textfile):
    from fontTools import subset
    with open(textfile, encoding="utf-8") as f:
        text = f.read()
    opts = subset.Options()
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    opts.recalc_bounds = True
    opts.drop_tables += ["GSUB", "GPOS", "GDEF"]
    font = subset.load_font(inp, opts)
    ss = subset.Subsetter(opts)
    ss.populate(text=text)
    ss.subset(font)
    font.save(out)
    print(json.dumps({"out": out, "bytes": os.path.getsize(out),
                      "orig": os.path.getsize(inp)}))

def cmd_imgconvert(inp, out):
    from PIL import Image
    im = Image.open(inp)
    if out.endswith(".png"):
        im.save(out, "PNG", optimize=True)
    elif out.endswith(".ico"):
        im.save(out, "ICO", sizes=[(16,16),(32,32),(48,48),(256,256)])
    else:
        im.save(out)
    print(json.dumps({"out": out, "bytes": os.path.getsize(out)}))

if __name__ == "__main__":
    cmd = sys.argv[1]
    {"imginfo": lambda: cmd_imginfo(sys.argv[2]),
     "imgvar": lambda: cmd_imgvar(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5]),
     "fontsubset": lambda: cmd_fontsubset(sys.argv[2], sys.argv[3], sys.argv[4]),
     "imgconvert": lambda: cmd_imgconvert(sys.argv[2], sys.argv[3]),
    }[cmd]()
