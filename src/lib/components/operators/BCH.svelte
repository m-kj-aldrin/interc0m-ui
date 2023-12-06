<script lang="ts">
    import type { ParameterState } from "$lib/network-state.svelte";

    let { parameters } = $props<{ parameters: ParameterState[] }>();
</script>

<div>bch operator</div>

<style>
    div {
        text-align: center;
    }
</style>
