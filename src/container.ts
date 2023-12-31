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

const handlerList: Readonly<string[]> = [
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
];

export class Container {

    #instances = new Map<any, () => any>();
    #asyncContext = new AsyncContext();

    /**
     * 
     * @template T
     * @param {ContainerKey<T> | ClassConstructor<T> | string | symbol} key 
     * @param {Factory<T>} [factory] 
     * @param {Scopes} [scope=Scopes.SINGLETON]
     */
    register<T>(key: ContainerKey<T> | ClassConstructor<T> | string | symbol, factory?: Factory<T>, scope: Scopes = Scopes.SINGLETON): void {
        const readKey = key instanceof ContainerKey ? key.key : key;
        const keyDescription = key instanceof ContainerKey ? key.description : key.toString();

        if (this.#instances.has(readKey))
            throw new Error(`${keyDescription} is already in use`);

        if (typeof readKey === 'string' || typeof readKey === 'symbol') {
            if (typeof factory !== 'function')
                throw new Error('Factory is required!');

            return this.#registerConstant(readKey, factory, scope);
        }

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
            default:
                instance = createSingleton(() => typeof factory === 'function' ? factory(this) : new readKey());
                break;
        }

        this.#instances.set(key, instance);
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
     * 
     * @returns {Container} Snapshot of this container
     */
    snapshot(): Container {
        const container = new Container();
        container.#instances = new Map(this.#instances);
        return container;
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

    #registerConstant<T>(key: ContainerKey<T> | string | symbol, factory: Factory<T>, scope: Scopes) {
        const readKey = key instanceof ContainerKey ? key.key : key;
        const keyDescription = key instanceof ContainerKey ? key.description : key.toString();

        if (this.#instances.has(readKey))
            throw new Error(`${keyDescription} is already in use`);

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
            default:
                instance = createSingleton(() => factory(this));
                break;
        }

        this.#instances.set(readKey, instance);
    }

    #makeInstance<T>(key: KeyProvider<T>, lazy: boolean) {
        const getInstance = () => {
            const keyValue = key();

            const factory = this.#instances.get(keyValue);
            if (!factory) {
                const readKey = keyValue instanceof ContainerKey ? keyValue.key : keyValue;
                const keyDescription = keyValue instanceof ContainerKey ? keyValue.description : keyValue.toString();

                console.error('Key not found');
                console.error(readKey);
                throw new Error(`${keyDescription} is not found, did you call register?`);
            }

            try {
                const obj: any = factory();
                return obj;
            } catch (err) {
                if (err instanceof RangeError)
                    console.error(`Possible circular dependency`, keyValue);

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

}
