import { quadInOut } from "svelte/easing";

const easing_functions = {
    linear: (x: number) => x,
};

function interpolate(a: number, b: number, f: number) {
    return a * (1 - f) + b * f;
}

const defauls_opt = {
    easing: "linear",
    tail: 1,
};

export default function (
    value: number,
    duration: number,
    opt: Partial<typeof defauls_opt> = {}
) {
    let state_value = $state(value);
    // console.log("inside bucket", value);

    const target_bucket = new Map<number, number>();
    let bucket_count = 0;

    opt = {
        ...defauls_opt,
        ...opt,
    };

    let easing_function: (x: number) => number = quadInOut;

    /**
     * @param {number} new_value
     */
    function set(new_value: number) {
        if (typeof new_value != "number") return;
        // console.log("inside bucket set", new_value);

        const local_previous_bucket_index = bucket_count - 1;
        const local_bucket_index = bucket_count++;

        let local_value =
            target_bucket.get(local_previous_bucket_index) ?? value;
        target_bucket.set(local_bucket_index, local_value);

        const local_start = performance.now();

        /**@type {Promise<number>} */
        return new Promise((res) => {
            /**@param {number} now */
            function iterate(now: number) {
                const local_elapsed = now - local_start;

                if (local_elapsed > duration) {
                    target_bucket.delete(local_bucket_index - 1);

                    local_value = new_value;

                    if (local_bucket_index == bucket_count - 1) {
                        state_value = local_value;

                        target_bucket.clear();
                        bucket_count = 0;
                        target_bucket.set(bucket_count - 1, new_value);
                    }

                    res(local_bucket_index);
                    return;
                }

                local_value = interpolate(
                    target_bucket?.get(local_previous_bucket_index) ?? value,
                    new_value,
                    easing_function(local_elapsed / duration)
                );

                target_bucket.set(local_bucket_index, local_value);

                if (local_bucket_index == bucket_count - 1) {
                    state_value = local_value;
                }

                requestAnimationFrame(iterate);
            }

            requestAnimationFrame(iterate);
        });
    }

    return {
        // set,
        set value(v: number) {
            set(v);
        },
        get value() {
            // return target_bucket.get(bucket_count - 1) ?? value;
            return state_value;
        },
        // get tail() {
        //   return [...target_bucket.values()].slice(-opt.tail);
        // },
    };
}
