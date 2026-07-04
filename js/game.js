(function () {
  const app = document.getElementById("app");
  const questionMap = new Map(window.QUESTIONS.map(q => [q.id, q]));
  const state = {
    mode: "junior",
    screen: "home",
    currentQuestion: 1,
    hearts: 0,
    awarded: new Set(),
    completed: false,
    answersEnabled: false,
    helpActive: false,
    facilitatorOpen: false,
    finalStep: 0
  };
  let thinkingTimer = null;

  const $ = (selector) => app.querySelector(selector);
  const treeStage = () => state.hearts >= 12 ? 4 : state.hearts >= 9 ? 3 : state.hearts >= 6 ? 2 : state.hearts >= 3 ? 1 : 0;
  const isSenior = () => state.mode === "senior";
  const play = (name) => window.GameAudio.play(name);

  function render() {
    clearTimeout(thinkingTimer);
    app.className = `app mode-${state.mode} screen-${state.screen}`;
    app.innerHTML = shell(screenHtml());
    bindCommon();
    bindScreen();
  }

  function shell(content) {
    const chrome = state.screen === "home" ? "" : `
      <header class="topbar">
        <div class="chapter-label">${currentChapterLabel()}</div>
        <div class="heart-wrap">
          <div class="heart-title">我们的礼仪之心</div>
          <div class="hearts" aria-label="已收集${state.hearts}颗礼仪之心">${heartHtml()}</div>
        </div>
        <div class="mini-tree">${treeHtml("small")}</div>
      </header>`;
    return `
      ${chrome}
      <main class="screen-shell">${content}</main>
      <button class="host-tab" type="button" data-action="toggleHost" aria-expanded="${state.facilitatorOpen}">⚙️ 主持人控制</button>
      ${state.facilitatorOpen ? hostPanel() : ""}
    `;
  }

  function currentChapterLabel() {
    const q = questionMap.get(state.currentQuestion);
    if (state.screen === "intro") return "故事开始";
    if (state.screen === "collectiveIntro") return "🤝 全班共同任务";
    if (state.screen.includes("final") || state.screen === "review" || state.screen === "recitation") return "✨ 总结";
    return q ? q.chapterTitle : "礼仪小侦探";
  }

  function heartHtml() {
    return Array.from({ length: 12 }, (_, i) => `<span class="heart ${i < state.hearts ? "filled" : ""}">${i < state.hearts ? "❤️" : "🤍"}</span>`).join("");
  }

  function treeHtml(size = "", forcedStage = null) {
    const stage = forcedStage ?? treeStage();
    return `<div class="tree tree-${stage} ${size}" aria-label="礼仪之树第${stage}阶段">
      <div class="tree-glow"></div>
      <div class="tree-seed"></div>
      <div class="tree-trunk"></div>
      <div class="tree-branch branch-left"></div>
      <div class="tree-branch branch-right"></div>
      <div class="tree-crown crown-one"></div>
      <div class="tree-crown crown-two"></div>
      <div class="tree-crown crown-three"></div>
      <div class="tree-flower f1"></div><div class="tree-flower f2"></div><div class="tree-flower f3"></div>
      <div class="tree-fruit p1"></div><div class="tree-fruit p2"></div><div class="tree-fruit p3"></div>
      <div class="tree-heart h1">♥</div><div class="tree-heart h2">♥</div><div class="tree-heart h3">♥</div>
      <div class="tree-heart h4">♥</div><div class="tree-heart h5">♥</div><div class="tree-heart h6">♥</div>
      <div class="tree-heart h7">♥</div><div class="tree-heart h8">♥</div><div class="tree-heart h9">♥</div>
      <div class="tree-heart h10">♥</div><div class="tree-heart h11">♥</div><div class="tree-heart h12">♥</div>
    </div>`;
  }

  function screenHtml() {
    if (state.screen === "home") return homeHtml();
    if (state.screen === "intro") return introHtml();
    if (state.screen === "turn") return turnHtml();
    if (state.screen === "question") return questionHtml(questionMap.get(state.currentQuestion));
    if (state.screen === "retry") return retryHtml();
    if (state.screen === "success") return successHtml(questionMap.get(state.currentQuestion));
    if (state.screen === "chapterIntro") return chapterIntroHtml();
    if (state.screen === "chapterComplete") return chapterCompleteHtml();
    if (state.screen === "collectiveIntro") return collectiveIntroHtml();
    if (state.screen === "finalCelebration") return finalCelebrationHtml();
    if (state.screen === "review") return reviewHtml();
    if (state.screen === "recitation") return recitationHtml();
    return homeHtml();
  }

  function homeHtml() {
    return `<section class="home">
      <div class="home-art">
        ${characterHtml("wave")}
        ${treeHtml("hero-tree", 4)}
        <div class="sun"></div><div class="cloud c1"></div><div class="cloud c2"></div>
      </div>
      <div class="home-copy">
        <p class="kicker">《弟子规》生活礼仪小活动</p>
        <h1>有礼貌！<br>我该怎么做？</h1>
        <p class="subtitle">和小乐一起成为礼仪小侦探！</p>
        <div class="mode-grid">
          <button class="mode-button" data-action="start" data-mode="junior"><span>🎈 小初班</span><small>4-9岁</small></button>
          <button class="mode-button" data-action="start" data-mode="senior"><span>🧠 小高班</span><small>10-12岁</small></button>
        </div>
        <div class="home-tools">
          <button class="icon-button" data-action="sound">${soundIcon()} 声音</button>
          <button class="icon-button" data-action="fullscreen">⛶ 全屏</button>
        </div>
      </div>
    </section>`;
  }

  function introHtml() {
    return `<section class="panel story">
      ${characterHtml("talk")}
      <div>
        <h2>大家好，我是小乐！</h2>
        <p>我每天都会遇见长辈和老师……</p>
        <p>可是，我有时不知道该怎样称呼，也不知道有本领时该怎样表现。</p>
        <div class="mission"><strong>今天，请大家成为礼仪小侦探！</strong><br>❤️ 收集12颗礼仪之心<br>🌳 一起让礼仪之树成长</div>
      </div>
      <div class="steps">
        <article><b>👀 认一认</b><span>他是尊长吗？<br>我和他是什么关系？</span></article>
        <article><b>🙋 称一称</b><span>我应该怎样<br>有礼貌地称呼？</span></article>
        <article><b>🌱 谦一谦</b><span>我会做，也不炫耀；<br>有能力，用来帮助。</span></article>
      </div>
      <button class="primary" data-action="next">▶ 开始挑战</button>
    </section>`;
  }

  function turnHtml() {
    return `<section class="panel center-card">
      <div class="big-icon">🔍</div>
      <h2>下一位礼仪小侦探，请上台！</h2>
      <p>准备好以后，再让情境出现。</p>
      <button class="primary" data-action="showQuestion">我准备好了！</button>
    </section>`;
  }

  function collectiveIntroHtml() {
    return `<section class="panel collective">
      ${treeHtml("feature-tree")}
      <div>
        <h2>🤝 全班挑战</h2>
        <p>小乐说：“最后3颗礼仪之心……需要大家一起完成！”</p>
        <ol>
          <li>情境出现</li><li>全班一起讨论</li><li>最终队长负责点击</li><li>全班共同获得最后3颗心</li>
        </ol>
        <button class="primary" data-action="startCollective">开始全班任务</button>
      </div>
    </section>`;
  }

  function questionHtml(q) {
    return `<section class="question-layout">
      <div class="scene-card">
        <h2>${q.title}</h2>
        ${sceneHtml(q)}
      </div>
      <div class="qa-card">
        <div class="dialogue">${q.dialogue.map(line => `<p>${line}</p>`).join("")}</div>
        <h3>${q.question}</h3>
        <div class="thinking">${state.answersEnabled || q.id >= 10 ? "可以作答了！" : "🤫 小侦探思考时间……"}</div>
        <div class="answers">
          ${q.options.map(opt => `<button class="answer" data-action="answer" data-answer="${opt.id}" ${state.answersEnabled || q.id >= 10 ? "" : "disabled"}>${opt.text}</button>`).join("")}
        </div>
        ${isSenior() && q.seniorPrompt ? `<div class="senior-prompt">${q.seniorPrompt}</div>` : ""}
      </div>
    </section>`;
  }

  function retryHtml() {
    return `<section class="panel center-card">
      <div class="big-icon">🤔</div>
      <h2>再想一想……</h2>
      <p>要不要请大家帮忙？</p>
      <div class="choice-row">
        <button class="secondary" data-action="retry">🔄 我再想想</button>
        <button class="primary" data-action="help">🤝 请大家帮忙</button>
      </div>
      ${state.helpActive ? `<div class="help-banner">🤝 启动全班智慧！讨论以后，请台上的小侦探做最后点击。</div>` : ""}
    </section>`;
  }

  function successHtml(q) {
    return `<section class="panel success">
      <div class="success-main">
        <h2>${q.danger ? "🚨 做得好！" : "⭐ 做得好！"}</h2>
        ${q.feedback.map(t => `<p>${t}</p>`).join("")}
        ${q.resolution ? `<div class="resolution">${q.resolution.map(t => `<p>${t}</p>`).join("")}</div>` : ""}
        ${q.learningText ? `<div class="classic">${q.learningText}</div>` : ""}
        ${isSenior() && q.seniorPrompt ? `<div class="senior-prompt">${q.seniorPrompt}</div>` : ""}
        <button class="primary" data-action="afterSuccess">${q.id === 12 ? "完成挑战" : "收下礼仪之心"}</button>
      </div>
      <div class="heart-fly">❤️</div>
      ${treeHtml("feature-tree")}
    </section>`;
  }

  function chapterIntroHtml() {
    const chapter = window.CHAPTERS[questionMap.get(state.currentQuestion).chapter];
    return `<section class="panel center-card">
      <h2>${questionMap.get(state.currentQuestion).chapterTitle}</h2>
      ${chapter.intro.map((line, i) => `<p class="${i === 2 ? "callout" : ""}">${line}</p>`).join("")}
      <button class="primary" data-action="next">继续</button>
    </section>`;
  }

  function chapterCompleteHtml() {
    const prevChapter = state.currentQuestion <= 3 ? 1 : state.currentQuestion <= 6 ? 2 : 3;
    const c = window.CHAPTERS[prevChapter];
    return `<section class="panel chapter-done">
      ${treeHtml("feature-tree")}
      <div>
        <h2>${c.completeTitle}</h2>
        <h3>${c.summaryTitle}</h3>
        <div class="summary-points">${c.points.map(p => `<span>${p}</span>`).join("")}</div>
        ${(c.after || []).map(p => `<p class="lesson">${p}</p>`).join("")}
        <button class="primary" data-action="nextChapter">${prevChapter === 3 ? "进入全班任务" : (c.button || "进入下一章")}</button>
      </div>
    </section>`;
  }

  function finalCelebrationHtml() {
    return `<section class="finale">
      <div class="darken"></div>
      <div class="confetti"></div>
      <div class="final-hearts">${heartHtml()}</div>
      ${treeHtml("final-tree")}
      <h2>🏆 挑战成功！</h2>
      <p>我们一起让礼仪之树成长了！</p>
      <p class="spark">✨ 我们都是礼仪小侦探！✨</p>
      <button class="primary" data-action="review">查看总结</button>
    </section>`;
  }

  function reviewHtml() {
    return `<section class="panel review">
      <h2>礼仪小侦探三步法</h2>
      <div class="review-flow">
        <article><b>👀 认一认</b><span>他是尊长吗？<br>我和他是什么关系？</span></article>
        <span class="arrow">↓</span>
        <article><b>🙋 称一称</b><span>我应该怎样<br>有礼貌地称呼？</span></article>
        <span class="arrow">↓</span>
        <article><b>🌱 谦一谦</b><span>会做不嘲笑，<br>懂得不炫耀。</span></article>
      </div>
      <div class="final-rules">
        <p>见到尊长，有礼貌地称呼。</p>
        <p>知道名字，也不直接呼名。</p>
        <p>有了本领，用来帮助，不炫耀。</p>
      </div>
      <button class="primary" data-action="recitation">一起朗读</button>
    </section>`;
  }

  function recitationHtml() {
    return `<section class="panel recitation">
      <h2>称尊长，勿呼名；</h2>
      <h2>对尊长，勿见能。</h2>
      <p>今天，你学会怎样称呼尊长，<br>也学会有本领时保持谦虚了吗？</p>
      <div class="choice-row">
        <button class="primary" data-action="replay">🔄 再玩一次</button>
        <button class="secondary" data-action="home">🏠 回到首页</button>
      </div>
    </section>`;
  }

  function characterHtml(mood) {
    return `<div class="xiaole ${mood}" aria-label="小乐">
      <div class="hair"></div><div class="face"><span class="eye e1"></span><span class="eye e2"></span><span class="smile"></span></div>
      <div class="body"></div><div class="arm a1"></div><div class="arm a2"></div><div class="name-tag">小乐</div>
    </div>`;
  }

  function sceneHtml(q) {
    const scenes = {
      1:{caption:"爷爷介绍老朋友", place:"客厅相聚", adults:[["grandpa","爷爷"],["lin-grandpa","林爷爷"]], props:["tea"]},
      2:{caption:"妈妈介绍朋友", place:"家中会客", adults:[["mother-role","妈妈"],["aunt-wang","王阿姨"]], props:["flowers"]},
      3:{caption:"不知道怎样称呼", place:"亲友聚会", adults:[["father-role","爸爸"],["elder-guest","长辈"]], props:["question"]},
      4:{caption:"陈叔叔来访", place:"家门口", adults:[["uncle-chen","陈叔叔"]], props:["door","gift"]},
      5:{caption:"见到老师", place:"学校教室", adults:[["teacher-role","老师"]], props:["blackboard","books"]},
      6:{caption:"爸爸遇见老朋友", place:"社区公园", adults:[["father-role","爸爸"],["adult-friend","建国叔叔"]], props:["trees","bench"]},
      7:{caption:"爷爷需要手机帮助", place:"客厅沙发", adults:[["grandpa","爷爷"]], props:["sofa2","smartphone"]},
      8:{caption:"奶奶不小心算错", place:"家中餐桌", adults:[["grandma","奶奶"]], props:["table","calculation"]},
      9:{caption:"长辈称赞小乐", place:"作品展示区", adults:[["elder-guest","长辈"]], props:["trophy","display"]},
      10:{caption:"第一次见李老师", place:"学校走廊", adults:[["teacher-li","李老师"]], props:["school","notice"]},
      11:{caption:"外婆学习用平板", place:"温馨客厅", adults:[["maternal-grandma","外婆"]], props:["sofa2","tablet"]},
      12:{caption:"拜访张老师", place:"老师家中", adults:[["mother-role","妈妈"],["teacher-zhang","张老师"]], props:["smartphone","tea"]}
    };
    const s = scenes[q.id] || scenes[1];
    const adults = s.adults.map((a,i)=>`<div class="story-person ${a[0]} person-${i+1}">
      <div class="person-hair"></div><div class="person-face"><i class="peye peye-l"></i><i class="peye peye-r"></i><i class="pmouth"></i></div>
      <div class="person-body"></div><div class="person-arm arm-l"></div><div class="person-arm arm-r"></div>
      <div class="role-tag">${a[1]}</div></div>`).join("");
    const props = s.props.map(p=>`<div class="story-prop prop-${p}"></div>`).join("");
    return `<div class="scene story-scene scene-q${q.id}">
      <div class="story-wall"></div><div class="story-floor"></div>
      <div class="scene-caption">${s.caption}</div><div class="place-tag">📍 ${s.place}</div>
      <div class="story-window"><i></i></div>
      ${characterHtml("scene-kid")}
      ${adults}${props}
    </div>`;
  }

  function hostPanel() {
    return `<aside class="host-panel">
      <h2>主持人控制</h2>
      <label>跳到题目
        <select data-action="jumpSelect">${window.QUESTIONS.map(q => `<option value="${q.id}" ${q.id === state.currentQuestion ? "selected" : ""}>第${q.id}题：${q.title}</option>`).join("")}</select>
      </label>
      <button data-action="jump">跳转</button>
      <button data-action="restartQuestion">重启当前题</button>
      <button data-action="sound">${soundIcon()} 切换声音</button>
      <button data-action="home">回到首页</button>
      <button data-action="reset">重置全游戏</button>
    </aside>`;
  }

  function soundIcon() { return window.GameAudio.isEnabled() ? "🔊" : "🔇"; }

  function bindCommon() {
    app.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => play("click")));
    app.querySelectorAll("[data-action='toggleHost']").forEach(btn => btn.addEventListener("click", () => { state.facilitatorOpen = !state.facilitatorOpen; render(); }));
    app.querySelectorAll("[data-action='sound']").forEach(btn => btn.addEventListener("click", () => { window.GameAudio.toggle(); render(); }));
    app.querySelectorAll("[data-action='fullscreen']").forEach(btn => btn.addEventListener("click", toggleFullscreen));
    app.querySelectorAll("[data-action='home']").forEach(btn => btn.addEventListener("click", goHome));
    app.querySelectorAll("[data-action='reset']").forEach(btn => btn.addEventListener("click", resetGame));
    app.querySelectorAll("[data-action='restartQuestion']").forEach(btn => btn.addEventListener("click", restartQuestion));
    app.querySelectorAll("[data-action='jump']").forEach(btn => btn.addEventListener("click", jumpFromHost));
  }

  function bindScreen() {
    app.querySelectorAll("[data-action='start']").forEach(btn => btn.addEventListener("click", () => startMode(btn.dataset.mode)));
    app.querySelectorAll("[data-action='next']").forEach(btn => btn.addEventListener("click", nextFromIntro));
    app.querySelectorAll("[data-action='showQuestion']").forEach(btn => btn.addEventListener("click", showQuestion));
    app.querySelectorAll("[data-action='answer']").forEach(btn => btn.addEventListener("click", () => answer(btn.dataset.answer)));
    app.querySelectorAll("[data-action='retry']").forEach(btn => btn.addEventListener("click", () => { state.helpActive = false; showQuestion(); }));
    app.querySelectorAll("[data-action='help']").forEach(btn => btn.addEventListener("click", () => { state.helpActive = true; render(); }));
    app.querySelectorAll("[data-action='afterSuccess']").forEach(btn => btn.addEventListener("click", afterSuccess));
    app.querySelectorAll("[data-action='nextChapter']").forEach(btn => btn.addEventListener("click", nextChapter));
    app.querySelectorAll("[data-action='startCollective']").forEach(btn => btn.addEventListener("click", () => { state.currentQuestion = 10; showQuestion(); }));
    app.querySelectorAll("[data-action='review']").forEach(btn => btn.addEventListener("click", () => { state.screen = "review"; render(); }));
    app.querySelectorAll("[data-action='recitation']").forEach(btn => btn.addEventListener("click", () => { state.screen = "recitation"; render(); }));
    app.querySelectorAll("[data-action='replay']").forEach(btn => btn.addEventListener("click", () => { const mode = state.mode; resetGame(); startMode(mode); }));
    if (state.screen === "question" && state.currentQuestion <= 9 && !state.answersEnabled) {
      thinkingTimer = setTimeout(() => { state.answersEnabled = true; render(); }, 3000);
    }
    if (state.screen === "finalCelebration") play("final");
  }

  function startMode(mode) {
    state.mode = mode;
    state.screen = "intro";
    state.currentQuestion = 1;
    state.hearts = 0;
    state.awarded = new Set();
    state.completed = false;
    state.facilitatorOpen = false;
    render();
  }

  function nextFromIntro() {
    if (state.screen === "intro") {
      state.screen = "turn";
    } else if (state.screen === "chapterIntro") {
      state.screen = state.currentQuestion <= 9 ? "turn" : "question";
    }
    render();
  }

  function showQuestion() {
    state.screen = "question";
    state.completed = state.awarded.has(state.currentQuestion);
    state.answersEnabled = state.currentQuestion >= 10;
    state.helpActive = false;
    render();
  }

  function answer(id) {
    const q = questionMap.get(state.currentQuestion);
    if (!state.answersEnabled && q.id <= 9) return;
    if (id === q.correctAnswer) {
      completeQuestion(q);
    } else {
      play("retry");
      state.screen = "retry";
      render();
    }
  }

  function completeQuestion(q) {
    if (!state.awarded.has(q.id)) {
      state.awarded.add(q.id);
      state.hearts = Math.min(12, state.awarded.size);
      play(q.danger ? "warning" : "correct");
      setTimeout(() => play("heart"), 180);
      if ([3, 6, 9, 12].includes(state.hearts)) setTimeout(() => play("grow"), 360);
    }
    state.completed = true;
    state.screen = "success";
    state.answersEnabled = false;
    render();
  }

  function afterSuccess() {
    const id = state.currentQuestion;
    if (id === 12) {
      state.screen = "finalCelebration";
    } else if ([3, 6, 9].includes(id)) {
      state.screen = "chapterComplete";
    } else {
      state.currentQuestion += 1;
      if (state.currentQuestion === 4 || state.currentQuestion === 7) state.screen = "chapterIntro";
      else state.screen = state.currentQuestion <= 9 ? "turn" : "question";
    }
    render();
  }

  function nextChapter() {
    if (state.currentQuestion === 3) state.currentQuestion = 4;
    else if (state.currentQuestion === 6) state.currentQuestion = 7;
    else if (state.currentQuestion === 9) { state.currentQuestion = 10; state.screen = "collectiveIntro"; render(); return; }
    state.screen = "chapterIntro";
    render();
  }

  function restartQuestion() {
    state.screen = state.currentQuestion <= 9 ? "turn" : "question";
    state.answersEnabled = state.currentQuestion >= 10;
    state.helpActive = false;
    state.facilitatorOpen = false;
    render();
  }

  function jumpFromHost() {
    const select = $("[data-action='jumpSelect']");
    if (!select) return;
    state.currentQuestion = Number(select.value);
    state.screen = state.currentQuestion <= 9 ? "turn" : "question";
    state.answersEnabled = state.currentQuestion >= 10;
    state.facilitatorOpen = false;
    render();
  }

  function resetGame() {
    state.currentQuestion = 1;
    state.hearts = 0;
    state.awarded = new Set();
    state.completed = false;
    state.answersEnabled = false;
    state.helpActive = false;
    state.screen = "home";
    state.facilitatorOpen = false;
    render();
  }

  function goHome() {
    state.screen = "home";
    state.facilitatorOpen = false;
    render();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  function moveQuestion(delta) {
    const next = Math.max(1, Math.min(12, state.currentQuestion + delta));
    if (next !== state.currentQuestion) {
      state.currentQuestion = next;
      state.screen = next <= 9 ? "turn" : "question";
      state.answersEnabled = next >= 10;
      render();
    }
  }

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "f") toggleFullscreen();
    if (event.key.toLowerCase() === "m") { window.GameAudio.toggle(); render(); }
    if (event.key.toLowerCase() === "r") restartQuestion();
    if (event.key === "ArrowLeft") moveQuestion(-1);
    if (event.key === "ArrowRight") {
      if (state.screen === "home") return;
      if (state.screen === "success") afterSuccess();
      else moveQuestion(1);
    }
  });

  render();
})();
