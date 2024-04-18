export enum Scopes {
    /**
     * Creates a single instance on the application.
     */
    SINGLETON = 0,

    /**
     * Creates a single instance per container.
     */
    CONTEXT = 1,

    /**
     * Creates a new instance on every injection.
     */
    INSTANCE = 2,

    /**
     * Creates a single instance on the container.
     */
    CONTAINER = 3
}
