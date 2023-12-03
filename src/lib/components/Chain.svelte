<script lang="ts">
    import { drag_state } from "$lib/drag-state.svelte";
    import type { ChainState } from "$lib/network-state.svelte";

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

        let new_chain = drag_state.dragged_chain.parent.move_module(
            drag_state.dragged_chain.index,
            drag_state.dragged_module,
            chain,
            targetIndex
        );

        if (new_chain) {
            drag_state.dragged_chain = chain;
        }
    }

    type ChangeEvent = Event & {
        currentTarget: EventTarget & HTMLElement;
        target: HTMLInputElement;
    };

    function on_input(e: ChangeEvent) {
        let [target, type] = e.target.name.split(".");
        let value = +e.target.value;

        // console.log({ target, type, value });

        chain.input = {
            [target]: {
                [type]: value,
            },
        };
    }
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
        <div class="input stack" onchange={on_input}>
            <div class="cv stack">
                <div>cvin&nbsp;</div>
                <label>
                    pid<input
                        name="cv.pid"
                        type="text"
                        value={chain.input.cv?.pid}
                    />
                </label>
                <label>
                    ch<input
                        type="text"
                        name="cv.channel"
                        value={chain.input.cv?.channel}
                        maxlength="2"
                    />
                </label>
            </div>
            <div>|</div>
            <div class="gt stack">
                <div>gtin&nbsp;</div>
                <label>
                    pid<input
                        type="text"
                        name="gate.pid"
                        value={chain.input.gate?.pid}
                    />
                </label>
                <label>
                    ch<input
                        type="text"
                        name="gate.channel"
                        value={chain.input.gate?.channel}
                        maxlength="2"
                    />
                </label>
            </div>
        </div>
        <!-- <button onclick={() => chain.remove()}>remove</button> -->
        <!-- <div>idx: {chain.index}</div> -->
    </header>
    <div class="modules stack">
        <slot />
    </div>
</div>

<style lang="scss">
    input {
        max-width: 3ch;
        text-align: center;
        border-bottom: 1px currentColor solid;
        padding: 0;
        border-radius: 0;
    }
    .chain {
        padding: var(--gap-2);
        gap: var(--gap-2);
        box-shadow: var(--shadow-0);
        background-color: var(--color-white);

        user-select: none;
    }
    .chain.dragging .modules {
        background-color: color-mix(
            in oklab,
            var(--color-gray-light) 20%,
            var(--color-white)
        );

        outline: 1px var(--color-gray-lightest) solid;
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
        outline: 1px transparent solid;
        transition-property: background-color, outline;
        transition-duration: 200ms;
        transition-timing-function: ease;
    }
</style>
