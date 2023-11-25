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
            ...e.currentTarget.querySelectorAll(".module[draggable]"),
        ] as HTMLElement[];

        let closest = get_closest_element(children, e.clientY);

        if (closest[0] != null) {
            let dnd_id = closest[0].getAttribute("data-dnd-id");
            if (dnd_id) {
                if (+dnd_id == drag_state.dragged_module?.id) return;
            }
        }

        let targetIndex = closest[2];

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
</script>

<div
    class="chain"
    ondragover={drag_over.bind(null, chain)}
    ondragstart={() => (drag_state.dragged_chain = chain)}
    ondragend={() => (drag_state.dragged_chain = null)}
>
    <header>header</header>
    <div class="modules">
        <slot />
    </div>
</div>

<style>
    .chain {
        display: flex;
        flex-direction: column;
    }

    header {
        padding: 2px;
        background-color: var(--color-gray-light);
        border-radius: 2px;
    }

    .modules {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 4px;
        border: 1px var(--color-gray-light) solid;
        flex-grow: 1;
        border-radius: 2px;
    }
</style>
