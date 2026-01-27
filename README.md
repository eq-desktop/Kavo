# Kantara

**Kantara** is a declarative, hierarchical format for defining **modular data and component structures**. It provides a consistent way to describe objects, values, properties, arguments, and nested elements in a format that is **both human-readable and machine-interpretable**.

While Kantara is used internally in **Aureli OS plugins**, it is a **general-purpose format** that can be applied to any system requiring structured, reusable component definitions.

---

## Overview

Kantara organizes information as **parts**, each representing a logical unit or component. Parts are self-contained and can include:

* A name and type
* Arguments or parameters
* An optional value
* Optional metadata properties
* Nested child parts

This makes Kantara ideal for **hierarchical, modular designs** where clarity and extensibility are important.

## Hierarchical Structure

Kantara encourages **tree-like compositions**. Parts can contain child parts, which can themselves have children. This structure allows **modular, reusable, and composable systems**, supporting patterns such as:

```
Root Part
├─ Child Part A
│  ├─ Nested Part A1
│  └─ Nested Part A2
└─ Child Part B
   └─ Nested Part B1
```

- Each node is a **part**
- Each part can define its **value, arguments, properties, and children**
- Hierarchy is flexible and can be arbitrarily deep

---

## Usage Patterns

Kantara can be used for:

1. **UI Components:** Defining panels, widgets, or controls in a modular way
2. **Data Structures:** Representing configuration, state, or system metadata
3. **Reusable Modules:** Sharing and composing parts across different systems
4. **Dynamic Computation:** Arguments and values allow parts to interact or adapt at runtime

> **Note:** Aureli OS plugins are built using Kantara as the underlying component format. A typical plugin defines metadata, configuration, event handlers, and widgets using Kantara’s structured approach. However, Kantara is not limited to Aureli OS plugins—it can be applied wherever modular, hierarchical component definitions are needed.

---

## Conceptual Example

A conceptual representation of a Kantara part tree:

```
Plugin Part
├─ Meta (name, version, author)
├─ Config (defaults, values)
├─ Event Handlers
│  ├─ onLoad
│  └─ onRender
└─ Widgets
   ├─ Widget A
   │  ├─ Meta
   │  └─ Render Logic
   └─ Widget B
       ├─ Meta
       └─ Render Logic
```

Each node is **self-contained** and **flexibly composable**, supporting clear and maintainable systems.

---

## ⚖️ License

This project is released under the APACHE-2.0 License.
You are free to use, modify, and distribute — but all changes must remain open-source.