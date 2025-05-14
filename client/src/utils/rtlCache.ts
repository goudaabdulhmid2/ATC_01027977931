import createCache from "@emotion/cache";
// @ts-ignore
import rtlPlugin from "stylis-plugin-rtl";

export default function createEmotionCache(dir: "ltr" | "rtl") {
  return createCache({
    key: dir === "rtl" ? "mui-rtl" : "mui",
    stylisPlugins: dir === "rtl" ? [rtlPlugin] : [],
    prepend: true,
  });
}
