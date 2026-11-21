import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to the section named in the URL hash (/#about) after every navigation.
 * The header's section links point at the home page, so they also work from other
 * pages: the router changes page first, then this finds the section and scrolls to it.
 */
export default function ScrollToHash() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    let timer = 0;
    // The section may not be rendered yet right after a page change, so look again for a moment.
    const go = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else if (tries++ < 30) timer = window.setTimeout(go, 50);
    };
    go();
    return () => window.clearTimeout(timer);
  }, [pathname, hash, key]);

  return null;
}
