/*
 * "Request CV" note. The CV is not downloadable: buttons marked
 * [data-cv-request] open a small dialog (in templates/base.html) with an
 * "Email me" button and a "Copy address" button.
 *
 * The email address is only filled in when the note opens (see email.js),
 * so it is never in the page's HTML. Without JavaScript the buttons simply
 * lead to the Contact section.
 */
import { getEmail, mailto, initCopyButton } from "./email.js";

export function initCvRequest({ lenis = null } = {}) {
  const dialog = document.getElementById("cv-request");
  if (!dialog) return;
  const link = dialog.querySelector("[data-email-link]");
  const address = dialog.querySelector("[data-email-text]");

  for (const button of document.querySelectorAll("[data-cv-request]")) {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const email = getEmail();
      link.href = mailto(email, { subject: link.dataset.subject, body: link.dataset.body });
      address.textContent = email;
      dialog.showModal();
      lenis?.stop(); // keep the page behind the note from scrolling
    });
  }

  // Close with the ✕ button, the Esc key (built into <dialog>), or a click
  // on the dimmed area around the note.
  dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => lenis?.start());

  // "Copy address": for visitors whose computer has no email app set up
  // (webmail users), the email link may do nothing, so offer to copy it.
  initCopyButton(dialog.querySelector("[data-email-copy]"), address);
}
