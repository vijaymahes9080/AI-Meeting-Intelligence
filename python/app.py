"""
AI Meeting Intelligence - Python Backend Server
Provides REST API endpoints and serves the visual intelligence studio workspace.
"""
import os
import json
import mimetypes
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from core.intelligence_pipeline import IntelligencePipeline

PORT = 8000
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "seedData.json")
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "public")

pipeline = IntelligencePipeline(DATA_PATH)

class MeetingIntelligenceHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self, content_type="application/json"):
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_cors_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/state":
            self._set_cors_headers()
            self.wfile.write(json.dumps(pipeline.get_full_state()).encode("utf-8"))
            return

        if path == "/api/meetings":
            self._set_cors_headers()
            self.wfile.write(json.dumps(pipeline.meetings).encode("utf-8"))
            return

        if path == "/api/graphs/decisions":
            self._set_cors_headers()
            self.wfile.write(json.dumps(pipeline.decision_graph.to_dict()).encode("utf-8"))
            return

        if path == "/api/graphs/tasks":
            self._set_cors_headers()
            self.wfile.write(json.dumps(pipeline.task_graph.to_dict()).encode("utf-8"))
            return

        if path == "/api/graphs/knowledge":
            self._set_cors_headers()
            self.wfile.write(json.dumps(pipeline.knowledge_graph.to_dict()).encode("utf-8"))
            return

        if path == "/api/risks":
            self._set_cors_headers()
            self.wfile.write(json.dumps({
                "risks": pipeline.risk_analyzer.to_dict(),
                "summary": pipeline.risk_analyzer.compute_organization_risk_score()
            }).encode("utf-8"))
            return

        if path == "/api/contradictions":
            self._set_cors_headers()
            self.wfile.write(json.dumps(pipeline.contradiction_detector.to_dict()).encode("utf-8"))
            return

        if path == "/api/automations":
            self._set_cors_headers()
            self.wfile.write(json.dumps(pipeline.automation_engine.get_all_actions()).encode("utf-8"))
            return

        # Serve static frontend files
        if path == "/" or path == "":
            path = "/index.html"
        
        file_path = os.path.join(PUBLIC_DIR, path.lstrip("/"))
        if os.path.exists(file_path) and not os.path.isdir(file_path):
            mime_type, _ = mimetypes.guess_type(file_path)
            self._set_cors_headers(content_type=mime_type or "text/plain")
            with open(file_path, "rb") as f:
                self.wfile.write(f.read())
        else:
            self.send_error(404, "File Not Found")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        content_length = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        
        try:
            body = json.loads(post_body)
        except Exception:
            body = {}

        if path == "/api/query/why":
            question = body.get("question", "")
            result = pipeline.query_engine.query(question)
            self._set_cors_headers()
            self.wfile.write(json.dumps(result).encode("utf-8"))
            return

        if path == "/api/meetings/process":
            title = body.get("title", "Ad-hoc Meeting")
            transcript = body.get("transcript", "")
            attendees = body.get("attendees", [])
            new_meeting = pipeline.process_raw_transcript(title, transcript, attendees)
            self._set_cors_headers()
            self.wfile.write(json.dumps(new_meeting).encode("utf-8"))
            return

        if path == "/api/automations/dispatch":
            action_id = body.get("actionId")
            self._set_cors_headers()
            self.wfile.write(json.dumps({"status": "SUCCESS", "actionId": action_id, "dispatchedAt": "2026-08-24T07:50:00Z"}).encode("utf-8"))
            return

        self.send_error(404, "Endpoint Not Found")

def main():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, MeetingIntelligenceHandler)
    print(f"🚀 AI Meeting Intelligence Python Server running at http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == "__main__":
    main()
