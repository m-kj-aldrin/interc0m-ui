import { drag_state } from "./drag-state.svelte";

type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

class NetworkState {
    chains = $state<ChainState[]>([]);
    outs = $state<OutState[]>([]);

    constructor() {
        $effect(() => {
            this.chains.forEach((chain, index) => (chain.index = index));
        });
    }

    static clear_counter() {
        ChainState.id_counter = 0;
        ModuleState.id_counter = 0;
        OutState.id_counter = 0;
    }

    private index_outs(index: number) {
        this.outs = this.outs.map((out) => {
            if (out.index > index) {
                out.index -= 1;
            }
            return out;
        });
    }

    add_chain() {
        let new_chain = new ChainState();
        this.chains = [...this.chains, new_chain];

        return new_chain;
    }

    remove_chain(id: number) {
        let removed_chain = this.chains.find((chain) => chain.id == id);

        if (removed_chain) {
            this.chains = this.chains.filter((chain) => chain != removed_chain);
        }
    }

    move_module(
        module_id: number,
        target_index: number,
        from_chain: ChainState,
        to_chain: ChainState
    ) {
        if (!from_chain || !to_chain) return false;

        let moved_module_index = from_chain.modules.findIndex(
            (module) => module.id == module_id
        );

        if (moved_module_index == -1) return false;

        if (from_chain == to_chain && moved_module_index == target_index - 1)
            return false;

        let moved_module = from_chain.modules.splice(moved_module_index, 1)[0];
        if (from_chain == to_chain) {
            from_chain.modules.splice(moved_module_index, 0, null);
        }

        to_chain.modules.splice(target_index, 0, moved_module);

        from_chain.modules = from_chain.modules.filter(
            (module) => module != null
        );

        if (from_chain != to_chain) {
            to_chain.modules = to_chain.modules;
            return true;
        }

        return false;
    }

    add_out(destination: Omit<OutDestination, "cv">, target: OutTarget) {
        let target_chain = this.chains[target.chain_index];
        let target_module = target_chain?.modules[target.module_index];

        if (!target_chain || !target_module) return;

        let new_out = new OutState(destination);
        new_out.target_id = target_module.id;
        new_out.index = this.outs.length;

        this.outs = [...this.outs, new_out];

        return new_out;
    }

    remove_out(id: number) {
        let removed_out_index = this.outs.findIndex((out) => out.id == id);

        if (removed_out_index == -1) return;

        let removed_out = this.outs.splice(removed_out_index, 1)[0];

        this.index_outs(removed_out.index);

        return removed_out;
    }

    update_out(id: number, destination: RecursivePartial<OutDestination>) {
        let updated_out = this.outs.find((out) => out.id == id);

        if (updated_out == undefined) return;

        updated_out.destination = {
            gate: {
                ...updated_out.destination.gate,
                ...destination.gate,
            },
            cv: {
                ...updated_out.destination.cv,
            },
        };

        this.index_outs(updated_out.index);

        updated_out.index = this.outs.length - 1;
    }
}

class ChainState {
    static id_counter = 0;
    readonly id = ChainState.id_counter++;
    index = $state(-1);

    modules = $state<ModuleState[]>([]);

    constructor() {
        $effect(() => {
            this.modules.forEach((module, index) => (module.index = index));
        });
    }

    add_module(type: keyof ModuleTypeMap | (keyof ModuleTypeMap)[]) {
        let new_module = Array.isArray(type)
            ? type.map((t) => new ModuleState(t))
            : [new ModuleState(type)];

        this.modules = [...this.modules, ...new_module];

        return new_module;
    }

    remove_module(id: number) {
        let removed_module_index = this.modules.findIndex(
            (module) => module.id == id
        );

        if (removed_module_index == -1) return;

        let removed_module = this.modules.splice(removed_module_index, 1)[0];

        this.modules = this.modules;

        return removed_module;
    }
}

export type ModuleTypeMap = {
    PTH: {};
    LFO: {};
    BCH: {};
    PRO: {};
};

class ModuleState {
    static id_counter = 0;
    readonly id = ModuleState.id_counter++;
    type: keyof ModuleTypeMap;
    index = $state(-1);
    show_outs_list = $state(false);
    minimized = $state(false);
    dragged = $state(false);

    constructor(type: keyof ModuleTypeMap) {
        this.type = type;
    }

    toggle_show_outs() {
        this.show_outs_list = !this.show_outs_list;
        if (this.show_outs_list) {
            drag_state.drag_available = false;
        } else {
            drag_state.drag_available = true;
        }
    }
}

type OutTarget = {
    chain_index: number;
    module_index: number;
};

type Periphial = {
    pid: number | null;
    channel: number | null;
};

type OutDestination = {
    gate: Periphial;
    cv: Periphial;
};

class OutState {
    static id_counter = 0;
    readonly id = OutState.id_counter++;
    target_id = $state(-1);
    destination: OutDestination;
    index = $state(-1);

    constructor(destination: Omit<OutDestination, "cv">) {
        this.destination = { cv: { pid: null, channel: null }, ...destination };
    }
}

export { NetworkState, ChainState, ModuleState, OutState };
