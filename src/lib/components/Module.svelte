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
  import Icon from "./icons/Icon.svelte";

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

  function outs_filter() {
    return network.outs.filter((out) => out.target_module == module);
  }

  let outs = $derived(outs_filter());

  function toggle_dot_menu() {
    module.dot_menu_open = !module.dot_menu_open;
  }

  let new_pid = $state(0);
  let new_ch = $state(0);

  function add_out() {
    network.add_out(
      { gate: { pid: new_pid, channel: new_ch } },
      { chain_index: chain.index, module_index: module.index }
    );
  }

  let bound_outside_handler: typeof click_outside;

  function click_outside(e: MouseEvent) {
    if (!e.composedPath().some((el) => el == dot_options || el == dot_button)) {
      module.dot_menu_open = false;

      window.removeEventListener("click", bound_outside_handler, {
        capture: true,
      });

      bound_outside_handler = null;
    }
  }

  let dot_options: HTMLElement;
  let dot_button: HTMLElement;

  function dot_menu_toggle(e: MouseEvent) {
    if (module.dot_menu_open) {
      module.dot_menu_open = false;

      window.removeEventListener("click", bound_outside_handler, {
        capture: true,
      });
      bound_outside_handler = null;
      return;
    }

    module.dot_menu_open = true;

    window.addEventListener("click", (bound_outside_handler = click_outside), {
      capture: true,
    });
  }
</script>

<div
  class="module stack border"
  class:dragged={module.dragged}
  class:minimized={module.minimized}
  data-dnd-id={module.id}
>
  <header
    class="padding stack"
    draggable={drag_state.drag_available}
    ondragstart={drag_start}
    ondragend={drag_end}
    role="application"
  >
    <div class="type">{module.type} id: {module.id} idx: {module.index}</div>

    <div class="outs">
      <!-- {@const outs = outs_filter()} -->

      <button class="symbol" onclick={() => module.toggle_show_outs()}>
        <Icon type="out"></Icon>
        <div class="count">{outs.length}</div>
      </button>

      {#if module.show_outs_list}
        <div class="outs-list stack border padding">
          <div class="outs-controlls stack">
            <div class="new-out stack">
              <label>
                pid:<input type="text" bind:value={new_pid} maxlength="2" />
              </label>

              <label>
                ch:<input type="text" bind:value={new_ch} maxlength="2" />
              </label>
            </div>

            <button class="add-out" onclick={add_out}>
              <Icon type="plus"></Icon>
            </button>
          </div>

          {#if outs.length}
            <hr />

            <div class="stack">
              {#each outs as out (out.id)}
                <Out {out}></Out>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    {#if module.type != "PTH"}
      <div class="module-controlls stack">
        <button
          class="minimize-module"
          onclick={toggle_minimize_module(module)}
        />
      </div>
    {/if}

    <div class="dot-menu">
      <button class="dots" onclick={dot_menu_toggle} bind:this={dot_button}>
        {#each { length: 3 } as i}
          <div class="dot"></div>
        {/each}
      </button>
      {#if module.dot_menu_open}
        <div class="stack border options" bind:this={dot_options}>
          <button
            class="remove-module"
            onclick={remove_module(module.id, chain)}>remove</button
          >
        </div>
      {/if}
    </div>
  </header>

  {#if !module.minimized && !(module.type == "PTH")}
    <div class="operator padding">
      <svelte:component
        this={Operators[module.type]}
        parameters={module.parameters}
      ></svelte:component>
    </div>
  {/if}
</div>

<style lang="scss">
  .padding {
    padding: var(--gap-1);
  }

  .module {
    --gap: 0;
    background-color: var(--bg-color);
    box-shadow: var(--shadow-0);
    width: var(--module-width);
    font-size: var(--text-size-1);

    > header {
      cursor: move;
      --gap: var(--gap-2);
      --direction: row;
      align-self: normal;

      background-color: var(--color-gray-light);
      padding-inline: var(--gap-2);
      &:hover {
        background-color: var(--color-gray-lightest);
      }
    }
  }

  .outs {
    margin-inline-start: auto;

    .symbol {
      border: none;
      background-color: transparent;
      padding: 0;
      display: flex;
      cursor: pointer;

      > .count {
        transform: translateY(0.75ex);
        font-size: var(--text-size-0);
      }
    }

    .outs-controlls {
      --direction: row;
      padding: var(--gap-1);
      align-self: normal;
      justify-content: space-between;

      .new-out {
        --direction: row;
      }

      .add-out {
        display: grid;
        padding: var(--gap-0);
        color: var(--color-ok);
      }
    }

    input {
      max-width: 3ch;
      text-align: center;
    }
  }

  .outs-list {
    background-color: var(--color-white);
    position: absolute;
    z-index: 10;
    box-shadow: var(--shadow-0);
  }

  .dot-menu {
    .dots {
      display: flex;
      flex-direction: column;
      gap: 2px;

      border: none;
      background-color: transparent;

      cursor: pointer;
      padding: 2px;
    }

    .dot {
      width: 0.5ch;
      height: 0.5ch;
      background-color: currentColor;
      border-radius: 50%;
    }

    .options {
      position: absolute;
      padding: var(--gap-1);
      background-color: var(--color-white);

      .remove-module {
        color: var(--color-error);
      }
    }
  }

  .module-controlls {
    --direction: row;
    align-items: center;

    button {
      width: 1.25ch;
      height: 1.25ch;
      border-radius: 50%;
      border: none;
      background-color: currentColor;
      padding: 0;

      &.minimize-module {
        background-color: var(--color-info);
      }
    }
  }

  .module.minimized {
    button.minimize-module {
      background-color: var(--color-ok);
    }
  }

  .operator {
    background-color: white;
    padding: var(--gap-2);
    align-self: normal;
  }

  /* DRAGGED */
  .dragged {
    border-color: var(--color-info);

    header {
      background-color: var(--color-info-light) !important;
    }
  }
</style>
