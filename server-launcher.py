#Use to create local host
import http.server
import socketserver

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    ".js": "application/javascript",
});

socketserver.TCPServer.allow_reuse_address = True

httpd = socketserver.TCPServer(("", PORT), Handler)

print ("Serving at port", PORT)
print(Handler.extensions_map[".js"])
httpd.serve_forever()
