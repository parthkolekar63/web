import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import net from "net";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Port Scanner Logic
  const scanPort = (host: string, port: number): Promise<{ port: number; open: boolean }> => {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1500);

      socket.on("connect", () => {
        socket.destroy();
        resolve({ port, open: true });
      });

      socket.on("timeout", () => {
        socket.destroy();
        resolve({ port, open: false });
      });

      socket.on("error", () => {
        socket.destroy();
        resolve({ port, open: false });
      });

      socket.connect(port, host);
    });
  };

  // API Routes
  app.post("/api/scan", async (req, res) => {
    const { target } = req.body;

    if (!target) {
      return res.status(400).json({ error: "Target is required" });
    }

    try {
      // Clean target (remove http/https for port scanning)
      const host = target.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
      const url = target.startsWith("http") ? target : `https://${target}`;

      // 1. Port Scan (Common ports)
      const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3306, 3389, 5432, 8080];
      const portResults = await Promise.all(commonPorts.map((p) => scanPort(host, p)));

      // 2. Header Analysis
      let headers: any = {};
      let status = 0;
      let error: string | null = null;

      try {
        const response = await axios.get(url, { 
          timeout: 5000,
          validateStatus: () => true, // Don't throw on 4xx/5xx
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        headers = response.headers;
        status = response.status;
      } catch (e: any) {
        error = e.message;
      }

      // 3. Vulnerability Logic
      const vulnerabilities = [];

      // Security Headers
      const securityHeaders = [
        "Content-Security-Policy",
        "Strict-Transport-Security",
        "X-Frame-Options",
        "X-Content-Type-Options",
        "Referrer-Policy",
        "Permissions-Policy"
      ];

      securityHeaders.forEach(header => {
        if (!headers[header.toLowerCase()]) {
          vulnerabilities.push({
            id: `missing-${header.toLowerCase()}`,
            severity: "low",
            title: `Missing Security Header: ${header}`,
            description: `The ${header} header is not set, which could expose the site to various attacks like XSS or Clickjacking.`
          });
        }
      });

      // Information Disclosure
      if (headers["server"]) {
        vulnerabilities.push({
          id: "info-disclosure-server",
          severity: "medium",
          title: "Server Header Exposed",
          description: `The 'Server' header is present (${headers["server"]}). This can reveal the web server version and operating system.`,
          value: headers["server"]
        });
      }

      if (headers["x-powered-by"]) {
        vulnerabilities.push({
          id: "info-disclosure-powered-by",
          severity: "medium",
          title: "X-Powered-By Header Exposed",
          description: `The 'X-Powered-By' header is present (${headers["x-powered-by"]}). This reveals the underlying technology stack.`,
          value: headers["x-powered-by"]
        });
      }

      // Open Ports Vulnerabilities
      const dangerousPorts = [21, 23, 445, 3306, 3389];
      portResults.filter(p => p.open && dangerousPorts.includes(p.port)).forEach(p => {
        vulnerabilities.push({
          id: `open-port-${p.port}`,
          severity: "high",
          title: `Sensitive Port Open: ${p.port}`,
          description: `Port ${p.port} is open. This port is often used for administrative or database services and should not be exposed publicly.`
        });
      });

      res.json({
        host,
        url,
        status,
        headers,
        portResults,
        vulnerabilities,
        error
      });

    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
