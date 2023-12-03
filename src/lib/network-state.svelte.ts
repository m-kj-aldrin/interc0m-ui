import { drag_state } from "./drag-state.svelte";

// TODO - Tree / TreeWalker
// We need a network-tree, so we can walk up and down through chains-modules-outs

type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

class NetworkState {
    private _chains = $state<ChainState[]>([]);
    _outs = $state<OutState[]>([]);
    _detached_outs = $state<OutState[]>([]);

    constructor() {
        $effect(() => {
            this._chains.forEach((chain, index) => (chain.index = index));
        });

        $effect(() => {
            this._outs.forEach((out, index) => (out.index = index));
        });
    }

    reset() {
        this._chains = [];
        this._outs = [];
    }

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

    add_chain(confing?: any) {
        let new_chain = new ChainState(this, this._chains.length);
        this._chains = [...this._chains, new_chain];
        new_chain.attach();

        return new_chain;
    }

    remove_chain(index: number | ChainState) {
        let removed_chain: ChainState;

        if (index instanceof ChainState) {
            let _index = this._chains.findIndex((chain) => chain == index);
            removed_chain = this._chains.splice(_index, 1)[0];
            removed_chain.index = _index;
        } else {
            removed_chain = this._chains.splice(index, 1)[0];
        }

        this._chains = this._chains;

        let modules = removed_chain.modules;
        let target_outs = [
            ...this._outs.filter((out) =>
                modules.some((module) => out.target_module == module)
            ),
            ...this._detached_outs.filter((out) =>
                modules.some((module) => out.target_module == module)
            ),
        ];

        target_outs.forEach((out) => out.remove());

        removed_chain.detach();

        return removed_chain;
    }

    move_module(
        from_chain: number,
        from_module: number | ModuleState,
        to_chain: number | ChainState,
        to_module: number
    ) {
        let moved_module =
            from_module instanceof ModuleState
                ? from_module
                : this._chains[from_chain].modules[from_module];

        if (to_chain instanceof ChainState) {
            to_chain.insert_module(moved_module, to_module);
        } else {
            this._chains[to_chain].insert_module(moved_module, to_module);
        }

        if (from_chain != to_chain) {
            this._chains[from_chain].update_modules();
            return true;
        }

        return false;
    }

    add_out(module: ModuleState) {
        let new_out = new OutState(this, module, this._outs.length);

        this._outs = [...this._outs, new_out];

        new_out.attach();
    }

    remove_out(out: number | OutState) {
        let index: number;
        if (out instanceof OutState) {
            index = this._outs.findIndex((_out) => _out == out);
        } else {
            index = out;
        }

        let removed_out = this._outs.splice(index, 1)[0];

        this._outs = this._outs.map((out, index) => {
            out.index = index;
            return out;
        });

        removed_out.detach();

        return removed_out;
    }
}

class ChainState {
    static id_counter = 0;
    readonly id = ChainState.id_counter++;
    private _attached = false;
    readonly parent: NetworkState;

    index = $state(-1);
    private _modules = $state<ModuleState[]>([]);

    constructor(network: NetworkState, index: number) {
        this.parent = network;
        this.index = index;

        $effect(() => {
            this._modules.forEach((module, index) => (module.index = index));
        });
    }

    get attached() {
        return this._attached;
    }

    get modules() {
        return this._modules;
    }

    update_modules() {
        this._modules = this._modules;
    }

    attach() {
        let str_repr = `c -n`;

        console.log(str_repr);

        if (true) {
            this._attached = true;
        }
    }

    detach() {
        let c_idx = this.index;

        let str_repr = `c -r ${c_idx}`;

        console.log(str_repr);

        if (true) {
            this._attached = false;
        }
    }

    remove() {
        this.parent.remove_chain(this);
    }

