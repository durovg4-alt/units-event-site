import "./styles.css";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

let lenis;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9, anchors: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

const header = document.querySelector("[data-header]");
const setHeaderState = () => header?.classList.toggle("is-scrolled", window.scrollY > 30);
setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
let lastFocused = null;

function closeMenu() {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Открыть меню");
  mobileMenu.setAttribute("aria-hidden", "true");
  document.body.classList.remove("menu-open");
  gsap.to(mobileMenu, { y: "-100%", autoAlpha: 0, duration: reduceMotion ? 0 : 0.65, ease: "power4.inOut" });
  lastFocused?.focus();
}

function openMenu() {
  if (!menuToggle || !mobileMenu) return;
  lastFocused = document.activeElement;
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Закрыть меню");
  mobileMenu.setAttribute("aria-hidden", "false");
  document.body.classList.add("menu-open");
  gsap.to(mobileMenu, { y: 0, autoAlpha: 1, visibility: "visible", duration: reduceMotion ? 0 : 0.75, ease: "power4.inOut" });
  mobileMenu.querySelector("a")?.focus();
}

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  isOpen ? closeMenu() : openMenu();
});

mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") closeMenu();
  if (event.key === "Tab" && menuToggle?.getAttribute("aria-expanded") === "true" && mobileMenu) {
    const focusable = [menuToggle, ...mobileMenu.querySelectorAll("a")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

function splitWords(element) {
  if (element.dataset.motionSplit === "true") return;
  const text = element.textContent.trim();
  const parts = text.split(/(\s+)/);
  element.textContent = "";
  element.setAttribute("aria-label", text);
  parts.forEach((part) => {
    if (!part.trim()) {
      element.appendChild(document.createTextNode(part));
      return;
    }
    const mask = document.createElement("span");
    const word = document.createElement("span");
    mask.className = "motion-word-mask";
    mask.setAttribute("aria-hidden", "true");
    word.className = "motion-word";
    word.textContent = part;
    mask.appendChild(word);
    element.appendChild(mask);
  });
  element.dataset.motionSplit = "true";
}

function initMotion() {
  if (reduceMotion) return;

  const heroTimeline = gsap.timeline({ defaults: { ease: "power4.out" } });
  heroTimeline
    .from(".hero-media img", { scale: 1.16, autoAlpha: 0, duration: 1.8 })
    .from(".hero-kicker", { y: 16, autoAlpha: 0, duration: 0.65 }, 0.5)
    .from(".hero-line > span", { yPercent: 115, duration: 1.05, stagger: 0.11 }, 0.62)
    .from(".hero-bottom", { y: 24, autoAlpha: 0, duration: 0.8 }, 1.03)
    .from(".hero-meta span", { y: 10, autoAlpha: 0, duration: 0.5, stagger: 0.07 }, 1.2);

  gsap.to(".hero-media img", {
    yPercent: 10,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.2 },
  });

  document.querySelectorAll("[data-motion-text='words']").forEach((element) => {
    splitWords(element);
    gsap.from(element.querySelectorAll(".motion-word"), {
      yPercent: 110,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power4.out",
      stagger: 0.045,
      scrollTrigger: { trigger: element, start: "top 82%", once: true },
    });
  });

  document.querySelectorAll("[data-reveal-group]").forEach((group) => {
    gsap.from(group.querySelectorAll("[data-reveal-item]"), {
      y: 38,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power4.out",
      stagger: 0.075,
      scrollTrigger: { trigger: group, start: "top 82%", once: true },
    });
  });

  document.querySelectorAll("[data-reveal]:not([data-reveal-item])").forEach((element) => {
    gsap.from(element, {
      y: 28,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power4.out",
      scrollTrigger: { trigger: element, start: "top 84%", once: true },
    });
  });

  const serviceCards = gsap.utils.toArray(".service-row");
  serviceCards.slice(0, -1).forEach((card, index) => {
    const nextCard = serviceCards[index + 1];
    gsap.to(card, {
      scale: 0.955,
      ease: "none",
      scrollTrigger: {
        trigger: nextCard,
        start: `top ${106 + index * 14}px`,
        end: `top ${68 + index * 14}px`,
        scrub: true,
      },
    });
  });

  gsap.to(".liquid-word", {
    xPercent: -12,
    ease: "none",
    scrollTrigger: { trigger: ".intro", start: "top bottom", end: "bottom top", scrub: 1.1 },
  });

  document.querySelectorAll("[data-mouse-parallax]").forEach((section) => {
    const layers = Array.from(section.querySelectorAll("[data-mouse-depth]")).map((layer) => ({
      layer,
      depth: Number(layer.dataset.mouseDepth || 0.03),
      xTo: gsap.quickTo(layer, "x", { duration: 0.8, ease: "power3.out" }),
      yTo: gsap.quickTo(layer, "y", { duration: 0.8, ease: "power3.out" }),
    }));
    if (!coarsePointer) {
      section.addEventListener("pointermove", (event) => {
        const rect = section.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        layers.forEach(({ depth, xTo, yTo }) => { xTo(x * depth); yTo(y * depth); });
      });
      section.addEventListener("pointerleave", () => layers.forEach(({ xTo, yTo }) => { xTo(0); yTo(0); }));
    }
  });

  if (!coarsePointer) {
    document.querySelectorAll("[data-magnetic]").forEach((element) => {
      const xTo = gsap.quickTo(element, "x", { duration: 0.45, ease: "power3.out" });
      const yTo = gsap.quickTo(element, "y", { duration: 0.45, ease: "power3.out" });
      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        xTo((event.clientX - rect.left - rect.width / 2) * 0.16);
        yTo((event.clientY - rect.top - rect.height / 2) * 0.16);
      });
      element.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });

    const cursor = document.querySelector(".cursor");
    if (cursor) {
      const xTo = gsap.quickTo(cursor, "x", { duration: 0.32, ease: "power3.out" });
      const yTo = gsap.quickTo(cursor, "y", { duration: 0.32, ease: "power3.out" });
      document.addEventListener("pointermove", (event) => {
        xTo(event.clientX);
        yTo(event.clientY);
        gsap.to(cursor, { autoAlpha: 1, duration: 0.2 });
      });
      document.querySelectorAll("a, button, .service-row").forEach((target) => {
        target.addEventListener("pointerenter", () => gsap.to(cursor, { scale: 2.4, rotate: 45, duration: 0.35 }));
        target.addEventListener("pointerleave", () => gsap.to(cursor, { scale: 1, rotate: 0, duration: 0.35 }));
      });
    }
  }
}

