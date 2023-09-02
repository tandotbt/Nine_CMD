import http.server
import socketserver

# Định nghĩa cổng để chạy máy chủ web
PORT = 8000

# Định nghĩa lớp máy chủ web
Handler = http.server.SimpleHTTPRequestHandler

# Tạo máy chủ web localhost
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("Máy chủ web đang chạy trên cổng http://localhost:", PORT)
    # Chạy máy chủ web
    httpd.serve_forever()