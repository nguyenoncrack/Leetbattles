import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "codeclash_bgm_enabled";
const MUSIC_SRC = "/background-music.mp3";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  }, [enabled]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.18;

    let unlocked = false;

    const tryPlay = async () => {
      if (!enabled || unlocked) return;
      try {
        await audio.play();
        unlocked = true;
      } catch {
        // Browser may block autoplay until user interacts. We'll retry
        // on the first click/keydown/touch.
      }
    };

    const unlockFromGesture = () => {
      void tryPlay();
    };

    void tryPlay();
    window.addEventListener("pointerdown", unlockFromGesture, { passive: true });
    window.addEventListener("keydown", unlockFromGesture);
    window.addEventListener("touchstart", unlockFromGesture, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", unlockFromGesture);
      window.removeEventListener("keydown", unlockFromGesture);
      window.removeEventListener("touchstart", unlockFromGesture);
    };
  }, [enabled]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (enabled) {
      void audio.play().catch(() => {});
      return;
    }
    audio.pause();
  }, [enabled]);

  return (
    <>
      <audio
        ref={audioRef}
        src={MUSIC_SRC}
        loop
        preload="auto"
        onCanPlay={() => setReady(true)}
      />
      <button
        type="button"
        onClick={() => setEnabled((v) => !v)}
        className="fixed bottom-4 right-4 z-50 rounded-xl border border-ink-600 bg-ink-900/80 px-3 py-2 text-xs font-semibold text-slate-200 backdrop-blur hover:bg-ink-800"
      >
        Music: {enabled ? "On" : "Off"}
        {!ready ? " (loading...)" : ""}
      </button>
    </>
  );
}
