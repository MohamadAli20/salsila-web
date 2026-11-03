"""Local static preview with the same clean page URLs as Vercel."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit
from functools import partial

ROOT = Path(__file__).resolve().parent

class CleanURLHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        parsed = urlsplit(path)
        if parsed.path == '/contribute':
            path = '/contribute.html'
        return super().translate_path(path)

    def send_head(self):
        parsed = urlsplit(self.path)
        if parsed.path == '/contribute.html':
            destination = '/contribute' + ('?' + parsed.query if parsed.query else '')
            self.send_response(308)
            self.send_header('Location', destination)
            self.send_header('Content-Length', '0')
            self.end_headers()
            return None
        return super().send_head()

if __name__ == '__main__':
    handler = partial(CleanURLHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(('127.0.0.1', 3001), handler)
    print('Salsilah preview: http://127.0.0.1:3001/ (genealogy: /contribute)', flush=True)
    server.serve_forever()
