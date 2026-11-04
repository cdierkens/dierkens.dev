---
title: "Unix principles for AI agents"
description: "The Unix philosophy (do one thing well, compose through text) maps almost one-for-one onto the design of AI skills, and onto the audit-to-review pipeline they run."
created: 2026-11-03
updated: 2026-11-03
published: 2026-11-03
tags: ["ai", "agents", "unix"]
---

# Unix principles for AI agents

Doug McIlroy's Unix philosophy has three lines that read less like an operating-system manual and more like advice for anyone building with AI today:

- *Do one thing and do it well.*
- *Expect the output of every program to become the input to another, as yet unknown, program.*
- *Use text as the universal interface.*

I've been building AI **skills** (small, single-purpose agents, each with a description, a procedure, and exactly one artifact it writes), and those three rules turn out to apply almost one-for-one. The mistake I keep seeing is treating an agent as one big prompt that does everything: research, plan, write, review, ship, all in one shot. That's the shell script that grew to ten thousand lines and that nobody can change anymore. The Unix answer is the same today as it was in 1978: build small tools, and compose them.

## A skill is a program, not a prompt

A prompt is a sentence you type. A skill is a small program written in natural language: it has a trigger, a fixed procedure, and a single output artifact it's responsible for. The difference is the same as the difference between a one-liner and a tool in your `bin/` that you can call, test, and replace.

Once a skill has *one* job, it inherits all the nice properties of a small program. It's easy to test in isolation, because it only has one input and one output. It's easy to measure, because you know exactly what it produced. And it's easy to throw away, because nothing else depends on its internals: only on the artifact it emits.

## Text is the pipe

The second rule is the one that makes the whole thing compose. Every skill writes plain Markdown, and every skill reads the plain Markdown the previous one wrote. There's no shared schema, no object model, no framework. The handoff is just "read that file."

This is the "text as universal interface" rule doing the heavy lifting. Because the artifacts are plain text, any skill can consume any other skill's output without knowing anything about it. `audit` writes a findings file. `brainstorm` reads that file. It doesn't need `audit`'s type definitions. It just needs the words on the page.

When you don't have to glue anything, composing two skills is not an integration project. It's two steps in a pipeline.

## The pipeline

The workflow I run is six stages, each its own skill, each handing a single artifact to the next:

1. **Audit**: reads the current state and writes what's actually true right now. Not what we wish were true. Findings, with the evidence for each.
2. **Brainstorm**: reads the audit and writes options. More than one, each with its tradeoffs.
3. **Behavior spec**: reads the chosen option and writes *what should change*, in terms of observable behavior and acceptance criteria. Implementation is deliberately not its job.
4. **Change spec**: reads the behavior spec and writes the *how*: the concrete, discrete changes, broken down into tasks that can be done one at a time.
5. **Write**: reads the change spec and writes the actual change: the code, the document, whatever the artifact is. It follows the spec; it does not revise it. If the spec turns out to be wrong, that's a signal to go back a stage, not to improvise here.
6. **Multi-lens review**: not one reviewer, but several skills, each reading the same artifact from a single angle and writing its own findings.

Each stage takes one input and emits one output. The behavior spec is not the change spec for the same reason the audit is not the brainstorm: because mixing them means you can't test either one, and you can't swap one out when it's not working. And the write is its own stage for the same reason: planning and doing are two different jobs, and a skill that's allowed to rewrite the plan while it executes is no longer a skill you can reason about.

## Review is filters, not a judge

The last stage is the one where the Unix analogy is sharpest. The temptation is one "reviewer" prompt that's supposed to catch everything. Instead, I split review into **lenses** (a skeptic lens, a security lens, a copy-edit lens, whatever the artifact needs), and each lens is its own skill that reads the same file and reports from its own angle.

Each lens is a *filter*: one concern, one pass over the input. You don't write one big review; you compose filters. And because each filter is independent, they can run in parallel, each one's findings don't leak into another's, and a lens that stops being useful gets deleted without touching the rest.

## Why this wins

The payoff of "one job, one artifact" shows up in three places:

- **Replaceability.** When a stage is weak, you fix *that stage*. You don't rewrite the monolith. A brainstorm that produces boring options is one skill to replace, not a pipeline to re-architect.
- **Debugging.** When something goes wrong, the failure is loud and local. The Unix "rule of silence" applies: a skill that succeeds stays quiet, so when the output is bad you already know *which* skill is responsible, because the artifact in the middle is sitting right there for you to read.
- **Measuring.** You can score each stage on its own artifact. If the behavior spec keeps missing acceptance criteria, you can see that in isolation instead of burying it in the final result.

None of this is about operating systems. It's about what composable things look like, and AI skills turn out to have the same shape as good Unix tools: do one thing well, write text, and let the next thing read it.

---

*This is a draft: the stage names, artifact names, and the "human approval only at the gates" detail are placeholders for your actual system. Tell me the real names and I'll slot them in.*
