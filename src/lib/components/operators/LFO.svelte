<script lang="ts">
  import type { ParameterState } from "$lib/network-state.svelte";
  import Slider from "../inputs/Slider.svelte";

  let { parameters } = $props<{ parameters: ParameterState[] }>();

  type ChangeEvent = Event & { currentTarget: HTMLInputElement };

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
  <div class="slider-row">
    {@const offset_param = parameters[0]}
    <div>
      <Slider value={offset_param.value} onchange={on_change(offset_param)}
      ></Slider>
    </div>
    {@const span_param = parameters[1]}
    <div>
      <label>
        <div>{span_param.name}</div>
        <input
          type="range"
          value={span_param.value}
          min="0"
          max="1"
          step="0.001"
          onchange={on_change(span_param)}
        />
      </label>
    </div>
  </div>
  <div class="slider-row">
    {@const phase_param = parameters[2]}
    <div>
      <label>
        <div>{phase_param.name}</div>
        <input
          type="range"
          value={phase_param.value}
          min="-0.5"
          max="0.5"
          step="0.001"
          onchange={on_change(phase_param)}
        />
      </label>
    </div>
    {@const frequency_param = parameters[3]}
    <div>
      <label>
        <div>{frequency_param.name}</div>
        <input
          type="range"
          value={frequency_param.value}
          min="0"
          max="1"
          step="0.001"
          onchange={on_change(frequency_param)}
        />
      </label>
    </div>
  </div>
</div>

<style lang="scss">
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

  .slider-row {
    display: flex;
  }

  .button-row {
    --direction: row;
    --gap: var(--gap-2);
  }
</style>
