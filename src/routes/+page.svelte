<script lang="ts">
    import "../app.css";
    import { NetworkState } from "$lib/network-state.svelte";
    import Module from "$lib/components/Module.svelte";
    import Chain from "$lib/components/Chain.svelte";
    import { setContext } from "svelte";
    import Select from "$lib/components/inputs/Select.svelte";
    import { MenuState } from "$lib/components/menu-state.svelte";

    const network = new NetworkState();
    const menu_state = new MenuState();

    setContext("network", network);
    setContext("menu_state", menu_state);

    NetworkState.clear_counter();
    network.reset();

    let c0 = network.add_chain();
    let c1 = network.add_chain();

    let c0m0 = c0.insert_module("LFO");
    let c0m1 = c0.insert_module("PTH");

    c1.insert_module("BCH");
    c1.insert_module("PTH");
    c1.insert_module("PRO").add_out({ pid: 0, channel: 4 });

    setTimeout(() => {
        c0m0.parameters[0].value = c0m1;
    }, 0);
</script>

<div
    class="chains stack"
    ondragover={(e) => e.preventDefault()}
    role="application"
    data-picking={menu_state.state == "picking.module"}
>
    {#each network.chains as chain (chain.id)}
        <Chain {chain}>
            <div class="new-module">
                <div class="plus-icon">&plus;</div>
                <Select
                    index={0}
                    reset={true}
                    onchange={(value) => chain.insert_module(value.label, 0)}
                    items={[
                        { label: "PTH", value: "PTH" },
                        { label: "LFO", value: "LFO" },
                        { label: "BCH", value: "BCH" },
                        { label: "PRO", value: "PRO" },
                    ]}
                ></Select>
            </div>
            {#each chain.modules as module, i (module.id)}
                <Module {module}></Module>
                <div class="new-module">
                    <div class="plus-icon">&plus;</div>
                    <Select
                        index={0}
                        reset={true}
                        onchange={(value) =>
                            chain.insert_module(value.label, i + 1)}
                        items={[
                            { label: "PTH", value: "PTH" },
                            { label: "LFO", value: "LFO" },
                            { label: "BCH", value: "BCH" },
                            { label: "PRO", value: "PRO" },
                        ]}
                    ></Select>
                </div>
            {/each}
        </Chain>
    {/each}
    <div class="new-chain">
        <button onclick={() => network.add_chain()}> &plus; </button>
    </div>
</div>

<style lang="scss">
    [data-picking="true"] {
        :global(*) {
            cursor: crosshair !important;
        }
    }

    .chains {
        --direction: row;
        align-items: normal;
        gap: var(--gap-2);

        // :global(.chain) {
        //     color: red !important;
        // }
    }

    .new-module {
        align-self: center;
        display: flex;
        font-size: var(--text-size-1);
        opacity: 0.1;

        align-items: center;
        gap: var(--gap-1);

        .plus-icon {
            // height: 2ch;
            aspect-ratio: 1/1;
            display: grid;
            place-content: center;
        }

        transition: opacity 100ms 200ms ease;
        &:hover {
            opacity: 1;
            transition-delay: 0ms;
        }
    }

    .new-chain {
        button {
            height: 3ch;
            aspect-ratio: 1/1;
            display: grid;
            place-content: center;
        }
    }
</style>
