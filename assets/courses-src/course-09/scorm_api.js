/* Minimal SCORM 1.2 API wrapper. Finds the LMS API in the window/frame hierarchy.
   No-ops safely (with a console note) when run standalone outside an LMS, so the
   package is still fully previewable in a normal browser. */
var ScormAPI = (function () {
  var api = null, initialized = false, found = false;

  function findAPI(win) {
    var attempts = 0;
    while (win && attempts < 10) {
      if (win.API) return win.API;
      if (win.parent && win.parent !== win) { win = win.parent; attempts++; }
      else break;
    }
    if (window.opener && !win) return findAPI(window.opener);
    return null;
  }

  function init() {
    api = findAPI(window);
    found = !!api;
    if (found) {
      var result = api.LMSInitialize("");
      initialized = (result === "true" || result === true);
    } else {
      console.log("[SCORM] No LMS API found — running in standalone preview mode. Scores will not be reported.");
    }
    return found;
  }

  function setValue(key, value) {
    if (found && initialized) api.LMSSetValue(key, String(value));
  }

  function commit() {
    if (found && initialized) api.LMSCommit("");
  }

  function finish(scorePercent, passThreshold) {
    if (!found || !initialized) return;
    setValue("cmi.core.score.raw", Math.round(scorePercent));
    setValue("cmi.core.score.min", 0);
    setValue("cmi.core.score.max", 100);
    var status = scorePercent >= (passThreshold || 70) ? "passed" : "failed";
    setValue("cmi.core.lesson_status", status);
    setValue("cmi.core.exit", "");
    commit();
    api.LMSFinish("");
  }

  function setIncomplete() {
    setValue("cmi.core.lesson_status", "incomplete");
    commit();
  }

  return { init: init, setValue: setValue, commit: commit, finish: finish, setIncomplete: setIncomplete, isConnected: function(){ return found; } };
})();
