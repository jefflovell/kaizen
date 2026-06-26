# Lesson context: Gradient Boosting Regression

Use with `../../LESSON_PLAYBOOK.md` and `../../ML_ROADMAP.md`.

## Role in the tree

Second ensemble regression lesson. It represents the “sequential correction”
version of ensembles and should cross-link to random forests.

## Current use case

Home energy forecasting. Boosting starts with a simple baseline, measures the
remaining residuals, and adds small trees that correct what the current model
still gets wrong.

## Current learning loop

1. Start with a baseline.
2. Find what remains wrong.
3. Add a correction tree.

## Interactive lab

Current lab: “Every tree inherits the unfinished work.”

The learner can grow boosting rounds one at a time, tune learning rate `η`
(“eta”), change correction-tree depth, adjust actual demand, and watch baseline,
residuals, forecasts, and training / held-out error recompute.

## Mechanics and vocab to preserve

- baseline
- residual
- weak learner
- correction tree
- learning rate `η` (“eta”)
- boosting round
- training error
- held-out / new-example error
- overfitting

Boosting should feel like iterative kaizen: measure the miss, learn the miss,
add a careful correction.

## Design notes

- Keep the ensemble switch visible:
  - Random Forest
  - Gradient Boosting
- The regression algorithm menu should keep one ensemble card linking to random
  forests for now; boosting is reached through the ensemble switch.
- Good exploratory behavior: higher learning rate and deeper trees can lower
  training error faster while worsening held-out error sooner.
