import { AsyncContext, ContextToken } from '@lzptec/ctx';
import { ContainerKey } from './container-key';
import { Scopes } from './scopes';
import type { ClassConstructor, Factory, KeyProvider } from './types';

/**
 * 
 * @template {any} T
 * @param {() => T} fn
 * @returns {() => T} function
 */
function createSingleton<T>(fn: () => T): () => T {
    let cache: T | undefined;
    return () => {
        if (!cache)
            cache = fn();

        return cache;
    };
}

const handlerList: readonly string[] = [
    'apply',
    'construct',
    'defineProperty',
    'deleteProperty',
    'getOwnPropertyDescriptor',
    'getPrototypeOf',
    'has',
    'isExtensible',
    'ownKeys',
    'preventExtensions',
    'setPrototypeOf',

    // reflect-metadata
    'decorate',
    'defineMetadata',
    'getMetadata',
    'hasMetadata',
    'getOwnMetadata',
    'hasOwnMetadata',
    'metadata'
] as const;

export class Container {
    #instances = new Map<any, () => any>();
    #asyncContext = new AsyncContext();
    #parent?: Container;

    static readonly #globalInstances = new Map<any, () => any>();

    constructor(parent?: Container) {
        this.#parent = parent;
    }

    /**
     * 
     * @template T
     * @param {ContainerKey<T> | ClassConstructor<T> | string | symbol} key
     * @param {Factory<T>} factory
     * @param {Scopes} [scope=Scopes.SINGLETON]
     */
    register<T>(key: ContainerKey<T> | string | symbol, factory: Factory<T>, scope?: Scopes): void;

    /**
     * 
     * @template T
     * @param {ContainerKey<T> | ClassConstructor<T> | string | symbol} key
     * @param {Factory<T>} [factory]
     * @param {Scopes} [scope=Scopes.SINGLETON]
     */
    register<T>(key: ClassConstructor<T>, factory?: Factory<T>, scope?: Scopes): void;

    /**
     * 
     * @template T
     * @param {ContainerKey<T> | ClassConstructor<T> | string | symbol} key
     * @param {Factory<T>} [factory]
     * @param {Scopes} [scope=Scopes.SINGLETON]
     */
    register<T>(key: ContainerKey<T> | ClassConstructor<T> | string | symbol, factory?: Factory<T>, scope: Scopes = Scopes.SINGLETON): void {
        if ((key instanceof ContainerKey || typeof key === 'string' || typeof key === 'symbol') && typeof factory !== 'function')
            throw new Error(`ContainerKey, string and symbol requires a factory.`);

        const readKey = key instanceof ContainerKey ? key.key : key;

        if (Container.#globalInstances.has(readKey) || this.#instances.has(readKey)) {
            const keyDescription = this.#getKeyDescription(key);
            throw new Error(`${keyDescription} is already in use`);
        }

        if (typeof readKey === 'string' || typeof readKey === 'symbol') {
            if (typeof factory !== 'function')
                throw new Error('Factory is required!');

            return this.#registerConstant(readKey, factory, scope);
        }

        return this.#registerInstance(readKey, factory, scope)
    }

    /**
     * 
     * @template {any} T
     * @param {ClassConstructor<T> | ContainerKey<T> | string | symbol} key
     * @returns {T} The value stored on the `key`
     */
    get<T>(key: ClassConstructor<T> | ContainerKey<T> | string | symbol): T {
        return this.#makeInstance(() => key, false);
    }

    /**
     * 
     * @template {any} T
     * @param {KeyProvider.<T>} key
     * @returns {T}
     */
    lazy<T>(key: KeyProvider<T>): T {
        return this.#makeInstance(key, true);
    }

    /**
     * Runs a function within a context and returns its return value.
     * The store is not accessible outside of the callback function or
     * the asynchronous operations created within the callback.
     * 
     * @param callback
     * @returns
     */
    context<T>(callback: () => T | Promise<T>) {
        return this.#asyncContext.run(callback);
    }

