import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Clock,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

const vertexShader = `
  uniform float uTime;
  uniform float uSeed;
  uniform vec2 uPointer;

  varying vec2 vUv;
  varying vec3 vViewNormal;
  varying vec3 vViewPos;

  void main() {
    vUv = uv;

    vec3 p = position;
    float t = uTime * 0.22 + uSeed;

    float wave = sin(p.x * 0.85 + t) * 0.34
      + cos(p.y * 1.15 - t * 0.8) * 0.22
      + sin((p.x + p.y) * 1.45 + t * 1.1) * 0.08
      + sin((p.x - p.y) * 0.55 + t * 0.4) * 0.06;

    p.z += wave;
    p.x += sin(p.y * 0.9 + t * 0.55) * 0.16;
    p.y += cos(p.x * 0.65 + t * 0.45) * 0.08;
    p.x += uPointer.x * 0.26 * (0.3 + uv.y);
    p.y += uPointer.y * 0.16;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vViewPos = mv.xyz;

    float dx = cos(p.x * 0.85 + t) * 0.34 * 0.85
      + cos((p.x + p.y) * 1.45 + t * 1.1) * 0.08 * 1.45
      + cos((p.x - p.y) * 0.55 + t * 0.4) * 0.06 * 0.55;
    float dy = -sin(p.y * 1.15 - t * 0.8) * 0.22 * 1.15
      + cos((p.x + p.y) * 1.45 + t * 1.1) * 0.08 * 1.45
      - cos((p.x - p.y) * 0.55 + t * 0.4) * 0.06 * 0.55;

    vec3 n = normalize(vec3(-dx * 1.4, -dy * 1.4, 1.0));
    vViewNormal = normalize(normalMatrix * n);

    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uSeed;
  uniform vec3 uPearl;
  uniform vec3 uGold;
  uniform vec3 uShadow;

  varying vec2 vUv;
  varying vec3 vViewNormal;
  varying vec3 vViewPos;

  void main() {
    float edgeX = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
    float edgeY = smoothstep(0.0, 0.24, vUv.y) * smoothstep(1.0, 0.7, vUv.y);

    vec3 viewDir = normalize(-vViewPos);
    float facing = clamp(dot(normalize(vViewNormal), viewDir), 0.0, 1.0);
    float fresnel = pow(1.0 - facing, 2.2);

    float folds = sin(
      vUv.y * 17.0
      + sin(vUv.x * 5.0 + uTime * 0.22 + uSeed) * 1.8
      + uSeed
    );
    folds = folds * 0.5 + 0.5;
    float sheen = smoothstep(0.5, 0.9, folds);

    float shimmer = pow(
      0.5 + 0.5 * sin(vUv.y * 30.0 + uTime * 0.75 + vUv.x * 8.0 + uSeed),
      22.0
    );

    float drift = pow(
      0.5 + 0.5 * sin(vUv.x * 3.2 - uTime * 0.32 + vUv.y * 2.1 + uSeed),
      3.0
    );

    vec3 color = mix(uShadow, uPearl, 0.3 + vUv.y * 0.36 + sheen * 0.2);
    color = mix(color, uGold, fresnel * 0.9 + sheen * 0.28);
    color += uGold * shimmer * 0.5;
    color += uGold * drift * 0.14;

    float alpha = (0.1 + fresnel * 0.38 + sheen * 0.12 + shimmer * 0.15 + drift * 0.08) * edgeX * edgeY;
    gl_FragColor = vec4(color, alpha);
  }
`;

function makeVeil(geometry, time, pointer, seed, options) {
  const material = new ShaderMaterial({
    uniforms: {
      uTime: time,
      uPointer: pointer,
      uSeed: { value: seed },
      uPearl: { value: new Color(0xe6e3dc) },
      uGold: { value: new Color(0xc5b396) },
      uShadow: { value: new Color(0x30343a) },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    blending: AdditiveBlending,
  });

  const mesh = new Mesh(geometry, material);
  mesh.position.set(...options.position);
  mesh.rotation.set(...options.rotation);
  mesh.scale.set(...options.scale);
  return mesh;
}

function makeDotTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.8)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

