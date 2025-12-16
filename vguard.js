/*! VOID Guard v1 (client-side deterrence only) */
(function () {
  "use strict";

  // IMPORTANT:
  // This is a deterrence layer for casual tampering only.
  // Real security must be enforced server-side (Firebase Rules / authz / rate limits).

  var tripped = false;
  var lastTrip = 0;

  function trip(reason){
    if (tripped) return;
    tripped = true;
    lastTrip = Date.now();

    try { if (document && document.documentElement) document.documentElement.innerHTML = ""; } catch(e){}

    try {
      var u = location.href.split("#")[0];
      var sep = u.indexOf("?") === -1 ? "?" : "&";
      location.replace(u + sep + "_vguard=" + Date.now());
    } catch(e){
      try { location.reload(); } catch(e2){}
    }
  }

  function suspectViewportDelta(){
    // Desktop indicator (DevTools docking changes viewport/outer sizes).
    var w = Math.abs((window.outerWidth || 0) - (window.innerWidth || 0));
    var h = Math.abs((window.outerHeight || 0) - (window.innerHeight || 0));
    return (w > 180 || h > 180);
  }

  function suspectConsoleOpen(){
    // Getter side-effect (works on many Chromium builds)
    var opened = false;
    try {
      var el = new Image();
      Object.defineProperty(el, "id", {
        get: function () { opened = true; return "x"; }
      });
      console.log(el);
      if (console.clear) console.clear();
    } catch(e){}
    return opened;
  }

  function check(){
    if (tripped) return;
    try {
      if (suspectViewportDelta()) return trip("viewport");
      if (suspectConsoleOpen()) return trip("console");
    } catch(e){}
  }

  // key traps (deterrence)
  document.addEventListener("keydown", function (e) {
    try {
      var k = (e.key || "").toLowerCase();
      var ctrl = !!e.ctrlKey, sh = !!e.shiftKey;

      if (e.key === "F12" || (ctrl && sh && (k === "i" || k === "j" || k === "c"))) {
        e.preventDefault(); e.stopPropagation();
        return trip("keys");
      }
      if (ctrl && (k === "u" || k === "s" || k === "p")) {
        e.preventDefault(); e.stopPropagation();
        return trip("keys2");
      }
    } catch(err){}
  }, true);

  // Optional: block right click
  document.addEventListener("contextmenu", function (e) {
    try { e.preventDefault(); } catch(err){}
  }, true);

  setInterval(check, 600);
  window.addEventListener("resize", check, true);
  document.addEventListener("visibilitychange", function(){ if (!document.hidden) check(); }, true);

  // keep forcing refresh if still open
  setInterval(function(){
    if (!tripped) return;
    if (Date.now() - lastTrip > 1500){
      try { location.reload(); } catch(e){}
    }
  }, 900);
})();
