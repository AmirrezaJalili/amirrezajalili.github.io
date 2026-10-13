/*
 * "Rare case" mosaic (imbalanced-classification chapter).
 *
 * - Hover (or tap on phones): the same gentle tilt + lift as the angiogram.
 * - Pointing at a tile shows its class (and, once revealed, whether the
 *   rare case was found).
 *
 * The step-by-step reveal is driven by scrolling, in story.js.
 */
import { initTiltLift, showTip, hideTip } from "./lift.js";

export function initMosaic(fig, { reduceMotion = false } = {}) {
  if (!fig) return;
  const stage = fig.querySelector(".mosaic__stage");
  const stack = fig.querySelector(".mosaic__stack");
  const tip = fig.querySelector(".mosaic__tip");
  const covers = [...fig.querySelectorAll(".mosaic__covers rect")];
  const hits = [...fig.querySelectorAll(".mosaic__hits rect")];

  initTiltLift(fig, stage, stack, { reduceMotion, maxTilt: 4, onLeave: () => hideTip(tip) });

  hits.forEach((hit, i) => {
    hit.addEventListener("pointermove", (e) => {
      // Only describe tiles that are already revealed by scrolling.
      if (parseFloat(getComputedStyle(covers[i]).opacity) > 0.5) return hideTip(tip);
      showTip(tip, stage, hit.dataset.label, e);
    });
    hit.addEventListener("pointerleave", () => hideTip(tip));
  });
}
