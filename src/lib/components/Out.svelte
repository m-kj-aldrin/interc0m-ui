<script lang="ts">
    import Icon from "./icons/Icon.svelte";
    import type { OutState } from "$lib/network-state.svelte";

    let { out } = $props<{ out: OutState }>();

    let new_pid = $state(0);
    let new_ch = $state(0);

    type ChangeEvent = Event & {
        currentTarget: EventTarget & HTMLElement;
        target: HTMLInputElement;
    };

    function update_out(e: ChangeEvent) {
        let type = e.target.name;
        let value = +e.target.value;

        out.update({
            [type]: value,
        });
    }
</script>

<div class="out padding stack">
    <div class="destination stack" onchange={update_out}>
        <label>
            pid:<input
                name="pid"
                type="text"
                value={out.destination.pid}
                maxlength="2"
            />
        </label>
        <label>
            ch:<input
                name="channel"
                type="text"
                value={out.destination.channel}
                maxlength="2"
            />
        </label>
    </div>
    <button class="remove-out" onclick={() => out.remove()}>
        <Icon type="cross"></Icon>
    </button>
</div>

<style>
    .out {
        --direction: row;
        background-color: var(--color-gray-lightest);
    }

    .remove-out {
        display: grid;
        padding: var(--gap-0);
        color: var(--color-error);
    }

    .padding {
        padding: var(--gap-1);
    }

    .destination {
        --direction: row;
    }

    input {
        max-width: 3ch;
        text-align: center;
    }
</style>
