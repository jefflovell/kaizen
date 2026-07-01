# Handoff: Support Vector Classification

Use this with:

- `../../ML_ROADMAP.md`
- `../../LESSON_PLAYBOOK.md`
- `../classification/LESSON_CONTEXT.md`

## Lesson role

This lesson follows decision trees in the classifier sequence. It should contrast
tree split paths with margin-based boundary selection.

## Current teaching target

Teach support vector classification as:

1. score an example with a boundary,
2. choose the side of the boundary as the class,
3. keep the widest useful margin around the boundary,
4. identify support vectors as the closest influential examples,
5. use soft-margin tolerance when perfect separation would be brittle.

## Neural-network sequence learnings to preserve

- Mechanism before slogan. Do not call SVC robust without showing the margin and
  the support vectors that constrain it.
- Define `f(x)` as the decision score and `C` as the cost of margin violations.
- Trust comes from distance to the boundary plus the reasonableness of the
  margin, not from a class label alone.
- Be visually honest: this lab is a two-feature linear slice. Kernels are named
  as a next idea, not fully demonstrated here.

## Current implementation

- Page: `index.html`
- Lab script: `support-vector-classification.js`
- Shared production styles: `styles.css` classifier production rules plus SVC
  margin and point styles.

The lab draws a linear boundary, dashed margin lines, support vectors, and a
current part. Sliders move the current part and adjust `C`, while readouts show
decision score, margin distance, support vector count, and trust notes.

## Good next pass

- Add a true kernel comparison panel with a curved boundary.
- Add a violation counter that responds more explicitly to `C`.
- Consider animating the margin widening/narrowing when `C` changes.
