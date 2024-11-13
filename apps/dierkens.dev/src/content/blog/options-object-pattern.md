---
created: 2024-11-05T14:53
updated: 2024-11-13T13:56
id: 01JBYZ3NX4D6QSDE8RX2PZMAAB
title: The Options Object Pattern
description: The Options Object Pattern is a way to design highly composable function APIs that are open to extension.
---

# The Options Object Pattern

While there are multiple benefits to the **Options Object** pattern, there are some benefits that outweigh others. Composability and extensibility rank a lot higher than discoverability or readability. You're functions need to compose well, and have the ability to grow or shrink in a backward compatible way. Those two things keep the refactor goblins away.

But what is the Options Object Pattern?

It's a pattern we use to define a function signature that is stable, yet with the ability to change and handle future use-cases.

It has a couple rules:

1. All required parameters are positional, and come before any optional parameters.
2. The last parameter is plain old object where all properties are optional, and supplying this options object is also optional.

It looks like this:

```ts
function myFunction(foo: string, options?: { bar?: number }): void;
```

Where `foo` is a required string, `options` is an optional object with an optional `bar` property.

## In the wild

You might already have noticed this pattern in the wild and it's so fetch. No I'm not trying to make that happen, I'm literally talking about [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch), and [`date-fns`](https://date-fns.org/v4.1.0/docs/formatDistance), and [`react`](https://react.dev/reference/react-dom/client/createRoot), and thousands of other function APIs in the browser, nodejs, and well known libraries.

But why do you see it in so many places?

It turns out, it solves a lot of problems that multiple arguments introduce.

## Holes, so many holes

When you use multiple primitive arguments, everything is honkey dory until you have multiple optional arguments. Have you ever written `JSON.stringify(data, null, 2)`? Do you even know what the second argument is!? Turns out it's a [replacer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#replacer) array or function that allows you to manipulate the transformation of the data to a string. Pretty neat if you want allow-list some keys to keep from leaking sensitive data right? But lets be honest, you're using [Zod](https://zod.dev/) to [parse not validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) your responses from your API endpoints already. But why do we have to pass `null` in as the second parameter? Because we only want to supply a value to the `space` argument, and don't need a `replacer`.

But you, as the almighty API decision maker have to make a choice when you use multiple optional arguments like in the case with `JSON.stringify`. You have to make the choice of what argument will be used the most. Had the original implementers decided that the `space` option had far more usage than the `replacer` function, you would be able to type `JSON.stringify(data, 2)`. How would we even make that decision? One (the `replacer`) cares about the data, while the other (`space`) cares about presentation. In this case, there are only 2 optional arguments, and it's likely pretty stable. But what about other popular apis. What if the `fetch` API looked like this?

```js
function fetch(url, body, headers, method)
```

Now, I have to supply something in the `body` parameter position whenever I want to set headers for a `GET` request

```js
fetch("http://example.com", undefined, { "x-custom-header": "foo" });
```

or `headers` when I need to set the `method` to anything other than the default `GET`.

```js
fetch("http://example.com", { foo: "bar" }, undefined, "POST");
```

Your invocations start looking Holy, no wait, I mean they have holes. Namely they have holes in the form of `undefined`, `null`, or some other token. Which is okay in small doses, but when there are functions with 15 optional arguments to pass in like `fetch`, that would quickly lead to hard to diagnose bugs. And what happens if you need to add another optional parameter to the function signature?

## Unused option? That's a major problem.

When we add an optional parameter to an existing function that uses multiple arguments we can always add to the end to keep backward compatibility like this:

```diff
+ function myFunction(foo: string, bar?: number, baz?: boolean): void;
- function myFunction(foo: string, bar?: number): void;
```

These two signatures are compatible at the [semver](https://semver.org/) major level. If you're fine with always adding to the end of the parameters list, or there are only a couple arguments and the API is stable , it's really not that big of a deal. If you are working on a fast paced team however, and the API needs room to grow and change before it becomes stable, the intent that you codify into your function signature is important. When you design a function without an options argument, the order of the parameters in the signature can only have intent codified when the function is created. Every new option added after the fact is arbitrarily placed at the end. Lets do a little thought exercise. Is `singals` in this list?

```js
[
  "referrerPolicy",
  "keepalive",
  "credentials",
  "browsingTopics",
  "headers",
  "method",
  "body",
  "cache",
  "attributionReporting",
  "signal",
  "integrity",
  "redirect",
  "referrer",
  "mode",
  "priority",
];
```

How about this one?

```js
[
  "attributionReporting",
  "body",
  "browsingTopics",
  "cache",
  "credentials",
  "headers",
  "integrity",
  "keepalive",
  "method",
  "mode",
  "priority",
  "redirect",
  "referrer",
  "referrerPolicy",
  "signal",
];
```

The answer is no for both. There is an entry called `signal` in both lists, but no `signals` entry. For me it's easier on my [cognitive load](https://dev.to/abbeyperini/cognitive-load-and-your-development-environment-2nc3) to scan an alphabetize list to find that there is one entry that starts with s, and notice that is not the plural form of `signal`. This might feel like a micro-optimization, but developers spend a large majority of their time performing maintenance and updates to existing code ([The Developer Coefficient](https://stripe.com/newsroom/stories/developer-coefficient)).

And what if we want to deprecate a parameter that is is no longer used in functions code? Just change it to an `_` right?

```diff
+ function myFunction(foo: string, bar?: number, baz?: boolean): void;
- function myFunction(foo: string, _?: number, baz?: boolean): void;
```

Overtime I've seen these unused properties grow in numbers and pollute the codebase.

With the optional object pattern the same much more precise.

```diff
+ function myFunction(foo: string, options?: { bar?: number }): void;
- function myFunction(foo: string, options?: { bar?: number, baz?: boolean }): void;
```

The parameter can safely be removed if it's unused, it no longer pollutes the function signature, and we keep our function signature short and readable.


## Composability, yeah I'm partial to that.

This section will demonstrate how the options object pattern is more composable, especially in cases where you can partially apply required params.

## Coding to an Interface

This section will demonstrate how the options interface can be shared across functions, which enhances composability and extensibility.

## ~~Readability~~ Discoverability

This section will demonstrate how the pattern improves the discoverability in your code base by leveraging those options interfaces to keep naming consistent across functions.

## Conclusion