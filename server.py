#!/usr/bin/env python3
"""
ZIP Tree Visualizer - Python Web Server
A simple HTTP server that parses ZIP files and returns tree structure as JSON
"""

import http.server
import socketserver
import json
import zipfile
import io
import urllib.parse
import os
from pathlib import Path

PORT = 8080

class ZipTreeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='frontend', **kwargs)
    
    def do_GET(self):
        """Handle GET requests - serve static files"""
        if self.path == '/' or self.path == '/index.html':
            self.path = '/index.html'
        return super().do_GET()
    
    def do_POST(self):
        """Handle POST requests - process ZIP file uploads"""
        if self.path == '/api/upload':
            self.handle_upload()
        else:
            self.send_error(404, "Not Found")
    
    def handle_upload(self):
        """Process uploaded ZIP file and return tree structure"""
        try:
            # Read content length
            content_length = int(self.headers['Content-Length'])
            
            # Read the request body
            post_data = self.rfile.read(content_length)
            
            # Parse multipart form data
            boundary = None
            content_type = self.headers.get('Content-Type', '')
            if 'boundary=' in content_type:
                boundary = '--' + content_type.split('boundary=')[1].strip()
            
            if not boundary:
                self.send_json_response({'error': 'No boundary found in Content-Type'}, 400)
                return
            
            # Extract file data from multipart
            file_data = self.extract_file_from_multipart(post_data, boundary)
            
            if not file_data:
                self.send_json_response({'error': 'No file data found in upload'}, 400)
                return
            
            # Parse ZIP file
            tree = self.parse_zip(file_data)
            
            # Send JSON response
            self.send_json_response(tree, 200)
            
        except Exception as e:
            print(f"Error processing upload: {e}")
            self.send_json_response({'error': str(e)}, 500)
    
    def extract_file_from_multipart(self, data, boundary):
        """Extract file binary data from multipart form data"""
        try:
            # Find the file data section
            boundary_bytes = boundary.encode('utf-8')
            parts = data.split(boundary_bytes)
            
            for part in parts:
                if b'Content-Type:' in part or b'filename=' in part:
                    # Find the double CRLF that separates headers from body
                    header_end = part.find(b'\r\n\r\n')
                    if header_end == -1:
                        header_end = part.find(b'\n\n')
                        if header_end != -1:
                            header_end += 2
                    else:
                        header_end += 4
                    
                    if header_end > 0:
                        file_data = part[header_end:]
                        # Remove trailing boundary markers and whitespace
                        file_data = file_data.rstrip(b'\r\n-')
                        return file_data
            
            return None
        except Exception as e:
            print(f"Error extracting file: {e}")
            return None
    
    def parse_zip(self, zip_data):
        """Parse ZIP file and build tree structure"""
        tree = {
            'name': 'root',
            'path': '',
            'isDirectory': True,
            'children': []
        }
        
        path_map = {'': tree}
        
        try:
            with zipfile.ZipFile(io.BytesIO(zip_data), 'r') as zip_file:
                for entry in zip_file.namelist():
                    # Skip empty entries
                    if not entry:
                        continue
                    
                    # Remove trailing slash for directories
                    clean_path = entry.rstrip('/')
                    parts = [p for p in clean_path.split('/') if p]
                    
                    is_dir = entry.endswith('/')
                    current_path = ''
                    current_node = tree
                    
                    for i, part in enumerate(parts):
                        is_last = i == len(parts) - 1
                        node_is_dir = is_last and is_dir or not is_last
                        
                        current_path = f"{current_path}/{part}" if current_path else part
                        
                        if current_path not in path_map:
                            new_node = {
                                'name': part,
                                'path': current_path,
                                'isDirectory': node_is_dir,
                                'children': []
                            }
                            current_node['children'].append(new_node)
                            path_map[current_path] = new_node
                        
                        current_node = path_map[current_path]
        
        except zipfile.BadZipFile:
            raise Exception("Invalid or corrupted ZIP file")
        except Exception as e:
            raise Exception(f"Error parsing ZIP: {str(e)}")
        
        return tree
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response"""
        json_data = json.dumps(data, indent=2)
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(json_data.encode('utf-8'))))
        self.end_headers()
        self.wfile.write(json_data.encode('utf-8'))
    
    def end_headers(self):
        """Add CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.end_headers()

def main():
    """Start the web server"""
    os.chdir(Path(__file__).parent)
    
    with socketserver.TCPServer(("", PORT), ZipTreeHandler) as httpd:
        print("=" * 50)
        print("ZIP Tree Visualizer - Web Server")
        print("=" * 50)
        print(f"Server running on http://localhost:{PORT}")
        print("Open your browser and navigate to the URL above")
        print("Press Ctrl+C to stop the server")
        print("=" * 50)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    main()

