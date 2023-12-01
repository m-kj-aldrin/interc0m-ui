<script lang="ts">
  import type { ParameterState } from "$lib/network-state.svelte";
  import Pulse from "../inputs/Pulse.svelte";
  import Select from "../inputs/Select.svelte";
  import Slider from "../inputs/Slider.svelte";
  import Toggle from "../inputs/Toggle.svelte";

  let { parameters } = $props<{ parameters: ParameterState[] }>();

  function on_change(p: ParameterState) {
    return function (value: number) {
      p.value = value;
      p.signal_intercom();
    };
  }
</script>

<div class="lfo stack">
  <div class="button-row stack">
    <Select
      onchange={({ value }) => on_change(parameters[4])(value)}
      index={parameters[4].value}
      items={[
        { label: "⟋", value: 0 },
        { label: "⟍", value: 1 },
        { label: "⎍", value: 2 },
        { label: "△", value: 3 },
        { label: "◠◡", value: 4 },
      ]}
    ></Select>
    <Select
      onchange={({ value }) => on_change(parameters[7])(value)}
      index={parameters[7].value}
      items={[
        { label: "∞", value: 0 },
        { label: "¼", value: 1 },
      ]}
    ></Select>
    <Pulse onchange={(value) => on_change(parameters[6])(+value)}>reset</Pulse>
    <Toggle
      onchange={(value) => on_change(parameters[8])(+value)}
      toggle={!!parameters[8].value}
    >
      hold
    </Toggle>
  </div>
  <hr />
  <div class="sliders">
    <div class="slider-row">
      <div>
        <div>{parameters[0].name}</div>
        <Slider value={parameters[0].value} onchange={on_change(parameters[0])}
        ></Slider>
      </div>
      <div>
        <div>{parameters[1].name}</div>
        <Slider value={parameters[1].value} onchange={on_change(parameters[1])}
        ></Slider>
      </div>
    </div>
    <div class="slider-row">
      <div>
        <div>{parameters[2].name}</div>
        <Slider value={parameters[2].value} onchange={on_change(parameters[2])}
        ></Slider>
      </div>
      <div>
        <div>{parameters[3].name}</div>
        <Slider value={parameters[3].value} onchange={on_change(parameters[3])}
        ></Slider>
      </div>
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
