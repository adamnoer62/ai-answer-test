import { useEffect, useState } from "react";

// Lazy-loads a Lottie JSON so the ~50-200KB animation files don't bloat the
// initial bundle — each is fetched only once the component that needs it mounts.
export function useLottieData(loader) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let alive = true;
    loader().then((mod) => {
      if (alive) setData(mod.default);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return data;
}
