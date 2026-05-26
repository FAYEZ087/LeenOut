export interface BoilerplateFile {
  filename: string;
  filepath: string;
  content: string;
}

export const STARTER_BOILERPLATE: BoilerplateFile[] = [
  {
    filename: "index.html",
    filepath: "index.html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leenout Starter Playground</title>
  <!-- Link stylesheets relatively — compiled dynamically -->
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="workspace">
    <header>
      <div class="logo">Leen<span>out</span></div>
      <div class="badge">Live Playground</div>
    </header>
    
    <main>
      <h1>Stranger, welcome to the <span class="neon-text">Workspace</span>.</h1>
      <p>This neon dark boilerplate renders in real-time. Edit files in the Monaco pane, hit <kbd>Ctrl + S</kbd>, and watch the DOM re-compile with sub-millisecond hot-reload latency.</p>
      
      <div class="interaction-card">
        <button id="action-btn">Click to Execute script.js</button>
        <p id="counter-msg">Keystroke locks: ACTIVE</p>
      </div>
    </main>

    <footer>
      <span>Phase 2 Sandbox Iframe compiler • Secured sandbox environment</span>
    </footer>
  </div>

  <!-- Link javascript relatively — compiled dynamically -->
  <script src="app.js"></script>
</body>
</html>`
  },
  {
    filename: "style.css",
    filepath: "style.css",
    content: `/* Leenout HSL Acid Dark Design System */
:root {
  --bg: #0a0a0a;
  --surface: #111111;
  --border: #222222;
  --accent: #e8ff47; /* Acid Yellow */
  --accent-orange: #ff6b35; /* Orange Burn */
  --text: #f0f0f0;
  --muted: #888888;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: 'DM Mono', monospace, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 60px 20px;
  overflow-y: auto;
}

/* Subtle Film Grain Noise */
body::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
  pointer-events: none;
  opacity: 0.3;
}

.workspace {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 40px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.7);
  position: relative;
}

.workspace::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, var(--accent), var(--accent-orange));
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-b: 1px solid var(--border);
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.logo {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -1px;
}

.logo span {
  color: var(--accent);
}

.badge {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  border: 1px solid var(--accent);
  color: var(--accent);
  padding: 4px 10px;
}

h1 {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: 15px;
  line-height: 1.2;
}

.neon-text {
  color: var(--accent-orange);
}

p {
  color: var(--muted);
  margin-bottom: 24px;
  font-size: 13px;
}

kbd {
  background: #1a1a1a;
  border: 1px solid var(--border);
  padding: 2px 6px;
  font-size: 11px;
  color: var(--accent);
}

.interaction-card {
  background: #070707;
  border: 1px solid var(--border);
  padding: 24px;
  text-align: center;
}

button {
  background: var(--accent);
  color: var(--bg);
  border: none;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
}

button:hover {
  background: var(--accent-orange);
  color: var(--text);
}

#counter-msg {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  color: var(--accent-orange);
}

footer {
  margin-top: 30px;
  border-t: 1px solid var(--border);
  padding-top: 20px;
  font-size: 10px;
  color: #444444;
  text-align: center;
}`
  },
  {
    filename: "app.js",
    filepath: "app.js",
    content: `// Dynamic Interactive Script

const actionBtn = document.getElementById('action-btn');
const counterMsg = document.getElementById('counter-msg');

let clickCount = 0;

if (actionBtn && counterMsg) {
  actionBtn.addEventListener('click', () => {
    clickCount++;
    actionBtn.textContent = 'Script trigger acknowledged!';
    actionBtn.style.background = '#ff6b35';
    actionBtn.style.color = '#f0f0f0';
    
    counterMsg.textContent = \`Edits executed: \${clickCount} times in local memory\`;
    
    console.log(\`[STUDIO] script.js triggered clickCount: \${clickCount}\`);
    
    setTimeout(() => {
      actionBtn.textContent = 'Click to Execute script.js';
      actionBtn.style.background = '#e8ff47';
      actionBtn.style.color = '#0a0a0a';
    }, 1500);
  });
}`
  }
];
