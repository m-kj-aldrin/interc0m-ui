<script lang="ts">
    import { drag_state } from "$lib/drag-state.svelte";
    import type { ChainState, NetworkState } from "$lib/network-state.svelte";
    import { getContext } from "svelte";

    let network = getContext("network") as NetworkState;

    let { chain } = $props<{ chain: ChainState }>();

    function get_closest_element(children: HTMLElement[], y: number) {
        return children.reduce<[HTMLElement | null, number, number]>(
            ([closest, closestY, targetIndex], child, index) => {
                const childBox = child.getBoundingClientRect();
                const offsetY = y - childBox.top - childBox.height / 2;

                if (offsetY < 0 && offsetY > closestY) {
                    return [child, offsetY, index];
                }
                return [closest, closestY, targetIndex];
            },
            [null, Number.NEGATIVE_INFINITY, children.length]
        );
    }

    function drag_over(
        chain: ChainState,
        e: DragEvent & { currentTarget: HTMLElement }
    ) {
        e.preventDefault();

        if (!drag_state.dragged_module || !drag_state.dragged_chain) return;

        let children = [
            ...e.currentTarget.querySelectorAll(".module"),
        ] as HTMLElement[];

        let closest = get_closest_element(children, e.clientY);

        if (closest[0] != null) {
            let dnd_id = closest[0].getAttribute("data-dnd-id");
            if (dnd_id) {
                if (+dnd_id == drag_state.dragged_module?.id) return;
            }
        }

        let targetIndex = closest[2];

        if (drag_state.dragged_chain == chain) {
            if (drag_state.dragged_module.index == targetIndex - 1) return;
            targetIndex =
                drag_state.dragged_module.index < targetIndex
                    ? targetIndex - 1
                    : targetIndex;
        }

        let res = network.move_module(
            drag_state.dragged_module.id,
            targetIndex,
            drag_state.dragged_chain,
            chain
        );

        if (res) {
            drag_state.dragged_chain = chain;
        }
    }

    // $effect(() => {
    //     console.log(drag_state.dragged_chain);
    // });
</script>

<div
    class="chain stack border"
    ondragover={drag_over.bind(null, chain)}
    ondragstart={() => (drag_state.dragged_chain = chain)}
    ondragend={() => (drag_state.dragged_chain = null)}
    ondrop={(e) => {
        drag_state.dragged_chain = null;
    }}
    role="application"
    class:dragging={drag_state.dragged_chain}
>
    <header class="stack">
        <div class="input stack">
            <div class="cv stack">
                <div>cvin&nbsp;</div>
                <div class="pid">midi</div>
                <div class="ch">4</div>
            </div>
            <div>|</div>
            <div class="gt stack">
                <div>gtin&nbsp;</div>
                <div class="pid">adc</div>
                <div class="ch">7</div>
            </div>
        </div>
    </header>
    <div class="modules stack">
        <slot />
    </div>
</div>

<style lang="scss">
    .chain {
        padding: var(--gap-2);
        gap: var(--gap-2);
        box-shadow: var(--shadow-0);
        background-color: var(--color-white);
    }
    .chain.dragging .modules {
        // background-color: color-mix(
        //     in oklab,
        //     var(--color-info) 30%,
        //     var(--color-white)
        // );
        background-color: color-mix(
            in oklab,
            var(--color-gray-light) 20%,
            var(--color-white)
        );
    }

    header {
        --direction: row;

        align-self: normal;

        padding-block: var(--gap-2);
        border-radius: 1px;

        background-color: var(--color-gray-light);

        justify-content: center;

        font-size: var(--text-size-1);

        .input {
            --gap: var(--gap-2);
            --direction: row;

            > .stack {
                --direction: row;
            }
        }
    }

    .modules {
        flex-grow: 1;
        --gap: var(--gap-2);
        transition: background-color 200ms ease;
    }
</style>
