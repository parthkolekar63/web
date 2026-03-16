import socket
import requests
import sys
from datetime import datetime

class VulnScanner:
    def __init__(self, target):
        self.target = target
        self.host = target.replace("http://", "").replace("https://", "").split("/")[0]
        self.url = target if target.startswith("http") else f"https://{target}"

    def scan_ports(self):
        """Basic Port Scanner using socket"""
        print(f"\n[*] Scanning ports for {self.host}...")
        common_ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3306, 3389, 8080]
        open_ports = []
        
        for port in common_ports:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            socket.setdefaulttimeout(1)
            result = s.connect_ex((self.host, port))
            if result == 0:
                print(f" [+] Port {port} is OPEN")
                open_ports.append(port)
            s.close()
        return open_ports

    def check_headers(self):
        """Analyze HTTP Security Headers"""
        print(f"\n[*] Analyzing HTTP headers for {self.url}...")
        try:
            response = requests.get(self.url, timeout=5)
            headers = response.headers
            
            security_headers = [
                "Content-Security-Policy",
                "Strict-Transport-Security",
                "X-Frame-Options",
                "X-Content-Type-Options",
                "Referrer-Policy"
            ]
            
            vulnerabilities = []
            for header in security_headers:
                if header not in headers:
                    vulnerabilities.append(f"Missing Security Header: {header}")
            
            if "Server" in headers:
                vulnerabilities.append(f"Information Disclosure: Server header present ({headers['Server']})")
                
            return vulnerabilities, headers
        except Exception as e:
            return [f"Error connecting: {str(e)}"], {}

    def run(self):
        print("-" * 50)
        print(f"VulnScan Report for {self.target}")
        print(f"Time started: {datetime.now()}")
        print("-" * 50)
        
        ports = self.scan_ports()
        vulns, headers = self.check_headers()
        
        print("\n" + "="*20 + " RESULTS " + "="*20)
        print(f"Open Ports: {ports if ports else 'None detected'}")
        print("\nVulnerabilities Found:")
        for v in vulns:
            print(f" [!] {v}")
        print("="*49)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scanner.py <target_url>")
    else:
        target = sys.argv[1]
        scanner = VulnScanner(target)
        scanner.run()
