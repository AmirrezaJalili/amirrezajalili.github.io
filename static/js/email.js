/*
 * Your email address is never written in the page's HTML, so the bots that
 * collect addresses from websites cannot find it. It is stored scrambled
 * (reversed, then base64) in <body data-email> and only put back together
 * when a visitor clicks: "Show email address" in the Contact section, or the
 * CV request note (cv-request.js).
 */

export function getEmail() {
  try {
    return atob(document.body.dataset.email || "").split("").reverse().join("");
  } catch {
    return "";
  }
}

export function mailto(email, { subject = "", body = "" } = {}) {
  const query = [["subject", subject], ["body", body]]
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return `mailto:${email}${query ? `?${query}` : ""}`;
}

/* A "Copy" button: copies the address and briefly says "Copied ✓". If the
   browser blocks copying, the address in `fallback` is selected instead. */
export function initCopyButton(button, fallback) {
  const label = button.querySelector("[data-copy-label]");
  const original = label.textContent;
  let timer;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(getEmail());
      label.textContent = "Copied ✓";
    } catch {
      if (fallback) getSelection().selectAllChildren(fallback);
      label.textContent = "Press Ctrl+C";
    }
    clearTimeout(timer);
    timer = setTimeout(() => { label.textContent = original; }, 2200);
  });
}

/* Contact section: "Show email address" → the address (an email link) and a
   Copy button appear in its place. */
export function initEmailReveal() {
  for (const box of document.querySelectorAll("[data-email-reveal]")) {
    const show = box.querySelector("[data-email-show]");
    const revealed = box.querySelector("[data-email-revealed]");
    const link = box.querySelector("[data-email-link]");
    initCopyButton(box.querySelector("[data-email-copy]"), link);
    show.addEventListener("click", () => {
      const email = getEmail();
      link.textContent = email;
      link.href = mailto(email);
      show.hidden = true;
      revealed.hidden = false;
      link.focus();
    });
  }
}
