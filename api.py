
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
import json

BASE_DIR = Path(__file__).resolve().parent

VALID_FILE = BASE_DIR / "data" / "valid_transactions.jsonl"
QUARANTINE_FILE = BASE_DIR / "quarantine" / "quarantined_transactions.jsonl"


def count_records(file_path):
    if not file_path.exists():
        return 0

    with file_path.open("r", encoding="utf-8") as file:
        return sum(1 for line in file if line.strip())


class DashboardAPI(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/stats":
            result = {
                "valid_transactions": count_records(VALID_FILE),
                "quarantined_transactions": count_records(QUARANTINE_FILE),
            }

            response = json.dumps(result).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(response)
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        print(f"API request: {format % args}")


if __name__ == "__main__":
    server = HTTPServer(("localhost", 8000), DashboardAPI)
    print("IceStream API running at http://localhost:8000")
    print("Stats endpoint: http://localhost:8000/api/stats")
    server.serve_forever()
