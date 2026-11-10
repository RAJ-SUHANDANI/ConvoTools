"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { ShimmeringText } from "@animate-ui/react/primitives/texts/shimmering";
import { CountingNumber } from "@animate-ui/react/primitives/texts/counting-number";
import { FileCheck } from "@/components/animate-ui/icons/file-check";

const SESSION_KEY = "convotools-intro-seen-v2";

/**
 * Visual entrance, not a network dependency. The complete page remains
 * server-rendered and indexable beneath the transition. A maximum wait and
 * reduced-motion escape prevent the intro from trapping the application.
 */
export default function IntroGate({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(true);
  const [percent, setPercent] = useState(0);
  const reduce = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.dataset.ctHydrated = "true";
    return () => { delete document.documentElement.dataset.ctHydrated; };
  }, []);

  useEffect(() => {
    let alive = true;
    if (pathname !== "/") {
      queueMicrotask(() => { if (alive) setShow(false); });
      return () => { alive = false; };
    }
    const seen = (() => {
      try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
    })();
    const crawler = /bot|crawl|spider|slurp|lighthouse|pagespeed/i.test(navigator.userAgent);
    if (seen || reduce || crawler) {
      queueMicrotask(() => { if (alive) setShow(false); });
      return () => { alive = false; };
    }

    let finishTimer: ReturnType<typeof setTimeout> | undefined;
    const started = performance.now();
    const complete = () => {
      if (!alive) return;
      const elapsed = performance.now() - started;
      finishTimer = setTimeout(() => {
        if (!alive) return;
        setPercent(100);
        setShow(false);
        try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* storage disabled */ }
      }, Math.max(0, 1550 - elapsed));
    };
    let finished = false;
    const once = () => { if (finished) return; finished = true; complete(); };
    const fallback = setTimeout(once, 3400);
    const ready = document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));
    Promise.allSettled([ready, document.fonts?.ready ?? Promise.resolve()]).then(once);
    const progressTimer = setInterval(() => {
      if (!alive) return;
      setPercent((value) => Math.min(value + 8, 94));
    }, 125);

    return () => {
      alive = false;
      clearTimeout(fallback);
      clearTimeout(finishTimer);
      clearInterval(progressTimer);
    };
  }, [reduce, pathname]);

  return (
    <>
      {children}
      <AnimatePresence>
        {show && pathname === "/" && (
          <motion.div
            className="ct-intro"
            key="ct-intro"
            role="status"
            aria-live="polite"
            aria-label="Preparing ConvoTools workspace"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="ct-intro-grid" aria-hidden="true" />
            <div className="ct-intro-top"><span className="ct-intro-mark">CT<span className="ct-intro-spark">✳</span></span><span>YOUR FILE WORKSPACE</span></div>
            <div className="ct-intro-center">
              <div className="ct-intro-scene" aria-hidden="true">
                <div className="ct-intro-3d">
                  <div className="ct-intro-sheet ct-intro-sheet-a"><span>PDF</span><i /><i /><i /></div>
                  <div className="ct-intro-sheet ct-intro-sheet-b"><span>DOC</span><i /><i /><i /></div>
                  <div className="ct-intro-sheet ct-intro-sheet-c"><FileCheck size={48} /><span>READY</span></div>
                </div>
                <div className="ct-intro-shadow" />
              </div>
              <span className="ct-intro-eyebrow">FROM ONE FORMAT TO ANOTHER</span>
              <h2>Good work in motion<span>.</span></h2>
              <ShimmeringText className="ct-intro-subline" text="Getting your tools ready" color="#8ba89b" shimmeringColor="#f7e8b9" duration={1.6} />
            </div>
            <div className="ct-intro-footer">
              <div className="ct-intro-meter"><div className="ct-intro-meter-track"><motion.i animate={{ scaleX: percent / 100 }} transition={{ duration: 0.26 }} /></div><span><CountingNumber number={percent} />%</span></div>
              <span>LOCAL-FIRST TOOLS · NO ACCOUNT REQUIRED</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
