<script lang="ts">
    import "../app.css";
    import { NetworkState } from "$lib/network-state.svelte";
    import { setContext, tick } from "svelte";
    import Module from "$lib/components/Module.svelte";
    import Chain from "$lib/components/Chain.svelte";
    import { slide } from "svelte/transition";
    import { flip } from "svelte/animate";
    NetworkState.clear_counter();

    let network = new NetworkState();
    setContext("network", network);

    network.add_chain().add_module(["PTH", "LFO", "BCH"]);

    network.add_out(
        { gate: { pid: 0, channel: 4 } },
        { chain_index: 0, module_index: 0 }
    );

    network.add_out(
        { gate: { pid: 4, channel: 0 } },
        { chain_index: 0, module_index: 0 }
    );

    network.add_chain().add_module(["BCH", "PRO"]);

    tick().then(() => {
        network.update_out(0, {
            gate: {
                pid: 8,
                channel: 2,
            },
        });
    });
</script>

<div class="chains" ondragover={(e) => e.preventDefault()}>
    {#each network.chains as chain (chain.id)}
        <Chain {chain}>
            {#each chain.modules as module (module.id)}
                <Module {chain} {module}></Module>
            {/each}
        </Chain>
    {/each}
</div>

<style>
    .chains {
        display: flex;
        gap: 4px;
    }
</style>
