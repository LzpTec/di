import test from 'ava';
import { Container, ContainerKey } from '../src';
import { Scopes } from '../src/scopes';

class SingletonTest { }
class InstanceTest { }
class ContextTest { }
class ContainerTest { }

const singletonKey = new ContainerKey<InstanceTest>('instance');

const container = new Container();
const container2 = new Container();

container.register(SingletonTest, undefined, Scopes.SINGLETON);
container.register(InstanceTest, undefined, Scopes.INSTANCE);
container.register(ContextTest, undefined, Scopes.CONTEXT);
container.register(ContainerTest, undefined, Scopes.CONTAINER);
container2.register(ContainerTest, undefined, Scopes.CONTAINER);
container.register(singletonKey, () => new InstanceTest(), Scopes.SINGLETON);

test('Container - Container Scope', async (t) => {
    const instance = container.get(ContainerTest);
    const instance2 = container2.get(ContainerTest);

    t.is(instance, container.get(ContainerTest));
    t.is(instance2, container2.get(ContainerTest))
    t.not(instance, instance2);

    t.pass();
});

test('Container - Singleton Scope', async (t) => {
    const instance = container.get(SingletonTest);
    const instance2 = container2.get(SingletonTest);

    t.is(instance, instance2);

    t.pass();
});

test('Container - Instance Scope', async (t) => {
    const instance = container.get(InstanceTest);

    t.not(instance, container.get(InstanceTest));
    t.pass();
});

test('Container - Context Scope', async (t) => {
    let instance1, instance2;
    await container.context(() => {
        instance1 = container.get(ContextTest);
    });

    await container.context(() => {
        instance2 = container.get(ContextTest);
        let instance = container.get(ContextTest);

        t.is(instance, instance2);
    })

    t.not(instance1, instance2);
    t.pass();
});

test('Container Key', async (t) => {
    const instance = container.get(singletonKey);
    t.is(instance, container.get(singletonKey));

    t.pass();
});
