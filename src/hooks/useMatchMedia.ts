import { useEffect } from "react";

export default function useMatchMedia(
  query: string,
  handler: (event: MediaQueryListEvent) => void
) {
  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    if (mediaQueryList.matches) {
      handler.call(null, new MediaQueryListEvent("", mediaQueryList));
    }

    mediaQueryList.addListener(handler);

    return () => {
      mediaQueryList.removeListener(handler);
    };
  }, [query, handler]);
}
