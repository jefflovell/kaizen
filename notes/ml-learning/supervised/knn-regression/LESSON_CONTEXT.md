# Lesson context: k-Nearest Neighbors Regression

Use with `../../LESSON_PLAYBOOK.md` and `../../ML_ROADMAP.md`.

## Role in the tree

Regression lesson for local similarity. KNN predicts by finding nearby examples
instead of training a global rule.

## Current use case

Streaming cold start. The model estimates how a new title might perform by
placing it on a simplified content map and averaging outcomes from nearby known
titles.

This connects naturally to recommender systems, but the page should say real
systems use high-dimensional embeddings and many more behavioral signals.

## Current learning loop

1. Describe the new title.
2. Find nearby titles.
3. Average their outcomes.

## Interactive lab

Current lab: “Every new title chooses its own neighborhood.”

The learner can move the new title, change the number of neighbors `k`, reset,
and watch nearest known titles plus the predicted completion outcome change.

The map axes are:

- lighthearted ↔ serious
- slow burn ↔ high energy

Color and point styling should keep the content points noticeable.

## Mechanics and vocab to preserve

- neighbor
- `k`: number of neighbors
- query point
- distance
- Euclidean distance
- embedding
- local average
- cold start

Explain that the 2D map is a teaching simplification of an embedding space that
could have hundreds or thousands of dimensions.

## Design notes

- Avoid graph expansion / white space when `k` changes.
- Keep real content-title examples legally light: titles may be named as factual
  examples, but do not use copyrighted artwork, logos, or protected copy.