const slides = Array.from(document.querySelectorAll("[data-slide]"));
const currentSlide = document.querySelector("[data-current-slide]");
const progress = document.querySelector("[data-progress]");
const nextButton = document.querySelector("[data-carousel-next]");
const toggleButton = document.querySelector("[data-carousel-toggle]");
let slideIndex = 0;
let carouselTimer;
let paused = reduceMotion;
const interval = 5500;

function animateProgress() {
  if (!progress) return;
  gsap.killTweensOf(progress);
  gsap.set(progress, { scaleX: 0 });
  if (!paused) gsap.to(progress, { scaleX: 1, duration: interval / 1000, ease: "none" });
}

function showSlide(nextIndex, direction = 1) {
  if (!slides.length || nextIndex === slideIndex) return;
  const outgoing = slides[slideIndex];
  const incoming = slides[nextIndex];
  incoming.classList.add("is-active");
  incoming.removeAttribute("aria-hidden");
  outgoing.setAttribute("aria-hidden", "true");

  if (reduceMotion) {
    outgoing.classList.remove("is-active");
  } else {
    gsap.fromTo(incoming, { autoAlpha: 0, xPercent: 4 * direction }, { autoAlpha: 1, xPercent: 0, duration: 1, ease: "power3.out" });
    gsap.fromTo(incoming.querySelector("img"), { scale: 1.08 }, { scale: 1, duration: 1.5, ease: "power3.out" });
    gsap.to(outgoing, { autoAlpha: 0, xPercent: -2 * direction, duration: 0.85, ease: "power3.inOut", onComplete: () => {
      outgoing.classList.remove("is-active");
      gsap.set(outgoing, { clearProps: "all" });
    }});
  }

  slideIndex = nextIndex;
  if (currentSlide) currentSlide.textContent = String(slideIndex + 1).padStart(2, "0");
  animateProgress();
}

