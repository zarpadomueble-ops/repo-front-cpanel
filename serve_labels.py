import json
from http.server import BaseHTTPRequestHandler, HTTPServer
import base64

class RequestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type")
        self.end_headers()

    def do_POST(self):
        if self.path == '/save':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            with open('image_descriptions.json', 'w') as f:
                json.dump(data, f, indent=4)
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b"OK")
            print("Descriptions saved successfully!")

if __name__ == '__main__':
    server_address = ('', 8001)
    httpd = HTTPServer(server_address, RequestHandler)
    print("Starting labeling server on port 8001...")
    httpd.serve_forever()
