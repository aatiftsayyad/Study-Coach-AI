/* ==========================================================================
   STUDY COACH AI - INTERACTIVE SAAS ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 1. Mobile Menu Drawer Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');
    const menuIcon = document.getElementById('menu-icon');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            const isOpen = navLinks.classList.contains('open');
            
            // Toggle icon
            if (isOpen) {
                menuIcon.setAttribute('data-lucide', 'x');
            } else {
                menuIcon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        });

        // Close drawer when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                menuIcon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            });
        });
    }

    // 2. Sticky Navbar Styling
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Scroll Reveal System using IntersectionObserver
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 4. Interactive Neural Network Canvas (Hero Section Background)
    const neuralCanvas = document.getElementById('neural-canvas');
    if (neuralCanvas) {
        const nCtx = neuralCanvas.getContext('2d');
        let nodes = [];
        const maxNodes = 60;
        const connectionDistance = 110;
        const mouseConnectionDistance = 180;
        let mouse = { x: null, y: null };

        const resizeNeuralCanvas = () => {
            const rect = neuralCanvas.parentElement.getBoundingClientRect();
            neuralCanvas.width = rect.width;
            neuralCanvas.height = rect.height;
        };
        resizeNeuralCanvas();
        window.addEventListener('resize', resizeNeuralCanvas);

        // Track Mouse relative to Neural Canvas
        window.addEventListener('mousemove', (e) => {
            const rect = neuralCanvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class NeuralNode {
            constructor() {
                this.x = Math.random() * neuralCanvas.width;
                this.y = Math.random() * neuralCanvas.height;
                this.vx = (Math.random() - 0.5) * 0.25; // Slow fluid drift
                this.vy = (Math.random() - 0.5) * 0.25;
                this.radius = Math.random() * 2 + 1.5;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce at edges
                if (this.x < 0 || this.x > neuralCanvas.width) this.vx = -this.vx;
                if (this.y < 0 || this.y > neuralCanvas.height) this.vy = -this.vy;
            }

            draw() {
                nCtx.beginPath();
                nCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                nCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                nCtx.fill();
            }
        }

        // Initialize Nodes
        for (let i = 0; i < maxNodes; i++) {
            nodes.push(new NeuralNode());
        }

        const animateNeuralNetwork = () => {
            nCtx.clearRect(0, 0, neuralCanvas.width, neuralCanvas.height);

            // Update & Draw Nodes
            nodes.forEach(node => {
                node.update();
                node.draw();
            });

            // Draw Connection Lines
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        const alpha = (1 - dist / connectionDistance) * 0.04;
                        nCtx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        nCtx.lineWidth = 0.55;
                        nCtx.beginPath();
                        nCtx.moveTo(nodes[i].x, nodes[i].y);
                        nCtx.lineTo(nodes[j].x, nodes[j].y);
                        nCtx.stroke();
                    }
                }

                // Mouse connections (interactive glow)
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = nodes[i].x - mouse.x;
                    const dy = nodes[i].y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < mouseConnectionDistance) {
                        const alpha = (1 - dist / mouseConnectionDistance) * 0.11;
                        // Draw glow lines with accent blue-purple tint
                        const grad = nCtx.createLinearGradient(nodes[i].x, nodes[i].y, mouse.x, mouse.y);
                        grad.addColorStop(0, 'rgba(139, 92, 246, 0.12)');
                        grad.addColorStop(1, 'rgba(59, 130, 246, 0.03)');
                        nCtx.strokeStyle = grad;
                        nCtx.lineWidth = 0.8;
                        nCtx.beginPath();
                        nCtx.moveTo(nodes[i].x, nodes[i].y);
                        nCtx.lineTo(mouse.x, mouse.y);
                        nCtx.stroke();

                        // Highlight node orb itself near mouse
                        nCtx.beginPath();
                        nCtx.arc(nodes[i].x, nodes[i].y, nodes[i].radius * 1.5, 0, Math.PI * 2);
                        nCtx.fillStyle = 'rgba(59, 130, 246, 0.3)';
                        nCtx.fill();
                    }
                }
            }

            requestAnimationFrame(animateNeuralNetwork);
        };
        animateNeuralNetwork();
    }

    // 5. Simulated Workspace Chat Preview (Redesigned split-pane UI)
    const chatPreviewSection = document.getElementById('ai-preview');
    const coachMessage = document.getElementById('coach-message');
    const coachBubbleContent = document.getElementById('coach-bubble-content');
    const chatBody = document.getElementById('chat-body');
    let chatStarted = false;

    const simulateCoachTyping = () => {
        coachMessage.classList.remove('hidden');
        coachBubbleContent.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        chatBody.scrollTop = chatBody.scrollHeight;

        // Custom indicator styles
        const style = document.createElement('style');
        style.textContent = `
            .typing-indicator {
                display: flex;
                align-items: center;
                gap: 5px;
                height: 24px;
            }
            .typing-indicator span {
                width: 8px;
                height: 8px;
                background-color: var(--color-text-muted);
                border-radius: 50%;
                opacity: 0.4;
                animation: typingBounce 1.4s infinite ease-in-out both;
            }
            .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
            .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
            @keyframes typingBounce {
                0%, 80%, 100% { transform: scale(0.6); }
                40% { transform: scale(1.1) translateY(-5px); opacity: 0.9; }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            // Replace indicator with descriptive initial message
            coachBubbleContent.innerHTML = `
                <p>Hello! I've analyzed your goal. Restructuring study blocks for System Architecture & Database Design inside your profile workspace.</p>
                <div class="preview-card-grid">
                    <!-- Widget 1: Student Goal & Spaced Plan -->
                    <div class="demo-feature-card reveal-widget">
                        <div class="demo-card-header text-gradient">
                            <i data-lucide="target"></i>
                            <span>Goal & Spaced Plan</span>
                        </div>
                        <div class="demo-goal-title">System Arch & DB Design</div>
                        <div class="demo-roadmap-timeline">
                            <div class="demo-roadmap-step">
                                <span class="roadmap-mini-dot"></span>
                                <span>Days 1-10: Scalability & Load Balancing</span>
                            </div>
                            <div class="demo-roadmap-step">
                                <span class="roadmap-mini-dot active"></span>
                                <span>Days 11-20: Partitioning & Sharding</span>
                            </div>
                            <div class="demo-roadmap-step">
                                <span class="roadmap-mini-dot pending"></span>
                                <span>Days 21-30: Caching & Audits</span>
                            </div>
                        </div>
                    </div>

                    <!-- Widget 2: Memory-Based Coaching -->
                    <div class="demo-feature-card reveal-widget">
                        <div class="demo-card-header text-gradient">
                            <i data-lucide="brain"></i>
                            <span>Memory Coach Matrix</span>
                        </div>
                        <div class="demo-memory-list">
                            <div class="demo-memory-item">
                                <span>CAP Theorem</span>
                                <span class="memory-recall-tag urgent">Recall (1d)</span>
                            </div>
                            <div class="demo-memory-item">
                                <span>Consistent Hashing</span>
                                <span class="memory-recall-tag">Recall (3d)</span>
                            </div>
                            <div class="demo-memory-item">
                                <span>SQL vs NoSQL indexes</span>
                                <span class="memory-recall-tag">Recall (5d)</span>
                            </div>
                        </div>
                    </div>

                    <!-- Widget 3: Smart Quiz Engine -->
                    <div class="demo-feature-card quiz-widget-card reveal-widget">
                        <div class="demo-card-header text-gradient">
                            <i data-lucide="pencil-ruler"></i>
                            <span>Smart Quiz Engine</span>
                        </div>
                        <div class="quiz-question">Which scaling architecture compromises write performance to ensure complete consistency?</div>
                        <div class="quiz-choices">
                            <button class="quiz-choice-mock">A. Asynchronous Replication</button>
                            <button class="quiz-choice-mock correct-choice">B. Multi-Region Synchronous Consensus</button>
                            <button class="quiz-choice-mock">C. Master-Slave Partitioning</button>
                            <button class="quiz-choice-mock">D. Active-Active Write Ring</button>
                        </div>
                    </div>

                    <!-- Widget 4: Progress Tracker -->
                    <div class="demo-feature-card progress-widget-card reveal-widget">
                        <div class="demo-card-header text-gradient">
                            <i data-lucide="activity"></i>
                            <span>Progress Tracker</span>
                        </div>
                        <div class="progress-bar-wrapper">
                            <div class="progress-bar-labels">
                                <span>Syllabus Mastered: 13/20 units</span>
                                <span>65% Complete</span>
                            </div>
                            <div class="progress-track-line">
                                <div class="progress-fill-line"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <p style="margin-top: 14px;">Your next active recall session is active. Ready to start?</p>
            `;

            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            chatBody.scrollTop = chatBody.scrollHeight;
        }, 2200);
    };

    if (chatPreviewSection) {
        const chatObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !chatStarted) {
                    setTimeout(simulateCoachTyping, 600);
                    chatStarted = true;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        chatObserver.observe(chatPreviewSection);
    }

    // 6. Canvas Background Floating Particles System (Faint Dust Particles)
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        const maxParticles = 40;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.15;
                this.speedY = (Math.random() - 0.5) * 0.15;
                this.color = Math.random() < 0.5 
                    ? `rgba(59, 130, 246, ${Math.random() * 0.08 + 0.03})` 
                    : `rgba(139, 92, 246, ${Math.random() * 0.08 + 0.03})`;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initParticles = () => {
            particlesArray = [];
            for (let i = 0; i < maxParticles; i++) {
                particlesArray.push(new Particle());
            }
        };
        initParticles();

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particlesArray.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        };
        animateParticles();
    }
});
