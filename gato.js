import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const box = document.getElementById("gato");

if (box) {
  // ---------- Renderizador, cena e câmera ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.domElement.setAttribute("aria-hidden", "true");
  box.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 2.8, 10);
  camera.lookAt(0, 0.4, 0);   // menor = gato mais alto na caixa

  function ajustar() {
    const w = box.clientWidth, h = box.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(ajustar).observe(box);
  ajustar();

  // ---------- Luzes (com uma luz verde por trás para o gato preto não sumir no tema escuro) ----------
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8899bb, 1.8));
  const sol = new THREE.DirectionalLight(0xffffff, 2.2);
  sol.position.set(4, 8, 5);
  sol.castShadow = true;
  sol.shadow.mapSize.set(512, 512);
  Object.assign(sol.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
  scene.add(sol);
  const contraluz = new THREE.DirectionalLight(0x3ddc97, 3);
  contraluz.position.set(-4, 4, -5);
  scene.add(contraluz);

  const chao = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.3 }));
  chao.rotation.x = -Math.PI / 2;
  chao.receiveShadow = true;
  scene.add(chao);

  // ---------- Materiais (gato smoking: preto com detalhes brancos) ----------
  const mat = (cor, rough = 0.85) => new THREE.MeshStandardMaterial({ color: cor, roughness: rough });
  const pelo = mat(0x26282f), branco = mat(0xf7f7f7);
  const rosa = mat(0xf4a3b5, 0.7), olho = mat(0xf2c94c, 0.2), preto = mat(0x050505, 0.4);

  function parte(pai, geo, material, pos = [0, 0, 0], esc = [1, 1, 1]) {
    const m = new THREE.Mesh(geo, material);
    m.position.set(...pos);
    m.scale.set(...esc);
    m.castShadow = true;
    pai.add(m);
    return m;
  }
  const esfera = (r) => new THREE.SphereGeometry(r, 32, 24);

  // ---------- Gato ----------
  const gato = new THREE.Group();
  gato.rotation.y = 0.35; // de ladinho
  scene.add(gato);
  const piscaveis = [];
  const orelhas = [];

  const corpo = parte(gato, esfera(1), pelo, [0, 0.95, 0], [1, 0.9, 1.3]);
  parte(gato, esfera(0.5), branco, [0, 0.9, 1.3], [0.8, 1, 0.5]); // peito branco

  [-1, 1].forEach((lado) => {
    parte(gato, new THREE.CylinderGeometry(0.2, 0.22, 0.9, 20), pelo, [lado * 0.38, 0.45, 0.85]);
    parte(gato, esfera(0.26), branco, [lado * 0.38, 0.12, 0.98], [1, 0.6, 1.3]); // "meias" brancas
    parte(gato, esfera(0.6), pelo, [lado * 0.75, 0.6, -0.5], [0.7, 0.9, 1]);
    parte(gato, esfera(0.26), branco, [lado * 0.65, 0.12, 0.3], [1, 0.6, 1.4]);
  });

  // Cabeça
  const cabeca = new THREE.Group();
  cabeca.position.set(0, 1.95, 1.15);
  gato.add(cabeca);
  parte(cabeca, esfera(0.8), pelo, [0, 0, 0], [1.1, 0.95, 1]);
  parte(cabeca, esfera(0.3), branco, [0, -0.25, 0.6], [1.2, 0.8, 0.8]);  // focinho
  parte(cabeca, esfera(0.14), branco, [0, 0.12, 0.76], [0.5, 1.5, 0.35]); // listra branca na testa

  [-1, 1].forEach((lado) => {
    const orelha = parte(cabeca, new THREE.ConeGeometry(0.3, 0.6, 16), pelo, [lado * 0.52, 0.68, -0.05]);
    orelha.rotation.z = -lado * 0.35;
    parte(orelha, new THREE.ConeGeometry(0.17, 0.4, 16), rosa, [0, -0.04, 0.08]);
    orelhas.push({ m: orelha, lado });

    const g = new THREE.Group();
    g.position.set(lado * 0.32, 0.12, 0.68);
    cabeca.add(g);
    parte(g, esfera(0.16), olho, [0, 0, 0], [1, 1.1, 0.7]);
    parte(g, esfera(0.1), preto, [0, 0, 0.08], [0.4, 1.1, 0.4]);
    piscaveis.push(g);

    [-1, 0, 1].forEach((i) => {
      const b = parte(cabeca, new THREE.CylinderGeometry(0.008, 0.008, 0.9, 6), branco,
        [lado * 0.7, -0.22 + i * 0.09, 0.62]);
      b.rotation.z = Math.PI / 2;
      b.rotation.y = lado * i * 0.25;
    });
  });
  parte(cabeca, esfera(0.07), rosa, [0, -0.1, 0.82], [1.3, 0.9, 0.8]);

  // Rabo (ponta branca)
  const N = 14;
  const rabo = [];
  const pivoRabo = new THREE.Group();
  pivoRabo.position.set(0, 0.8, -1.25);
  gato.add(pivoRabo);
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    rabo.push(parte(pivoRabo, esfera(0.2 - t * 0.06), i >= N - 3 ? branco : pelo));
  }

  // ---------- Centraliza o gato na horizontal (ignora o rabo, que balança) ----------
  gato.updateMatrixWorld(true);
  const caixa = new THREE.Box3();
  gato.children.forEach((c) => { if (c !== pivoRabo) caixa.expandByObject(c); });
  gato.position.x -= caixa.getCenter(new THREE.Vector3()).x;

  // ---------- Balão de fala (HTML sobre o canvas) ----------
  const balao = document.createElement("div");
  balao.className = "balao";
  balao.setAttribute("aria-live", "polite");
  box.appendChild(balao);
  let balaoTimer;
  function fala(txt, ms = 2800) {
    balao.textContent = txt;
    balao.classList.add("on");
    clearTimeout(balaoTimer);
    balaoTimer = setTimeout(() => balao.classList.remove("on"), ms);
  }

  // ---------- Estado das reações ----------
  const alvo = { x: 0, y: 0 };
  let pulo = -1;          // 0..1 durante o pulo
  let pulso = 0;          // "tremidinha" quando você digita
  let nao = 0;            // balançar a cabeça dizendo "não"
  let digitandoAte = 0;   // rabo mais rápido enquanto digita
  let campoAtivo = false; // true quando um campo do formulário está em foco
  let t = 0;

  // Faz a cabeça apontar para um ponto da tela
  function mirar(x, y) {
    const r = box.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * 0.35;
    alvo.x = Math.max(-1, Math.min(1, (x - cx) / 350));
    alvo.y = Math.max(-1, Math.min(1, (y - cy) / 250));
  }

  window.addEventListener("pointermove", (e) => { if (!campoAtivo) mirar(e.clientX, e.clientY); });

  const frases = ["Miau! 🐱", "Prrrr... 💚", "Bora conversar? 💬"];
  box.addEventListener("click", () => {
    if (pulo < 0) pulo = 0;
    fala(frases[Math.floor(Math.random() * frases.length)], 2200);
  });

  // ---------- Reações ao botão "enviar_mensagem()" ----------
  const enviar = document.getElementById("enviar");
  if (enviar) {
    enviar.addEventListener("pointerenter", () => {
      const r = enviar.getBoundingClientRect();
      campoAtivo = true;                      // para de seguir o mouse e olha pro botão
      mirar(r.left + r.width / 2, r.top + r.height / 2);
      digitandoAte = Infinity;                // rabo acelerado
      fala("Vai mandar mensagem? 💌", 2500);
    });
    enviar.addEventListener("pointerleave", () => {
      campoAtivo = false;
      digitandoAte = 0;
    });
    enviar.addEventListener("click", () => {
      if (pulo < 0) pulo = 0;
      fala("Miau! Abrindo seu e-mail ✉️", 3500);
    });
  }

  // ---------- Só anima quando está visível ----------
  let visivel = true;
  new IntersectionObserver(([en]) => (visivel = en.isIntersecting)).observe(box);

  // ---------- Animação ----------
  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ultimo = performance.now();
  let fase = 0;
  let proximaPiscada = 2;

  function animar(agora) {
    requestAnimationFrame(animar);
    if (!visivel) { ultimo = agora; return; }
    const dt = Math.min((agora - ultimo) / 1000, 0.05);
    ultimo = agora;
    t += dt;

    // respiração
    corpo.scale.y = 0.9 + Math.sin(t * 2) * 0.015;
    cabeca.position.y = 1.95 + Math.sin(t * 2) * 0.02;

    // cabeça: segue o alvo + "sim" ao digitar + "não" em erro
    pulso *= 0.9;
    nao = Math.max(0, nao - dt * 1.3);
    const alvoY = alvo.x * 0.8 + Math.sin(t * 25) * 0.5 * nao;
    const alvoX = alvo.y * 0.35 + pulso * 0.12;
    cabeca.rotation.y += (alvoY - cabeca.rotation.y) * 0.1;
    cabeca.rotation.x += (alvoX - cabeca.rotation.x) * 0.1;

    // orelhas tremem ao digitar
    orelhas.forEach(({ m, lado }) => {
      m.rotation.z = -lado * 0.35 + lado * pulso * 0.25;
    });

    // rabo: velocidade maior enquanto digita
    const balanco = reduzir ? 0.1 : 1;
    fase += dt * (t < digitandoAte ? 7 : 2.2);
    rabo.forEach((s, i) => {
      const k = i / (N - 1);
      s.position.set(
        Math.sin(fase - k * 2.5) * 0.4 * k * balanco,
        1.5 * k * (1 - 0.2 * k),
        -0.2 - 0.6 * Math.sin(k * 1.2)
      );
    });

    // piscada
    let fechado = 1;
    if (t > proximaPiscada) {
      const p = (t - proximaPiscada) / 0.15;
      fechado = p < 1 ? 1 - Math.sin(p * Math.PI) * 0.9 : 1;
      if (p >= 1) proximaPiscada = t + 2 + Math.random() * 3;
    }
    piscaveis.forEach((o) => (o.scale.y = fechado));

    // pulo
    if (pulo >= 0) {
      pulo += dt * 1.8;
      gato.position.y = Math.sin(Math.min(pulo, 1) * Math.PI) * 1.3;
      if (pulo >= 1) { pulo = -1; gato.position.y = 0; }
    }

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animar);
}