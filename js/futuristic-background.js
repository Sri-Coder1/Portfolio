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

  let width, height, nodes, networkLayers;
  const config = {
    colors: {
      bg: '#050816',
      cyan: 'rgba(0, 229, 255, 0.8)',
      blue: 'rgba(33, 150, 243, 0.7)',
      purple: 'rgba(124, 77, 255, 0.7)',
    },
    nodeRadius: 2.2
  };

  // --- SETUP ---
  function setup() {
    width = canvas.width = container.clientWidth;
    height = canvas.height = container.clientHeight;

    // Normalized coordinates keep one recognizable neural-network pattern
    // stable while allowing it to scale with the viewport.
    const layerBlueprint = [
      [0.12, [0.2, 0.4, 0.6, 0.8]],
      [0.36, [0.12, 0.3, 0.5, 0.7, 0.88]],
      [0.64, [0.2, 0.4, 0.6, 0.8]],
      [0.88, [0.3, 0.5, 0.7]]
    ];

    networkLayers = layerBlueprint.map(([x, yPositions], layerIndex) =>
      yPositions.map((normalizedY, nodeIndex) => ({
        x: width * x,
        y: height * normalizedY,
        radius: config.nodeRadius,
        pulseOffset: (layerIndex * 1.7) + (nodeIndex * 0.55)
      }))
    );
    nodes = networkLayers.flat();
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

  function drawNetwork(ctx, time) {
    let edgeIndex = 0;
    const driftX = Math.sin(time * 0.00018) * Math.min(width * 0.035, 24);
    const driftY = Math.cos(time * 0.00014) * Math.min(height * 0.025, 16);

    networkLayers.slice(0, -1).forEach((layer, layerIndex) => {
      const nextLayer = networkLayers[layerIndex + 1];
      layer.forEach((node) => {
        nextLayer.forEach((nextNode) => {
          const nodeX = node.x + driftX;
          const nodeY = node.y + driftY;
          const nextNodeX = nextNode.x + driftX;
          const nextNodeY = nextNode.y + driftY;

          ctx.beginPath();
          ctx.moveTo(nodeX, nodeY);
          ctx.lineTo(nextNodeX, nextNodeY);
          ctx.strokeStyle = config.colors.blue;
          ctx.lineWidth = 0.55;
          ctx.globalAlpha = 0.22;
          ctx.stroke();

          // Move a small signal along each connection as the network gently floats.
          const progress = (time * 0.00012 + edgeIndex * 0.08) % 1;
          const signalX = nodeX + (nextNodeX - nodeX) * progress;
          const signalY = nodeY + (nextNodeY - nodeY) * progress;
          ctx.beginPath();
          ctx.arc(signalX, signalY, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = config.colors.cyan;
          ctx.globalAlpha = 0.8;
          ctx.shadowColor = config.colors.cyan;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
          edgeIndex += 1;
        });
      });
    });

    nodes.forEach((node) => {
      const pulse = (Math.sin(time * 0.0015 + node.pulseOffset) + 1) / 2;
      ctx.beginPath();
      ctx.arc(node.x + driftX, node.y + driftY, node.radius * (1 + pulse * 0.55), 0, Math.PI * 2);
      ctx.fillStyle = config.colors.cyan;
      ctx.globalAlpha = 0.55 + pulse * 0.45;
      ctx.shadowColor = config.colors.cyan;
      ctx.shadowBlur = 8 + pulse * 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  // --- ANIMATION LOOP ---
  function animate(time) {
    ctx.save();

    drawBackground(ctx);
    drawNetwork(ctx, time);

    ctx.restore();

    requestAnimationFrame(animate);
  }

  // --- EVENT LISTENERS ---
  function onResize() {
    setup();
  }

  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(container);

  // --- INITIALIZATION ---
  setup();
  requestAnimationFrame(animate);

  // Return a cleanup function in case it's needed for a SPA transition
  return () => {
    resizeObserver.disconnect();
    container.innerHTML = '';
  };
}
