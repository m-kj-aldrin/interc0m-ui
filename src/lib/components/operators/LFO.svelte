<script lang="ts">
    import type { ParameterState } from "$lib/network-state.svelte";
    import Slider from "../inputs/Slider.svelte";

    let { parameters } = $props<{ parameters: ParameterState[] }>();

    function on_change(p: ParameterState) {
        return function (value: number) {
            p.value = value;
            p.update();
        };
    }
</script>

<div class="lfo stack">
    <div class="button-row stack">
        <select>
            <option value="sine">sin</option>
            <option value="pulse">pls</option>
            <option value="ramp up">up</option>
            <option value="ramp down">down</option>
        </select>
        <select>
            <option value="beatsync">sync</option>
            <option value="freerunning">free</option>
        </select>
        <button>reset</button>
        <button>hold</button>
    </div>
    <hr />
    <div class="sliders">
        <div class="slider-row">
            <div>
                <div>{parameters[0].name}</div>
                <Slider
                    value={parameters[0].value}
                    onchange={on_change(parameters[0])}
                ></Slider>
            </div>
            <div>
                <div>{parameters[1].name}</div>
                <Slider
                    value={parameters[1].value}
                    onchange={on_change(parameters[1])}
                ></Slider>
            </div>
        </div>
        <div class="slider-row">
            <div>
                <div>{parameters[2].name}</div>
                <Slider
                    value={parameters[2].value}
                    onchange={on_change(parameters[2])}
                ></Slider>
            </div>
            <div>
                <div>{parameters[3].name}</div>
                <Slider
                    value={parameters[3].value}
                    onchange={on_change(parameters[3])}
                ></Slider>
            </div>
        </div>
    </div>
</div>

<style lang="scss">
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
