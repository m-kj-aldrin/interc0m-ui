import type { ChainState, ModuleState } from "./network-state.svelte";

class DragState {
    dragging = $state(false);
    dragged_module = $state<ModuleState | null>(null);
    dragged_chain = $state<ChainState | null>(null);
    drag_available = $state(true);

    constructor() {}
}

export const drag_state = new DragState();