function nextSlide() {
  showSlide((slideIndex + 1) % slides.length, 1);
}

function startCarousel() {
  clearInterval(carouselTimer);
  if (!paused && slides.length > 1) carouselTimer = window.setInterval(nextSlide, interval);
  animateProgress();
}

nextButton?.addEventListener("click", () => {
  nextSlide();
  startCarousel();
});

toggleButton?.addEventListener("click", () => {
  paused = !paused;
  toggleButton.querySelector("span").textContent = paused ? "Старт" : "Пауза";
  toggleButton.setAttribute("aria-label", paused ? "Запустить карусель" : "Поставить карусель на паузу");
  startCarousel();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) clearInterval(carouselTimer);
  else startCarousel();
});

const cocktailSlides = Array.from(document.querySelectorAll("[data-cocktail-slide]"));
const cocktailTabs = Array.from(document.querySelectorAll("[data-cocktail-to]"));
const cocktailNext = document.querySelector("[data-cocktail-next]");
const cocktailPause = document.querySelector("[data-cocktail-pause]");
let cocktailIndex = 0;
let cocktailTimer;
let cocktailsPaused = reduceMotion;

function showCocktail(nextIndex, direction = 1) {
  if (!cocktailSlides.length || nextIndex === cocktailIndex) return;
  const outgoing = cocktailSlides[cocktailIndex];
  const incoming = cocktailSlides[nextIndex];
  incoming.classList.add("is-active");
  incoming.removeAttribute("aria-hidden");
  outgoing.setAttribute("aria-hidden", "true");
  cocktailTabs.forEach((tab, index) => tab.setAttribute("aria-selected", String(index === nextIndex)));

  if (reduceMotion) {
    outgoing.classList.remove("is-active");
  } else {
    gsap.fromTo(incoming, { autoAlpha: 0, xPercent: 5 * direction }, { autoAlpha: 1, xPercent: 0, duration: 0.8, ease: "power3.out" });
    gsap.fromTo(incoming.querySelector("img"), { scale: 1.06 }, { scale: 1, duration: 1.15, ease: "power3.out" });
    gsap.to(outgoing, { autoAlpha: 0, xPercent: -3 * direction, duration: 0.7, ease: "power3.inOut", onComplete: () => {
      outgoing.classList.remove("is-active");
      gsap.set(outgoing, { clearProps: "all" });
    }});
  }
  cocktailIndex = nextIndex;
}

function startCocktailCarousel() {
  clearInterval(cocktailTimer);
  if (!cocktailsPaused && cocktailSlides.length > 1) {
    cocktailTimer = window.setInterval(() => showCocktail((cocktailIndex + 1) % cocktailSlides.length), 5200);
  }
}

cocktailTabs.forEach((tab, index) => tab.addEventListener("click", () => {
  showCocktail(index, index >= cocktailIndex ? 1 : -1);
  startCocktailCarousel();
}));

cocktailNext?.addEventListener("click", () => {
  showCocktail((cocktailIndex + 1) % cocktailSlides.length);
  startCocktailCarousel();
});

cocktailPause?.addEventListener("click", () => {
  cocktailsPaused = !cocktailsPaused;
  cocktailPause.textContent = cocktailsPaused ? "Старт" : "Пауза";
  cocktailPause.setAttribute("aria-label", cocktailsPaused ? "Запустить карусель коктейлей" : "Поставить карусель коктейлей на паузу");
  startCocktailCarousel();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) clearInterval(cocktailTimer);
  else startCocktailCarousel();
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();

initMotion();
startCarousel();
startCocktailCarousel();
window.addEventListener("load", () => ScrollTrigger.refresh());
