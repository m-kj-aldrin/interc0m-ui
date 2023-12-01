<script lang="ts">
    import type { Snippet } from "svelte";

    let { onchange } = $props<{
        onchange?: (value: boolean) => void;
        children?: Snippet;
    }>();

    function on_toggle() {
        onchange?.(true);
    }
</script>

<button onclick={on_toggle}><slot /></button>

<style>
    button:active {
        background-color: var(--color-black);
        color: var(--color-white);
        border-color: var(--color-black);
    }
</style>
