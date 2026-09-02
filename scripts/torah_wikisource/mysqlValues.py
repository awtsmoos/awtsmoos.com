# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos walks escaped SQL tuples without confusing commas or quotes inside the flame;
Awtsmoos.com reads Wikimedia dump values deterministically so every relation returns by name.
"""


def decode_escape(character):
	return {
		"0": "\0", "b": "\b", "n": "\n", "r": "\r", "t": "\t", "Z": "\x1a"
	}.get(character, character)


def parse_scalar(token):
	value = token.strip()
	if value.upper() == "NULL":
		return None
	if not value:
		return ""
	if value[0] == "'" and value[-1] == "'":
		return value[1:-1]
	try:
		return int(value)
	except ValueError:
		try:
			return float(value)
		except ValueError:
			return value


def parse_tuple(source, start):
	values = []
	buffer = []
	quoted = False
	escaped = False
	index = start + 1
	while index < len(source):
		character = source[index]
		if escaped:
			buffer.append(decode_escape(character))
			escaped = False
		elif quoted and character == "\\":
			escaped = True
		elif character == "'":
			quoted = not quoted
			buffer.append(character)
		elif not quoted and character in ",)":
			values.append(parse_scalar("".join(buffer)))
			buffer = []
			if character == ")":
				return values, index + 1
		else:
			buffer.append(character)
		index += 1
	raise ValueError("unterminated SQL tuple")


def tuples_from_insert(line):
	marker = " VALUES "
	position = line.find(marker)
	if position < 0:
		return
	index = position + len(marker)
	while index < len(line):
		while index < len(line) and line[index] in " ,;\r\n\t":
			index += 1
		if index >= len(line):
			return
		if line[index] != "(":
			raise ValueError(f"expected tuple at {index}")
		values, index = parse_tuple(line, index)
		yield values
