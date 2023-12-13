<script lang="ts">
    import { getContext } from "svelte";
    import Pulse from "$lib/components/inputs/Pulse.svelte";
    import Slider from "$lib/components/inputs/Slider.svelte";
    import Toggle from "$lib/components/inputs/Toggle.svelte";
    import Select from "$lib/components/inputs/Select.svelte";
    import type { MenuState } from "$lib/state/menu-state.svelte";
    import {
        ModuleState,
        ParameterState,
    } from "$lib/state/intercom/network-state.svelte";

    let { parameters } = $props<{ parameters: ParameterState[] }>();

    function type_check(value: ParameterState["value"]) {
        return value instanceof ModuleState ? value.pointer : value;
    }

    let menu_state = getContext("menu_state") as MenuState;

    function select_module(parameter: ParameterState) {
        menu_state.state = "picking.module";
        menu_state.fn = (module: ModuleState) => {
            parameter.value = module;
        };
    }
</script>

<div class="lfo stack">
    <div class="button-row stack">
        <Select
            onchange={({ value }) => (parameters[4].value = value)}
            index={type_check(parameters[4].value)}
            items={[
                { label: "⟋", value: 0 },
                { label: "⟍", value: 1 },
                { label: "⎍", value: 2 },
                { label: "△", value: 3 },
                { label: "◠◡", value: 4 },
            ]}
        ></Select>
        <Select
            onchange={({ value }) => (parameters[7].value = value)}
            index={type_check(parameters[7].value)}
            items={[
                { label: "∞", value: 0 },
                { label: "¼", value: 1 },
            ]}
        ></Select>
        <Pulse onchange={() => (parameters[6].value = 1)}>reset</Pulse>
        <Toggle
            onchange={(value) => (parameters[8].value = +value)}
            toggle={!!type_check(parameters[8].value)}
        >
            hold
        </Toggle>
    </div>
    <hr />

    <div class="sliders"></div>
    <div class="slider-row">
        <div>
            <div>{parameters[0].name}</div>
            <div class="stack-h">
                <button onclick={() => select_module(parameters[0])}>
                    &cir;
                </button>
                <Slider
                    onchange={(value) => (parameters[0].value = value)}
                    value={parameters[0].value}
                ></Slider>
            </div>
        </div>
        <div>
            <div>{parameters[1].name}</div>
            <Slider
                onchange={(value) => (parameters[1].value = value)}
                value={type_check(parameters[1].value)}
            ></Slider>
        </div>
    </div>
    <div class="slider-row">
        <div>
            <div>{parameters[2].name}</div>
            <Slider
                onchange={(value) => (parameters[2].value = value)}
                value={type_check(parameters[2].value)}
            ></Slider>
        </div>
        <div>
            <div>{parameters[3].name}</div>
            <Slider
                onchange={(value) => (parameters[3].value = value)}
                value={type_check(parameters[3].value)}
            ></Slider>
        </div>
    </div>
</div>

<style lang="scss">
    .lfo,
    .lfo * {
        user-select: none;
        -webkit-user-select: none;
    }

    select {
        background-color: transparent;
        font-family: inherit;
        font-size: inherit;
        color: currentColor;
        border: 1px var(--color-gray-light) solid;
    }

    label {
        display: flex;
        flex-direction: column;
        gap: 4px;

        input {
            width: 64px;
        }
    }

    .lfo {
        --gap: var(--gap-2);
    }

    .button-row {
        flex-wrap: wrap;
    }

    .sliders {
        display: flex;
        flex-direction: column;
        gap: var(--gap-2);
    }

    .slider-row {
        display: flex;
        gap: var(--gap-3);
        > div {
            display: flex;
            flex-direction: column;
            gap: 3px;
        }
    }

    .button-row {
        --direction: row;
        --gap: var(--gap-2);
    }
</style>
