---
name: sketch
description: Draw a detailed ASCII sketch of what is being worked on. For GUI/UI work, draw a wireframe of the screen or component. For logic, backend, or non-visual work, draw a diagram (flow, sequence, data flow, or component/module map) that outlines the changes. Use when the user asks to sketch, diagram, visualize, or draw the current work.
compatibility: opencode
---

## Usage

- `@sketch` — sketch whatever is currently being worked on, based on conversation context and the working tree changes.
- `@sketch <topic>` — sketch the named feature, file, component, or flow.

## Rules & Boundaries

- **Read-only**: Never modify project files. Output the sketch in the response only, unless the user asks to save it.
- **Ground it in reality**: Use real names (files, components, functions, endpoints, tables) from the conversation or code. Do not invent elements. If something is a guess, mark it `(?)`.
- **Show the change**: Always distinguish new, modified, removed, and unchanged parts using the legend below.
- **Plain ASCII only**: Use `+ - | / \ < > ^ v` and similar characters so it renders in any monospace font. No box-drawing unicode, no emojis inside the diagram.
- **Keep it readable**: Max ~100 columns wide. Split into multiple sketches rather than cramming.
- **Always in a fenced code block** (```text) so alignment is preserved.

## Legend (include when the sketch uses it)

```text
[+] new      [~] modified      [-] removed      (no marker) unchanged
```

## Workflow

1. **Gather context**:
   - Use the conversation first. If it is not enough, check `git status --short` and `git diff HEAD --stat`, and read only the files needed to get names and structure right.
   - Decide the kind of work: **UI** (anything the user sees or interacts with) or **logic** (services, APIs, data, scripts, config, infra). Mixed work gets both sketches.

2. **UI work: draw a wireframe**
   - Draw the screen/component layout with borders, headings, buttons `[ Save ]`, inputs `[____]`, checkboxes `[x]`/`[ ]`, dropdowns `[ Value v ]`, tabs, lists, tables, and icons as `(i)`, `(x)`.
   - Use real labels and copy from the code or discussion.
   - Mark new/modified elements with `[+]`/`[~]` beside them or in a callout.
   - Add numbered callouts `(1)`, `(2)` and a short notes list below for behavior (hover, validation, empty/error/loading states, responsive notes).
   - If states differ materially (empty, loading, error), sketch them side by side or sequentially.

3. **Logic work: draw a diagram that outlines the changes**
   Pick the diagram type that fits best (more than one is fine):
   - **Flow / pipeline**: request or data moving through steps, with branches and error paths.
   - **Sequence**: actors/services as columns, messages as arrows over time.
   - **Component / module map**: boxes for modules with arrows for dependencies or calls.
   - **Data model**: tables/types with fields and relationships.
   - **Before / After**: two diagrams side by side or stacked when the change is a restructure.
   Label arrows with what flows (payload, event, function call). Mark each box with `[+]`, `[~]`, `[-]`.

4. **Add a short key below the sketch**:
   - 3 to 6 bullets: what changes, where (file paths), and any open questions or risks the sketch exposes.

## Example (logic)

```text
 Client --POST /orders--> [~] OrdersController
                              |
                              v
                       [+] OrderValidator ---invalid---> 400 response
                              |valid
                              v
                       [~] OrderService --save--> (OrdersDb)
                              |
                              +--emit OrderCreated--> [+] EmailQueue
```

## Example (UI)

```text
+--------------------------------------------+
| Settings                              [x]  |
+--------------------------------------------+
| Profile | Notifications (1) | Billing      |
+--------------------------------------------+
| [+] Email alerts        [x] On             |
| [+] Frequency      [ Daily v ]             |
|                                            |
|              [ Cancel ]  [ Save ]           |
+--------------------------------------------+
 (1) [+] new tab; Save disabled until changed
```
