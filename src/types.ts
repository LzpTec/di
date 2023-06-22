import type { Container } from "./container";
import type { ContainerKey } from "./container-key";

/**
 * @template {object} T
 * @typedef {new (...args: any[]) => T} ClassConstructor
 */
export type ClassConstructor<T> =  new (...args: any[]) => T;

/**
 * @template {object} T
 * @typedef {(container: Container) => T} Factory
 */
export type Factory<T> = (container: Container) => T;

/**
 * @template {object} T
 * @typedef {() => ClassConstructor<T> | ContainerKey<T> | string | symbol} KeyProvider
 */
export type KeyProvider<T> = () => ClassConstructor<T> | ContainerKey<T> | string | symbol;