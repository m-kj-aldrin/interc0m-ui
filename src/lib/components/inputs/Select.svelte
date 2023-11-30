<script lang="ts">
  let { items, onchange } = $props<{
    items: any[];
    onchange?: (item: any) => void;
  }>();

  let selected_item = $state(items[0]);

  let width = items.reduce((value, item) => {
    if (item.length > value) {
      return item.length;
    }
    return value;
  }, 0);

  function on_change(item: any) {
    selected_item = item;
    onchange?.(selected_item);
    open = false;
    window.removeEventListener("click", click_outside, { capture: true });
  }

  let open = $state(false);

  function toggle_open() {
    if (open) {
      open = false;
      window.removeEventListener("click", click_outside, { capture: true });
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
      window.removeEventListener("click", click_outside, { capture: true });
      open = false;
    }
  }
</script>

<div class="select" style:--width={`${width + 2}ch`}>
  <button onclick={toggle_open} bind:this={button_el}>{selected_item}</button>

  {#if open}
    <div class="list" bind:this={list_el}>
      {#each items as item}
        <button
          class:selected={item == selected_item}
          class="item"
          onclick={() => on_change(item)}>{item}</button
        >
      {/each}
    </div>
  {/if}
</div>

<style>
  .select {
  }

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
  }

  .item {
    border: none;
    text-align: start;
    border-radius: 1px;
  }

  .item.selected,
  .item:hover {
    background-color: var(--color-gray-lightest);
  }

  .item,
  button {
    padding-block: var(--gap-0);
  }
</style>
