/*
 * Interactive angiogram figure.
 *
 * - Hover (or tap on phones): the figure tilts slightly towards the pointer
 *   and its layers separate in 3D: segments, red stenosis mask, boxes and
 *   number badges lift off the X-ray, each a little more than the one below.
 * - Pointing at a segment (or its badge, or its name in the legend)
 *   highlights it and shows its SYNTAX name.
 *
 * The step-by-step reveal (box → mask → segments) is driven by scrolling,
 * in story.js.
 */
import { initTiltLift, showTip, hideTip } from "./lift.js";

export function initAngiogram(fig, { reduceMotion = false } = {}) {
  if (!fig) return;
  const stage = fig.querySelector(".angio__stage");
  const stack = fig.querySelector(".angio__stack");
  const tip = fig.querySelector(".angio__tip");
  const segs = [...fig.querySelectorAll(".angio__seg")];
  const badges = [...fig.querySelectorAll(".angio__badge")];
  const legend = [...document.querySelectorAll(".chapter--coronary .legend__item[data-seg]")];
  const MAX_TILT = 4; // degrees: small, so the masks stay on their vessels

  // Hover: tilt + lift the layers (shared with the mosaic, see lift.js).
  initTiltLift(fig, stage, stack, { reduceMotion, maxTilt: MAX_TILT, onLeave: () => focus(null) });

  // --- Highlight one segment --------------------------------------------
  const visible = (el) => parseFloat(getComputedStyle(el).opacity) > 0.5;

  function focus(index, event) {
    const active = index === null ? null : String(index);
    fig.classList.toggle("has-focus", active !== null);
    for (const group of [segs, badges, legend]) {
      for (const el of group) el.classList.toggle("is-active", el.dataset.seg === active);
    }
    if (active === null || !event) {
      hideTip(tip);
      return;
    }
    const seg = segs.find((s) => s.dataset.seg === active);
    showTip(tip, stage, seg.dataset.label, event);
  }

  for (const el of [...segs, ...badges]) {
    el.addEventListener("pointermove", (e) => {
      const seg = segs.find((s) => s.dataset.seg === el.dataset.seg);
      if (visible(seg)) focus(el.dataset.seg, e);
    });
    el.addEventListener("pointerleave", () => focus(null));
  }
  for (const item of legend) {
    const on = () => {
      const seg = segs.find((s) => s.dataset.seg === item.dataset.seg);
      if (visible(seg)) focus(item.dataset.seg);
    };
    item.addEventListener("pointerenter", on);
    item.addEventListener("focus", on);
    item.addEventListener("pointerleave", () => focus(null));
    item.addEventListener("blur", () => focus(null));
  }
}
