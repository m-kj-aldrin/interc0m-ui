import { drag_state } from "./drag-state.svelte";

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

class NetworkState {
  private _chains = $state<ChainState[]>([]);
  private _outs = $state<OutState[]>([]);

  constructor() {}

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

  private index_outs(index: number) {
    this._outs = this._outs.map((out) => {
      if (out.index > index) {
        out.index -= 1;
      }
      return out;
    });
  }

  add_chain() {
    let new_chain = new ChainState(this);
    new_chain.index = this._chains.length;

    this._chains = [...this._chains, new_chain];

    new_chain.attach();

    return new_chain;
  }

  remove_chain(id: number) {
    let removed_chain = this._chains.find((chain) => chain.id == id);

    if (removed_chain) {
      this._chains = this._chains.filter((chain) => chain != removed_chain);

      let modules = removed_chain.modules;

      let [moved_outs, intact_outs] = this._outs.reduce(
        (acc, out, index) => {
          if (modules.some((m) => m == out.target_module)) {
            acc[0].push(out);
            return acc;
          }

          acc[1].push(out);

          return acc;
        },
        [[], []] as [OutState[], OutState[]]
      );

      intact_outs.forEach((out, index) => (out.index = index));

      moved_outs.forEach((o) => o.dettach());

      removed_chain.dettach();
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

    let moved_module = from_chain.modules.splice(moved_module_index, 1)[0];

    if (from_chain != to_chain) {
      from_chain.index_modules();
    }

    moved_module.dettach();

    to_chain.modules.splice(target_index, 0, moved_module);

    to_chain.index_modules();

    moved_module.attach();

    let [moved_outs, intact_outs] = this._outs.reduce(
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

    intact_outs.forEach((out, index) => (out.index = index));

    moved_outs
      .map((o, index) => {
        o.dettach();
        o.index = intact_outs.length + index;
        return o;
      })
      .forEach((o) => o.attach());

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

    new_out.attach();

    return new_out;
  }

  remove_out(id: number) {
    let removed_out_index = this._outs.findIndex((out) => out.id == id);

    // if (removed_out_index == -1) return;

    let removed_out = this._outs.splice(removed_out_index, 1)[0];

    removed_out.dettach();

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

const network = new NetworkState();

class ChainState {
  static id_counter = 0;
  readonly id = ChainState.id_counter++;
  index = $state(-1);
  attached = false;
  readonly parent_network: NetworkState;

  modules = $state<ModuleState[]>([]);

  constructor(network: NetworkState) {
    this.parent_network = network;
  }

  attach() {
    let str_repr = `c -n`;

    console.log(str_repr);

    if (true) {
      this.attached = true;
    }
  }

  dettach() {
    let c_idx = this.index;

    let str_repr = `c -r ${c_idx}`;

    console.log(str_repr);

    if (true) {
      this.attached = false;
    }
  }

  remove() {
    network.remove_chain(this.id);
  }

  index_modules() {
    this.modules = this.modules.map((module, index) => {
      module.index = index;
      return module;
    });
  }

  add_module(type: keyof ModuleTypeMap | (keyof ModuleTypeMap)[]) {
    let new_module = Array.isArray(type)
      ? type.map((t, i) => new ModuleState(t, this, this.modules.length + i))
      : [new ModuleState(type, this, this.modules.length)];

    this.modules = [...this.modules, ...new_module];

    new_module.forEach((module) => module.attach());

    return new_module;
  }

  remove_module(id: number) {
    let removed_module_index = this.modules.findIndex(
      (module) => module.id == id
    );

    if (removed_module_index == -1) return;

    let removed_module = this.modules.splice(removed_module_index, 1)[0];

    let network = this.parent_network;

    let [moved_outs, intact_outs] = network._outs.reduce(
      (acc, out, index) => {
        if (out.target_module == removed_module) {
          acc[0].push(out);
          return acc;
        }

        acc[1].push(out);

        return acc;
      },
      [[], []] as [OutState[], OutState[]]
    );

    if (moved_outs.length) {
      let removed_out_inddices = moved_outs.map((out) => out.index);
      let removed_outs_str = removed_out_inddices
        .map((out) => {
          let str = `o -r ${out}`;
          return str;
        })
        .join("\n");

      console.log(removed_outs_str);
    }

    intact_outs.forEach((out, index) => (out.index = index));

    removed_module.dettach();

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
  readonly type: keyof ModuleTypeMap;
  parent_chain: ChainState | null = null;
  index = -1;
  show_outs_list = $state(false);
  minimized = $state(false);
  dragged = $state(false);
  dot_menu_open = $state(false);
  attached = false;

  parameters = $state<ParameterState[]>([]);

  constructor(
    type: keyof ModuleTypeMap,
    parent_chain: ChainState,
    index: number
  ) {
    this.type = type;
    this.parent_chain = parent_chain;
    this.index = index;

    this.parameters = module_type_map[type].map((struct, index) => {
      let param = new ParameterState(struct.name, struct.value, index, this);
      return param;
    });
  }

  attach() {
    let c_idx = this.parent_chain?.index;
    let m_idx = this.index;
    let parameters_str = this.parameters
      .map((parameter) => parameter.toString())
      .join(":");

    let str_repr = `m -c ${c_idx} -i ${m_idx} ${this.type}${parameters_str}`;

    console.log(str_repr);

    if (true) {
      this.attached = true;
    }
  }

  dettach() {
    let c_idx = this.parent_chain?.index;
    let m_idx = this.index;

    let str_repr = `m -c ${c_idx} -r ${m_idx}`;

    console.log(str_repr);

    if (true) {
      this.attached = false;
    }
  }

  remove() {
    this.parent_chain?.remove_module(this.id);
    this.dettach();
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
  readonly name: string;
  readonly parent_module: ModuleState;
  readonly index: number;
  private bouncer: ReturnType<typeof debounce>;
  //   private attached: boolean = false;

  constructor(name: string, value: number, index: number, module: ModuleState) {
    this.name = name;
    this.value = value;
    this.index = index;
    this.parent_module = module;
    this.bouncer = debounce();
    // this.signal_intercom();
  }

  toString() {
    let str_rep = `${+this.value}`;
    return str_rep;
  }

  signal_intercom() {
    let c_idx = this.parent_module.parent_chain?.index;
    let m_idx = this.parent_module.index;
    this.bouncer(() => {
      console.log(`p -m ${c_idx}:${m_idx} -p ${this.index}:${this.value}`);
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
  attached = false;

  constructor(destination: Omit<OutDestination, "cv">) {
    this.destination = { cv: { pid: null, channel: null }, ...destination };
  }

  attach() {
    let gate = this.destination.gate;
    let c_idx = this.target_module?.parent_chain?.index;
    let m_idx = this.target_module?.index;

    let target_str = `${c_idx}:${m_idx}:${c_idx}:${m_idx}`;

    let str_repr = `o -n ${gate.pid}:${gate.channel}:${target_str}`;

    console.log(str_repr);
  }

  dettach() {
    let str_repr = `o -r ${this.index}`;

    console.log(str_repr);
  }

  remove() {
    return network.remove_out(this.id);
  }
}

export { network };
export { NetworkState, ChainState, ModuleState, OutState };
