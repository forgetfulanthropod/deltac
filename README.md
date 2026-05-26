# Δ ⟁ ⟠ ⌂

Delta (by **Rivvr Homes**) is the ultimate tool for transforming the built environment—starting with **Residential** projects.

Delta combines three responsibilities into a single, continuously-updating project system:

- **Scoping**: the app **generates** remodel options for a space and helps the owner **select** the desired outcome.
- **Sourcing**: materials are **automatically sourced** from major distributors; owners can **accept all** to order everything (connect Amazon / Home Depot / etc. when not yet connected).
- **Scheduling**: labor and trades are **automatically scheduled** using lean project management concepts (stories, tasks, point weighting, burndown charts, critical path diagrams) with full editing.

---

## Product overview

Delta has two sides:

- **Residential** (build first): homeowners and workers execute remodel projects with clear progress, transparent sourcing, and predictable schedules.
- **Commercial** (later): expands the same system to multi-unit and enterprise workflows.

The **top-level ontology is Projects** for both personas.

---

## Personas

### Project Owner
- Creates and manages projects
- Selects generated remodel scope options
- Connects purchasing accounts and places consolidated orders
- Approves or edits schedules; monitors progress via burndown + critical path

### Worker
- Creates an account to get jobs
- Joins projects, claims/accepts assigned tasks
- Updates task status and notes from the field
- Provides availability and confirms scheduled work

---

## App structure (Residential)

### 1) Persona selection (first screen)
The first screen asks the user to choose:

- **Project Owner**
- **Worker**

This choice drives the default navigation and permissions model, but both roles operate on **Projects**.

### 2) Projects home
For both personas, the Projects home shows:

- A **90% complete sample project** (preloaded)
- A **“New project”** button

Each Project contains:

- **Stories** (scope units / outcomes)
- **Tasks** (work items) under each Story
- **Assignments** (tasks assigned to workers)
- **Points** (weighting for burndown + capacity planning)

---

## Key experiences

### Sample project (90% complete)
Tapping the sample project demonstrates the core value immediately:

- **Progress animation**: the app animates the flow of progress in the order tasks were completed.
- **Burndown chart**: the chart plays back completion over time, visually “burning down” remaining work.
- **Remaining work**: the remaining Stories and Tasks are listed below the chart.
- **Interaction**: remaining tasks can be checked off to continue the demonstration.

### New project
Creating a new project guides the owner through:

- Project basics (name, address/space type, target timeline)
- Capturing the space (photos / dimensions / notes)
- Generating remodel scope options (scoping)
- Converting chosen scope → Stories + Tasks (scheduling + sourcing hooks)

---

## The three responsibilities in detail

### 1) Scoping (Generate → Select)
Delta generates remodel options for a space. The user selects the remodel they want.

- **Inputs**: photos, rough measurements, constraints, style preferences, budget band
- **Outputs**:
  - remodel options (e.g. “Refresh”, “Mid-scale”, “Full remodel”)
  - each option maps to a structured scope: Stories → Tasks → point estimates
- **Owner actions**:
  - compare options
  - select an option (becomes the active project plan)
  - edit stories/tasks as needed

### 2) Sourcing (Auto-source → Accept all)
For an active scope, Delta auto-sources materials from major online distributors.

- **Auto-sourcing**:
  - recommended SKUs per task/story
  - alternatives and substitutions (in-stock, lead time, price bands)
  - consolidated cart view across vendors
- **Account connections**:
  - “Connect Amazon”
  - “Connect Home Depot”
  - (and other distributors as integrations expand)
- **One-tap ordering**:
  - **Accept all** to order everything required for the plan
  - partial ordering supported (per story, per room, per trade)

### 3) Scheduling (Lean planning → Auto diagrams → Editable)
Scheduling is built on stories, tasks, points, and dependencies.

- **Lean planning primitives**:
  - stories and tasks
  - points (effort/complexity weighting)
  - dependencies (finish-to-start, parallelizable work, blockers)
- **Automatic outputs**:
  - burndown chart (progress over time)
  - critical path diagram (what drives completion date)
  - timeline and trade sequence (who/when/where)
- **Editing**:
  - owners can adjust dates, dependencies, and assignments
  - workers can propose changes and confirm availability

---

## Data model (conceptual)

- **Project**
  - stories[]
  - members (owners, workers)
  - schedule (computed + edited)
  - sourcing (computed carts + order history)
- **Story**
  - tasks[]
  - points (sum of tasks)
  - status
- **Task**
  - assignee (worker)
  - points
  - status (todo / in-progress / done)
  - dependencies
  - materials (auto-sourced recommendations)

---

## Navigation (starter)

- **Persona selection**
  - Owner → Projects home
  - Worker → Projects home
- **Projects home**
  - Sample project (90% complete)
  - Create new project
- **Project detail**
  - Progress playback + burndown
  - Remaining stories + tasks list
  - Scoping / Sourcing / Scheduling sections

---

## Development

### Requirements
- Node.js + npm

### Install

```bash
npm install
```

### Run (Android / iOS / Web)

```bash
npm start
```

Or directly:

```bash
npm run android
npm run ios
npm run web
```

Notes:
- iOS simulator builds require macOS; you can still develop iOS UI/flows using Expo Go on a device.

### Project layout
- `src/app/`: routes and screens (Expo Router)
- `src/components/`: shared UI components
- `src/constants/`: themes and constants

---

## Roadmap (Residential first)

- **MVP**
  - persona selection
  - projects list + sample project playback
  - project detail with stories/tasks checklist
- **Scoping**
  - remodel option generation and selection
  - editable stories/tasks derived from selected option
- **Sourcing**
  - vendor connections + consolidated cart
  - accept-all ordering
- **Scheduling**
  - dependencies + points + worker availability
  - automatic burndown + critical path + editable schedule