    #registerInstance<T>(readKey: new (...args: any[]) => T, factory?: Factory<T>, scope?: Scopes) {
        let instance: () => any;

        switch (scope) {
            case Scopes.INSTANCE:
                instance = () => typeof factory === 'function' ? factory(this) : new readKey();
                break;
            case Scopes.CONTEXT:
                const contextKey = new ContextToken<(() => T) | undefined>(() => undefined);

                instance = () => {
                    if (!this.#asyncContext.has(contextKey))
                        this.#asyncContext.set(contextKey, createSingleton(() => typeof factory === 'function' ? factory(this) : new readKey()));

                    const instanceMaker = this.#asyncContext.get(contextKey)!;
                    return instanceMaker();
                };
                break;
            case Scopes.SINGLETON:
                instance = createSingleton(() => typeof factory === 'function' ? factory(this) : new readKey());
                Container.#globalInstances.set(readKey, instance);
                return;
            default:
                instance = createSingleton(() => typeof factory === 'function' ? factory(this) : new readKey());
                break;
        }

        this.#instances.set(readKey, instance);
    }

    #registerConstant<T>(readKey: string | symbol, factory: Factory<T>, scope: Scopes) {
        let instance: () => any;

        switch (scope) {
            case Scopes.INSTANCE:
                instance = () => factory(this);
                break;
            case Scopes.CONTEXT:
                const contextKey = new ContextToken<(() => T) | undefined>(() => undefined);

                instance = () => {
                    if (!this.#asyncContext.has(contextKey))
                        this.#asyncContext.set(contextKey, createSingleton(() => factory(this)));

                    const instanceMaker = this.#asyncContext.get(contextKey)!;
                    return instanceMaker();
                };
                break;
            case Scopes.SINGLETON:
                instance = createSingleton(() => factory(this));
                Container.#globalInstances.set(readKey, instance);
                return;
            default:
                instance = createSingleton(() => factory(this));
                break;
        }

        this.#instances.set(readKey, instance);
    }

    #makeInstance<T>(key: KeyProvider<T>, lazy: boolean) {
        const getInstance = () => {
            const keyValue = key();
            const readKey = keyValue instanceof ContainerKey ? keyValue.key : keyValue;

            let factory: (() => any) | undefined = Container.#globalInstances.get(readKey);
            let container: Container | undefined = this;

            while (!factory && container) {
                factory = container.#instances.get(readKey);
                container = container.#parent;
            }

            if (!factory) {
                const keyDescription = this.#getKeyDescription(keyValue);

                console.error('Key not found');
                console.error(readKey);
                throw new Error(`${keyDescription} is not found, did you call register?`);
            }

            try {
                const obj: any = factory();
                return obj;
            } catch (err) {
                if (err instanceof RangeError)
                    console.error(`Possible circular dependency`, readKey);

                console.error(err);
                throw err;
            }
        };

        if (!lazy)
            return getInstance();

        const handler: Record<string, any> = {
            get: (_: any, key: string | symbol) => {
                const obj = getInstance();
                const value = obj[key];
                return typeof value === 'function' ? value.bind(obj) : value;
            },
            set: (_: any, key: string | symbol, value: any) => {
                const obj = getInstance();
                obj[key] = value;
                return true;
            }
        };

        handlerList
            .forEach((key) => {
                handler[key] = (...args: any[]) => {
                    const obj = getInstance();
                    // @ts-ignore
                    return Reflect[key].apply(null, [obj, ...args.slice(1)]);
                };
            });

        const instance: any = new Proxy({}, handler);
        return instance;
    }

    #getKeyDescription<T>(key: ClassConstructor<T> | ContainerKey<T> | string | symbol) {
        if (key instanceof ContainerKey)
            return key.description;

        if ('name' in (key as any))
            return (key as any).name;

        return key.toString();
    }

}
