<script lang="ts">
  let { toggle } = $props<{ toggle: boolean }>();

  let s = $state(toggle);

  function on_toggle() {
    s = !s;
  }
</script>

<button class:toggle={s} onclick={on_toggle}><slot /></button>

<style>
  button.toggle {
    background-color: var(--color-black);
    color: var(--color-white);
  }
</style>
