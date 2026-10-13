/*
 * Explainability figure (story chapter 3).
 *
 * - Hover (or tap on phones): the same gentle tilt + lift as the other figures.
 * - Pointing at the lesion shows how much of it the explanation covers
 *   (first the narrow one, after the correction the full one).
 *
 * The step-by-step reveal is driven by scrolling, in story.js.
 */
import { initTiltLift, showTip, hideTip } from "./lift.js";

export function initExplain(fig, { reduceMotion = false } = {}) {
  if (!fig) return;
  const stage = fig.querySelector(".explain__stage");
  const stack = fig.querySelector(".explain__stack");
  const tip = fig.querySelector(".explain__tip");
  const lesion = fig.querySelector(".explain__hits polygon");
  const narrow = fig.querySelector(".explain__heat--narrow");
  const fixed = fig.querySelector(".explain__heat--fixed");
  const shown = (el) => parseFloat(getComputedStyle(el).opacity) > 0.5;

  initTiltLift(fig, stage, stack, { reduceMotion, maxTilt: 4, onLeave: () => hideTip(tip) });

  lesion.addEventListener("pointermove", (e) => {
    // Describe whichever explanation is on screen (none before step 2).
    if (shown(fixed)) showTip(tip, stage, lesion.dataset.labelFixed, e);
    else if (shown(narrow)) showTip(tip, stage, lesion.dataset.labelNarrow, e);
    else hideTip(tip);
  });
  lesion.addEventListener("pointerleave", () => hideTip(tip));
}
