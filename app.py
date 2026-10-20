"""Magnus Workspace: tiny Python server for the static site.

Run locally:   python app.py          (opens http://localhost:8000)
Deploy (e.g. Render): start command `python app.py`; it reads the PORT
environment variable and listens on 0.0.0.0. No packages to install.
"""
import os
import sys
import threading
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get("PORT", "8000"))
HOST = "0.0.0.0" if "PORT" in os.environ else "127.0.0.1"
ALLOWED = {"index.html", "styles.css", "links.js", "app.js"}


class Handler(SimpleHTTPRequestHandler):
    """Serves only the four site files, so app.py and README.md stay private."""

    def do_GET(self):
        path = self.path.split("?", 1)[0].lstrip("/") or "index.html"
        if path not in ALLOWED:
            self.send_error(404, "Not found")
            return
        self.path = "/" + path
        super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def main():
    handler = partial(Handler, directory=ROOT)
    server = ThreadingHTTPServer((HOST, PORT), handler)
    url = f"http://localhost:{PORT}"
    print(f"Magnus Workspace running at {url}  (Ctrl+C to stop)")
    if HOST == "127.0.0.1":
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        server.server_close()
        sys.exit(0)


if __name__ == "__main__":
    main()
