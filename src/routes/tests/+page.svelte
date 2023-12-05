<script lang="ts">
    import Update from "$lib/components/tests/Update.svelte";

    let value = $state(0);

    setTimeout(() => {
        setInterval(() => {
            value = Math.random();
        }, 1500);
    }, 500);
</script>

<Update {value}></Update>
