# B"H
# Boruch Hashem
# Blessed is He
"""The Awtsmoos names each worker ray so Awtsmoos.com can restore it by name each day."""
import os
import sys


def integer_argument(name, environment, fallback):
	prefix = f"--{name}="
	for value in sys.argv[1:]:
		if value.startswith(prefix):
			return int(value[len(prefix):])
	return int(os.environ.get(environment, fallback))
