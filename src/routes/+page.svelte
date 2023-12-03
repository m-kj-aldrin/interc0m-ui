<script lang="ts">
    import "../app.css";
    import { NetworkState } from "$lib/network-state.svelte";
    import Module from "$lib/components/Module.svelte";
    import Chain from "$lib/components/Chain.svelte";
    import { setContext } from "svelte";

    const network = new NetworkState();

    setContext("network", network);

    NetworkState.clear_counter();
    network.reset();

    let c0 = network.add_chain();
    let c1 = network.add_chain();

    c0.insert_module("LFO");

    c1.insert_module("BCH");
    c1.insert_module("PTH");
    c1.insert_module("PRO").add_out({ pid: 0, channel: 4 });

    network.move_module(1, 1, 0, 1);
    network.move_module(0, 0, 1, 2);
</script>

<div
    class="chains stack"
    ondragover={(e) => e.preventDefault()}
    role="application"
>
    {#each network.chains as chain (chain.id)}
        <Chain {chain}>
            {#each chain.modules as module (module.id)}
                <Module {module}></Module>
            {/each}
        </Chain>
    {/each}
</div>

<style>
    .chains {
        --direction: row;
        align-items: normal;
        gap: var(--gap-2);
    }
</style>
