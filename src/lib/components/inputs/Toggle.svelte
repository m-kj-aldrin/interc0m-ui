<script lang="ts">
    import type { Snippet } from "svelte";

    let { toggle, onchange } = $props<{
        toggle: boolean;
        onchange?: (value: boolean) => void;
        children?: Snippet;
    }>();

    let s = $state(toggle);

    function on_toggle() {
        s = !s;
        onchange?.(s);
    }
</script>

<button class:toggle={s} onclick={on_toggle}><slot /></button>

<style>
    button:where(.toggle, :active) {
        background-color: var(--color-black);
        color: var(--color-white);
        border-color: var(--color-black);
    }
</style>
