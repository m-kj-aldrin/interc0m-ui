<script lang="ts">
  import bucket from "$lib/bucket.svelte.ts";
  import { ModuleState } from "$lib/network-state.svelte";
  import { cubicInOut, quadInOut } from "svelte/easing";
  import { tweened } from "svelte/motion";

  let {
    value,
    min = 0,
    max = 1,
    step = 0.001,
    type = "bar",
    onchange,
  } = $props<{
    value: number;
    min?: number;
    max?: number;
    step?: number;
    type?: "bar" | "offset";
    onchange: (value: number) => void;
  }>();

  let x = bucket(0, 100);

  function clamp01(x: number) {
    return Math.min(Math.max(x, 0), 1);
  }

  type PEvent = PointerEvent & { currentTarget: SVGElement };

  function pointer_down(e: PEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);

    let box = e.currentTarget.getBoundingClientRect();

    let mouse = {
      x: (e.clientX - box.x) / box.width,
      y: (e.clientY - box.y) / box.height,
    };

    let c_x = clamp01(mouse.x);
    x.value = c_x;

    // e.currentTarget.dispatchEvent(new InputEvent("change", {}));
    onchange(c_x);

    e.currentTarget.addEventListener("pointermove", pointer_move);
    e.currentTarget.addEventListener("pointerup", pointer_up);

    function pointer_move(e: PEvent) {
      mouse.x = (e.clientX - box.x) / box.width;
      mouse.y = (e.clientY - box.y) / box.height;

      c_x = clamp01(mouse.x);
      x.value = c_x;

      //   e.currentTarget.dispatchEvent(new InputEvent("change", {}));
      onchange(c_x);
    }

    function pointer_up(e: PEvent) {
      e.currentTarget.releasePointerCapture(e.pointerId);

      e.currentTarget.removeEventListener("pointermove", pointer_move);
      e.currentTarget.removeEventListener("pointerup", pointer_up);
    }
  }
</script>

<svg class="slider" width="64" height="16" onpointerdown={pointer_down}>
  <g>
    <rect width="64" height="16" fill="var(--color-gray-light)"></rect>
    {#if type == "bar"}
      <rect class="bar" width={x.value * 64} height="16" fill="green"></rect>
    {/if}
  </g>
</svg>

<style>
  svg {
    /* outline: 1px red solid; */
  }
</style>
