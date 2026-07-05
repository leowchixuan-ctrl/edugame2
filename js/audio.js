const MASTER_VOLUME = 3.0;

window.GameAudio = (() => {
  let enabled = true;
  let ctx = null;

  function ensureContext() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
  }

  function tone(frequency, start, duration, type = "sine", volume = 0.06) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
  Math.min(volume * MASTER_VOLUME, 0.18),
  start + 0.015
);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      start + duration
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  function playClick(now) {
  tone(520, now, 0.10, "triangle", 0.06);
  tone(660, now + 0.06, 0.10, "sine", 0.05);
}

  function playCorrect(now) {
    tone(523, now, 0.14, "triangle", 0.065);
    tone(659, now + 0.11, 0.16, "triangle", 0.07);
    tone(784, now + 0.23, 0.22, "triangle", 0.075);
  }

  function playRetry(now) {
    tone(392, now, 0.18, "sine", 0.05);
    tone(330, now + 0.14, 0.22, "sine", 0.045);
  }

  function playHeart(now) {
    tone(880, now, 0.1, "sine", 0.055);
    tone(1175, now + 0.08, 0.18, "triangle", 0.065);
  }

  function playGrow(now) {
    tone(392, now, 0.2, "sine", 0.055);
    tone(523, now + 0.14, 0.22, "triangle", 0.06);
    tone(659, now + 0.28, 0.25, "triangle", 0.065);
    tone(784, now + 0.43, 0.32, "sine", 0.07);
  }

  function playWarning(now) {
    tone(330, now, 0.18, "sine", 0.055);
    tone(294, now + 0.15, 0.2, "sine", 0.05);
    tone(262, now + 0.3, 0.25, "sine", 0.045);
  }

  function playFinal(now) {
    tone(523, now, 0.18, "triangle", 0.065);
    tone(659, now + 0.14, 0.18, "triangle", 0.07);
    tone(784, now + 0.28, 0.2, "triangle", 0.075);
    tone(1047, now + 0.44, 0.3, "triangle", 0.08);

    tone(659, now + 0.78, 0.16, "sine", 0.06);
    tone(784, now + 0.9, 0.16, "sine", 0.065);
    tone(1047, now + 1.02, 0.42, "triangle", 0.085);
  }

  async function play(name) {
  if (!enabled) return;

  try {
    ensureContext();

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const now = ctx.currentTime + 0.01;

    switch (name) {
      case "click":
        playClick(now);
        break;

      case "correct":
        playCorrect(now);
        break;

      case "retry":
        playRetry(now);
        break;

      case "heart":
        playHeart(now);
        break;

      case "grow":
        playGrow(now);
        break;

      case "warning":
        playWarning(now);
        break;

      case "final":
        playFinal(now);
        break;

      default:
        playClick(now);
    }
  } catch (error) {
    console.warn("Audio playback failed:", error);
  }
}

  return {
    play,

    isEnabled: () => enabled,

    setEnabled(value) {
      enabled = Boolean(value);
    },

    toggle() {
      enabled = !enabled;

      if (enabled) {
        play("click");
      }

      return enabled;
    }
  };
})();
