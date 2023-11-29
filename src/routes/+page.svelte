<script lang="ts">
  import "../app.css";
  import { NetworkState, ParameterState } from "$lib/network-state.svelte";
  import { setContext } from "svelte";
  import Module from "$lib/components/Module.svelte";
  import Chain from "$lib/components/Chain.svelte";
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

  // network.chains[0].modules[1].parameters[0] = new ParameterState(0.25);

  // network.chains[0].modules[0].show_outs_list = true;
</script>

<div
  class="chains stack"
  ondragover={(e) => e.preventDefault()}
  role="application"
>
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
    --direction: row;
    align-items: normal;
    gap: var(--gap-2);
  }
</style>