export function initSilkVeil(canvas) {
  if (!canvas) return null;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    canvas.classList.add("is-unavailable");
    return null;
  }

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 5.6);

  const time = { value: 0 };
  const pointer = { value: new Vector2(0, 0) };
  const pointerTarget = new Vector2(0, 0);

  const group = new Group();
  group.rotation.set(-0.06, -0.34, 0.02);
  scene.add(group);

  const backGeometry = new PlaneGeometry(6.4, 7.2, 80, 100);
  const frontGeometry = new PlaneGeometry(5.2, 6.2, 64, 80);

  const backVeil = makeVeil(backGeometry, time, pointer, 0, {
    position: [1.0, 0.1, -0.8],
    rotation: [0.1, -0.52, 0.06],
    scale: [1, 1, 1],
  });

  const frontVeil = makeVeil(frontGeometry, time, pointer, 2.7, {
    position: [0.1, -0.18, 0.25],
    rotation: [-0.12, -0.3, -0.05],
    scale: [0.86, 0.9, 1],
  });

  group.add(backVeil, frontVeil);

  const threadCurve = new CatmullRomCurve3([
    new Vector3(-1.85, 2.35, 0.4),
    new Vector3(-1.0, 1.8, -0.2),
    new Vector3(0.4, 1.0, 0.3),
    new Vector3(1.5, -0.05, -0.25),
    new Vector3(1.0, -1.35, 0.15),
    new Vector3(-0.35, -2.35, -0.1),
    new Vector3(-1.45, -2.7, 0.35),
  ]);

  const thread = new Mesh(
    new TubeGeometry(threadCurve, 240, 0.006, 5, false),
    new MeshBasicMaterial({
      color: 0xd8c7a9,
      transparent: true,
      opacity: 0.4,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  thread.scale.setScalar(0.82);
  group.add(thread);

  const pin = new Mesh(
    new SphereGeometry(0.032, 16, 16),
    new MeshBasicMaterial({
      color: 0xe8dbc1,
      transparent: true,
      opacity: 0.9,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  pin.position.set(-1.18, 1.78, 0.65);
  group.add(pin);

  const dustGeometry = new BufferGeometry();
  const dustCount = 90;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 6.2;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 7.8;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 2.2;
  }
  dustGeometry.setAttribute("position", new BufferAttribute(dustPositions, 3));

  const dust = new Points(
    dustGeometry,
    new PointsMaterial({
      color: 0xd8c7a9,
      size: 0.035,
      sizeAttenuation: true,
      map: makeDotTexture(),
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  group.add(dust);

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (reducedMotion) renderer.render(scene, camera);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  const clock = new Clock();
  let frame = 0;
  let visible = true;

  const onPointerMove = (event) => {
    pointerTarget.set(
      (event.clientX / window.innerWidth - 0.5) * 2,
      (event.clientY / window.innerHeight - 0.5) * 2,
    );
  };

  const onVisibility = () => {
    if (!document.hidden) clock.getDelta();
  };

  if (!reducedMotion) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.02 },
    ).observe(canvas);
  }

  const render = () => {
    if (document.hidden || !visible) {
      frame = requestAnimationFrame(render);
      return;
    }

    pointer.value.lerp(pointerTarget, 0.035);
    time.value = clock.getElapsedTime();

    const t = time.value;

    group.rotation.y = -0.34 + Math.sin(t * 0.12) * 0.12 + pointer.value.x * 0.16;
    group.rotation.x = -0.06 + Math.sin(t * 0.09) * 0.04 - pointer.value.y * 0.08;
    group.rotation.z = Math.sin(t * 0.07) * 0.02;
    group.position.x = pointer.value.x * 0.12;
    group.position.y = Math.sin(t * 0.15) * 0.06 + pointer.value.y * 0.05;
    camera.position.x = pointer.value.x * 0.16;
    camera.position.y = -pointer.value.y * 0.12;
    camera.lookAt(0, 0, 0);
    backVeil.rotation.z = 0.06 + Math.sin(t * 0.18) * 0.05;
    frontVeil.rotation.z = -0.05 + Math.sin(t * 0.16 + 1.4) * 0.06;
    dust.rotation.y = t * 0.03;
    dust.rotation.x = Math.sin(t * 0.08) * 0.05;
    thread.rotation.z = Math.sin(t * 0.1) * 0.03;
    pin.scale.setScalar(0.9 + Math.sin(t * 0.7) * 0.16);

    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  };

  if (reducedMotion) {
    time.value = 1.4;
    renderer.render(scene, camera);
  } else {
    render();
  }

  window.addEventListener(
    "pagehide",
    () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      backGeometry.dispose();
      frontGeometry.dispose();
      dustGeometry.dispose();
      thread.geometry.dispose();
      pin.geometry.dispose();
      renderer.dispose();
    },
    { once: true },
  );

  return { resize };
}
