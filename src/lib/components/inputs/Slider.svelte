<script lang="ts">
    import bucket from "$lib/bucket.svelte";

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

    class T {
        value = $state(value);
    }

    let x = new T();
    let init_v = typeof value == "number" ? value : 0;
    let buck = bucket(init_v, 100);
    // let buck = $state(value)
    // let buck = new T();

    let str_mode = $derived(typeof value == "string");

    $effect(() => {
        buck.value = value;
        if (str_mode) {
            x.value = value;
        }
    });

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
        buck.value = c_x;
        onchange(c_x);
        e.currentTarget.addEventListener("pointermove", pointer_move);
        e.currentTarget.addEventListener("pointerup", pointer_up);
        let tresholded = false;

        function pointer_move(e: PEvent) {
            mouse.x = (e.clientX - box.x) / box.width;
            mouse.y = (e.clientY - box.y) / box.height;
            c_x = clamp01(mouse.x);
            buck.value = c_x;
            if (c_x < 1 && c_x > 0) {
                tresholded = false;
            }
            if (tresholded) return;
            onchange(c_x);
            if (c_x >= 1 || c_x <= 0) {
                tresholded = true;
            }
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
        <rect width="64" height="16" fill="var(--color-gray-light)" rx="1"
        ></rect>
        {#if !str_mode}
            {#if type == "bar"}
                <rect
                    class="bar"
                    style:--x={buck.value}
                    width={buck.value * 64}
                    height="16"
                ></rect>
            {/if}
        {/if}
        <g transform="translate(32 12)">
            <text dy="0" font-size="10" text-anchor="middle">
                {#if str_mode}
                    {x.value}
                {:else}
                    {buck.value.toFixed(4)}
                {/if}
            </text>
        </g>
    </g>
</svg>

<style>
    rect.bar {
        fill: color-mix(
            in oklab,
            rgb(241, 221, 88),
            #66df5b calc(var(--x, 0) * 100%)
        );
    }

    svg {
        cursor: ew-resize;
    }

    svg * {
        user-select: none;
        -webkit-user-select: none;
    }
</style>
