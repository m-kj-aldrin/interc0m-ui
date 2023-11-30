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

        let str = `c -n`;
        console.log(str);

        return new_chain;
    }

    remove_chain(id: number) {
        let removed_chain = this._chains.find((chain) => chain.id == id);

        if (removed_chain) {
            this._chains = this._chains.filter(
                (chain) => chain != removed_chain
            );
        }

        let str = `c -r ${removed_chain?.index}`;
        console.log(str);
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

        // console.log('move');

        // if (from_chain == to_chain && moved_module_index == target_index - 1)
        //     return false;

        let moved_module = from_chain.modules.splice(moved_module_index, 1)[0];
        if (from_chain == to_chain) {
            // from_chain.modules.splice(moved_module_index, 0, null);
        }

        if (from_chain != to_chain) {
            from_chain.index_modules();
        }

        let removed_module_str = `m -c ${moved_module.parent_chain?.index} -r ${moved_module.index}`;
        console.log(removed_module_str);

        to_chain.modules.splice(target_index, 0, moved_module);

        to_chain.index_modules();

        let added_module_str = `m -c ${to_chain.index} -i ${moved_module.index}:${moved_module.type}`;
        console.log(added_module_str);

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
            let removed_outs_str = removed_out_inddices
                .map((out) => {
                    let str = `o -r ${out}`;
                    return str;
                })
                .join("\n");

            console.log(removed_outs_str);

            let added_outs_str = removed_outs
                .map(
                    ({ destination: { gate } }) =>
                        `o -n ${gate.pid}:${gate.channel}:${to_chain.index}:${moved_module.index}:${to_chain.index}:${moved_module.index}`
                )
                .join("\n");

            console.log(added_outs_str);
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

        let added_str = `o -n ${destination.gate.pid}:${destination.gate.channel}:${target_chain.index}:${target_module.index}:${target_chain.index}:${target_module.index}`;
        console.log(added_str);

        return new_out;
    }

    remove_out(id: number) {
        let removed_out_index = this._outs.findIndex((out) => out.id == id);

        if (removed_out_index == -1) return;

        let removed_out = this._outs.splice(removed_out_index, 1)[0];

        let removed_out_str = `o -r ${removed_out.index}`;
        console.log(removed_out_str);

        this.index_outs(removed_out.index);

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

        let removed_out_str = `o -r ${updated_out.index}`;
        console.log(removed_out_str);

        this.index_outs(updated_out.index);

        let target_chain = updated_out.target_module?.parent_chain;
        let target_module = updated_out.target_module;

        let added_out_str = `o -n ${updated_out.destination.gate.pid}:${updated_out.destination.gate.channel}:${target_chain.index}:${target_module.index}:${target_chain.index}:${target_module.index}`;
        console.log(added_out_str);

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

        let str = new_module
            .map((module) => `m -c ${this.index} -a ${module.type}`)
            .join("\n");
        console.log(str);

        return new_module;
    }

    remove_module(id: number) {
        let removed_module_index = this.modules.findIndex(
            (module) => module.id == id
        );

        if (removed_module_index == -1) return;

        let removed_module = this.modules.splice(removed_module_index, 1)[0];

        // console.log(removed_module.parent_chain?.index, removed_module.index);

        let str = `m -c ${this.index} -r ${removed_module.index}`;
        console.log(str);

        // this.modules = this.modules;
        this.index_modules();

        return removed_module;
    }
}

export type ModuleTypeMap = {
    PTH: [];
    LFO: [
        { name: "frequency"; value: number },
        { name: "span"; value: number },
        { name: "phase"; value: number },
        { name: "offset"; value: number },
        { name: "wave select"; value: 0 | 1 | 2 | 3 | 4 },
        { name: "duty cycle"; value: number },
        { name: "reset"; value: number },
        { name: "mode"; value: 0 | 1 },
        { name: "hold"; value: boolean }
    ];
    BCH: [];
    PRO: [];
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

        this.parameters = module_type_map[type].map((struct, index) => {
            let param = new ParameterState(
                struct.name,
                struct.value,
                index,
                this
            );
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

const module_type_map: ModuleTypeMap = {
    PTH: [],
    PRO: [],
    BCH: [],
    LFO: [
        { name: "frequency", value: 0.1 },
        { name: "span", value: 0.5 },
        { name: "phase", value: 0 },
        { name: "offset", value: 0 },
        { name: "wave select", value: 1 },
        { name: "duty cycle", value: 0 },
        { name: "reset", value: 0 },
        { name: "mode", value: 0 },
        { name: "hold", value: false },
    ],
};

function debounce(window: number = 25) {
    let timeout_id: number;
    return function async(fn: (...args: any) => any) {
        clearTimeout(timeout_id);
        timeout_id = setTimeout(() => {
            fn();
        }, window);
    };
}

export class ParameterState {
    value = $state<number>(0);
    name: string;
    parent_module: ModuleState;
    index: number;
    bouncer: ReturnType<typeof debounce>;

    constructor(
        name: string,
        value: number,
        index: number,
        module: ModuleState
    ) {
        this.name = name;
        this.value = value;
        this.index = index;
        this.parent_module = module;
        this.bouncer = debounce();
    }

    update() {
        let c_idx = this.parent_module.parent_chain?.index;
        let m_idx = this.parent_module.index;
        this.bouncer(() => {
            console.log(
                `p -m ${c_idx}:${m_idx} -p ${this.index}:${this.value}`
            );
        });
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
