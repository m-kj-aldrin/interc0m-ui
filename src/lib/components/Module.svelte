<script lang="ts">
    import { drag_state } from "$lib/drag-state.svelte";
    import type {
        ModuleState,
        ChainState,
        NetworkState,
    } from "$lib/network-state.svelte";
    import { getContext } from "svelte";
    import Out from "./Out.svelte";

    import * as Operators from "./operators/index";

    const network = getContext("network") as NetworkState;

    let { module, chain } = $props<{
        module: ModuleState;
        chain: ChainState;
    }>();

    function remove_module(id: number, chain: ChainState) {
        return function () {
            chain.remove_module(id);
        };
    }

    function toggle_minimize_module(module: ModuleState) {
        return function () {
            module.minimized = !module.minimized;
        };
    }

    function drag_start(e: DragEvent) {
        drag_state.dragged_module = module;
        module.dragged = true;
    }

    function drag_end(e: DragEvent) {
        module.dragged = false;
        drag_state.dragged_module = null;
    }

    function outs_filter(target_id: number) {
        return network.outs.filter((out) => out.target_id == target_id);
    }

    // let t = outs_filter(module.id);
</script>

<div
    class="module"
    class:dragged={module.dragged}
    data-dnd-id={module.id}
    draggable={drag_state.drag_available}
    ondragstart={drag_start}
    ondragend={drag_end}
>
    <header>
        <div class="type">{module.type}</div>

        <div class="outs">
            {@const outs = outs_filter(module.id)}
            <div class="symbol" onclick={() => module.toggle_show_outs()}>
                <svg
                    width="8"
                    height="8"
                    viewBox="0 0 6 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M3 0.25V5.25M3 0.25H1M3 0.25H5M3 5.25L1 3.25M3 5.25L5 3.25"
                        stroke="currentColor"
                        stroke-width="0.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
                <div>{outs.length}</div>
                {#if module.show_outs_list}
                    <div class="outs-list">
                        {#each outs as out (out.id)}
                            <div class="out">
                                <div>pid {out.destination.gate.pid}</div>
                                <div>ch {out.destination.gate.channel}</div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>

        <div class="module-controlls">
            {#if module.type != "PTH"}
                <button
                    class="minimize-module"
                    onclick={toggle_minimize_module(module)}
                />
            {/if}
            <button
                class="remove-module"
                onclick={remove_module(module.id, chain)}
            />
        </div>
    </header>

    {#if !module.minimized && !(module.type == "PTH")}
        <div class="operator">
            <svelte:component this={Operators[module.type]}></svelte:component>
        </div>
    {/if}
</div>

<style>
    .module {
        border-radius: 2px;
        border: 1px var(--color-gray-light) solid;
        display: flex;
        gap: 2px;
        flex-direction: column;
        background-color: var(--bg-color);
        box-shadow: var(--shadow-0);
        width: var(--module-width);
    }

    .module.dragged {
        border-color: var(--color-info);
    }
    .module.dragged header {
        background-color: var(--color-info-light);
    }

    .module .type {
        padding: 2px;
        border-radius: 2px;
    }

    .module .operator {
        padding: 4px;
        border-radius: 2px;
    }

    .module header {
        display: flex;
        gap: 8px;
        background-color: var(--color-gray-light);
        padding: 2px;
    }

    .module header .outs {
        margin-inline-start: auto;
    }

    .module header .outs .symbol {
        display: flex;
    }

    .module header .outs .outs-list {
        background-color: var(--color-white);
        display: flex;
        flex-direction: column;
        position: absolute;
        padding: 2px;
        border-radius: 2px;
        border: 1px var(--color-gray-light) solid;
    }

    .out {
        display: flex;
        gap: 2px;
    }

    .module .footer {
        background-color: white;
        padding-inline: 4px;
        border-radius: 2px;
    }

    .module :where(header, .footer) {
        font-size: 10px;
    }

    .module .module-controlls {
        display: flex;
        align-items: center;

        /* margin-inline-start: auto; */
        gap: 2px;
    }

    .module .module-controlls button {
        width: 1ch;
        height: 1ch;
        border-radius: 50%;
        border: none;
        background-color: currentColor;
        padding: 0;
    }

    .module-controlls button.remove-module {
        background-color: red;
    }

    .module-controlls button.minimize-module {
        background-color: orange;
    }

    .module .operator {
        background-color: white;
    }
</style>
