/*
 * The scroll story: one GSAP timeline "scrubbed" by the scroll position.
 *
 * Positions on the timeline are measured in pixels of scrolling, starting
 * when the top of the page is at the top of the screen. Because they depend
 * on the screen height, the timeline is rebuilt when the window is resized.
 *
 * Want to change the choreography? Each line below says "between scroll
 * position A and B, animate these values". V = one screen height.
 *
 * Nothing changes place: each chapter's figure stays where it is (angiogram
 * on the left, mosaic on the right, explainability figure on the left).
 * Scrolling only reveals layers step by step and fades things in and out.
 */
import { gsap, ScrollTrigger } from "gsap";
import { reduceMotion } from "./site.js";

export function buildStory() {
  const story = document.getElementById("story");
  const el = (name) => story.querySelector(`[data-anim="${name}"]`);
  const heroText = el("hero");
  const cue = el("cue");

  // Chapter 1: segmentation (angiogram)
  const coronarySection = document.getElementById("coronary");
  const coronaryText = el("coronary-text");
  const angio = el("angio");
  const inAngio = (sel) => [...angio.querySelectorAll(sel)];
  const boxes = inAngio(".angio__box");
  const boxLabels = inAngio(".angio__box-label");
  const angioMask = angio.querySelector(".angio__mask");
  const segs = inAngio(".angio__seg");
  const badges = inAngio(".angio__badge");
  const angioSteps = inAngio(".fig__steps li");
  const angioBars = inAngio(".fig__step-bar");
  const angioLegend = [...coronarySection.querySelectorAll(".legend__item")];

  // Chapter 2: classification on imbalanced data (mosaic)
  const imbalanceSection = document.getElementById("imbalance");
  const imbalanceText = el("imbalance-text");
  const mosaic = el("mosaic");
  const inMosaic = (sel) => [...mosaic.querySelectorAll(sel)];
  const covers = inMosaic(".mosaic__covers rect");
  const dots = inMosaic(".mosaic__dot");
  const rareOutlines = inMosaic(".mosaic__rare");
  const misses = inMosaic(".mosaic__miss");
  const resolved = inMosaic(".mosaic__miss.is-resolved");
  const founds = inMosaic(".mosaic__found");
  const alarms = inMosaic(".mosaic__alarm");
  const statsBox = mosaic.querySelector(".mosaic__stats");
  const accuracyEl = mosaic.querySelector('[data-stat="accuracy"]');
  const foundEl = mosaic.querySelector('[data-stat="found"]');
  const mosaicSteps = inMosaic(".fig__steps li");
  const mosaicBars = inMosaic(".fig__step-bar");
  const mosaicLegend = [...imbalanceSection.querySelectorAll(".legend__item")];
  const stats = {
    rareTotal: +statsBox.dataset.rareTotal,
    naive: +statsBox.dataset.naive,
    balanced: +statsBox.dataset.balanced,
    found: +statsBox.dataset.found,
  };

  // Chapter 3: explainability (missed melanoma, explanation check, correction)
  const explainSection = document.getElementById("explainability");
  const explainText = el("explain-text");
  const explain = el("explain");
  const inExplain = (sel) => explain.querySelector(sel);
  const truthTag = inExplain(".explain__tag--truth");
  const flagTag = inExplain(".explain__tag--flag");
  const rightTag = inExplain(".explain__tag--right");
  const heatNarrow = inExplain(".explain__heat--narrow");
  const heatFixed = inExplain(".explain__heat--fixed");
  const lesionBorder = inExplain(".explain__border polygon");
  const explainStats = inExplain(".explain__stats");
  const wrongAnswer = inExplain(".explain__answer--wrong");
  const wrongCross = inExplain(".explain__cross");
  const rightAnswer = inExplain(".explain__answer--right");
  const explainedEl = inExplain('[data-stat="explained"]');
  const explainSteps = [...explain.querySelectorAll(".fig__steps li")];
  const explainBars = [...explain.querySelectorAll(".fig__step-bar")];
  const explainLegend = [...explainSection.querySelectorAll(".legend__item")];
  const explained = { narrow: +explainStats.dataset.narrow, fixed: +explainStats.dataset.fixed };

  let tl;

  function build() {
    if (tl) {
      tl.scrollTrigger.kill();
      tl.kill();
    }

    const V = window.innerHeight;
    const narrow = window.innerWidth <= 760; // phones: figure above, text below
    const offset = (section) => section.offsetTop - story.offsetTop;

    const coronaryStart = offset(coronarySection);                          // chapter reaches top of screen
    const coronaryEnd = coronaryStart + coronarySection.offsetHeight - V;   // chapter stops being pinned
    const imbalanceStart = offset(imbalanceSection);
    const imbalanceEnd = imbalanceStart + imbalanceSection.offsetHeight - V;
    const explainStart = offset(explainSection);
    const explainEnd = explainStart + explainSection.offsetHeight - V;
    const storyEnd = explainStart + explainSection.offsetHeight;            // story has left the screen

    tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: story,
        start: "top top",
        end: `+=${storyEnd}`,
        scrub: 0.8, // seconds the animation takes to "catch up" with the scroll
      },
    });

    // between(a, b) → place a tween from scroll position a to scroll position b
    const between = (a, b) => [a, Math.max(1, b - a)];
    const add = (target, from, to, [at, duration], ease = "power2.inOut") => {
      const vars = { ...to, duration, ease };
      if (from) tl.fromTo(target, from, { ...vars, immediateRender: true }, at);
      else tl.to(target, vars, at);
    };
    // Position inside a pinned chapter: f = 0 … 1 through the pinned part.
    const pinnedAt = (start, end) => (f) => start + f * (end - start);
    const stepOn = (step, a, pinned) =>
      add(step, { opacity: 0.4 }, { opacity: 1 }, between(a, a + 0.04 * pinned), "none");

    const slideX = narrow ? 0 : 48; // text slides in sideways on desktop only
    const slideY = narrow ? 32 : 0;

    // ── Hero: photo and name fade up and away ────────────────────────────
    add(heroText, { autoAlpha: 1, y: 0, scale: 1 }, { autoAlpha: 0, y: -0.08 * V, scale: 0.97 },
      between(0, 0.5 * V), "power1.in");
    add(cue, { autoAlpha: 1 }, { autoAlpha: 0 }, between(0, 0.12 * V), "none");

    // ── Chapter 1: segmentation. Angiogram on the left, text on the right ─
    add(angio, { autoAlpha: 0 }, { autoAlpha: 1 }, between(coronaryStart - 0.6 * V, coronaryStart - 0.05 * V), "power1.out");
    add(coronaryText, { autoAlpha: 0, x: slideX, y: slideY }, { autoAlpha: 1, x: 0, y: 0 },
      between(coronaryStart - 0.55 * V, coronaryStart + 0.05 * V), "power2.out");

    if (!reduceMotion) {
      const pinned = coronaryEnd - coronaryStart;
      const at = pinnedAt(coronaryStart, coronaryEnd);

      // Step 1: draw the box around each stenosis.
      stepOn(angioSteps[0], at(0.02), pinned);
      add(angioBars[0], { "--p": 0 }, { "--p": 1 }, between(at(0.02), at(0.22)), "none");
      add(boxes, { strokeDashoffset: (i, t) => t.style.getPropertyValue("--len") }, { strokeDashoffset: 0 },
        between(at(0.02), at(0.2)), "power1.inOut");
      add(boxLabels, { autoAlpha: 0 }, { autoAlpha: 1 }, between(at(0.16), at(0.22)), "none");

      // Step 2: fill the stenosis with the red segmentation mask.
      stepOn(angioSteps[1], at(0.26), pinned);
      add(angioBars[1], { "--p": 0 }, { "--p": 1 }, between(at(0.26), at(0.44)), "none");
      add(angioMask, { autoAlpha: 0 }, { autoAlpha: 1 }, between(at(0.26), at(0.44)), "power1.inOut");

      // Step 3: the boxes step back and the SYNTAX segments light up one by one.
      stepOn(angioSteps[2], at(0.5), pinned);
      add(angioBars[2], { "--p": 0 }, { "--p": 1 }, between(at(0.5), at(0.9)), "none");
      add(boxes, null, { autoAlpha: 0.35 }, between(at(0.5), at(0.56)), "none");
      add(boxLabels, null, { autoAlpha: 0 }, between(at(0.5), at(0.56)), "none");
      const each = 0.4 / Math.max(1, segs.length);
      segs.forEach((seg, i) => {
        const a = at(0.5 + i * each);
        const b = a + Math.max(1, 1.4 * each * pinned);
        add(seg, { autoAlpha: 0 }, { autoAlpha: 1 }, between(a, b), "power1.out");
        add(badges[i], { autoAlpha: 0, scale: 0.6, xPercent: -50, yPercent: -50 },
          { autoAlpha: 1, scale: 1, xPercent: -50, yPercent: -50 }, between(a, b), "back.out(2)");
        if (angioLegend[i]) add(angioLegend[i], { opacity: 0.35 }, { opacity: 1 }, between(a, b), "none");
      });
    }

    add(coronaryText, null, { autoAlpha: 0, y: -40 }, between(coronaryEnd - 0.2 * V, coronaryEnd + 0.1 * V), "power1.in");
    add(angio, null, { autoAlpha: 0 }, between(coronaryEnd - 0.15 * V, coronaryEnd + 0.25 * V), "power1.in");

    // ── Chapter 2: imbalanced classification. Text left, mosaic right ────
    add(mosaic, { autoAlpha: 0 }, { autoAlpha: 1 }, between(imbalanceStart - 0.6 * V, imbalanceStart - 0.05 * V), "power1.out");
    add(imbalanceText, { autoAlpha: 0, x: -slideX, y: slideY }, { autoAlpha: 1, x: 0, y: 0 },
      between(imbalanceStart - 0.55 * V, imbalanceStart + 0.05 * V), "power2.out");

    if (!reduceMotion) {
      const pinned = imbalanceEnd - imbalanceStart;
      const at = pinnedAt(imbalanceStart, imbalanceEnd);
      // The two numbers under the mosaic count up as you scroll.
      const counter = { acc: 0, found: 0 };
      const render = () => {
        accuracyEl.textContent = `${Math.round(counter.acc)}%`;
        foundEl.textContent = `${Math.round(counter.found)} / ${stats.rareTotal}`;
      };
      const pop = { autoAlpha: 0, scale: 0.4 };
      const popped = { autoAlpha: 1, scale: 1 };

      // Step 1 "The data": tiles appear one after another; class dots and the
      // outlines of the few rare cases follow.
      stepOn(mosaicSteps[0], at(0.02), pinned);
      add(mosaicBars[0], { "--p": 0 }, { "--p": 1 }, between(at(0.02), at(0.3)), "none");
      add(covers, { opacity: 1 }, { opacity: 0, stagger: { amount: 0.1 * pinned, from: "random" } },
        between(at(0.02), at(0.06)), "power1.out");
      add(dots, { autoAlpha: 0 }, { autoAlpha: 1 }, between(at(0.16), at(0.22)), "none");
      add(rareOutlines, { autoAlpha: 0 }, { autoAlpha: 1 }, between(at(0.22), at(0.3)), "power1.inOut");
      add(mosaicLegend, { opacity: 0.35 }, { opacity: 1 }, between(at(0.16), at(0.3)), "none");

      // Step 2 "Accuracy hides it": a naive model never predicts the rare
      // class. Accuracy looks high, yet every rare case is missed.
      stepOn(mosaicSteps[1], at(0.36), pinned);
      add(mosaicBars[1], { "--p": 0 }, { "--p": 1 }, between(at(0.36), at(0.6)), "none");
      add(statsBox, { autoAlpha: 0 }, { autoAlpha: 1 }, between(at(0.36), at(0.42)), "none");
      add(counter, { acc: 0, found: 0 }, { acc: stats.naive, found: 0, onUpdate: render },
        between(at(0.38), at(0.5)), "power1.out");
      add(misses, pop, popped, between(at(0.46), at(0.58)), "back.out(2)");

      // Step 3 "Find the rare cases": a model trained with the imbalance in
      // mind finds most of them (one is still missed, one false alarm).
      stepOn(mosaicSteps[2], at(0.64), pinned);
      add(mosaicBars[2], { "--p": 0 }, { "--p": 1 }, between(at(0.64), at(0.92)), "none");
      add(resolved, null, { autoAlpha: 0 }, between(at(0.66), at(0.74)), "none");
      add(founds, pop, popped, between(at(0.68), at(0.8)), "back.out(2)");
      add(alarms, pop, popped, between(at(0.76), at(0.84)), "back.out(2)");
      add(counter, null, { acc: stats.balanced, found: stats.found, onUpdate: render },
        between(at(0.68), at(0.86)), "power1.inOut");
    }

    add(imbalanceText, null, { autoAlpha: 0, y: -40 }, between(imbalanceEnd - 0.2 * V, imbalanceEnd + 0.1 * V), "power1.in");
    add(mosaic, null, { autoAlpha: 0 }, between(imbalanceEnd - 0.15 * V, imbalanceEnd + 0.25 * V), "power1.in");

    // ── Chapter 3: explainability. Figure on the left, text on the right ─
    add(explain, { autoAlpha: 0 }, { autoAlpha: 1 }, between(explainStart - 0.6 * V, explainStart - 0.05 * V), "power1.out");
    add(explainText, { autoAlpha: 0, x: slideX, y: slideY }, { autoAlpha: 1, x: 0, y: 0 },
      between(explainStart - 0.55 * V, explainStart + 0.05 * V), "power2.out");

    if (!reduceMotion) {
      const pinned = explainEnd - explainStart;
      const at = pinnedAt(explainStart, explainEnd);
      // "Lesion explained" (share of the lesion the heatmap covers) counts as you scroll
      // (it shows a dash until the explanation is checked in step 2).
      const counter = { value: -1 };
      const render = () => {
        explainedEl.textContent = counter.value < 0 ? "–" : `${Math.round(counter.value)}%`;
      };
      const pop = { autoAlpha: 0, scale: 0.85 };
      const popped = { autoAlpha: 1, scale: 1 };

      // Step 1 "The answer": the model calls the lesion a harmless
      // nevus. The biopsy says melanoma, so the answer is a dangerous miss.
      stepOn(explainSteps[0], at(0.02), pinned);
      add(explainBars[0], { "--p": 0 }, { "--p": 1 }, between(at(0.02), at(0.3)), "none");
      add(explainStats, { autoAlpha: 0 }, { autoAlpha: 1 }, between(at(0.02), at(0.08)), "none");
      add(counter, { value: -1 }, { value: -1, onUpdate: render }, between(at(0.02), at(0.04)), "none");
      add(wrongAnswer, { autoAlpha: 0 }, { autoAlpha: 1 }, between(at(0.04), at(0.12)), "power1.out");
      add(truthTag, pop, popped, between(at(0.16), at(0.24)), "back.out(2)");
      add(wrongCross, { autoAlpha: 0 }, { autoAlpha: 1 }, between(at(0.2), at(0.26)), "none");

      // Step 2 "Check why": the heatmap lights up only one small
      // corner of the lesion, so the check fails and the case is flagged.
      stepOn(explainSteps[1], at(0.34), pinned);
      add(explainBars[1], { "--p": 0 }, { "--p": 1 }, between(at(0.34), at(0.6)), "none");
      add(heatNarrow, { autoAlpha: 0 }, { autoAlpha: 1 }, between(at(0.34), at(0.42)), "power1.inOut");
      add(lesionBorder, { strokeDashoffset: (i, t) => t.style.getPropertyValue("--len") }, { strokeDashoffset: 0 },
        between(at(0.38), at(0.5)), "power1.inOut");
      add(counter, null, { value: explained.narrow, onUpdate: render }, between(at(0.44), at(0.52)), "power1.out");
      add(flagTag, pop, popped, between(at(0.5), at(0.58)), "back.out(2)");
      add(explainLegend, { opacity: 0.35 }, { opacity: 1 }, between(at(0.34), at(0.5)), "none");

      // Step 3 "Correct it": the corrected model looks at the whole lesion,
      // and now gives the right answer for the right reason.
      stepOn(explainSteps[2], at(0.64), pinned);
      add(explainBars[2], { "--p": 0 }, { "--p": 1 }, between(at(0.64), at(0.92)), "none");
      add(heatNarrow, null, { autoAlpha: 0 }, between(at(0.64), at(0.72)), "none");
      add(heatFixed, { autoAlpha: 0 }, { autoAlpha: 1 }, between(at(0.66), at(0.78)), "power1.inOut");
      add(counter, null, { value: explained.fixed, onUpdate: render }, between(at(0.68), at(0.84)), "power1.inOut");
      add(flagTag, null, { autoAlpha: 0 }, between(at(0.76), at(0.8)), "none");
      add(wrongAnswer, null, { autoAlpha: 0 }, between(at(0.76), at(0.8)), "none");
      add(rightAnswer, { autoAlpha: 0 }, { autoAlpha: 1 }, between(at(0.8), at(0.86)), "power1.out");
      add(rightTag, pop, popped, between(at(0.82), at(0.9)), "back.out(2)");
    }

    // ── Story ends: text and figure fade as the academic sections arrive ──
    add(explainText, null, { autoAlpha: 0 }, between(explainEnd - 0.1 * V, explainEnd + 0.35 * V), "power1.in");
    add(explain, null, { autoAlpha: 0 }, between(explainEnd, explainEnd + 0.45 * V), "power1.in");

    tl.set({}, {}, storyEnd); // make the timeline exactly as long as the story
  }

  build();

  // Rebuild when the window size really changes (ignore the small height
  // changes caused by mobile browser toolbars appearing/disappearing).
  let lastW = window.innerWidth;
  let lastH = window.innerHeight;
  let timer;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === lastW && Math.abs(h - lastH) < 120) return;
      lastW = w;
      lastH = h;
      build();
      ScrollTrigger.refresh();
    }, 200);
  });
}
