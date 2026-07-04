window.GameAudio = (() => {
  let enabled = true;
  let ctx = null;

  const tones = {
    click: [420, 0.04, "sine", 0.05],
    correct: [660, 0.12, "triangle", 0.08],
    retry: [260, 0.12, "sine", 0.045],
    heart: [760, 0.12, "triangle", 0.08],
    grow: [520, 0.2, "sine", 0.08],
    warning: [360, 0.16, "sine", 0.06],
    final: [880, 0.26, "triangle", 0.09]
  };

  function ensureContext() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
  }

  function play(name) {
    if (!enabled) return;
    const tone = tones[name] || tones.click;
    try {
      ensureContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = tone[0];
      osc.type = tone[2];
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(tone[3], ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + tone[1]);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + tone[1] + 0.02);
      if (name === "final") {
        setTimeout(() => play("heart"), 130);
        setTimeout(() => play("correct"), 260);
      }
    } catch (error) {
      /* Missing or blocked audio should never interrupt the game. */
    }
  }

  return {
    play,
    isEnabled: () => enabled,
    setEnabled(value) { enabled = Boolean(value); },
    toggle() { enabled = !enabled; play("click"); return enabled; }
  };
})();
