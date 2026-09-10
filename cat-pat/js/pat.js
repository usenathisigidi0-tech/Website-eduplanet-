/* ==========================================================================
   Online Banking — CAT PAT Grade 12 (2026)
   Small helper script shared by all four pages.

   Nothing here is required for the site to work. Every page is complete,
   readable and navigable with JavaScript switched off — this file only adds
   two conveniences on top.
   ========================================================================== */

(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     1. Reveal sections as they scroll into view.

     The CSS only hides a .reveal section if <html> carries class="js".
     That class is added here, so if this file is blocked or fails to run,
     the class is never added and everything stays plainly visible.
     ---------------------------------------------------------------------- */

  var root = document.documentElement;
  var targets = document.querySelectorAll(".reveal");

  if (targets.length && "IntersectionObserver" in window) {
    root.className += " js";

    var watcher = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          watcher.unobserve(entry.target);   // reveal once, then stop watching
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    targets.forEach(function (el) { watcher.observe(el); });

    /* Safety net. If anything goes wrong above and a section is never
       revealed, drop the "js" class after 4 seconds so the CSS stops
       hiding it. The page can then never end up blank. */
    window.setTimeout(function () {
      var hidden = document.querySelectorAll(".reveal:not(.in)");
      var i;
      for (i = 0; i < hidden.length; i++) {
        if (hidden[i].getBoundingClientRect().top < window.innerHeight) {
          root.className = root.className.replace(/\bjs\b/, "");
          return;
        }
      }
    }, 4000);
  }

  /* ----------------------------------------------------------------------
     2. Back-to-top button.

     Appears only once the reader has scrolled past one screen height.
     ---------------------------------------------------------------------- */

  var toTop = document.getElementById("toTop");

  if (toTop) {
    var showButton = function () {
      if (window.pageYOffset > window.innerHeight * 0.8) {
        toTop.classList.add("show");
      } else {
        toTop.classList.remove("show");
      }
    };

    window.addEventListener("scroll", showButton, { passive: true });
    showButton();

    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}());
