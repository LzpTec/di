import test from 'ava';
import { Container } from './src';
import { Scopes } from './src/scopes';

class Singleton{}
class Instance{}
class Context{
    id: number = Math.random();
}

const container = new Container();
container.register(Singleton, undefined, Scopes.SINGLETON);
container.register(Instance, undefined, Scopes.INSTANCE);
container.register(Context, undefined, Scopes.CONTEXT);

test('Container Singleton', async (t) => {
    const instance = container.get(Singleton);

    t.is(instance, container.get(Singleton));

    t.pass();
});

test('Container Instance', async (t) => {
    const instance = container.get(Instance);

    t.not(instance, container.get(Instance));
    t.pass();
});

test('Container Context', async (t) => {
    let instance1, instance2;
    await container.context(() => {
        instance1 = container.get(Context);
    });

    await container.context(() => {
        instance2 = container.get(Context);
        let instance = container.get(Context);

        t.is(instance, instance2);
    })

    t.not(instance1, instance2);
    t.pass();
});