    insert_module(module: ModuleTypes | ModuleState, index?: number) {
        if (index != undefined) {
            if (index > this._modules.length) {
                index = this._modules.length;
            } else if (index < 0) {
                index = 0;
            }
        } else {
            index = this._modules.length;
        }

        let new_module: ModuleState;

        if (module instanceof ModuleState) {
            new_module = module.remove();
            new_module.index = index;
            new_module.parent = this;
        } else {
            new_module = new ModuleState(module, this, index);
        }

        this._modules.splice(index, 0, new_module);

        this._modules = this._modules;

        new_module.attach();

        let target_outs = new_module.parent.parent._detached_outs.filter(
            (out) => out.target_module == new_module
        );

        new_module.parent.parent._detached_outs =
            new_module.parent.parent._detached_outs.filter(
                (out) => out.target_module != new_module
            );

        new_module.parent.parent._outs = [
            ...new_module.parent.parent._outs,
            ...target_outs,
        ].map((out, index) => {
            out.index = index;
            return out;
        });

        target_outs.forEach((out) => out.attach());

        return new_module;
    }

    remove_module(module: number | ModuleState) {
        let removed_module: ModuleState;
        if (module instanceof ModuleState) {
            let _index = this._modules.findIndex(
                (_module) => _module == module
            );

            removed_module = this._modules.splice(_index, 1)[0];

            removed_module.index = _index;
        } else {
            removed_module = this._modules.splice(module, 1)[0];
        }

        let target_outs = removed_module.parent.parent.outs
            .filter((out) => out.target_module == removed_module)
            .map((out) => out.remove());

        removed_module.parent.parent._detached_outs = [
            ...removed_module.parent.parent._detached_outs,
            ...target_outs,
        ];

        this._modules = this._modules;

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

export type ModuleTypes = keyof ModuleTypeMap;

class ModuleState {
    static id_counter = 0;
    readonly id = ModuleState.id_counter++;
    readonly type: keyof ModuleTypeMap;
    private attached = false;
    parent: ChainState;

    // states - -
    index = $state(-1);
    dragged = $state(false);
    minimized = $state(false);
    show_outs_list = $state(false);
    dot_menu_open = $state(false);

    constructor(type: ModuleTypes, parent: ChainState, index: number) {
        this.type = type;
        this.parent = parent;
        this.index = index;
        this.attach();
    }

    // attach / detach - places / lifts up the module from intercom state but doesnt care about the  client state,
    // enables the client state to stay intact and we can optionally go back and forth between mirroring indiviual modules

    attach() {
        if (this.attached) return;
        let chain_index = this.parent.index;
        let module_index = this.index;

        let str_repr = `m -c ${chain_index} -i ${module_index}`;

        console.log(str_repr);

        this.attached = true;
    }

    detach() {
        if (!this.attached) return;
        let chain_index = this.parent.index;
        let module_index = this.index;

        let str_repr = `m -c ${chain_index} -r ${module_index}`;

        console.log(str_repr);

        this.attached = false;
    }

    remove() {
        this.parent.remove_module(this);
        return this;
    }

    add_out() {
        this.parent.parent.add_out(this);
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

    constructor(
        name: string,
        value: number,
        index: number,
        module: ModuleState
    ) {}
}

class OutState {
    static id_counter = 0;
    readonly id = OutState.id_counter++;
    target_module = $state<ModuleState>();
    index = $state(-1);
    attached = false;
    parent: NetworkState;

    constructor(network: NetworkState, module: ModuleState, index: number) {
        this.parent = network;
        this.target_module = module;
        this.index = index;
    }

    remove() {
        return this.parent.remove_out(this);
    }

    attach() {
        if (this.attached) return;
        let c_idx = this.target_module?.parent.index;
        let m_idx = this.target_module?.index;

        let str_repr = `o -n ${"_"}:${"_"}:${c_idx}:${m_idx}:${c_idx}:${m_idx}`;

        console.log(str_repr);

        this.attached = true;
    }

    detach() {
        if (!this.attached) return;
        let o_idx = this.index;

        let str_repr = `o -r ${o_idx}`;

        console.log(str_repr);

        this.attached = false;
    }
}

export { NetworkState, ChainState, ModuleState, OutState };
