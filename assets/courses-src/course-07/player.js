(function () {
  var state = { screen: "slide", slideIndex: 0, quizIndex: 0, answers: [], selected: null, answered: false };
  var app = document.getElementById("app");

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k.indexOf("on") === 0) e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }

  function render() {
    app.innerHTML = "";
    var totalSlides = COURSE_DATA.slides.length;
    var totalScreens = totalSlides + 1; // + quiz
    var progressLabel = state.screen === "slide"
      ? "Slide " + (state.slideIndex + 1) + " of " + totalSlides
      : "Knowledge Check";

    var header = el("header", { class: "course-header" }, [
      el("div", {}, [
        el("div", { class: "brand" }, [document.createTextNode("Business Analysis & Agile Practitioner Series")]),
        el("h1", {}, [document.createTextNode(COURSE_DATA.title)]),
      ]),
      el("div", { class: "progress" }, [document.createTextNode(progressLabel)]),
    ]);
    app.appendChild(header);

    var main = el("main", { id: "main" }, []);
    app.appendChild(main);

    if (state.screen === "slide") renderSlide(main);
    else if (state.screen === "quiz") renderQuiz(main);
    else if (state.screen === "result") renderResult(main);

    if (state.screen !== "result") app.appendChild(renderFooter());
  }

  function renderSlide(main) {
    var s = COURSE_DATA.slides[state.slideIndex];
    var wrap = el("div", {}, []);
    if (s.badge) wrap.appendChild(el("div", { class: "badge-welcome" }, [document.createTextNode(s.badge)]));
    wrap.appendChild(el("div", { class: "slide-image-wrap" }, [ el("img", { src: "slides/" + s.img, alt: "Slide" }) ]));
    var nb = el("div", { class: "narration-box" }, [ el("h3", {}, [document.createTextNode("Narrator Script")]) ]);
    (s.notes || []).forEach(function (p) { nb.appendChild(el("p", {}, [document.createTextNode(p)])); });
    wrap.appendChild(nb);
    main.appendChild(wrap);
  }

  function renderFooter() {
    var totalSlides = COURSE_DATA.slides.length;
    var isLastSlide = state.screen === "slide" && state.slideIndex === totalSlides - 1;
    var prevBtn = el("button", {
      class: "secondary",
      onclick: function () {
        if (state.screen === "slide" && state.slideIndex > 0) { state.slideIndex--; render(); }
      },
    }, [document.createTextNode("← Previous")]);
    if (state.screen !== "slide" || state.slideIndex === 0) prevBtn.disabled = true;

    var nextLabel = isLastSlide ? "Start Knowledge Check →" : "Next →";
    var nextBtn = el("button", {
      class: "primary",
      onclick: function () {
        if (state.screen === "slide") {
          if (isLastSlide) { state.screen = "quiz"; state.quizIndex = 0; state.answers = []; state.selected = null; state.answered = false; }
          else state.slideIndex++;
          render();
        }
      },
    }, [document.createTextNode(nextLabel)]);

    var dots = el("div", { class: "dots" }, COURSE_DATA.slides.map(function (_, i) {
      var cls = "dot" + (i === state.slideIndex && state.screen === "slide" ? " active" : i < state.slideIndex || state.screen !== "slide" ? " done" : "");
      return el("span", { class: cls });
    }));

    return el("footer", { class: "nav-bar" }, [prevBtn, dots, state.screen === "slide" ? nextBtn : el("span", {}, [])]);
  }

  function renderQuiz(main) {
    var quiz = COURSE_DATA.quiz;
    var q = quiz[state.quizIndex];
    var wrap = el("div", { class: "quiz-wrap" }, []);
    wrap.appendChild(el("div", { class: "quiz-progress" }, [document.createTextNode("Question " + (state.quizIndex + 1) + " of " + quiz.length)]));
    wrap.appendChild(el("div", { class: "quiz-question" }, [document.createTextNode(q.q)]));

    q.options.forEach(function (opt, oi) {
      var cls = "quiz-option";
      if (state.answered) {
        if (oi === q.correct) cls += " correct";
        else if (oi === state.selected) cls += " incorrect";
      } else if (oi === state.selected) cls += " selected";
      var optEl = el("div", {
        class: cls,
        onclick: function () {
          if (state.answered) return;
          state.selected = oi;
          render();
        },
      }, [document.createTextNode(String.fromCharCode(65 + oi) + ". " + opt)]);
      wrap.appendChild(optEl);
    });

    if (!state.answered) {
      var checkBtn = el("button", {
        class: "primary",
        onclick: function () {
          if (state.selected === null) return;
          state.answered = true;
          state.answers[state.quizIndex] = state.selected === q.correct;
          render();
        },
      }, [document.createTextNode("Check Answer")]);
      if (state.selected === null) checkBtn.disabled = true;
      wrap.appendChild(el("div", { style: "margin-top:18px" }, [checkBtn]));
    } else {
      var isCorrect = state.selected === q.correct;
      wrap.appendChild(el("div", { class: "quiz-feedback " + (isCorrect ? "correct" : "incorrect") },
        [document.createTextNode((isCorrect ? "Correct. " : "Not quite. ") + q.explanation)]));
      var isLastQ = state.quizIndex === quiz.length - 1;
      var nextQBtn = el("button", {
        class: "primary",
        style: "margin-top:18px",
        onclick: function () {
          if (isLastQ) { finishQuiz(); }
          else { state.quizIndex++; state.selected = null; state.answered = false; render(); }
        },
      }, [document.createTextNode(isLastQ ? "See Results →" : "Next Question →")]);
      wrap.appendChild(nextQBtn);
    }
    main.appendChild(wrap);
  }

  function finishQuiz() {
    var correctCount = state.answers.filter(Boolean).length;
    var pct = Math.round((correctCount / COURSE_DATA.quiz.length) * 100);
    state.finalScore = pct;
    state.screen = "result";
    ScormAPI.finish(pct, 70);
    render();
  }

  function renderResult(main) {
    var pass = state.finalScore >= 70;
    var correctCount = state.answers.filter(Boolean).length;
    var wrap = el("div", { class: "quiz-result" }, [
      el("div", { class: "score" }, [document.createTextNode(state.finalScore + "%")]),
      el("div", {}, [document.createTextNode(correctCount + " of " + COURSE_DATA.quiz.length + " correct")]),
      el("div", { class: "verdict " + (pass ? "pass" : "fail") }, [document.createTextNode(pass ? "Knowledge Check Passed" : "Not Yet Passed — Review and Retake")]),
      el("div", { style: "margin-top:28px" }, [
        el("button", { class: "secondary", onclick: function () {
          state.screen = "slide"; state.slideIndex = 0; render();
        } }, [document.createTextNode("← Review Course Content")]),
        document.createTextNode("  "),
        el("button", { class: "primary", onclick: function () {
          state.screen = "quiz"; state.quizIndex = 0; state.answers = []; state.selected = null; state.answered = false; render();
        } }, [document.createTextNode("Retake Knowledge Check")]),
      ]),
    ]);
    main.appendChild(wrap);
  }

  window.addEventListener("load", function () {
    ScormAPI.init();
    ScormAPI.setIncomplete();
    render();
  });
})();
