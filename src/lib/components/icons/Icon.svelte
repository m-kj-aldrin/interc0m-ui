<script lang="ts">
    let { type } = $props<{ type: "out" | "cross" | "plus" }>();
</script>

{#if type == "out"}
    <svg
        width="10"
        height="10"
        viewBox="0 0 6 6"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M3 0.25V5.25M3 0.25H1M3 0.25H5M3 5.25L1 3.25M3 5.25L5 3.25"
            stroke="currentColor"
            stroke-width="0.5"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
{:else if type == "cross"}
    <svg width="10" height="10" viewBox="0 0 8 8" fill="none">
        <g stroke="currentColor" transform="rotate(45 4 4)">
            <path d="M0,4 h8 M4,0 v8"></path>
        </g>
    </svg>
{:else if type == "plus"}
    <svg width="10" height="10" viewBox="0 0 8 8" fill="none">
        <g stroke="currentColor" stroke-width="1">
            <path d="M0,4 h8 M4,0 v8"></path>
        </g>
    </svg>
{/if}
