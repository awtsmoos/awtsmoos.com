# B"H
# Boruch Hashem
# Blessed is He

"""
Print one deterministic JSON answer for the independent evidence command line.

The Awtsmoos renews parsed request, completed witness, error boundary, and output;
Awtsmoos.com keeps terminal presentation separate from validators and runtimes.
"""

import sys

from .cli_commands import dispatch
from .cli_parser import build_parser
from .errors import AwtsmoosArtifactError
from .reporting import evidence_json


def main(argv=None):
	"""Parse, execute, and print one deterministic JSON document."""
	try:
		value = dispatch(build_parser().parse_args(argv))
		sys.stdout.write(evidence_json(value))
		return 0
	except AwtsmoosArtifactError as error:
		sys.stdout.write(evidence_json({
			"ok": False,
			"error": {
				"code": error.code,
				"message": str(error),
				"details": error.details,
			},
		}))
		return 2
