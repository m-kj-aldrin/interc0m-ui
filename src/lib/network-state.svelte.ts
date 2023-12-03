import { drag_state } from "./drag-state.svelte";

// TODO - Tree / TreeWalker
// We need a network-tree, so we can walk up and down through chains-modules-outs

const logger = {
    cli: true,
};

function log_cli(msg: string) {
    if (logger.cli) {
        console.log(msg);
    }
}

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

        // TODO - refactor this, get attached outs to specified module
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

    add_out(module: ModuleState, destination: PeriphialUnion) {
        let new_out = new OutState(
            this,
            module,
            this._outs.length,
            destination
        );

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
    private _input: {
        gate: PeriphialUnion | { pid: null; channel: null };
        cv: PeriphialUnion | { pid: null; channel: null };
    };

    index = $state(-1);
    private _modules = $state<ModuleState[]>([]);

    constructor(
        network: NetworkState,
        index: number,
        input?: { gate?: PeriphialUnion; cv?: PeriphialUnion }
    ) {
        this.parent = network;
        this.index = index;

        this._input = {
            gate: {
                pid: null,
                channel: null,
            },
            cv: {
                pid: null,
                channel: null,
            },
            ...input,
        };

        $effect(() => {
            this._modules.forEach((module, index) => (module.index = index));
        });
    }

    set input({ cv, gate }: { gate?: PeriphialUnion; cv?: PeriphialUnion }) {
        this._input = {
            cv: {
                ...this._input.cv,
                ...cv,
            },
            gate: {
                ...this._input.gate,
                ...gate,
            },
        };

        this.edit();
    }

    get input() {
        return this._input;
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

    // TODO - this might be a option inside attach ???
    edit() {
        let cv = `${this._input.cv.pid ?? "_"}:${
            this._input.cv.channel ?? "_"
        }`;

        let gate = `${this._input.gate.pid ?? "_"}:${
            this._input.gate.channel ?? "_"
        }`;

        let modules_str = this.modules
            .map((module) => {
                return module.toString();
            })
            .join(",");

        let str_repr = `c -e ${this.index}:cv${cv},gt${gate}>${modules_str}`;

        log_cli(str_repr);
    }

    attach() {
        let str_repr = `c -n`;

        log_cli(str_repr);

        if (true) {
            this._attached = true;
        }
    }

    detach() {
        let c_idx = this.index;

        let str_repr = `c -r ${c_idx}`;

        log_cli(str_repr);

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

        // TODO - refactor this, get attached outs to specified module
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

        // TODO - refactor this, get attached outs to specified module
        let target_outs = removed_module.parent.parent.outs
            .filter((out) => out.target_module == removed_module)
            .map((out) => out.remove());

        removed_module.parent.parent._detached_outs = [
            ...removed_module.parent.parent._detached_outs,
            ...target_outs,
        ];

        removed_module.detach();

        this._modules = this._modules;

        return removed_module;
    }
}

export type ModuleTypeSignature = {
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
        { name: "hold"; value: 0 | 1 }
    ];
    BCH: [];
    PRO: [];
};

export type ModuleTypes = keyof ModuleTypeSignature;

class ModuleState {
    static id_counter = 0;
    readonly id = ModuleState.id_counter++;
    readonly type: keyof ModuleTypeSignature;
    private attached = false;
    parent: ChainState;
    private _parameters: ParameterState[];

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

        $effect(() => {
            drag_state.drag_available = !this.show_outs_list;
        });
        $effect(() => {
            drag_state.drag_available = !this.dot_menu_open;
        });

