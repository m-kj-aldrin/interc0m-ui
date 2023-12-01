<script lang="ts">
  import {
    network,
    type NetworkState,
    type OutState,
  } from "$lib/network-state.svelte";
  import { getContext } from "svelte";
  import Icon from "./icons/Icon.svelte";
  import type { ChangeEventHandler } from "svelte/elements";

  // let network = getContext("network") as NetworkState;

  let { out } = $props<{ out: OutState }>();

  let new_pid = $state(0);
  let new_ch = $state(0);

  function remove_out() {
    network.remove_out(out.id);
  }

  type ChangeEvent = Event & {
    currentTarget: EventTarget & HTMLInputElement;
  };

  function update_pid(e: ChangeEvent) {
    let value = +e.currentTarget.value;

    network.update_out(out.id, {
      gate: {
        pid: value,
      },
    });
  }

  function update_ch(e: ChangeEvent) {
    let value = +e.currentTarget.value;

    network.update_out(out.id, {
      gate: {
        channel: value,
      },
    });
  }
</script>

<div class="out padding stack">
  <div class="destination stack">
    <label>
      pid:<input
        onchange={update_pid}
        type="text"
        value={out.destination.gate.pid}
        maxlength="2"
      />
    </label>
    <label>
      ch:<input
        onchange={update_ch}
        type="text"
        value={out.destination.gate.channel}
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
