// Pre-Commit Secret & Security Scanner Utility

export interface SecretScanResult {
  hasSecret: boolean;
  type?: string;
  matchedText?: string;
}

const SECRET_PATTERNS = [
  { name: "Stripe Secret Key", regex: /sk_live_[0-9a-zA-Z]{24,}/ },
  { name: "AWS Access Key ID", regex: /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/ },
  { name: "RSA Private Key", regex: /-----BEGIN RSA PRIVATE KEY-----/ },
  { name: "Generic Secret Token", regex: /(api_key|secret_key|private_key)\s*=\s*['"][0-9a-zA-Z_\-]{20,}['"]/i }
];

export function scanCodeForSecrets(content: string): SecretScanResult {
  for (const pattern of SECRET_PATTERNS) {
    const match = content.match(pattern.regex);
    if (match) {
      return {
        hasSecret: true,
        type: pattern.name,
        matchedText: match[0].substring(0, 15) + "..."
      };
    }
  }

  return { hasSecret: false };
}
