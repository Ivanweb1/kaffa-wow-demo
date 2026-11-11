const DEMO_TIMING = {
  intro: 5000,
  pause: 900,
  ritual: 7200,
  afterRitual: 600,
  tour: 4300,
};
const qs = (s) => document.querySelector(s),
  qsa = (s) => [...document.querySelectorAll(s)];
const IS_DEMO = new URLSearchParams(location.search).has("demo");
document.body.classList.toggle("demo", IS_DEMO);
const state = {
  cart: 0,
  manifest: null,
  seq: [[], [], []],
  posters: [
    "frames/0-beans.png",
    "frames/1-grind.png",
    "frames/2-pour.png",
    "frames/3-sip.png",
  ],
  lastFrame: "",
  ritualProgress: 0,
  startRect: null,
  cache: new Map(),
  introTween: null,
};
const canvas = qs("#filmCanvas"),
  ctx = canvas.getContext("2d"),
  poster = qs("#filmPoster"),
  win = qs("#filmWindow");
qs(".photo-grid").innerHTML = Array.from(
  { length: 8 },
  (_, i) =>
    `<img class="reveal" src="assets/img/grid-${i + 1}.webp" alt="Кофейная мастерская">`,
).join("");
qs(".filters").innerHTML = ["Все", "Кофемолки", "Чайники", "Керамика", "Зерно"]
  .map(
    (x, i) =>
      `<button class="${i ? "" : "active"}" data-filter="${x}">${x}</button>`,
  )
  .join("");
