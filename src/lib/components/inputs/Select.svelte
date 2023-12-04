<script lang="ts">
    type Item = {
        label: string;
        value: number;
    };

    let {
        items,
        index = 0,
        onchange,
        reset = false,
    } = $props<{
        items: Item[];
        index?: number;
        onchange?: (item: Item) => void;
        reset?: boolean;
    }>();

    let selected_item = $state(items[index]);

    function on_change(item: Item) {
        selected_item = item;
        onchange?.(item);
        open = false;
        window.removeEventListener("click", click_outside, { capture: true });
        if (reset) {
            selected_item = items[0];
        }
    }

    let open = $state(false);

    function toggle_open() {
        if (open) {
            open = false;
            window.removeEventListener("click", click_outside, {
                capture: true,
            });
            return;
        }

        open = true;
        window.addEventListener("click", click_outside, { capture: true });
    }

    let list_el: HTMLElement;
    let button_el: HTMLElement;

    function click_outside(e: MouseEvent) {
        let path = e.composedPath();
        if (!path.some((el) => el == list_el || el == button_el)) {
            window.removeEventListener("click", click_outside, {
                capture: true,
            });
            open = false;
        }
    }
</script>

<div class="select">
    <button onclick={toggle_open} bind:this={button_el}>
        {selected_item.label}
    </button>

    {#if open}
        <div class="list" bind:this={list_el}>
            {#each items as item, i}
                <button
                    class:selected={item == selected_item}
                    class="item"
                    onclick={() => on_change(item)}
                >
                    {item.label}
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .list {
        margin-top: var(--gap-1);
        position: absolute;

        background-color: var(--color-white);
        border: 1px var(--color-black) solid;
        border-radius: 1px;

        display: flex;
        flex-direction: column;
        gap: var(--gap-0);

        padding: var(--gap-0);

        z-index: 10;
    }

    .item {
        border: none;
        text-align: start;
        border-radius: 1px;

        display: grid;
        place-content: center;
    }

    .item.selected,
    .item:hover {
        background-color: var(--color-gray-lightest);
    }

    button {
        font-family: system-ui;
    }

    .select > button {
        padding-inline: var(--gap-2);
    }
</style>
