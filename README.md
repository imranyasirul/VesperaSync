# VesperaSync — Real-Time CRDT Collaborative Engineering Workspace

VesperaSync is a local-first, zero-conflict collaborative engineering platform powered by **Yjs CRDTs**, **Binary WebSockets**, **IndexedDB offline persistence**, and **Role-Based Access Control (RBAC)**.

---

## Core Architecture & Features

- **Conflict-Free Replicated Data Types (Yjs CRDT):** Deterministic state-vector merging ensures concurrent edits across multiple users never overwrite or corrupt document state.
- **Custom Binary Wire Protocol (`lib0`):** Encodes document sync updates and user awareness states into compact binary `ArrayBuffer` frames—saving up to ~90% bandwidth compared to JSON payloads.
- **Floating Multiplayer Cursors & Presence:** Real-time character-level cursor overlays with per-user color badges and live cursor coordinates.
- **CRDT Local Undo/Redo (`Y.UndoManager`):** Reverts only the current user's local operations without disturbing concurrent edits made by teammates.
- **Offline-First Persistence (`y-indexeddb`):** Stores document state locally in the browser's IndexedDB so users can continue editing offline and merge seamlessly upon reconnection.
- **Workspace RBAC & Security Audit Trail:** Supports `OWNER`, `EDITOR`, and `VIEWER` roles with Prisma-backed audit logging for document creation and team membership changes.
- **Multi-Language Interface & Markdown Export:** Built-in localization switcher and one-click `.md` document export.

---

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide Icons
- **CRDT & Sync Engine:** Yjs, `y-protocols`, `y-indexeddb`, `lib0`, Native WebSockets (`ws`)
- **Backend & Persistence:** PostgreSQL, Prisma ORM, Redis Pub/Sub, JWT Authentication

---

## Local Setup

1. **Start Infrastructure Services:**
   ```bash
   docker-compose up -d