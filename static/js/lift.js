/*
 * Shared hover effect for the layered figures (angiogram, mosaic).
 *
 * Mouse over the figure: it tilts a little towards the pointer and gets the
 * class "is-lifted", which makes its layers rise slightly towards the viewer
 * (see .angio__layer / .mosaic__layer in main.css; the layers stay exactly
 * aligned with the image underneath).
 * Phones and tablets: tap the figure to lift / restack the layers.
 */
export function initTiltLift(fig, stage, stack, { reduceMotion = false, maxTilt = 4, onLeave } = {}) {
  function tilt(e) {
    if (reduceMotion) return;
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    stack.style.setProperty("--ry", `${(px * 2 * maxTilt).toFixed(2)}deg`);
    stack.style.setProperty("--rx", `${(-py * 2 * maxTilt).toFixed(2)}deg`);
  }
  function lift(on) {
    fig.classList.toggle("is-lifted", on && !reduceMotion);
    if (!on) {
      stack.style.setProperty("--rx", "0deg");
      stack.style.setProperty("--ry", "0deg");
    }
  }
  stage.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") lift(true); });
  stage.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") tilt(e); });
  stage.addEventListener("pointerleave", (e) => {
    if (e.pointerType !== "mouse") return;
    lift(false);
    if (onLeave) onLeave();
  });
  stage.addEventListener("click", (e) => {
    if (e.pointerType === "mouse") return;
    lift(!fig.classList.contains("is-lifted"));
  });
}

/* Small label that follows the pointer inside a figure stage. */
export function showTip(tip, stage, text, event) {
  const r = stage.getBoundingClientRect();
  tip.textContent = text;
  tip.style.left = `${event.clientX - r.left}px`;
  tip.style.top = `${event.clientY - r.top}px`;
  tip.classList.add("is-visible");
}

export function hideTip(tip) {
  tip.classList.remove("is-visible");
}
