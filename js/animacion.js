(() => {
  const intro = document.getElementById('impoexIntro');
  const canvas = document.getElementById('impoexWorld');
  const brandMarkWrap = document.getElementById('brandMarkWrap');
  const brandCopy = document.getElementById('brandCopy');
  const skipButton = document.getElementById('skipIntro');
  if (!intro || !canvas || !window.THREE) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.innerWidth < 860;
  const globeRadius = 1.55;
  const particleCount = isMobile() ? 2600 : 4400;

  const TEXTURES = {
    normal: 'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
    night: 'https://threejs.org/examples/textures/planets/earth_lights_2048.png'
  };

  const COLORS = {
    red: new THREE.Color('#e32b20'),
    blue: new THREE.Color('#263965'),
    blue2: new THREE.Color('#273a66'),
    soft: new THREE.Color('#8fe7ff'),
    white: new THREE.Color('#f4fbff')
  };

  const state = {
    progress: 0,
    targetProgress: 0,
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    time: 0
  };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, isMobile() ? 6.4 : 5.35);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const root = new THREE.Group();
  const worldGroup = new THREE.Group();
  const earthPivot = new THREE.Group();
  const earthGroup = new THREE.Group();
  const routeGroup = new THREE.Group();
  const hubGroup = new THREE.Group();
  const travelerGroup = new THREE.Group();
  const shellDotsGroup = new THREE.Group();
  const techGridGroup = new THREE.Group();
  const scanGroup = new THREE.Group();
  const particleGroup = new THREE.Group();
  const starsGroup = new THREE.Group();

  earthPivot.add(earthGroup);
  worldGroup.add(earthPivot, routeGroup, hubGroup, travelerGroup, shellDotsGroup, techGridGroup, scanGroup);
  root.add(worldGroup, particleGroup);
  scene.add(root, starsGroup);

  scene.add(new THREE.AmbientLight('#9fdfff', 0.55));
  const keyLight = new THREE.DirectionalLight('#ffffff', 1.15);
  keyLight.position.set(4.4, 3.2, 5.4);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight('#4b8de0', 0.45);
  fillLight.position.set(-4.5, -1.4, -3.8);
  scene.add(fillLight);
  const redLight = new THREE.PointLight('#e32b20', 0.72, 12, 2);
  redLight.position.set(-1.0, 0.8, 3.2);
  scene.add(redLight);

  const glowWhite = makeGlowTexture('rgba(244,251,255,1)');
  const glowRed = makeGlowTexture('rgba(227,43,32,1)');

  buildStars();
  buildWorld();

  const logoPools = sampleFilledLogoPoints();
  const finalX = new Float32Array(particleCount);
  const finalY = new Float32Array(particleCount);
  const finalZ = new Float32Array(particleCount);
  const currentPositions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const pathIndex = new Uint8Array(particleCount);
  const localScale = new Float32Array(particleCount);
  const delay = new Float32Array(particleCount);
  const jitter = new Float32Array(particleCount);
  const orbitPhase = new Float32Array(particleCount);
  const orbitLift = new Float32Array(particleCount);
  buildParticles();

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: isMobile() ? 0.03 : 0.021,
    transparent: true,
    opacity: 0.92,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    sizeAttenuation: true
  });
  const particlePoints = new THREE.Points(particleGeometry, particleMaterial);
  particleGroup.add(particlePoints);

  window.addEventListener('pointermove', (event) => {
    state.targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
    state.targetMouseY = (event.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  window.addEventListener('resize', onResize);
  skipButton?.addEventListener('click', () => {
    document.getElementById('siteStart')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  setupScroll();
  onResize();
  animate();

  function buildWorld() {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const earthMaterial = new THREE.MeshStandardMaterial({
      color: '#020814',
      emissive: new THREE.Color('#061a33'),
      emissiveIntensity: 1.28,
      roughness: 0.78,
      metalness: 0.28,
      transparent: true,
      opacity: 1
    });

    try {
      earthMaterial.normalMap = loader.load(TEXTURES.normal);
      earthMaterial.emissiveMap = loader.load(TEXTURES.night);
    } catch (_) {}

    const globe = new THREE.Mesh(new THREE.SphereGeometry(globeRadius, 96, 96), earthMaterial);
    globe.name = 'earthMesh';
    earthGroup.add(globe);

    try {
      const lights = new THREE.Mesh(
        new THREE.SphereGeometry(globeRadius * 1.002, 72, 72),
        new THREE.MeshBasicMaterial({
          map: loader.load(TEXTURES.night),
          color: '#8fe7ff',
          transparent: true,
          opacity: 0.36,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      lights.name = 'nightLights';
      earthGroup.add(lights);

      const warmLights = new THREE.Mesh(
        new THREE.SphereGeometry(globeRadius * 1.003, 72, 72),
        new THREE.MeshBasicMaterial({
          map: loader.load(TEXTURES.night),
          color: '#e32b20',
          transparent: true,
          opacity: 0.16,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      warmLights.name = 'warmLights';
      earthGroup.add(warmLights);
    } catch (_) {}

    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(globeRadius * 1.006, 26, 26)),
      new THREE.LineBasicMaterial({ color: '#8fe7ff', transparent: true, opacity: 0.052, depthWrite: false })
    );
    wire.name = 'wire';
    earthGroup.add(wire);

    buildTechGlobeShell();

    const shellCount = isMobile() ? 1450 : 2300;
    const shellPos = new Float32Array(shellCount * 3);
    const shellCol = new Float32Array(shellCount * 3);
    for (let i = 0; i < shellCount; i++) {
      const i3 = i * 3;
      const p = randomPointOnSphere(globeRadius * 1.014);
      shellPos[i3] = p.x;
      shellPos[i3 + 1] = p.y;
      shellPos[i3 + 2] = p.z;
      const c = Math.random() > 0.955 ? COLORS.red : COLORS.soft;
      shellCol[i3] = c.r;
      shellCol[i3 + 1] = c.g;
      shellCol[i3 + 2] = c.b;
    }
    const shellGeometry = new THREE.BufferGeometry();
    shellGeometry.setAttribute('position', new THREE.BufferAttribute(shellPos, 3));
    shellGeometry.setAttribute('color', new THREE.BufferAttribute(shellCol, 3));
    const shellMaterial = new THREE.PointsMaterial({
      size: isMobile() ? 0.0085 : 0.0066,
      transparent: true,
      opacity: 0.42,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const shellDots = new THREE.Points(shellGeometry, shellMaterial);
    shellDots.name = 'shellDots';
    shellDotsGroup.add(shellDots);

    const hubs = [
      { name: 'Ecuador', lat: -1.83, lon: -78.18, color: '#e32b20', size: 0.055 },
      { name: 'Miami', lat: 25.76, lon: -80.19, size: 0.028 },
      { name: 'Rotterdam', lat: 51.92, lon: 4.47, size: 0.030 },
      { name: 'Madrid', lat: 40.41, lon: -3.70, size: 0.028 },
      { name: 'Dubai', lat: 25.20, lon: 55.27, size: 0.030 },
      { name: 'Shanghai', lat: 31.23, lon: 121.47, size: 0.032 },
      { name: 'Singapore', lat: 1.35, lon: 103.82, size: 0.028 }
    ];
    const routes = [
      ['Ecuador', 'Miami'], ['Ecuador', 'Rotterdam'], ['Ecuador', 'Madrid'],
      ['Ecuador', 'Dubai'], ['Ecuador', 'Shanghai'], ['Ecuador', 'Singapore'],
      ['Miami', 'Rotterdam'], ['Dubai', 'Shanghai']
    ];
    const lookup = Object.fromEntries(hubs.map(h => [h.name, h]));

    hubs.forEach((hub) => {
      const pos = latLonToVector3(hub.lat, hub.lon, globeRadius * 1.026);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: hub.color ? glowRed : glowWhite,
        color: hub.color || '#8fe7ff',
        transparent: true,
        opacity: hub.color ? 0.72 : 0.30,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      glow.position.copy(pos);
      glow.scale.setScalar(hub.color ? 0.28 : 0.13);
      glow.userData.baseScale = glow.scale.x;
      glow.userData.baseOpacity = glow.material.opacity;
      hubGroup.add(glow);

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(hub.size, 12, 12),
        new THREE.MeshBasicMaterial({ color: hub.color || '#8fe7ff', transparent: true, opacity: hub.color ? 0.78 : 0.52, blending: THREE.AdditiveBlending })
      );
      core.position.copy(pos);
      core.userData.baseOpacity = core.material.opacity;
      hubGroup.add(core);
    });

    routes.forEach((pair, idx) => {
      const start = lookup[pair[0]];
      const end = lookup[pair[1]];
      const a = latLonToVector3(start.lat, start.lon, globeRadius * 1.026);
      const b = latLonToVector3(end.lat, end.lon, globeRadius * 1.026);
      const control = a.clone().add(b).normalize().multiplyScalar(globeRadius * (pair[0] === 'Ecuador' ? 1.58 : 1.38));
      const curve = new THREE.QuadraticBezierCurve3(a, control, b);

      const route = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 64, pair[0] === 'Ecuador' ? 0.0034 : 0.0022, 7, false),
        new THREE.MeshBasicMaterial({ color: pair[0] === 'Ecuador' ? '#e32b20' : '#8fe7ff', transparent: true, opacity: pair[0] === 'Ecuador' ? 0.26 : 0.11, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      route.userData.baseOpacity = route.material.opacity;
      routeGroup.add(route);

      const traveler = new THREE.Sprite(new THREE.SpriteMaterial({
        map: pair[0] === 'Ecuador' ? glowRed : glowWhite,
        color: pair[0] === 'Ecuador' ? '#fff0e8' : '#d7fbff',
        transparent: true,
        opacity: pair[0] === 'Ecuador' ? 0.56 : 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      traveler.scale.setScalar(pair[0] === 'Ecuador' ? 0.08 : 0.06);
      traveler.userData.curve = curve;
      traveler.userData.speed = 0.12 + idx * 0.010;
      traveler.userData.phase = Math.random();
      traveler.userData.baseOpacity = traveler.material.opacity;
      travelerGroup.add(traveler);
    });

    const ecuadorVec = latLonToVector3(-1.8312, -78.1834, 1).normalize();
    const front = new THREE.Vector3(0, 0, 1);
    earthPivot.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(ecuadorVec, front));
    earthPivot.rotateY(-0.3);
    earthPivot.rotateX(0.16);
  }

  function buildTechGlobeShell() {
    const ringMaterial = new THREE.LineBasicMaterial({
      color: '#8fe7ff',
      transparent: true,
      opacity: 0.075,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const redRingMaterial = new THREE.LineBasicMaterial({
      color: '#e32b20',
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    [-60, -30, 0, 30, 60].forEach((lat, idx) => {
      const ring = makeLatitudeRing(lat, globeRadius * 1.018, idx === 2 ? redRingMaterial : ringMaterial);
      techGridGroup.add(ring);
    });

    for (let lon = 0; lon < 180; lon += 30) {
      const ring = makeGreatCircle(globeRadius * 1.019, ringMaterial);
      ring.rotation.y = THREE.MathUtils.degToRad(lon);
      ring.rotation.z = Math.PI / 2;
      techGridGroup.add(ring);
    }

    const scan = makeGreatCircle(globeRadius * 1.06, redRingMaterial);
    scan.name = 'scanRing';
    scan.rotation.x = Math.PI / 2.5;
    scanGroup.add(scan);

    const scan2 = makeGreatCircle(globeRadius * 1.10, ringMaterial);
    scan2.name = 'scanRingAlt';
    scan2.rotation.x = Math.PI / 2.15;
    scan2.rotation.y = Math.PI / 5;
    scanGroup.add(scan2);
  }

  function makeGreatCircle(radius, material) {
    const points = [];
    const segments = 160;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(t) * radius, Math.sin(t) * radius, 0));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, material.clone());
  }

  function makeLatitudeRing(lat, radius, material) {
    const y = Math.sin(THREE.MathUtils.degToRad(lat)) * radius;
    const r = Math.cos(THREE.MathUtils.degToRad(lat)) * radius;
    const points = [];
    const segments = 160;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, material.clone());
  }

  function buildParticles() {
    const pools = logoPools.filter(Boolean);
    const scale = isMobile() ? 0.0105 : 0.0132;
    if (!pools.length) return;

    for (let i = 0; i < particleCount; i++) {
      const sample = pools[i % pools.length][Math.floor(Math.random() * pools[i % pools.length].length)];
      const i3 = i * 3;
      finalX[i] = (sample.x - 110) * scale;
      finalY[i] = -(sample.y - 120) * scale;
      finalZ[i] = (Math.random() - 0.5) * 0.04;
      currentPositions[i3] = finalX[i];
      currentPositions[i3 + 1] = finalY[i];
      currentPositions[i3 + 2] = finalZ[i];
      colors[i3] = sample.color.r;
      colors[i3 + 1] = sample.color.g;
      colors[i3 + 2] = sample.color.b;
      pathIndex[i] = sample.pathIndex;
      localScale[i] = 0.84 + Math.random() * 0.24;
      delay[i] = Math.random() * 0.18;
      jitter[i] = Math.random() * 0.05;
      orbitPhase[i] = Math.random() * Math.PI * 2;
      orbitLift[i] = (Math.random() - 0.5) * 0.24;
    }
  }

  function sampleFilledLogoPoints() {
    const sampler = document.getElementById('impoexMarkSampler');
    const paths = sampler ? Array.from(sampler.querySelectorAll('path')) : [];
    const tempCanvas = document.createElement('canvas');
    const width = 440;
    const height = 480;
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
    const pools = [];
    if (!ctx || !window.Path2D || !paths.length) return pools;

    paths.forEach((path, idx) => {
      const d = path.getAttribute('d');
      if (!d) return;
      const color = new THREE.Color(path.dataset.color || '#273a66');
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.scale(width / 220, height / 240);
      ctx.fillStyle = '#fff';
      try { ctx.fill(new Path2D(d)); } catch (error) { ctx.restore(); return; }
      ctx.restore();

      const image = ctx.getImageData(0, 0, width, height).data;
      const pool = [];
      const step = isMobile() ? 4 : 3;
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const alpha = image[(y * width + x) * 4 + 3];
          if (alpha > 10 && Math.random() > 0.08) {
            pool.push({ x: (x / width) * 220, y: (y / height) * 240, color, pathIndex: idx });
          }
        }
      }
      pools.push(pool);
    });
    return pools;
  }

  function buildStars() {
    const count = isMobile() ? 500 : 850;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 30;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = -8 - Math.random() * 14;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ size: 0.026, color: '#8fe7ff', transparent: true, opacity: 0.20, depthWrite: false });
    starsGroup.add(new THREE.Points(geometry, material));
  }

  function animate() {
    requestAnimationFrame(animate);
    state.time += 0.008;
    state.progress += (state.targetProgress - state.progress) * 0.08;
    state.mouseX += (state.targetMouseX - state.mouseX) * 0.06;
    state.mouseY += (state.targetMouseY - state.mouseY) * 0.06;

    const morph = smoothstep(0.10, 0.58, state.progress);
    const condense = smoothstep(0.54, 0.78, state.progress);
    const shift = smoothstep(0.72, 0.94, state.progress);
    const textReveal = smoothstep(0.80, 0.98, state.progress);
    const grow = smoothstep(0, 0.8, Math.min(1, state.time * 0.5));

    updateParticles(morph, condense);
    updateWorld(morph, condense);
    updateUI(condense, shift, textReveal);

    root.scale.setScalar(lerp(0.36, 1, grow));
    root.position.x = lerp(0, isMobile() ? -0.55 : -1.5, shift);
    root.position.y = lerp(0.05, isMobile() ? 0.12 : 0.02, shift);
    root.rotation.y = state.mouseX * 0.12 * (1 - shift * 0.75);
    root.rotation.x = state.mouseY * -0.06 * (1 - shift * 0.75);

    renderer.render(scene, camera);
  }

  function updateParticles(morph, condense) {
    const orbitRadius = globeRadius * (isMobile() ? 1.58 : 1.66);
    const offsets = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
    const orbitSpeed = state.time * 0.92;
    const fadeWorld = smoothstep(0.18, 0.72, morph);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const groupOffset = offsets[pathIndex[i]];
      const orbitAngle = orbitSpeed + groupOffset + orbitPhase[i] * 0.1;

      const planeTiltX = pathIndex[i] === 0 ? 0.82 : pathIndex[i] === 1 ? -0.68 : 0.18;
      const planeTiltZ = pathIndex[i] === 0 ? 0.25 : pathIndex[i] === 1 ? -0.22 : 0.58;

      const cx = Math.cos(orbitAngle) * orbitRadius;
      const cy = Math.sin(orbitAngle) * orbitRadius * 0.42 + orbitLift[i];
      const cz = Math.sin(orbitAngle + groupOffset) * orbitRadius * 0.58;

      const spin = orbitAngle + Math.PI * 0.5;
      const cosS = Math.cos(spin);
      const sinS = Math.sin(spin);
      let lx = finalX[i] * localScale[i] * cosS - finalY[i] * localScale[i] * sinS;
      let ly = finalX[i] * localScale[i] * sinS + finalY[i] * localScale[i] * cosS;
      let lz = finalZ[i] + Math.sin(state.time * 1.1 + i * 0.015) * jitter[i];

      // tilt each orbit so the isotipo pieces wrap around the globe instead of sitting behind it
      let ty = ly * Math.cos(planeTiltX) - lz * Math.sin(planeTiltX);
      let tz = ly * Math.sin(planeTiltX) + lz * Math.cos(planeTiltX);
      let tx = lx * Math.cos(planeTiltZ) - ty * Math.sin(planeTiltZ);
      let ty2 = lx * Math.sin(planeTiltZ) + ty * Math.cos(planeTiltZ);

      const orbitX = cx + tx * 0.78;
      const orbitY = cy + ty2 * 0.78;
      const orbitZ = cz + tz;

      const localMorph = smoothstep(0, 1, clamp((morph - delay[i]) / (1 - delay[i]), 0, 1));
      currentPositions[i3] = lerp(orbitX, finalX[i], localMorph);
      currentPositions[i3 + 1] = lerp(orbitY, finalY[i], localMorph);
      currentPositions[i3 + 2] = lerp(orbitZ, finalZ[i], localMorph);
    }

    particleGeometry.attributes.position.needsUpdate = true;
    particleMaterial.size = lerp(isMobile() ? 0.032 : 0.023, isMobile() ? 0.022 : 0.015, condense);
    particleMaterial.opacity = lerp(0.96, 0.10, condense);
    particleMaterial.depthTest = false;
    particleMaterial.depthWrite = false;
  }

  function updateWorld(morph, condense) {
    if (!prefersReducedMotion) {
      earthPivot.rotation.y += 0.00095 * (1 - morph * 0.85);
      earthPivot.rotation.x += 0.00005;
      techGridGroup.rotation.y -= 0.00045 * (1 - morph * 0.75);
      scanGroup.rotation.y += 0.0022 * (1 - morph * 0.9);
      scanGroup.rotation.z += 0.0009 * (1 - morph * 0.9);
      starsGroup.rotation.y += 0.00035;
    }

    const fadeWorld = smoothstep(0.18, 0.72, morph);
    const earthMesh = earthGroup.getObjectByName('earthMesh');
    const nightLights = earthGroup.getObjectByName('nightLights');
    const warmLights = earthGroup.getObjectByName('warmLights');
    const wire = earthGroup.getObjectByName('wire');
    const shellDots = shellDotsGroup.getObjectByName('shellDots');

    if (earthMesh) earthMesh.material.opacity = lerp(1, 0.04, fadeWorld);
    if (nightLights) nightLights.material.opacity = lerp(0.36, 0.03, fadeWorld);
    if (warmLights) warmLights.material.opacity = lerp(0.16, 0.015, fadeWorld);
    if (wire) wire.material.opacity = lerp(0.052, 0, fadeWorld);
    if (shellDots) shellDots.material.opacity = lerp(0.42, 0.02, fadeWorld);

    techGridGroup.children.forEach((line, idx) => {
      if (!line.material) return;
      const pulse = 0.012 * Math.sin(state.time * 2.1 + idx);
      line.material.opacity = Math.max(0, (line.material.color.getHexString() === 'e32b20' ? 0.09 : 0.08) * (1 - fadeWorld * 0.95) + pulse * (1 - fadeWorld * 0.95));
    });

    scanGroup.children.forEach((line, idx) => {
      if (!line.material) return;
      const pulse = 0.03 * Math.sin(state.time * 2.8 + idx);
      line.material.opacity = Math.max(0, (idx === 0 ? 0.11 : 0.085) * (1 - fadeWorld * 0.92) + pulse * (1 - fadeWorld * 0.92));
    });

    routeGroup.children.forEach(route => {
      route.material.opacity = route.userData.baseOpacity * (1 - fadeWorld);
    });

    hubGroup.children.forEach((obj, idx) => {
      if (!obj.material) return;
      const pulse = Math.sin(state.time * 2.4 + idx) * 0.03;
      const baseOpacity = obj.userData.baseOpacity ?? obj.material.opacity;
      obj.material.opacity = Math.max(0, baseOpacity * (1 - fadeWorld) + pulse * (1 - fadeWorld));
      if (obj.isSprite) {
        const s = obj.userData.baseScale || obj.scale.x;
        obj.scale.setScalar(s * (1 + Math.sin(state.time * 2.5 + idx) * 0.04 * (1 - fadeWorld)));
      }
    });

    travelerGroup.children.forEach(traveler => {
      const t = (state.time * traveler.userData.speed + traveler.userData.phase) % 1;
      traveler.position.copy(traveler.userData.curve.getPoint(t));
      traveler.material.opacity = traveler.userData.baseOpacity * (1 - fadeWorld);
    });

    worldGroup.scale.setScalar(lerp(1, 0.955, condense));
  }

  function updateUI(condense, shift, textReveal) {
    document.documentElement.style.setProperty('--intro-progress', state.progress.toFixed(4));
    document.documentElement.style.setProperty('--grid-opacity', clamp(0.90 - state.progress * 0.45, 0.35, 0.90).toFixed(4));
    document.documentElement.style.setProperty('--scroll-opacity', clamp(0.86 - state.progress * 2.2, 0, 0.86).toFixed(4));

    if (brandMarkWrap) {
      const opacity = clamp(condense * 1.16, 0, 1);
      if (isMobile()) {
        brandMarkWrap.style.transform = `translate(-50%, -50%) scale(${lerp(0.96, 1, opacity).toFixed(3)})`;
      } else {
        const finalX = lerp(0, -235, shift);
        brandMarkWrap.style.transform = `translate(calc(-50% + ${finalX.toFixed(2)}px), -50%) scale(${lerp(0.96, 1, opacity).toFixed(3)})`;
      }
      brandMarkWrap.style.opacity = opacity.toFixed(3);
    }

    if (brandCopy) {
      const opacity = clamp(textReveal * 1.16, 0, 1);
      brandCopy.style.opacity = opacity.toFixed(3);
      brandCopy.style.clipPath = `inset(0 ${(100 - opacity * 100).toFixed(2)}% 0 0)`;
      if (isMobile()) {
        brandCopy.style.transform = `translate(-50%, ${lerp(28, 0, textReveal).toFixed(2)}px)`;
      } else {
        brandCopy.style.transform = `translate(${lerp(90, 28, textReveal).toFixed(2)}px, -50%)`;
      }
      const line = brandCopy.querySelector('.brand-line');
      if (line) line.style.transform = `scaleX(${opacity.toFixed(3)})`;
    }
  }

  function setupScroll() {
    const update = progress => {
      state.targetProgress = progress;
    };

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({
        trigger: intro,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.9,
        onUpdate: self => update(self.progress)
      });
      return;
    }

    const fallback = () => {
      const rect = intro.getBoundingClientRect();
      const max = Math.max(1, rect.height - window.innerHeight);
      update(Math.min(1, Math.max(0, -rect.top / max)));
    };
    window.addEventListener('scroll', fallback, { passive: true });
    fallback();
  }

  function makeGlowTexture(color) {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, color);
    grad.addColorStop(0.18, color.replace('1)', '0.78)'));
    grad.addColorStop(0.5, color.replace('1)', '0.18)'));
    grad.addColorStop(1, color.replace('1)', '0)'));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  function randomPointOnSphere(radius) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    );
  }

  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.position.z = isMobile() ? 6.4 : 5.35;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
})();
