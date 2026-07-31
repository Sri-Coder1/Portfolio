/**
 * Futuristic Cyberpunk Background Animation
 *
 * This script uses the Canvas API to render a multi-layered, animated background
 * with a high-tech, cyberpunk aesthetic.
 *
 * Features:
 * - Lightweight 2D Canvas rendering.
 * - Layered composition for a sense of depth.
 * - Animated elements: neural network, particles, grid, and scanline.
 * - Parallax effect on mouse movement.
 * - Optimized for performance using requestAnimationFrame.
 * - Fully responsive to container size changes.
 */
function initFuturisticBackground(container) {
  if (!container) {
    console.error("Animation container is missing.");
    return;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  container.innerHTML = ''; // Clear existing content (like the old Three.js canvas)
  container.appendChild(canvas);

  let width, height, nodes, particles, connections;
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let targetMouse = { x: mouse.x, y: mouse.y };
  const parallaxFactor = 0; // Set to 0 to disable mouse movement

  const config = {
    colors: {
      bg: '#050816',
      cyan: 'rgba(0, 229, 255, 0.8)',
      blue: 'rgba(33, 150, 243, 0.7)',
      purple: 'rgba(124, 77, 255, 0.7)',
    },
    nodeCount: 0,
    particleCount: 0,
    connectionRadius: 200,
    maxConnections: 4,
    scanLineCycle: 20000, // 20 seconds
  };

  // --- UTILITY FUNCTIONS ---
  const rand = (min, max) => Math.random() * (max - min) + min;

  // --- CLASSES ---
  class Node {
    constructor() {
      this.x = rand(0, width);
      this.y = rand(0, height);
      this.vx = rand(-0.1, 0.1);
      this.vy = rand(-0.1, 0.1);
      this.radius = rand(1, 2.5);
      this.pulseSpeed = rand(0.001, 0.002);
      this.pulseOffset = rand(0, Math.PI * 2);
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -this.radius || this.x > width + this.radius) this.vx *= -1;
      if (this.y < -this.radius || this.y > height + this.radius) this.vy *= -1;
    }

    draw(ctx, time) {
      const pulse = (Math.sin(time * this.pulseSpeed + this.pulseOffset) + 1) / 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * (1 + pulse * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = config.colors.cyan;
      ctx.globalAlpha = 0.5 + pulse * 0.5;
      ctx.fill();
    }
  }

  class Particle {
    constructor() {
      this.x = rand(0, width);
      this.y = rand(0, height);
      this.vx = rand(-0.2, 0.2);
      this.vy = rand(-0.2, 0.2);
      this.radius = rand(0.5, 1.5);
      const colors = [config.colors.cyan, config.colors.blue, config.colors.purple];
      this.color = colors[Math.floor(rand(0, colors.length))];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  // --- SETUP ---
  function setup() {
    width = canvas.width = container.clientWidth;
    height = canvas.height = container.clientHeight;

    config.nodeCount = Math.max(15, Math.floor((width * height) / 35000));
    config.particleCount = Math.max(30, Math.floor((width * height) / 20000));

    nodes = Array.from({ length: config.nodeCount }, () => new Node());
    particles = Array.from({ length: config.particleCount }, () => new Particle());

    connections = [];
    for (let i = 0; i < nodes.length; i++) {
      let nodeConnections = 0;
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodeConnections >= config.maxConnections) break;
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < config.connectionRadius) {
          connections.push([nodes[i], nodes[j], dist]);
          nodeConnections++;
        }
      }
    }
  }

  // --- DRAWING FUNCTIONS ---
  function drawBackground(ctx) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = config.colors.bg;
    ctx.fillRect(0, 0, width, height);

    // Layer 6: Glowing Blobs
    const glows = [
      { x: width * 0.15, y: height * 0.2, color: 'rgba(0, 229, 255, 0.08)', radius: Math.min(width, height) * 0.7 },
      { x: width * 0.85, y: height * 0.8, color: 'rgba(124, 77, 255, 0.08)', radius: Math.min(width, height) * 0.6 }
    ];

    glows.forEach(glow => {
      const grad = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, glow.radius);
      grad.addColorStop(0, glow.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    });
  }

  function drawGrid(ctx) {
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = config.colors.blue;
    ctx.lineWidth = 0.5;
    const gridSize = 50;

    for (let x = 0; x <= width; x += gridSize) {
      if (Math.random() > 0.2) { // Broken grid effect
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }
    for (let y = 0; y <= height; y += gridSize) {
      if (Math.random() > 0.2) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
  }

  function drawCircuits(ctx) {
    ctx.globalAlpha = 0.03;
    ctx.strokeStyle = config.colors.cyan;
    ctx.lineWidth = 1;
    connections.forEach(([nodeA, nodeB]) => {
      ctx.beginPath();
      ctx.moveTo(nodeA.x, nodeA.y);
      ctx.bezierCurveTo(
        nodeA.x, (nodeA.y + nodeB.y) / 2,
        nodeB.x, (nodeA.y + nodeB.y) / 2,
        nodeB.x, nodeB.y
      );
      ctx.stroke();
    });
  }

  function drawScanline(ctx, time) {
    const cycleTime = time % config.scanLineCycle;
    const y = (cycleTime / config.scanLineCycle) * (height + 200) - 100;

    ctx.globalAlpha = 0.07;
    const grad = ctx.createLinearGradient(0, y - 20, 0, y + 20);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.5, config.colors.cyan);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y - 20, width, 40);
  }

  function drawNetwork(ctx, time) {
    ctx.strokeStyle = config.colors.blue;
    ctx.lineWidth = 0.5;
    connections.forEach(([nodeA, nodeB, dist]) => {
      const opacity = 1 - (dist / config.connectionRadius);
      ctx.globalAlpha = opacity * 0.5;
      ctx.beginPath();
      ctx.moveTo(nodeA.x, nodeA.y);
      ctx.lineTo(nodeB.x, nodeB.y);
      ctx.stroke();
    });

    nodes.forEach(node => {
      node.update();
      node.draw(ctx, time);
    });
  }

  function drawParticles(ctx) {
    ctx.globalAlpha = 0.6;
    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });
  }

  // --- ANIMATION LOOP ---
  function animate(time) {
    // Smooth mouse movement
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;

    const parallaxX = ((mouse.x / window.innerWidth) - 0.5) * parallaxFactor;
    const parallaxY = ((mouse.y / window.innerHeight) - 0.5) * parallaxFactor;

    ctx.save();
    ctx.translate(-parallaxX, -parallaxY);

    drawBackground(ctx);
    drawCircuits(ctx);
    drawParticles(ctx);
    drawNetwork(ctx, time);

    ctx.restore();

    requestAnimationFrame(animate);
  }

  // --- EVENT LISTENERS ---
  function onMouseMove(e) {
    targetMouse.x = e.clientX;
    targetMouse.y = e.clientY;
  }

  function onResize() {
    setup();
  }

  window.addEventListener('mousemove', onMouseMove);
  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(container);

  // --- INITIALIZATION ---
  setup();
  requestAnimationFrame(animate);

  // Return a cleanup function in case it's needed for a SPA transition
  return () => {
    window.removeEventListener('mousemove', onMouseMove);
    resizeObserver.disconnect();
    container.innerHTML = '';
  };
}