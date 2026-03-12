#!/usr/bin/env python3
"""
Example ANSD browser fetcher service for Cloudflare-protected endpoints.

Expected request body (POST):
{
  "url": "https://senegal.opendataforafrica.org/api/1.0/...",
  "method": "GET",
  "headers": { "Accept": "application/json" },
  "provider": "ANSD"
}

Response:
{
  "status": 200,
  "data": { ...JSON... }
}

Run:
  pip install undetected-chromedriver selenium
  python scripts/ansd_browser_fetcher_example.py
"""

import json
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

import undetected_chromedriver as uc
from selenium.webdriver.common.by import By

HOST = "127.0.0.1"
PORT = 8799
AUTH_TOKEN = ""  # Optional bearer token expected by this service.


def fetch_json_with_browser(url: str) -> dict:
  options = uc.ChromeOptions()
  options.headless = False
  driver = uc.Chrome(options=options)
  try:
    driver.get(url)
    time.sleep(3)
    body_text = driver.find_element(By.TAG_NAME, "body").text
    return json.loads(body_text)
  finally:
    driver.quit()


class Handler(BaseHTTPRequestHandler):
  def _send(self, code: int, payload: dict):
    raw = json.dumps(payload).encode("utf-8")
    self.send_response(code)
    self.send_header("Content-Type", "application/json")
    self.send_header("Content-Length", str(len(raw)))
    self.end_headers()
    self.wfile.write(raw)

  def do_POST(self):
    if self.path != "/fetch":
      self._send(404, {"error": "not found"})
      return

    if AUTH_TOKEN:
      auth = self.headers.get("Authorization", "")
      if auth != f"Bearer {AUTH_TOKEN}":
        self._send(401, {"error": "unauthorized"})
        return

    length = int(self.headers.get("Content-Length", "0"))
    if length <= 0:
      self._send(400, {"error": "missing body"})
      return

    raw = self.rfile.read(length).decode("utf-8")
    try:
      body = json.loads(raw)
    except Exception:
      self._send(400, {"error": "invalid json"})
      return

    target_url = str(body.get("url", "")).strip()
    if not target_url:
      self._send(400, {"error": "url is required"})
      return

    try:
      data = fetch_json_with_browser(target_url)
      self._send(200, {"status": 200, "data": data})
    except Exception as exc:
      self._send(500, {"error": str(exc)})


def main():
  server = HTTPServer((HOST, PORT), Handler)
  print(f"ANSD browser fetcher listening on http://{HOST}:{PORT}/fetch")
  server.serve_forever()


if __name__ == "__main__":
  main()

