/**
 * AETHER-ENGINE v0.3.3
 * Repository: Glondale/Aether-Engine
 */

(function() {
    console.log("Aether Engine: Link Attempt...");

    function showBootFailure(error) {
        console.error("Aether Engine: Initialization failed.", error);

        const existing = document.getElementById('aether-failure');
        if (existing) existing.remove();

        const failure = document.createElement('div');
        failure.id = 'aether-failure';
        failure.style.position = 'fixed';
        failure.style.right = '16px';
        failure.style.bottom = '16px';
        failure.style.width = '320px';
        failure.style.maxWidth = 'calc(100vw - 32px)';
        failure.style.background = '#050505';
        failure.style.border = '2px solid #a31212';
        failure.style.boxShadow = '0 0 24px rgba(163, 18, 18, 0.35)';
        failure.style.color = '#d7d7d7';
        failure.style.padding = '14px';
        failure.style.fontFamily = 'Courier New, monospace';
        failure.style.fontSize = '12px';
        failure.style.lineHeight = '1.4';
        failure.style.zIndex = '2147483647';

        const title = document.createElement('div');
        title.style.color = '#ff6b6b';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '8px';
        title.textContent = 'AETHER LINK DEGRADED';

        const body = document.createElement('div');
        body.textContent = 'Initialization failed on this page. Host restrictions or page structure prevented a clean link.';

        const detail = document.createElement('div');
        detail.style.marginTop = '8px';
        detail.style.color = '#9a9a9a';
        detail.textContent = error && error.message ? `FAULT: ${error.message}` : 'FAULT: Unknown initialization error.';

        failure.appendChild(title);
        failure.appendChild(body);
        failure.appendChild(detail);

        const mountPoint = document.body || document.documentElement;
        if (mountPoint) mountPoint.appendChild(failure);
    }

    class AetherEngine {
        constructor() {
            this.SAVE_KEY = 'AETHER_RESONANCE_DATA';
            this.state = this.loadState();
            this.nodes = [];
            this.init();
        }

        getDefaultState() {
            return {
                p: { name: 'Zell', integrity: 100, maxI: 100, resonance: 0, strain: 0, apt: 1 },
                journal: [],
                meta: { launches: 0, lastHost: '', lastSeenAt: '', status: 'idle' }
            };
        }

        normalizeState(saved) {
            const base = this.getDefaultState();
            const player = saved && saved.p ? saved.p : {};
            const journal = saved && Array.isArray(saved.journal) ? saved.journal.slice(-16) : [];
            const meta = saved && saved.meta ? saved.meta : {};

            return {
                ...base,
                ...saved,
                p: { ...base.p, ...player },
                journal,
                meta: { ...base.meta, ...meta }
            };
        }

        loadState() {
            const saved = localStorage.getItem(this.SAVE_KEY);

            if (!saved) {
                return this.getDefaultState();
            }

            try {
                return this.normalizeState(JSON.parse(saved));
            } catch (error) {
                console.warn('Aether Engine: Save data degraded, rebuilding state.', error);
                return this.getDefaultState();
            }
        }

        saveState(shouldRender = true) {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.state));
            if (shouldRender) this.renderStats();
        }

        init() {
            this.injectStyles();
            this.createUI();
            this.renderStats();

            this.restoreJournal();

            this.state.meta.launches += 1;
            this.state.meta.lastHost = window.location.host;
            this.state.meta.lastSeenAt = new Date().toISOString();
            this.state.meta.status = 'active';
            this.saveState(false);

            if (this.state.meta.launches > 1) {
                this.log(`AETHER TRACE RESYNCED: ${this.state.meta.lastHost || 'UNKNOWN HOST'}.`, '#7ee787');
            } else {
                this.log("AETHER LINK ESTABLISHED.");
            }

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

            if (!document.body) {
                throw new Error('Document body unavailable for HUD mount.');
            }

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
            const entry = { msg, color };
            this.state.journal.push(entry);
            this.state.journal = this.state.journal.slice(-16);
            this.state.meta.lastSeenAt = new Date().toISOString();

            const d = document.createElement('div');
            d.className = 'aether-log';
            d.style.color = color;
            d.textContent = '> ' + entry.msg;
            this.screenEl.appendChild(d);
            this.screenEl.scrollTop = this.screenEl.scrollHeight;
            this.saveState(false);
        }

        restoreJournal() {
            if (!this.state.journal.length) return;

            this.state.journal.forEach((entry) => {
                const d = document.createElement('div');
                d.className = 'aether-log';
                d.style.color = entry.color || '#00ff41';
                d.textContent = '> ' + entry.msg;
                this.screenEl.appendChild(d);
            });

            this.screenEl.scrollTop = this.screenEl.scrollHeight;
        }

        renderStats() {
            const { p } = this.state;

            while (this.statsEl.firstChild) {
                this.statsEl.removeChild(this.statsEl.firstChild);
            }

            const panel = document.createElement('div');
            panel.style.borderBottom = '1px solid #00ff41';
            panel.style.paddingBottom = '10px';
            panel.style.marginBottom = '10px';

            const name = document.createElement('strong');
            name.textContent = p.name.toUpperCase();

            const rowOne = document.createElement('div');
            rowOne.textContent = `HP: ${p.integrity}% | RES: ${p.resonance}`;

            const rowTwo = document.createElement('div');
            rowTwo.textContent = `STR: ${p.strain}% | APT: ${p.apt}`;

            panel.appendChild(name);
            panel.appendChild(document.createElement('br'));
            panel.appendChild(rowOne);
            panel.appendChild(rowTwo);
            this.statsEl.appendChild(panel);

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
                this.state.meta.status = 'dormant';
                this.state.meta.lastSeenAt = new Date().toISOString();
                this.saveState(false);
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
        try {
            window.AetherInstance = new AetherEngine();
            console.log("Aether Engine: Successfully initialized.");
        } catch (error) {
            window.AetherInstance = null;
            showBootFailure(error);
        }
    }
})();