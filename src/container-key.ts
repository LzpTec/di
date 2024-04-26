/**
 * @template T
 */
export class ContainerKey<T> {
    #description;

    /**
     * 
     * @param {string} description
     */
    constructor(description: string) {
        this.#description = description;
    }

    get description() {
        return this.#description;
    }

    get type() {
        return null as T;
    }
}
