import { tick } from "svelte";
import { drag_state } from "./drag-state.svelte";

type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

class NetworkState {
    private _chains = $state<ChainState[]>([]);
    private _outs = $state<OutState[]>([]);

    constructor() {}

    get chains() {
        return this._chains;
    }

    get outs() {
        return this._outs;
    }

    static clear_counter() {
        ChainState.id_counter = 0;
        ModuleState.id_counter = 0;
        OutState.id_counter = 0;
    }

    private index_outs(index: number) {
        this._outs = this._outs.map((out) => {
            if (out.index > index) {
                out.index -= 1;
            }
            return out;
        });
    }

    add_chain() {
        let new_chain = new ChainState();
        new_chain.index = this._chains.length;

        this._chains = [...this._chains, new_chain];

        return new_chain;
    }

    remove_chain(id: number) {
        let removed_chain = this._chains.find((chain) => chain.id == id);

        if (removed_chain) {
            this._chains = this._chains.filter(
                (chain) => chain != removed_chain
            );
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

        console.log('move');

        // if (from_chain == to_chain && moved_module_index == target_index - 1)
        //     return false;

        let moved_module = from_chain.modules.splice(moved_module_index, 1)[0];
        if (from_chain == to_chain) {
            // from_chain.modules.splice(moved_module_index, 0, null);
        }

        if (from_chain != to_chain) {
            // from_chain.modules = from_chain.modules;
            from_chain.index_modules();
        }

        let remove_c_idx = from_chain.index;
        let remove_m_idx = moved_module.index;

        // console.log(`m -r ${remove_c_idx}:${remove_m_idx}`);

        to_chain.modules.splice(target_index, 0, moved_module);

        // from_chain.modules = from_chain.modules.filter(
        //     (module) => module != null
        // );

        to_chain.index_modules();

        let added_c_idx = to_chain.index;
        let added_m_idx = moved_module.index;
        // console.log(`m -i ${added_c_idx}:${added_m_idx}`);

        let [removed_outs, intact_outs] = this._outs.reduce(
            (acc, out, index) => {
                if (out.target_module == moved_module) {
                    acc[0].push(out);
                    return acc;
                }

                acc[1].push(out);

                return acc;
            },
            [[], []] as [OutState[], OutState[]]
        );

        if (removed_outs.length) {
            let removed_out_inddices = removed_outs.map((out) => out.index);
            let r_str = removed_out_inddices
                .map((out) => {
                    let str = `o -r ${out}`;
                    return str;
                })
                .join("\n");

            // console.log(r_str);

            let addStr = removed_outs
                .map(
                    ({ destination: { gate } }) =>
                        `o -a ${to_chain.index}:${moved_module.index}:${gate.pid}:${gate.channel}`
                )
                .join("\n");

            // console.log(addStr);
        }

        intact_outs.forEach((out, index) => (out.index = index));
        removed_outs.forEach((out, index) => {
            out.index = index + intact_outs.length;
        });

        if (from_chain != to_chain) {
            to_chain.modules = to_chain.modules;
            moved_module.parent_chain = to_chain;
            return true;
        }

        return false;
    }

    add_out(destination: Omit<OutDestination, "cv">, target: OutTarget) {
        let target_chain = this._chains[target.chain_index];
        let target_module = target_chain?.modules[target.module_index];

        if (!target_chain || !target_module) return;

        let new_out = new OutState(destination);
        new_out.index = this._outs.length;
        new_out.target_module = target_module;

        this._outs = [...this._outs, new_out];

        // console.log(
        //     `o -a ${target.chain_index}:${target.module_index}:${destination.gate.pid}:${destination.gate.channel}:${destination.gate.pid}:${destination.gate.channel}`
        // );

        return new_out;
    }

    remove_out(id: number) {
        let removed_out_index = this._outs.findIndex((out) => out.id == id);

        if (removed_out_index == -1) return;

        let removed_out = this._outs.splice(removed_out_index, 1)[0];

        console.log(removed_out.index);

        this.index_outs(removed_out.index);
        // let target_module = removed_out.target_module
        // let c_idx = target_module?.parent_chain?.index
        // let m_idx = target_module?.index

        this._outs = this._outs;

        return removed_out;
    }

    update_out(id: number, destination: RecursivePartial<OutDestination>) {
        let updated_out = this._outs.find((out) => out.id == id);

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

        // TODO - !!!
        // THE POSITION OF THE OUTS NEEDS TO STAY INTACT
        // ORELSE THEY WILL CHANGE ORDER IN THE UI

        // console.log(updated_out.index);

        // let o = this._outs.splice(updated_out.index, 1)[0];
        // this._outs.push(o);

        this._outs = this._outs;

        this.index_outs(updated_out.index);

        updated_out.index = this._outs.length - 1;
    }
}

class ChainState {
    static id_counter = 0;
    readonly id = ChainState.id_counter++;
    index = $state(-1);

    modules = $state<ModuleState[]>([]);

    constructor() {
        // $effect(() => {
        //     this.modules.forEach((module, index) => (module.index = index));
        // });
    }
    index_modules() {
        this.modules = this.modules.map((module, index) => {
            module.index = index;
            return module;
        });
    }

    add_module(type: keyof ModuleTypeMap | (keyof ModuleTypeMap)[]) {
        let new_module = (
            Array.isArray(type)
                ? type.map((t) => new ModuleState(t))
                : [new ModuleState(type)]
        ).map((module, index) => {
            module.index = this.modules.length + index;
            module.parent_chain = this;
            return module;
        });

        this.modules = [...this.modules, ...new_module];

        return new_module;
    }

    remove_module(id: number) {
        let removed_module_index = this.modules.findIndex(
            (module) => module.id == id
        );

        if (removed_module_index == -1) return;

        let removed_module = this.modules.splice(removed_module_index, 1)[0];

        // console.log(removed_module.parent_chain?.index, removed_module.index);

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
    parent_chain: ChainState | null = null;
    index = -1;
    show_outs_list = $state(false);
    minimized = $state(false);
    dragged = $state(false);
    dot_menu_open = $state(false);

    parameters = $state<ParameterState[]>([]);

    constructor(type: keyof ModuleTypeMap) {
        this.type = type;

        this.parameters = module_type_map[type].map((struct) => {
            let param = new ParameterState(struct.name, struct.value, this);
            return param;
        });
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

const module_type_map = {
    PTH: [],
    PRO: [],
    BCH: [],
    LFO: [
        { name: "offset", value: 0 },
        { name: "span", value: 0.25 },
        { name: "phase", value: 0 },
        { name: "frequency", value: 0.75 },
    ],
};

export class ParameterState {
    value = $state<number | string>();
    name: string;
    parent_module: ModuleState;

    constructor(name: string, value: number | string, module: ModuleState) {
        this.name = name;
        this.value = value;
        this.parent_module = module;
    }

    update() {
        let c_idx = this.parent_module.parent_chain?.index;
        let m_idx = this.parent_module.index;
        // console.log(`-p ${c_idx}:${m_idx} ${this.value}`);
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
    target_module = $state<ModuleState>();
    destination: OutDestination;
    index = $state(-1);

    constructor(destination: Omit<OutDestination, "cv">) {
        this.destination = { cv: { pid: null, channel: null }, ...destination };
    }
}

export { NetworkState, ChainState, ModuleState, OutState };
