import type { ModuleState } from "./network-state.svelte";

export type NetworkConfig = {
    chains: ChainConfig[];
    outs: OutConfig[];
};

export type ChainConfig = {
    modules: ModuleConfig[];
    inputs?: {
        cv?: PeriphialUnion;
        gate?: PeriphialUnion;
    };
};

export type ModuleConfig = ModuleSigValue;

export type OutConfig = {
    target:
        | {
              chain_index: number;
              module_index: number;
          }
        | ModuleState;
    destination: PeriphialUnion;
};

type ExtractValues<T> = {
    [K in keyof T]: T[K]["value"];
};

export type ModuleSigValue = {
    [T in keyof ModuleTypeSignature]: {
        type: T;
        parameters?: ExtractValues<ModuleTypeSignature[T]>;
    };
}[keyof ModuleTypeSignature];

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

type PeriphialADC = {
    pid: 0;
    channel: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
};

type PeriphialDAC = {
    pid: 1;
    channel: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
};

export type Periphials = {
    adc: PeriphialADC;
    dac: PeriphialDAC;
};

export type PeriphialUnion = Periphials[keyof Periphials];
