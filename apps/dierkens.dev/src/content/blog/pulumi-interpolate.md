---
title: "Pulumi in Python: Translating Interpolation"
description: Pulumi is a powerful tool for managing infrastructure as code, and its flexibility across different languages makes it a popular choice among developers. While Pulumi's TypeScript syntax offers a clean and convenient way to handle Outputs and Inputs`, translating these features to Python can be challenging. This article explores the nuances of using `pulumi.interpolate` in TypeScript and how to achieve similar functionality in Python.
published: 2024-07-17
hero: /blog-placeholder-3.jpg
created: 2024-11-04T10:36
updated: 2024-11-05T15:08
tags:
  - pulumi
  - iac
  - python
  - TypeScript
  - JavaScript
id: 01JBYZ3NX69PS0KJMQDNVB3AMS
---

# Pulumi in Python: Translating Interpolation

Pulumi is a powerful tool for managing infrastructure as code, and its flexibility across different languages makes it a popular choice among developers. While Pulumi's TypeScript syntax offers a clean and convenient way to handle `Outputs` and `Inputs`, translating these features to Python can be challenging. This article explores the nuances of using `pulumi.interpolate` in TypeScript and how to achieve similar functionality in Python.


## Pulumi Interpolate

In the TypeScript syntax of Pulumi, there is a clean approach for concatenating `Outputs`. It leverages tagged template literals, which are not available in Python. As per the [Pulumi reference docs](https://www.pulumi.com/docs/reference/pkg/nodejs/pulumi/pulumi/functions/interpolate.html), `interpolate` is similar to `concat` but is designed to be used as a tagged template expression. For example:

```ts
// 'server' and 'loadBalancer' are both resources that expose [Output] properties.
let val: Output<string> = pulumi.interpolate`http://${server.hostname}:${loadBalancer.port}`;
```

As with `concat`, the 'placeholders' between `${}` can be any Inputs, i.e., they can be `Promise`s, `Output`s, or just plain JavaScript values.

Having done most of my Pulumi work in TypeScript, I frequently used the `pulumi.interpolate` tagged template literal whenever I needed to pass an `Input` into a new resource. Without giving it much thought, I used it extensively without comparing it deeply to `pulumi.concat` or `apply`. However, when I started working with Pulumi in Python and reached for `pulumi.interpolate`, I realized it was missing.

This prompted a deeper dive into understanding what it means to be an `Output` vs. an `Input` and how to translate:

```ts
pulumi.interpolate`http://${server.hostname}:${loadBalancer.port}`;
```

to:

```ts
pulumi.concat("http://", server.hostname, ":", loadBalancer.port);
```

## Output

`Output`s are values from resources that may be populated or will resolve and be populated in the future. Because an `Output` is associated with the resource it comes from, an edge can be created when it's passed as an `Input` to `pulumi.interpolate` or `pulumi.concat`, and later used to create another resource. The dependency graph between resources, created by the `nodes (resources)` and their `edges (Output -> Input)`, allows Pulumi to create resources in the correct order and ensures that `Output`s are populated when needed by the next resource in the graph.

## Input

An input can be a raw value, a promise, or an `Output`. If an `Input` to a resource is an `Output`, then you have a reference to the resource where the `Output` was originally created. The fact that an `Input` can be an `Output` enables it to trace its dependencies.

Here's its type definition:

```ts
type Input<T> = T | Promise<T> | OutputInstance<T>;
```

## Tagged Template Literals in 30 Seconds

Here’s an example of how we could uppercase just the values (the "placeholders" between `${}`), without altering the literal string portion of the template literal:

```js
function uppercaseValues(strings, ...values) {
  const result = [];
  strings.forEach((string, i) => {
    result.push(string);
    if (i < values.length) {
      result.push(values[i].toString().toUpperCase());
    }
  });
  return result.join("");
}

const name = "Chris";
const hobby = "TypeScript";

console.log(uppercaseValues`Hello, my name is ${name} and I love ${hobby}.`);
// Output: "Hello, my name is CHRIS and I love TYPESCRIPT."
```

## Implementing `pulumi.interpolate`

Without knowing the exact source code, and expanding from the example above, we can imagine how to implement `pulumi.interpolate` on our own. It might look something like this:

```js
function interpolate(strings, ...values) {
  const result = [];
  strings.forEach((string, i) => {
    result.push(string);
    if (i < values.length) {
      result.push(values[i]);
    }
  });
  return pulumi.concat(...result);
}
```

All we did was replace the final `join` call with a call to `pulumi.concat`. If this were the implementation, we'd perform checks on whether raw strings need to be unwrapped from `Output` types, instead of operating just on the placeholders, which is what the [real implementation does](https://github.com/pulumi/pulumi/blob/100470d2e72f0c6d16d3cbba661e9509daf43bb8/sdk/nodejs/output.ts#L1072).

Its function definition in TypeScript is:

```ts
function interpolate(
  literals: TemplateStringsArray,
  ...placeholders: Input<any>[]
): Output<string>;
```

which is very similar to `concat`:

```ts
function concat(...params: Input<any>[]): Output<string>;
```

The lightbulb moment comes when you realize that you're really just forwarding along `Output` values and wrapping them in parent `Output`s.

## Back to Python

You can make some silly mistakes when porting `interpolate` over to `concat`. Let’s demonstrate with an example.

In TypeScript, I would have done this:

```ts
function get_image_name(
  imageRegistry: Repository,
  name: string,
  version: Input<string>,
) {
  return pulumi.interpolate`${image_registry.repository_id}/${name}:${version}`;
}
```

When porting to Python, I might end up with this:

```python
def get_image_tag(image_registry: Repository, name: str, version: Input[str]):
	return pulumi.Output.concat(
		image_registry.repository_id,
		f"/{name}:{version}"
	)
```

However, `interpolate` was iterating over every placeholder individually to create dependencies and resolve outputs. With our Python code, we’ve subtly lost that connection with the `version` argument. We need to break up our `Output`s manually and surface them as individual arguments to `pulumi.Output.concat`.

The corrected code would look like this:

```python
def get_image_tag(image_registry: Repository, name: str, version: Input[str]):
	return pulumi.Output.concat(
		image_registry.repository_id,
		f"/{name}:",
		version
	)
```

Now, the version will be correctly included in the dependency graph, and we’ll be error-free!

## Conclusion

Translating `pulumi.interpolate` from TypeScript to Python requires a deeper understanding of how `Outputs` and `Inputs` work in Pulumi. While Python does not support tagged template literals, using `pulumi.concat` effectively allows us to achieve similar functionality. By manually managing dependencies and ensuring all `Output` values are properly handled, we can ensure our Pulumi code in Python is just as robust and efficient as in TypeScript.
