# B"H
# Boruch Hashem
# Blessed is He

"""
Dispatch parsed CLI requests into artifact or Blender evidence services.

The Awtsmoos renews chosen command, bounded service, and returned witness together;
Awtsmoos.com keeps command meaning separate from argument grammar and JSON printing.
"""

from .blender import BlenderDiscovery, BlenderRunner, BlenderSceneRequest
from .errors import AwtsmoosArtifactError
from .identity import ArtifactIdentifier
from .orchestrator import ArtifactOrchestrator


def dispatch(arguments):
	"""Execute one parsed command and return a serializable evidence value."""
	orchestrator = ArtifactOrchestrator()
	if arguments.command == "discover":
		return orchestrator.discover()
	if arguments.command == "inspect":
		return ArtifactIdentifier().identify(arguments.path)
	if arguments.command == "verify":
		return orchestrator.verify(
			arguments.path,
			execute=arguments.execute,
			adb_serial=arguments.adb_serial,
		)
	if arguments.command == "execute":
		return orchestrator.verify(
			arguments.path,
			execute=True,
			arguments=tuple(arguments.arguments),
		)
	if arguments.command == "verify-apk":
		return _verify_apk(arguments, orchestrator)
	if arguments.command == "blender-probe":
		return BlenderDiscovery().require()
	if arguments.command == "blender-create":
		return _create_blender_scene(arguments)
	raise AwtsmoosArtifactError(
		"CLI_COMMAND_UNKNOWN",
		f"Unknown command '{arguments.command}'.",
	)


def _verify_apk(arguments, orchestrator):
	"""Require APK format after generic validation and optional emulator install."""
	report = orchestrator.verify(
		arguments.path,
		execute=arguments.install,
		adb_serial=arguments.adb_serial,
	)
	if report.identity.format != "apk":
		raise AwtsmoosArtifactError(
			"APK_REQUIRED",
			"The supplied artifact is not an APK.",
		)
	return report


def _create_blender_scene(arguments):
	"""Create a bounded scene request and invoke the fixed Blender runner."""
	request = BlenderSceneRequest(
		name=arguments.name,
		width=arguments.width,
		height=arguments.height,
		samples=arguments.samples,
		frame_end=arguments.frame_end,
	)
	return BlenderRunner().create(arguments.output_directory, request)
