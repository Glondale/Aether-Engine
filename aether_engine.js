/**
 * AETHER-ENGINE v0.3.2
 * Repository: Glondale/Aether-Engine
 */

(function() {
    console.log("Aether Engine: Link Attempt...");

    class AetherEngine {
        constructor() {
            this.SAVE_KEY = 'AETHER_RESONANCE_DATA';
            this.state = this.loadState();
            this.nodes = [];
            this.init();
        }

        loadState() {
            const saved = localStorage.getItem(this.SAVE_KEY);
            return saved ? JSON.parse(saved) : {
                p: { name: 'Zell', integrity: 100, maxI: 100, resonance: 0, strain: 0, apt: 1 }
            };
        }

        saveState() {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.state));
            this.renderStats();
        }

        init() {
            this.injectStyles();
            this.createUI();
            this.renderStats();
            this.log("AETHER LINK ESTABLISHED.");
            this.log("DECODING SITE DATA...");
        }

        injectStyles() {
            if (document.getElementById('aether-styles')) return;
            const style = document.createElement('style');
            style.id = 'aether-styles';
            style.textContent = `
                #aether-sidebar {
                    position: fixed; top: 0; right: 0; width: 300px; height: 100%;
                    background: #050505; border-left: 2px solid #00ff41;
                    z-index: 9999; padding: 20px; font-family: 'Courier New', monospace;
                    color: #00ff41; display: flex; flex-direction: column; box-sizing: border-box;
                    transition: border-color 0.5s;
                }
                #aether-frame {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    border: 4px solid #00ff41; pointer-events: none; z-index: 9998;
                    transition: all 0.5s;
                }
                .aether-log { font-size: 11px; margin-bottom: 6px; line-height: 1.2; }
                .aether-input {
                    width: 100%; background: #000; border: 1px solid #00ff41;
                    color: #00ff41; padding: 8px; font-family: monospace; outline: none;
                }
                @keyframes jitter {
                    0% { transform: translate(0); }
                    25% { transform: translate(2px, -2px); }
                    75% { transform: translate(-2px, 2px); }
                }
            `;
            document.head.appendChild(style);
        }

        createUI() {
            // Check if UI already exists to prevent duplication
            if (document.getElementById('aether-sidebar')) return;

            document.documentElement.style.marginRight = '300px';
            
            const frame = document.createElement('div');
            frame.id = 'aether-frame';
            
            const side = document.createElement('div');
            side.id = 'aether-sidebar';
            
            this.statsEl = document.createElement('div');
            this.screenEl = document.createElement('div');
            this.screenEl.style.flexGrow = '1';
            this.screenEl.style.overflowY = 'auto';

            const input = document.createElement('input');
            input.className = 'aether-input';
            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    this.handleCommand(e.target.value);
                    e.target.value = '';
                }
            };

            side.appendChild(this.statsEl);
            side.appendChild(this.screenEl);
            side.appendChild(input);
            document.body.appendChild(frame);
            document.body.appendChild(side);
        }

        log(msg, color = '#00ff41') {
            const d = document.createElement('div');
            d.className = 'aether-log';
            d.style.color = color;
            d.textContent = '> ' + msg;
            this.screenEl.appendChild(d);
            this.screenEl.scrollTop = this.screenEl.scrollHeight;
        }

        renderStats() {
            const { p } = this.state;
            this.statsEl.innerHTML = `<div style="border-bottom:1px solid #00ff41; padding-bottom:10px; margin-bottom:10px;">
                <strong>${p.name.toUpperCase()}</strong><br>
                HP: ${p.integrity}% | RES: ${p.resonance}<br>
                STR: ${p.strain}% | APT: ${p.apt}
            </div>`;

            const frame = document.getElementById('aether-frame');
            const side = document.getElementById('aether-sidebar');
            if (!frame || !side) return;

            const r = Math.min(255, p.strain * 2.5);
            const g = Math.max(0, 255 - (p.strain * 2.5));
            const color = `rgb(${r}, ${g}, 60)`;
            
            frame.style.borderColor = color;
            side.style.borderColor = color;
            if (p.strain > 70) side.style.animation = 'jitter 0.1s infinite';
            else side.style.animation = 'none';
        }

        handleCommand(raw) {
            const parts = raw.toLowerCase().trim().split(' ');
            const cmd = parts[0];
            const arg = parts[1];
            
            if (cmd === 'scan') {
                this.log("PULSING DOM STRATA...");
                this.nodes = Array.from(document.querySelectorAll('h1, h2, h3, p, span'))
                    .filter(el => el.textContent.trim().length > 30)
                    .slice(0, 6);
                this.nodes.forEach((n, i) => {
                    this.log(`[${i}] ${n.textContent.substring(0, 30)}...`, '#888');
                });
            } 
            else if (cmd === 'siphon') {
                const idx = parseInt(arg);
                const node = this.nodes[idx];
                if (!node) return this.log("TARGET NODE NULL.");
                
                const gain = Math.floor(node.textContent.length / 50) + 1;
                this.state.p.resonance += gain;
                this.state.p.strain += Math.floor(Math.random() * 5);
                
                node.style.transition = 'all 1s';
                node.style.filter = 'blur(4px) grayscale(100%)';
                node.style.opacity = '0.2';
                this.log(`RESONANCE ABSORBED: +${gain}`);
                this.saveState();
            }
            else if (cmd === 'exit') {
                document.documentElement.style.marginRight = '0';
                const f = document.getElementById('aether-frame');
                const s = document.getElementById('aether-sidebar');
                if (f) f.remove();
                if (s) s.remove();
                window.AetherInstance = null; // Reset instance for next launch
            }
            else {
                this.log("HELP: scan, siphon [n], exit");
            }
        }
    }

    // Launch with a clean check
    if (document.getElementById('aether-sidebar')) {
        console.log("Aether Engine: System already active.");
    } else {
        window.AetherInstance = new AetherEngine();
        console.log("Aether Engine: Successfully initialized.");
    }
})();