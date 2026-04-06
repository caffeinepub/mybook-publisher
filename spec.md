# MyBook Publisher

## Current State
A full-stack book publishing app (Inkwell) with:
- Dashboard showing a hero banner, stats, and a grid of book cards
- Book CRUD: create, edit, delete, publish books with chapters
- Editor page for writing chapters with drag-to-reorder
- Reader page for reading published books
- Backend in Motoko with Book/Chapter data models

## Requested Changes (Diff)

### Add
- A "Movie Ideas" section below the My Books section on the Dashboard
- Users can add movie idea cards (title + optional notes/pitch)
- Users can delete individual movie ideas
- Ideas are stored in localStorage (frontend-only, no backend change needed)

### Modify
- Dashboard.tsx: add Movie Ideas state management and UI section

### Remove
- Nothing removed

## Implementation Plan
1. In Dashboard.tsx, add localStorage-backed state for movie ideas (array of { id, title, notes })
2. Add a "Movie Ideas" section header with an "Add Idea" button below the books grid
3. Render idea cards in a grid similar to the books grid (but simpler)
4. Add an "Add Movie Idea" dialog with title (required) and notes/pitch (optional) fields
5. Add delete button on each idea card
