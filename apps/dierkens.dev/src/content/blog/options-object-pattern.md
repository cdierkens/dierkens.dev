---
created: 2024-11-05T14:53
updated: 2024-11-06T18:37
id: 01JBYZ3NX4D6QSDE8RX2PZMAAB
title: The Options Object Pattern
description: The Options Object Pattern is a way to design highly composable function APIs that are open to extension.
---
# The Options Object Pattern

While there are multiple benefits to the **Options Object** pattern, there are some benefits that outweigh others. Composability and extensibility rank a lot higher than discoverability or readability. You're functions need to compose well, and have the ability to grow in a backward compatible way. Those two things keep the refactor goblins away.

But what is the Options Object Pattern?

It's a pattern we use to define a function signature that is stable, yet with the ability to change and handle future use-cases.

It has a couple rules:

1. All required parameters are positional, and come before any optional parameters.
2. The last parameter is plain old object where all properties are optional, and supplying this options object is also optional.

It looks like this:

```ts
function myFunction(foo: string, options?: { bar?: number}): void 
```

Where  `foo` is a required string, `options` is an optional object with an optional `bar` property.

## In the wild

You might already have noticed this pattern in the wild and it's so fetch. No I'm not trying to make that happen, I'm literally talking about [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch), and  [`date-fns`](https://date-fns.org/v4.1.0/docs/formatDistance), and [`react`](https://react.dev/reference/react-dom/client/createRoot), and thousands of other function APIs in the browser, nodejs, and well known libraries.

But why do you see it in so many places?

Because it's flexible enough to handle:

- Graceful Deprecation
- Adding new options
- Partial Application
- Default Values

## Graceful Deprecation

```ts
// Graceful Deprecation

// Let's say v1 looks like this.
interface Options {
  oldName?: string;
}
function fn1(foo: string, { oldName }: Options = {}) {
  console.log(foo, oldName);
}
fn1("hello", { oldName: "world" });
// hello world

// And in v2 we use a better name.
interface Options {
  /**
   * @deprecated since version 2.0, will be removed in version 3.0
   */
  oldName?: string;
  newName?: string;
}

function fn2(foo: string, { oldName, newName = oldName }: Options = {}) {
  console.log(foo, newName);
}
fn2("hello", { oldName: "world" });
// hello world
fn2("hello", { newName: "world" });
// hello world
```

