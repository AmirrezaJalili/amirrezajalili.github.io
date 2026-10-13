/*
 * Shared by every page:
 * - smooth scrolling (Lenis), also for links to #sections
 * - sections fade up gently as they come into view ([data-reveal])
 * - the navbar gets a background once you scroll
 * - cards get a soft glow that follows the mouse
 * - "Request CV" buttons open a small note (cv-request.js)
 * - the email address is shown only after a click (email.js)
 */
import { gsap, ScrollTrigger } from "gsap";
import Lenis from "lenis";
import { initCvRequest } from "./cv-request.js";
import { initEmailReveal } from "./email.js";

gsap.registerPlugin(ScrollTrigger);

export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- Smooth scrolling ------------------------------------------------------
let lenis = null;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.09, anchors: { offset: -72 } });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// --- Reveal on scroll ------------------------------------------------------
const reveals = gsap.utils.toArray("[data-reveal]");
if (!reduceMotion && reveals.length) {
  gsap.set(reveals, { autoAlpha: 0, y: 28 });
  ScrollTrigger.batch(reveals, {
    start: "top 90%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.07, overwrite: true }),
  });
}

// --- Navbar background after scrolling ------------------------------------
const navbar = document.getElementById("navbar");
const updateNavbar = () => navbar.classList.toggle("is-scrolled", window.scrollY > 24);
window.addEventListener("scroll", updateNavbar, { passive: true });
updateNavbar();

// --- Card glow that follows the pointer -----------------------------------
for (const card of document.querySelectorAll(".card")) {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
}

// --- "Request CV" note and the hidden-from-bots email address ---------------
initCvRequest({ lenis });
initEmailReveal();
