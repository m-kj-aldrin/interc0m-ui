<script lang="ts">
    import type {
        ChainState,
        ModuleState,
        NetworkState,
    } from "$lib/network-state.svelte";
    import { getContext } from "svelte";
    import type { ChangeEventHandler } from "svelte/elements";

    let { module, chain } = $props<{
        module: ModuleState;
        chain: ChainState;
    }>();

    const network = getContext("network") as NetworkState;

    function outs_filter(target_id: number) {
        return network.outs.filter((out) => out.target_id == target_id);
    }

    function remove_out(id: number) {
        return function () {
            network.remove_out(id);
        };
    }

    function update_out(id: number, target: "pid" | "channel") {
        const fn: ChangeEventHandler<HTMLInputElement> = (e) => {
            let value = +e.currentTarget.value;

            network.update_out(id, {
                gate: {
                    [target]: value,
                },
            });
        };

        return fn;
    }

    function add_out() {
        network.add_out(
            { gate: { pid: 0, channel: 0 } },
            {
                chain_index: chain.index,
                module_index: module.index,
            }
        );
    }
</script>

<div class="outs">
    {@const outs = outs_filter(module.id)}

    <div class="outs-symbols">
        <button class="show-list" onclick={() => module.toggle_show_outs()}
            >&#9881;</button
        >
        <div>
            {#each outs.slice(0, 5) as out (out.id)}
                <div class="out-symbol">&DownArrow;</div>
            {/each}
            {#if outs.length > 5}
                <div>&hellip;</div>
            {/if}
        </div>
    </div>

    {#if module.show_outs_list}
        <div class="outs-list">
            <button onclick={add_out}>add</button>
            {#each outs as out (out.id)}
                <div class="out-li">
                    <div class="destination">
                        <label>
                            pid:
                            <input
                                type="text"
                                maxlength="2"
                                onchange={update_out(out.id, "pid")}
                                value={out.destination.gate.pid}
                            />
                        </label>
                        <label>
                            ch:
                            <input
                                type="text"
                                maxlength="2"
                                onchange={update_out(out.id, "channel")}
                                value={out.destination.gate.channel}
                            />
                        </label>
                    </div>
                    <button class="remove-out" onclick={remove_out(out.id)}
                        >&Cross;</button
                    >
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .outs-symbols,
    .outs-symbols > div,
    .outs-list,
    .out-li {
        display: flex;
        gap: 2px;
    }

    .outs-list {
        flex-direction: column;
    }

    .out-li,
    .outs-list {
        border: 1px currentColor solid;
        padding: 2px;
        border-radius: 2px;
    }

    .out-symbol {
        margin-inline-start: -0.5ch;
    }

    .outs-symbols > div {
        margin-inline-start: auto;
        align-items: center;
    }

    .outs-symbols button.show-list {
        padding: 0;
        border: none;
        font-size: 1.25em;
        /* line-height: 0.5; */
    }

    .outs-list {
        margin-top: 2px;
        position: absolute;
        background-color: white;
    }

    .out-li {
        align-items: center;
        background-color: white;
    }

    .out-li .destination input {
        max-width: 3ch;
        text-align: center;
    }

    .out-li .remove-out {
        color: red;
    }
</style>
