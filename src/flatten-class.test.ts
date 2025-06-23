import { describe, expect, it } from 'vitest';
import { flatten, unflatten } from './flatten';
import { CLASS_MAPPING_SYMBOL } from './internal';

describe('flatten and unflatten class instances', () => {
  it('should flatten cats when flattenClassInstances is true', () => {
    class Cat {
      constructor(public name: string) {}
      meow() {
        return 'Meow!';
      }
    }
    const cat = new Cat('cutie');
    const flattened = flatten({ cat }, { flattenClassInstances: true });
    expect(flattened).toEqual({ 'cat.name': 'cutie' });
    // No additional properties is added to the flattened object
    expect(
      Object.keys(Object.getOwnPropertyDescriptors(flattened)).length,
    ).toBe(1);

    const unflattened = unflatten(flattened) as any;
    expect(unflattened.cat.name).toEqual('cutie');
  });

  it('should handle nested class instances when flattenClassInstances is true', () => {
    class Owner {
      constructor(public name: string) {}
    }

    class Pet {
      constructor(
        public name: string,
        public owner: Owner,
      ) {}
    }

    const owner = new Owner('John');
    const pet = new Pet('Fluffy', owner);

    const flattened = flatten({ pet }, { flattenClassInstances: true });
    expect(flattened).toEqual({
      'pet.name': 'Fluffy',
      'pet.owner.name': 'John',
    });

    const unflattened = unflatten(flattened) as any;
    expect(unflattened.pet.name).toEqual('Fluffy');
    expect(unflattened.pet.owner.name).toEqual('John');
  });

  it('should flatten and restore class instances when enabled', () => {
    class Cat {
      constructor(public name: string = '') {}
      meow() {
        return 'Meow!';
      }
    }

    const cat = new Cat('cutie');
    const flattened = flatten(
      { cat },
      { flattenClassInstances: true, unflattenToClassInstances: true },
    );
    expect(
      Object.keys(Object.getOwnPropertyDescriptors(flattened)).length,
    ).toBe(1);
    expect((flattened as any)[CLASS_MAPPING_SYMBOL]).toEqual({ cat: Cat });
    expect(flattened).toEqual({ 'cat.name': 'cutie' });

    const unflattened1 = unflatten(flattened) as any;
    expect(unflattened1.cat.name).toEqual('cutie');
    expect(typeof unflattened1.cat.meow).toBe('function');
    expect(unflattened1.cat instanceof Cat).toBe(true);

    const cat2 = new Cat('cutie');
    const flattened2 = flatten({ cat: cat2 }, { flattenClassInstances: true });

    const unflattened2 = unflatten(flattened2) as any;

    expect(unflattened2.cat.name).toEqual('cutie');
    expect(typeof unflattened2.cat.meow).toBe('undefined');
    expect(unflattened2.cat instanceof Cat).toBe(false);
  });

  it('should flatten and restore deeply nested class instance', () => {
    class Cat {
      constructor(public name: string = '') {}
      meow() {
        return 'Meow!';
      }
    }
    class Pet {
      cat?: Cat;
      type() {
        return 'cat';
      }
    }

    const pet = new Pet();
    pet.cat = new Cat('cutie');
    const flattened = flatten(
      { pet },
      { flattenClassInstances: true, unflattenToClassInstances: true },
    );
    expect((flattened as any)[CLASS_MAPPING_SYMBOL]).toEqual({
      pet: Pet,
      'pet.cat': Cat,
    });
    expect(flattened).toEqual({ 'pet.cat.name': 'cutie' });

    const unflattened1 = unflatten(flattened) as any;
    expect(unflattened1.pet.cat.name).toEqual('cutie');
    expect(unflattened1.pet.cat.meow()).toBe('Meow!');
    expect(unflattened1.pet.type()).toBe('cat');
    expect(unflattened1.pet.cat instanceof Cat).toBe(true);

    const pet2 = new Pet();
    pet2.cat = new Cat('cutie');
    const flattened2 = flatten({ pet: pet2 }, { flattenClassInstances: true });
    expect((flattened2 as any)[CLASS_MAPPING_SYMBOL]).toBeUndefined();
    expect(flattened2).toEqual({ 'pet.cat.name': 'cutie' });

    const unflattened2 = unflatten(flattened2) as any;
    expect(unflattened2.pet.cat.name).toEqual('cutie');
    expect(typeof unflattened2.pet.cat.meow).toBe('undefined');
    expect(unflattened2.pet.cat instanceof Cat).toBe(false);
  });

  it('should handle inheritance correctly', () => {
    class Animal {
      constructor(public name: string) {}
    }
    class Dog extends Animal {
      constructor(
        name: string,
        public breed: string,
      ) {
        super(name);
      }
    }

    const dog = new Dog('Buddy', 'Golden Retriever');
    const flattened = flatten(dog, {
      flattenClassInstances: true,
      unflattenToClassInstances: true,
    });
    const unflattened = unflatten(flattened, {
      flattenClassInstances: true,
      unflattenToClassInstances: true,
    });

    expect(unflattened).toBeInstanceOf(Dog);
    expect(unflattened.name).toBe(dog.name);
    expect(unflattened.breed).toBe(dog.breed);
  });

  it('should handle complex circular references with class instances', () => {
    class Node {
      value: string;
      next: Node | null = null;
      prev: Node | null = null;

      constructor(value: string) {
        this.value = value;
      }
    }

    const node1 = new Node('A');
    const node2 = new Node('B');
    const node3 = new Node('C');

    node1.next = node2;
    node2.prev = node1;
    node2.next = node3;
    node3.prev = node2;

    const flattened = flatten(node1, {
      flattenClassInstances: true,
      unflattenToClassInstances: true,
      circularReference: 'symbol',
    });
    const unflattened: any = unflatten(flattened, {
      flattenClassInstances: true,
      unflattenToClassInstances: true,
      circularReference: 'symbol',
    });

    expect(unflattened).toBeInstanceOf(Node);
    expect(unflattened.value).toBe('A');
    expect(unflattened.next).toBeInstanceOf(Node);
    expect(unflattened.next?.value).toBe('B');
    expect(unflattened.next?.next).toBeInstanceOf(Node);
    expect(unflattened.next?.next?.value).toBe('C');
    expect(unflattened.next?.prev).toBe(unflattened);
  });

  it('should throw error when class constructor throw error', () => {
    class Point {
      x: number;
      y: number;
      constructor(coords: { x: number; y: number }) {
        this.x = coords.x;
        this.y = coords.y;
      }
    }

    const point = new Point({ x: 10, y: 20 });
    const flattened = flatten(point, {
      flattenClassInstances: true,
      unflattenToClassInstances: true,
    });
    expect(() =>
      unflatten(flattened, {
        flattenClassInstances: true,
        unflattenToClassInstances: true,
      }),
    ).toThrow();
  });

  it('should not flatten private properties or methods', () => {
    class MyClass {
      public publicProp: string = 'public';
      private _privateProp: string = 'private';

      publicPublicMethod() {
        return 'public method';
      }

      private _privateMethod() {
        return 'private method';
      }
    }

    const instance = new MyClass();
    const flattened = flatten(instance, {
      flattenClassInstances: true,
      unflattenToClassInstances: true,
    });
    const unflattened = unflatten(flattened, {
      flattenClassInstances: true,
      unflattenToClassInstances: true,
    });

    expect(flattened['publicProp']).toBe('public');
    expect(unflattened).toBeInstanceOf(MyClass);
    expect(unflattened.publicPublicMethod()).toBe('public method');

    expect(unflattened.publicProp).toBe('public');
  });

  it('should handle empty class instances', () => {
    class EmptyClass {}
    const instance = new EmptyClass();
    const flattened = flatten(instance, {
      flattenClassInstances: true,
      unflattenToClassInstances: true,
    });
    const unflattened = unflatten(flattened, {
      flattenClassInstances: true,
      unflattenToClassInstances: true,
    });

    expect(unflattened).toEqual({});
  });

  it('should handle class instances with only methods', () => {
    class MethodClass {
      greet() {
        return 'Hello';
      }
    }
    const instance = new MethodClass();
    const flattened = flatten(instance, {
      flattenClassInstances: true,
      unflattenToClassInstances: true,
    });
    const unflattened = unflatten(flattened, {
      flattenClassInstances: true,
      unflattenToClassInstances: true,
    });

    expect(unflattened).toBeInstanceOf(MethodClass);
    expect(unflattened.greet()).toBe('Hello');
  });

  it('should work with strict option enabled', () => {
    class MyData {
      constructor(public data: any) {}
    }
    const instance = new MyData({ a: { b: 1 } });
    const flattened = flatten(instance, {
      flattenClassInstances: true,
      unflattenToClassInstances: true,
      strict: true,
    });
    const unflattened = unflatten(flattened, {
      flattenClassInstances: true,
      unflattenToClassInstances: true,
      strict: true,
    });

    expect(unflattened).toBeInstanceOf(MyData);
    expect(unflattened.data).toEqual(instance.data);
  });
});
