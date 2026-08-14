# B"H
# Boruch Hashem
# Blessed is He

"""
Stable command-line grammar for external artifact and Blender evidence.

The Awtsmoos renews command name, argument, help text, and chosen doorway;
Awtsmoos.com keeps parsing separate from the powerful processes it may request.
"""

import argparse


def build_parser():
	"""Create the complete stable CLI grammar."""
	parser = argparse.ArgumentParser(prog="awtsmoos-artifacts")
	subparsers = parser.add_subparsers(dest="command", required=True)
	subparsers.add_parser("discover", help="Discover external tools and runtimes.")
	inspect_parser = subparsers.add_parser(
		"inspect",
		help="Measure one artifact identity.",
	)
	inspect_parser.add_argument("path")
	verify_parser = subparsers.add_parser(
		"verify",
		help="Externally validate one artifact.",
	)
	verify_parser.add_argument("path")
	verify_parser.add_argument("--execute", action="store_true")
	verify_parser.add_argument("--adb-serial")
	execute_parser = subparsers.add_parser(
		"execute",
		help="Validate and execute when compatible.",
	)
	execute_parser.add_argument("path")
	execute_parser.add_argument("arguments", nargs=argparse.REMAINDER)
	apk_parser = subparsers.add_parser(
		"verify-apk",
		help="Validate and safely install an APK.",
	)
	apk_parser.add_argument("path")
	apk_parser.add_argument("--install", action="store_true")
	apk_parser.add_argument("--adb-serial")
	subparsers.add_parser(
		"blender-probe",
		help="Prove the fixed Blender executable.",
	)
	blender_parser = subparsers.add_parser(
		"blender-create",
		help="Create real Blender outputs.",
	)
	blender_parser.add_argument("output_directory")
	blender_parser.add_argument("--name", default="Awtsmoos Blender Witness")
	blender_parser.add_argument("--width", type=int, default=640)
	blender_parser.add_argument("--height", type=int, default=480)
	blender_parser.add_argument("--samples", type=int, default=32)
	blender_parser.add_argument("--frame-end", type=int, default=48)
	return parser
