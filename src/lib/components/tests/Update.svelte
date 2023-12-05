<script lang="ts">
    let { value } = $props<{ value: number }>();

    // let _value = $state(value);
    let _value = $derived(value)
</script>

<div>value: {_value}</div>