function fitCanvas() {
  const r = win.getBoundingClientRect(),
    d = Math.min(devicePixelRatio, 2);
  canvas.width = r.width * d;
  canvas.height = r.height * d;
  ctx.setTransform(d, 0, 0, d, 0, 0);
}
function draw(img) {
  fitCanvas();
  const w = canvas.width / Math.min(devicePixelRatio, 2),
    h = canvas.height / Math.min(devicePixelRatio, 2),
    s = Math.max(w / img.width, h / img.height),
    iw = img.width * s,
    ih = img.height * s;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
}
function fitWordmark() {
  return;
}
async function preload() {
  try {
    state.manifest = await fetch("assets/seq/manifest.json").then((r) =>
      r.ok ? r.json() : null,
    );
  } catch (e) {}
  const counts = state.manifest?.sequences || {};
  for (let s = 1; s <= 3; s++) {
    for (let i = 1; i <= (counts[s] || 0); i++) {
      state.seq[s - 1].push(
        `assets/seq/${s}/${String(i).padStart(4, "0")}.webp`,
      );
    }
  }
  const urls = [
    ...state.posters,
    ...state.seq.flat(),
    ...qsa("img").map((i) => i.src),
  ];
  let loaded = 0;
  await Promise.all(
    urls.map(
      (src) =>
        new Promise((res) => {
          const i = new Image();
          i.onload = i.onerror = () => {
            state.cache.set(src, i);
            loaded++;
            qs("#loader small").textContent =
              `готовим первую чашку · ${Math.round((loaded / urls.length) * 100)}%`;
            res();
          };
          i.src = src;
        }),
    ),
  );
  if (!IS_DEMO) qs("#loader").classList.add("done");
}
function renderFrame(sequence, index) {
  const src =
    state.seq[sequence]?.[
      Math.max(0, Math.min(index, state.seq[sequence].length - 1))
    ];
  if (!src || src === state.lastFrame) return;
  state.lastFrame = src;
  const cached = state.cache.get(src);
  if (cached?.complete) {
    canvas.style.display = "block";
    draw(cached);
    return;
  }
  const img = new Image();
  img.onload = () => {
    canvas.style.display = "block";
    draw(img);
  };
  img.src = src;
}
function intro() {
  const tl = gsap.timeline();
  tl.from(".header", { y: -30, opacity: 0, duration: 0.7 })
    .from(
      ".wordmark tspan",
      { yPercent: 115, duration: 1.1, stagger: 0.08, ease: "power4.out" },
      -0.25,
    )
    .from(".film-window", { y: 45, opacity: 0, duration: 0.9 }, -0.65)
    .from(
      ".hero-aside>*",
      { y: 25, opacity: 0, duration: 0.55, stagger: 0.08 },
      -0.7,
    );
  qsa("[data-count]").forEach((el) =>
    gsap.to(
      { v: 0 },
      {
        v: +el.dataset.count,
        duration: 1.6,
        delay: 0.8,
        onUpdate: function () {
          el.textContent = Math.round(this.targets()[0].v);
        },
      },
    ),
  );
  const shotMode = new URLSearchParams(location.search).get("shot");
  if (state.seq[0].length && (!shotMode || shotMode === "hero")) {
    const play = { frame: 0 };
    state.introTween = gsap.to(play, {
      frame: state.seq[0].length - 1,
      duration: 5,
      ease: "none",
      onUpdate: () => renderFrame(0, Math.round(play.frame)),
    });
  }
}
const steps = [
  {
    p: 0,
    w: "ПОМОЛ",
    n: "Шаг 01",
    t: "Точная геометрия жерновов.<br>Ни одной случайной крупицы.",
    img: "frames/1-grind.png",
  },
  {
    p: 0.38,
    w: "ПРОЛИВ",
    n: "Шаг 02",
    t: "Вода раскрывает сладость.<br>Медленно, круг за кругом.",
    img: "frames/2-pour.png",
  },
  {
    p: 0.7,
    w: "ГЛОТОК",
    n: "Шаг 03",
    t: "Температура, фактура, тишина.<br>Чашка становится вашей.",
    img: "frames/3-sip.png",
  },
];
let active = -1;
function setStep(i) {
  if (i === active) return;
  active = i;
  const s = steps[i];
  gsap.to("#stepWord", {
    yPercent: -110,
    duration: 0.25,
    onComplete() {
      qs("#stepWord").textContent = s.w;
      qs("#stepLabel").textContent = s.n;
      qs("#stepText").innerHTML = s.t;
      qs("#ghostWord").textContent = s.w;
      poster.src = s.img;
      gsap.fromTo(
        "#stepWord",
        { yPercent: 110 },
        { yPercent: 0, duration: 0.42 },
      );
    },
  });
}
function frameAtProgress(p) {
  if (p < 0.15) return [0, 120];
  if (p < 0.3) return [1, Math.round(((p - 0.15) / 0.15) * 48)];
  if (p < 0.55) return [1, 49 + Math.round(((p - 0.3) / 0.25) * (120 - 49))];
  if (p < 0.6) return [2, Math.round(((p - 0.55) / 0.05) * 72)];
  if (p < 0.8) return [2, 73 + Math.round(((p - 0.6) / 0.2) * (120 - 73))];
  return [2, 120];
}
const mix = (a, b, p) => a + (b - a) * p;
function captureStartRect() {
  if (state.ritualProgress > 0.001) return;
  gsap.set(win, { clearProps: "position,left,top,width,height,zIndex" });
  const r = win.getBoundingClientRect();
  state.startRect = {
    left: r.left,
    top: r.top,
    width: r.width,
    height: r.height,
  };
  placeFilm(0);
}
function placeFilm(p) {
  state.ritualProgress = p;
  const r = state.startRect || win.getBoundingClientRect();
  let left = 0,
    top = 0,
    width = innerWidth,
    height = innerHeight,
    radius = 0;
  if (p < 0.15) {
    const t = gsap.parseEase("power2.inOut")(p / 0.15);
    left = mix(r.left, 0, t);
    top = mix(r.top, 0, t);
    width = mix(r.width, innerWidth, t);
    height = mix(r.height, innerHeight, t);
    radius = mix(8, 0, t);
  } else if (p > 0.88) {
    const t = gsap.parseEase("power2.inOut")((p - 0.88) / 0.12);
    left = mix(0, innerWidth * 0.15, t);
    top = mix(0, innerHeight * 0.14, t);
    width = mix(innerWidth, innerWidth * 0.7, t);
    height = mix(innerHeight, innerHeight * 0.72, t);
    radius = mix(0, 8, t);
  }
  gsap.set(win, {
    position: "fixed",
    left,
    top,
    width,
    height,
    zIndex: 80,
    borderRadius: radius,
    visibility: "visible",
  });
  const introFade = Math.min(p / 0.15, 1);
  gsap.set(".header,.wordmark,.hero-aside", {
    y: -60 * introFade,
    opacity: 1 - introFade,
  });
  const copyVisible = p >= 0.15 && p < 0.9 ? 1 : 0;
  gsap.set(".ritual-copy", { opacity: copyVisible });
  gsap.set(".film-shade", { opacity: copyVisible * 0.62 });
  gsap.set(".ghost-word", { opacity: copyVisible * 0.1, xPercent: p * 8 });
}
function setupRitual() {
  captureStartRect();
  ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    endTrigger: "#ritual",
    end: "bottom bottom",
    onLeave: () => gsap.set(win, { visibility: "hidden" }),
    onEnterBack: () => gsap.set(win, { visibility: "visible" }),
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress,
        [seq, frame] = frameAtProgress(p);
      if (p > 0.01 && state.introTween) {
        state.introTween.kill();
        state.introTween = null;
      }
      let stage = 0;
      if (p >= 0.6) stage = 2;
      else if (p >= 0.4) stage = 1;
      if (p >= 0.15) setStep(stage);
      renderFrame(seq, frame);
      placeFilm(p);
      if (p >= 0.8)
        gsap.to(".bag-cards article", {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.08,
          duration: 0.35,
          overwrite: true,
        });
      else
        gsap.to(".bag-cards article", {
          opacity: 0,
          y: 40,
          scale: 0.88,
          duration: 0.2,
          overwrite: true,
        });
      gsap.to(".bag-cards .pill", {
        opacity: p >= 0.82 && p < 0.97 ? 1 : 0,
        duration: 0.2,
        overwrite: true,
      });
    },
  });
}
function setupMotion() {
  gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }
  setupRitual();
  qsa(".reveal").forEach((el) =>
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 88%" },
      y: 24,
      opacity: 0,
      duration: 0.75,
      ease: "power2.out",
    }),
  );
}
qsa("[data-slide]").forEach(
  (b) =>
    (b.onclick = () => {
      qs("#sliderImage").style.opacity = 0;
      setTimeout(() => {
        qs("#sliderImage").src = `assets/img/slider-${b.dataset.slide}.webp`;
        qs("#sliderImage").style.opacity = 1;
      }, 180);
    }),
);
qsa(".add").forEach(
  (b) =>
    (b.onclick = () => {
      state.cart++;
      qs("#cartCount").textContent = `Корзина (${state.cart})`;
      gsap.fromTo(
        "#cartCount",
        { scale: 1.35 },
        { scale: 1, duration: 0.35, ease: "back.out" },
      );
    }),
);
qsa(".filters button").forEach(
  (b) =>
    (b.onclick = () => {
      qsa(".filters button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      const f = b.dataset.filter;
      qsa(".product-grid>[data-cat]").forEach((card) => {
        const show = f === "Все" || card.dataset.cat === f;
        gsap.to(card, {
          opacity: show ? 1 : 0,
          scale: show ? 1 : 0.94,
          duration: 0.3,
          onComplete() {
            card.style.display = show ? "" : "none";
            ScrollTrigger.refresh();
          },
        });
      });
    }),
);
qs("form").onsubmit = (e) => e.preventDefault();
function scrollTween(y, duration, ease = "none") {
  const o = { y: scrollY };
  return new Promise((resolve) =>
    gsap.to(o, {
      y,
      duration,
      ease,
      onUpdate: () => scrollTo(0, o.y),
      onComplete: resolve,
    }),
  );
}
async function demo() {
  await new Promise((r) => setTimeout(r, DEMO_TIMING.intro));
  await new Promise((r) => setTimeout(r, DEMO_TIMING.pause));
  const target =
    qs("#ritual").offsetTop + qs("#ritual").offsetHeight - innerHeight - 2;
  await scrollTween(target, DEMO_TIMING.ritual / 1000);
  await new Promise((r) => setTimeout(r, DEMO_TIMING.afterRitual));
  await scrollTween(
    document.body.scrollHeight - innerHeight,
    DEMO_TIMING.tour / 1000,
    "power1.inOut",
  );
}
function applyShot() {
  const shot = new URLSearchParams(location.search).get("shot");
  if (!shot || shot === "hero") return;
  const map = { grind: 0.2, pour: 0.48, sip: 0.84, transition: 0.95 };
  if (shot in map) {
    const r = qs("#ritual");
    const end = r.offsetTop + r.offsetHeight - innerHeight;
    scrollTo(0, end * map[shot]);
    placeFilm(map[shot]);
    const [seq, frame] = frameAtProgress(map[shot]);
    renderFrame(seq, frame);
    setStep(shot === "grind" ? 0 : shot === "pour" ? 1 : 2);
    if (shot === "sip") {
      gsap.set(".bag-cards article", { opacity: 1, y: 0, scale: 1 });
      gsap.set(".bag-cards .pill", { opacity: 1 });
    }
  } else qs(shot === "catalog" ? "#catalog" : "#footer").scrollIntoView();
}
window.addEventListener("resize", () => {
  fitCanvas();
  fitWordmark();
  captureStartRect();
  ScrollTrigger.refresh();
});
preload().then(() => {
  fitWordmark();
  captureStartRect();
  intro();
  setupMotion();
  setTimeout(applyShot, 900);
  if (location.search.includes("demo=1")) setTimeout(demo, 500);
});
