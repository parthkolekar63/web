import React, { useState } from 'react';
import { 
  Shield, 
  Terminal, 
  Code2, 
  FileCode, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  Globe, 
  Copy,
  ExternalLink,
  Cpu
} from 'lucide-react';

const PYTHON_CODE = `import socket
import requests
import sys

class VulnScanner:
    def __init__(self, target):
        self.target = target
        self.host = target.replace("http://", "").replace("https://", "").split("/")[0]

    def scan_ports(self):
        common_ports = [21, 22, 80, 443, 3306]
        open_ports = []
        for port in common_ports:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            socket.setdefaulttimeout(1)
            if s.connect_ex((self.host, port)) == 0:
                open_ports.append(port)
            s.close()
        return open_ports

    def check_headers(self):
        response = requests.get(f"https://{self.host}")
        headers = response.headers
        # ... logic to check security headers ...
        return headers`;

export default function App() {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [target, setTarget] = useState('example.com');
  const [scanning, setScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const simulateScan = () => {
    setScanning(true);
    setLogs([]);
    const steps = [
      `[info] Initializing Python VulnScanner for ${target}...`,
      `[info] Resolving host: ${target}`,
      `[scan] Starting TCP port scan on common ports...`,
      `[scan] Port 80: OPEN`,
      `[scan] Port 443: OPEN`,
      `[scan] Port 22: CLOSED`,
      `[header] Fetching HTTP headers...`,
      `[vuln] WARNING: Missing 'Content-Security-Policy'`,
      `[vuln] WARNING: Missing 'X-Frame-Options'`,
      `[info] Scan complete. 2 vulnerabilities found.`
    ];

    steps.forEach((step, i) => {
      setTimeout(() => {
        setLogs(prev => [...prev, step]);
        if (i === steps.length - 1) setScanning(false);
      }, i * 600);
    });
  };

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-zinc-300 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/10 rounded-xl border border-blue-500/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Python VulnScan <span className="text-blue-500">Lab</span></h1>
              <p className="text-sm text-zinc-500">Educational Security Tooling & Analysis</p>
            </div>
          </div>
          <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Live Simulation
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'code' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Python Source
            </button>
          </div>
        </header>

        {activeTab === 'preview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Control Panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  Scanner Config
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-zinc-500 uppercase mb-2 block">Target Host</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input 
                        type="text" 
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        className="w-full bg-black/50 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-blue-500/50 outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={simulateScan}
                    disabled={scanning}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {scanning ? <span className="animate-pulse">Running Python Script...</span> : <><Play className="w-4 h-4" /> Run Scanner</>}
                  </button>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-xs font-mono text-zinc-500 uppercase mb-4">Module Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><Code2 className="w-4 h-4" /> Socket Engine</span>
                    <span className="text-emerald-500">LOADED</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Requests Lib</span>
                    <span className="text-emerald-500">LOADED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terminal Output */}
            <div className="lg:col-span-8">
              <div className="bg-black border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-[500px]">
                <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">python3 scanner.py</span>
                </div>
                <div className="p-6 font-mono text-sm overflow-y-auto flex-1 space-y-1 custom-scrollbar">
                  {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-700">
                      <Terminal className="w-12 h-12 mb-4 opacity-20" />
                      <p>Awaiting execution command...</p>
                    </div>
                  )}
                  {logs.map((log, i) => (
                    <div key={i} className={cn(
                      "flex gap-3",
                      log.includes('[vuln]') ? "text-red-400" : 
                      log.includes('[scan]') ? "text-blue-400" : "text-zinc-400"
                    )}>
                      <span className="opacity-30 select-none">{i + 1}</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {scanning && <div className="w-2 h-5 bg-blue-500 animate-pulse inline-block ml-2" />}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-zinc-900 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-white">scanner.py</span>
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText(PYTHON_CODE)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="p-0 overflow-x-auto">
              <pre className="p-6 text-sm font-mono leading-relaxed text-zinc-400">
                <code>{PYTHON_CODE}</code>
                <div className="mt-4 text-zinc-600 italic"># ... full script available in project files ...</div>
              </pre>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <footer className="mt-16 pt-8 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-sm">Python Requirements</h4>
            <p className="text-xs text-zinc-500">Requires Python 3.x and the 'requests' library. Install via: <code className="text-blue-500">pip install requests</code></p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-sm">Socket Scanning</h4>
            <p className="text-xs text-zinc-500">Uses low-level TCP handshakes to detect open ports without full connection overhead.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-sm">Header Auditing</h4>
            <p className="text-xs text-zinc-500">Analyzes HTTP response metadata to ensure modern security standards are enforced.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
