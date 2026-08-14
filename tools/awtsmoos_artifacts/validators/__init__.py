# B"H
# Boruch Hashem
# Blessed is He

"""Public external artifact validators chosen by measured format identity."""

from .apk import ApkValidator
from .elf import ElfValidator
from .macho import MachOValidator
from .pe import PeValidator
from .wasm import WasmValidator

VALIDATORS = {
	"apk": ApkValidator,
	"elf": ElfValidator,
	"mach-o": MachOValidator,
	"pe": PeValidator,
	"webassembly": WasmValidator,
}

__all__ = [
	"ApkValidator",
	"ElfValidator",
	"MachOValidator",
	"PeValidator",
	"WasmValidator",
	"VALIDATORS",
]
