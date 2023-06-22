/**
 * @template T
 */
export class ContainerKey<T> {
    #key;
    #description;

    /**
     * 
     * @param {string} description 
     */
    constructor(description: string) {
        this.#key = Symbol();
        this.#description = description;
    }

    get key() {
        return this.#key;
    }

    get description() {
        return this.#description;
    }

    get type() {
        return null as T;
    }
}
