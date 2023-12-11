import type { ModuleTypeSignature } from "../network-state.svelte";
import type { Properties } from "csstype";

type ColorMap = {
    [k in keyof ModuleTypeSignature]: Properties["color"];
};

export const module_color_map: ColorMap = {
    PTH: "palegoldenrod",
    BCH: "gold",
    LFO: "paleturquoise",
    PRO: "lime",
};
