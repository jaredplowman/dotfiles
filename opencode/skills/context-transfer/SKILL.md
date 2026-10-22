---
name: context-transfer
description: Packages architectural decisions and high-level context into a compact XML payload for a low-level implementation model within the same session.
license: MIT
compatibility: opencode
---

## What I Do
I format complex, high-level context, constraints, and structural decisions into a dense, token-efficient XML block. This block allows a lower-level implementation model to take over and code without losing the original high-level intent.

## When to Use Me
Use this skill when you (the high-level model) have finished designing a solution, architectural pattern, or refactoring strategy, and are ready to hand off execution to a lower-level implementation model within the same session context.

## Execution Instructions
When the user asks to package or transfer context for the implementation model, generate an output matching the following XML structure exactly. Do not write to external files; output it directly into the chat session.

```xml
<context_transfer>
  <system_architecture>
    <!-- Core architecture, patterns used (e.g., MVVM, Clean Architecture), and structural choices -->
  </system_architecture>
  <technical_stack>
    <!-- Languages, frameworks, and versions (e.g., C#, TS, Vue.js, C++) -->
  </technical_stack>
  <state_and_intent>
    <!-- What has been decided, what problems were solved, and what the current task is -->
  </state_and_intent>
  <constraints_and_boundaries>
    <!-- Invariants, performance criteria, edge cases, or patterns that MUST NOT be used -->
  </constraints_and_boundaries>
  <next_steps>
    <!-- Ordered, concrete implementation instructions for the lower-level model -->
  </next_steps>
</context_transfer>