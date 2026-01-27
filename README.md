# Kavo

**Kavo** is a declarative, hierarchical format for defining **modular data and component structures**. It provides a consistent way to describe objects, values, properties, arguments, and nested elements in a format that is **both human-readable and machine-interpretable**.

While Kavo is used internally in **Aureli OS plugins**, it is a **general-purpose format** that can be applied to any system requiring structured, reusable component definitions.

---

## Overview

Kavo organizes information as **parts**, each representing a logical unit or component. Parts are self-contained and can include:

* A name and type
* Arguments or parameters
* An optional value
* Optional metadata properties
* Nested child parts

This makes Kavo ideal for **hierarchical, modular designs** where clarity and extensibility are important.

## Hierarchical Structure

Kavo encourages **tree-like compositions**. Parts can contain child parts, which can themselves have children. This structure allows **modular, reusable, and composable systems**, supporting patterns such as:

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

Kavo can be used for:

1. **UI Components:** Defining panels, widgets, or controls in a modular way
2. **Data Structures:** Representing configuration, state, or system metadata
3. **Reusable Modules:** Sharing and composing parts across different systems
4. **Dynamic Computation:** Arguments and values allow parts to interact or adapt at runtime

> **Note:** Aureli OS plugins are built using Kavo as the underlying component format. A typical plugin defines metadata, configuration, event handlers, and widgets using Kavo’s structured approach. However, Kavo is not limited to Aureli OS plugins—it can be applied wherever modular, hierarchical component definitions are needed.

---

## Conceptual Example

A conceptual representation of a Kavo part tree:

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

## Guide

### Parts

A **part** is the fundamental building block. Every part can have:

* A **name**
* A **kind** (type of part: `object`, `section`, `property`, `function`, `import`)
* Optional **arguments**
* Optional **value**
* Optional **properties**
* Optional **children**

**Syntax Example:**

```kvo
object "RootPart" {
    value: true
    property1: "example"
}
```

* `object "RootPart"` → a named part of kind `object`
* `value` → optional value for the part
* `property1` → a property inside the part

---

### Properties

**Properties** are key-value pairs associated with a part.

**Syntax:**

```kvo
propertyName: "stringValue"
anotherProperty: 42
flagProperty: true
```

* Values can be **strings**, **numbers**, or **booleans**
* Properties can exist inside **any part**

---

### Nested Children

Parts can contain **nested children**, forming a hierarchical tree:

```kvo
section "ParentSection" {
    propertyA: true
    section "ChildSection" {
        propertyB: "value"
    }
}
```

* The root part contains a child section
* Child sections can themselves contain **properties or further nested children**

---

### Sections

**Sections** are parts intended to group related data or parts together:

```kvo
sections "FeatureFlags" flags {
    enableBeta: true
    enableLogging: false
}
```

* `"FeatureFlags"` → flag being a string, useful for namespacing
* `flags` → flag properties
* Sections can contain **properties, subsections, or child parts**

---

### Functions

Functions are **parts representing executable blocks**:

```kvo
literalFunctions(showMessage, times) {
    repeat(times) {
        console.log(showMessage)
    }
}
```

* Arguments are defined in parentheses
* Body is enclosed in `{ ... }`
* Functions can be nested inside parts or sections

---

### Imports

Kavo supports **modularization via imports**:

```kvo
@import "common.kvo"           # inline contents at this location
@import nonfinal "defaults.kvo"  # reference to another file
```

* **Reference import** → `kind: import`, stores only the filename
* **Inline import** → parsed immediately and injected into the current tree

---

### Literals & Values

Parts and properties can store:

* **Strings**: `"Hello World"`
* **Numbers**: `26`
* **Booleans**: `true` / `false`

Example:

```kvo
timeout: 100
message: "Hello"
```

---

### Hierarchical Composition

Kavo encourages **tree-like modular structures**:

```
RootPart
├─ SectionA
│  ├─ Property1
│  └─ ChildSection
└─ SectionB
   └─ Function
```

* Every part can have **children, properties, and arguments**
* Deep hierarchies are fully supported

---

### Comments

Kavo supports comments:

```kvo
// Single-line comment
/* Multi-line
   comment */
```

* Comments are ignored by the parser
* Can appear anywhere in the file

---

## ⚖️ License

This project is released under the APACHE-2.0 License.
You are free to use, modify, and distribute — but all changes must remain open-source.