        const signature = module_type_signature[type];
        this._parameters = signature.map(
            (struct, index) =>
                new ParameterState(struct.name, struct.value, index, this)
        );
    }

    get parameters() {
        return this._parameters;
    }

    toString() {
        let parameters_str = this._parameters
            .map((parameter) => {
                return `${parameter.value}`;
            })
            .join(":");

        let str_repr = `${this.type}>${parameters_str}`;

        return str_repr;
    }

    // attach / detach - places / lifts up the module from intercom state but doesnt care about the  client state,
    // enables the client state to stay intact and we can optionally go back and forth between mirroring indiviual modules

    attach() {
        if (this.attached) return;
        let chain_index = this.parent.index;
        let module_index = this.index;

        let str_repr = `m -c ${chain_index} -i ${module_index}`;

        log_cli(str_repr);

        this.attached = true;
    }

    detach() {
        if (!this.attached) return;
        let chain_index = this.parent.index;
        let module_index = this.index;

        let str_repr = `m -c ${chain_index} -r ${module_index}`;

        log_cli(str_repr);

        this.attached = false;
    }

    remove() {
        this.parent.remove_module(this);
        return this;
    }

    add_out(destination: PeriphialUnion) {
        this.parent.parent.add_out(this, destination);
    }
}

const module_type_signature: ModuleTypeSignature = {
    PTH: [],
    PRO: [],
    BCH: [],
    LFO: [
        { name: "frequency", value: 0.1 },
        { name: "span", value: 0.5 },
        { name: "phase", value: 0 },
        { name: "offset", value: 0 },
        { name: "wave select", value: 0 },
        { name: "duty cycle", value: 0 },
        { name: "reset", value: 0 },
        { name: "mode", value: 0 },
        { name: "hold", value: 0 },
    ],
};

function debounce(window: number = 25) {
    let timeout_id: number;
    return function (fn: (...args: any) => any) {
        clearTimeout(timeout_id);
        timeout_id = setTimeout(() => {
            fn();
        }, window);
    };
}

type ModulePointer = {
    chain: number | ChainState;
    module: number | ModuleState;
};

export class ParameterState {
    private _value = $state<number | ModuleState>(0);
    index = -1;
    parent: ModuleState;
    name: string;
    private bouncer: ReturnType<typeof debounce>;

    constructor(
        name: string,
        value: number | ModuleState,
        index: number,
        parent: ModuleState
    ) {
        this.name = name;
        this._value = value;
        this.index = index;
        this.parent = parent;
        this.bouncer = debounce();
    }

    get value() {
        return this._value;
    }

    set value(v: number | ModuleState) {
        let c_idx = this.parent.parent.index;
        let m_idx = this.parent.index;

        let _v = `${v}`;

        if (v instanceof ModuleState) {
            _v = `[${v.parent.index}:${v.index}]`;
        }

        this.bouncer(() => {
            let str_repr = `p -m ${c_idx}:${m_idx} -v ${this.index}:${_v}`;

            log_cli(str_repr);
        });

        this._value = v;
    }
}

type PeriphialADC = {
    pid: 0;
    channel: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
};

type PeriphialDAC = {
    pid: 1;
    channel: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
};

type Periphials = {
    adc: PeriphialADC;
    dac: PeriphialDAC;
};

export type PeriphialUnion = Periphials[keyof Periphials];

const perihial_map: Periphials = {
    adc: {
        pid: 0,
        channel: 0,
    },
    dac: {
        pid: 1,
        channel: 0,
    },
};

class OutState {
    static id_counter = 0;
    readonly id = OutState.id_counter++;
    target_module = $state<ModuleState>();
    destination: PeriphialUnion;
    index = $state(-1);
    attached = false;
    parent: NetworkState;

    constructor(
        network: NetworkState,
        module: ModuleState,
        index: number,
        destination: PeriphialUnion
    ) {
        this.parent = network;
        this.target_module = module;
        this.index = index;
        this.destination = destination;
    }

    remove() {
        return this.parent.remove_out(this);
    }

    attach() {
        if (this.attached) return;
        let c_idx = this.target_module?.parent.index;
        let m_idx = this.target_module?.index;

        let { pid, channel } = this.destination;

        let str_repr = `o -n ${pid}:${channel}:${c_idx}:${m_idx}:${c_idx}:${m_idx}`;

        log_cli(str_repr);

        this.attached = true;
    }

    detach() {
        if (!this.attached) return;
        let o_idx = this.index;

        let str_repr = `o -r ${o_idx}`;

        log_cli(str_repr);

        this.attached = false;
    }
}

export { NetworkState, ChainState, ModuleState, OutState };
