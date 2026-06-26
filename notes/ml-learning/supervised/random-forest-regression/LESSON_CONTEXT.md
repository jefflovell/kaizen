# Lesson context: Random Forest Regression

Use with `../../LESSON_PLAYBOOK.md` and `../../ML_ROADMAP.md`.

## Role in the tree

First ensemble regression lesson. It represents the “parallel many trees”
version of ensembles and should link clearly to gradient boosting as the
sequential counterpart.

## Current use case

Home energy forecasting. A forest predicts energy demand by averaging many
trees trained on different bootstrap samples and feature subsets.

## Current learning loop

1. Resample the homes.
2. Vary the questions.
3. Average the forest.

## Interactive lab

Current lab: “One forecast becomes a chorus.”

The learner can change the number of trees, choose an energy scenario, adjust
feature diversity, resample the forest, and drag individual tree votes. The key
lesson is that averaging diverse tree opinions reduces variance but does not
automatically remove shared bias.

## Mechanics and vocab to preserve

- ensemble
- bootstrap sample
- feature subsampling
- random forest
- tree vote
- variance
- bias
- correlation between trees
- forest mean
- `Σ` (“capital sigma”): add tree predictions

## Design notes

- Keep the ensemble switch visible:
  - Random Forest
  - Gradient Boosting
- The regression algorithm menu should keep one ensemble card linking to random
  forests for now; use the on-page ensemble switch to reach boosting.
- Good exploratory behavior: tree count stabilizes the average, diversity makes
  votes less correlated, resampling changes the chorus.
