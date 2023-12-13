export class MenuState {
    state = $state<"idle" | "picking.module">("idle");
    fn: (...args: any) => void = () => null;

    constructor() {}
}
