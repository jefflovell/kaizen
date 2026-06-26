# Lesson context: Regularized Linear Models

Use with `../../LESSON_PLAYBOOK.md` and `../../ML_ROADMAP.md`.

## Role in the tree

Regression lesson for Ridge and Lasso. Keep these together on one page because
they are sibling variations of linear regression that differ mainly in the
penalty they add to the loss.

## Current use case

Streaming-title engagement prediction. Features such as tone match, star power,
franchise, runtime, release timing, and social buzz receive coefficients that
regularization can shrink.

## Current learning loop

1. Fit the signal.
2. Penalize complexity.
3. Validate the balance.

## Interactive lab

Current lab: “One dial changes what the model is willing to remember.”

The learner can switch Ridge (L2) and Lasso (L1), tune `λ` (“lambda”), perturb
feature coefficients, and watch regularized weights, prediction, active
features, training error, and new-example error respond.

Ridge and Lasso explainers should swap based on the selected model rather than
showing both at full height.

## Mechanics and vocab to preserve

- regularization
- Ridge / L2
- Lasso / L1
- `λ` (“lambda”): regularization strength
- coefficient / weight
- penalty
- active feature
- residual
- loss function
- training error vs new-example error
- hyperparameter

L2 means squared coefficient size; L1 means absolute coefficient size. Explain
those as measurement choices, not mysterious labels.

## Design notes

- The lambda glyph should use the page font, not an SVG replacement.
- Keep continuous penalty mini-graphs behind or near the sliders if they improve
  the concept without crowding the lab.
- Avoid overflow at positive and negative coefficient extremes.
