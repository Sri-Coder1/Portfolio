/**
 * Cinematic AI Neural Core Animation
 *
 * This script uses Three.js to render a dynamic, procedural neural network,
 * inspired by high-end sci-fi film aesthetics.
 *
 * Features:
 * - GPU-accelerated WebGL rendering via Three.js.
 * - Procedurally generated neurons (particles) and synapses (lines).
 * - Animated energy pulses traveling through the network.
 * - Parallax effect on mouse movement.
 * - Soft bloom and glow effects using post-processing.
 * - Volumetric feel achieved with fog and color grading.
 * - Optimized for performance.
 */
function initNeuralNetworkAnimation(container) {
  if (!container || !window.THREE) {
    console.error("Animation container or THREE.js is missing.");
    return;
  }

  let scene, camera, renderer, composer, bloomPass;
  let neuronCloud, synapseLines, pulseCloud;
  let mouse = new THREE.Vector2();
  let targetRotation = new THREE.Vector2();
  const neuronData = [];

  const params = {
    neuronCount: 2000,
    connectionRadius: 2.5,
    maxConnections: 10,
    pulseSpeed: 0.75,
    pulseCount: 100,
    bloom: {
      strength: 1.2,
      radius: 0.5,
      threshold: 0.1
    },
    colors: {
      background: "#000514",
      fog: "#0d1a3b",
      neurons: "#4f80ff",
      synapses: "#1a3c8f",
      pulses: "#66faff"
    }
  };

  // --- 1. SETUP ---
  function init() {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(params.colors.fog, 0.15);

    // Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 15;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(params.colors.background, 1);
    container.appendChild(renderer.domElement);

    // Post-processing (Bloom)
    const renderScene = new THREE.RenderPass(scene, camera);
    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = params.bloom.threshold;
    bloomPass.strength = params.bloom.strength;
    bloomPass.radius = params.bloom.radius;

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    createNetwork();
    addEventListeners();
    animate();
  }

  // --- 2. CREATE NETWORK ---
  function createNetwork() {
    const neuronPositions = [];
    const volumeRadius = 10;

    // Create Neurons (Particles)
    for (let i = 0; i < params.neuronCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / params.neuronCount);
      const theta = Math.sqrt(params.neuronCount * Math.PI) * phi;

      const x = volumeRadius * Math.cos(theta) * Math.sin(phi);
      const y = volumeRadius * Math.sin(theta) * Math.sin(phi);
      const z = volumeRadius * Math.cos(phi);

      neuronPositions.push(x, y, z);
      neuronData.push({
        position: new THREE.Vector3(x, y, z),
        connections: 0,
        indices: []
      });
    }

    const neuronGeometry = new THREE.BufferGeometry();
    neuronGeometry.setAttribute("position", new THREE.Float32BufferAttribute(neuronPositions, 3));
    const neuronMaterial = new THREE.PointsMaterial({
      color: params.colors.neurons,
      size: 0.05,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8
    });
    neuronCloud = new THREE.Points(neuronGeometry, neuronMaterial);
    scene.add(neuronCloud);

    // Create Synapses (Lines)
    const synapsePositions = [];
    for (let i = 0; i < params.neuronCount; i++) {
      const p1 = neuronData[i];
      if (p1.connections >= params.maxConnections) continue;

      for (let j = i + 1; j < params.neuronCount; j++) {
        const p2 = neuronData[j];
        if (p2.connections >= params.maxConnections || p1.position.distanceTo(p2.position) > params.connectionRadius) continue;

        p1.connections++;
        p2.connections++;
        p1.indices.push(j);
        p2.indices.push(i);
        synapsePositions.push(p1.position.x, p1.position.y, p1.position.z);
        synapsePositions.push(p2.position.x, p2.position.y, p2.position.z);
      }
    }

    const synapseGeometry = new THREE.BufferGeometry();
    synapseGeometry.setAttribute("position", new THREE.Float32BufferAttribute(synapsePositions, 3));
    const synapseMaterial = new THREE.LineBasicMaterial({
      color: params.colors.synapses,
      linewidth: 0.5,
      transparent: true,
      opacity: 0.2
    });
    synapseLines = new THREE.LineSegments(synapseGeometry, synapseMaterial);
    scene.add(synapseLines);

    // Create Pulses
    const pulseGeometry = new THREE.BufferGeometry();
    pulseGeometry.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(params.pulseCount * 3), 3));
    const pulseMaterial = new THREE.PointsMaterial({
      color: params.colors.pulses,
      size: 0.15,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      map: createPulseTexture()
    });

    pulseCloud = new THREE.Points(pulseGeometry, pulseMaterial);
    pulseCloud.userData.pulses = Array.from({ length: params.pulseCount }, () => createPulse());
    scene.add(pulseCloud);
  }

  function createPulseTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext("2d");
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(255,255,255,1)");
    gradient.addColorStop(0.4, "rgba(102,250,255,0.5)");
    gradient.addColorStop(1, "rgba(102,250,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  function createPulse() {
    let fromIndex, toIndex;
    let attempts = 0;
    do {
      fromIndex = Math.floor(Math.random() * neuronData.length);
      const fromNeuron = neuronData[fromIndex];
      if (fromNeuron.indices.length > 0) {
        toIndex = fromNeuron.indices[Math.floor(Math.random() * fromNeuron.indices.length)];
      }
      attempts++;
    } while (toIndex === undefined && attempts < 100);

    if (toIndex === undefined) toIndex = (fromIndex + 1) % neuronData.length;

    return { from: neuronData[fromIndex].position, to: neuronData[toIndex].position, progress: Math.random() };
  }

  // --- 3. ANIMATION LOOP ---
  function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.0001;
    const delta = 0.01; // Fixed delta for consistent speed

    scene.rotation.y += (targetRotation.x - scene.rotation.y) * 0.05;
    scene.rotation.x += (targetRotation.y - scene.rotation.x) * 0.05;

    const pulsePositions = pulseCloud.geometry.attributes.position.array;
    pulseCloud.userData.pulses.forEach((pulse, i) => {
      pulse.progress += params.pulseSpeed * delta;
      if (pulse.progress >= 1) {
        Object.assign(pulse, createPulse());
        pulse.progress = 0;
      }
      const pos = pulse.from.clone().lerp(pulse.to, pulse.progress);
      pulsePositions.set([pos.x, pos.y, pos.z], i * 3);
    });
    pulseCloud.geometry.attributes.position.needsUpdate = true;

    neuronCloud.rotation.y = time * 0.2;
    synapseLines.rotation.y = time * 0.2;

    composer.render();
  }

  // --- 4. EVENT LISTENERS ---
  function addEventListeners() {
    window.addEventListener("resize", onWindowResize);
    document.addEventListener("mousemove", onMouseMove);
  }

  function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    composer.setSize(container.clientWidth, container.clientHeight);
  }

  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    targetRotation.x = mouse.x * 0.1;
    targetRotation.y = mouse.y * 0.1;
  }

  init();
}