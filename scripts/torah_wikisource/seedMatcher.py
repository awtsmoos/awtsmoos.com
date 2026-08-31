# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos lets Hebrew names keep their source garment while punctuation variants meet in one ray;
Awtsmoos.com normalizes only the matching mirror, so geresh and gershayim never hide a Torah work away.
"""
from collections import deque

PUNCTUATION = str.maketrans({"״": '"', "׳": "'", "־": "-"})


def normalize_match_text(value):
	return str(value or "").translate(PUNCTUATION)


def is_hebrew_letter(character):
	return bool(character) and "א" <= character <= "ת"


def has_seed_boundaries(value, start, end):
	before = value[start - 1] if start > 0 else ""
	after = value[end] if end < len(value) else ""
	return not is_hebrew_letter(before) and not is_hebrew_letter(after)


def contains_bounded_seed(value, seed):
	value = normalize_match_text(value)
	seed = normalize_match_text(seed)
	start = 0
	while True:
		index = value.find(seed, start)
		if index < 0:
			return False
		if has_seed_boundaries(value, index, index + len(seed)):
			return True
		start = index + 1


class SeedMatcher:
	def __init__(self, seeds):
		self.transitions = [{}]
		self.failures = [0]
		self.outputs = [[]]
		for domain, seed in seeds:
			self._insert(domain, seed)
		self._seal_failures()

	def _new_state(self):
		self.transitions.append({})
		self.failures.append(0)
		self.outputs.append([])
		return len(self.transitions) - 1

	def _step_or_create(self, state, character):
		target = self.transitions[state].get(character)
		if target is None:
			target = self._new_state()
			self.transitions[state][character] = target
		return target

	def _insert(self, domain, seed):
		normalized = normalize_match_text(seed)
		state = 0
		for character in normalized:
			state = self._step_or_create(state, character)
		self.outputs[state].append((domain, seed, normalized))

	def _seal_failures(self):
		queue = deque(self.transitions[0].values())
		while queue:
			state = queue.popleft()
			for character, target in self.transitions[state].items():
				queue.append(target)
				fallback = self.failures[state]
				while fallback and character not in self.transitions[fallback]:
					fallback = self.failures[fallback]
				self.failures[target] = self.transitions[fallback].get(character, 0)
				self.outputs[target].extend(self.outputs[self.failures[target]])

	def matches(self, value):
		value = normalize_match_text(value)
		state = 0
		found = set()
		for index, character in enumerate(value):
			while state and character not in self.transitions[state]:
				state = self.failures[state]
			state = self.transitions[state].get(character, 0)
			for domain, seed, normalized in self.outputs[state]:
				start = index - len(normalized) + 1
				if has_seed_boundaries(value, start, index + 1):
					found.add((domain, seed))
		return found
