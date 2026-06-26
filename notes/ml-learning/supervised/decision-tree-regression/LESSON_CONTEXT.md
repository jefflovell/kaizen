# Lesson context: Decision Tree Regression

Use with `../../LESSON_PLAYBOOK.md` and `../../ML_ROADMAP.md`.

## Role in the tree

Second regression algorithm lesson. It contrasts with linear regression by
showing a model that asks a sequence of feature-threshold questions instead of
fitting one global line.

## Current use case

GPU market pricing. A decision tree turns the market into price bands by
splitting examples into regions with different average prices.

## Current learning loop

1. Try a threshold.
2. Measure the groups.
3. Split again.

## Interactive lab

Current lab: “A tree turns the market into price bands.”

The learner can grow one split, fit the tree, change depth, and reset. The lab
should make it clear that depth means additional questions / splits, and that
too much depth can overfit.

## Mechanics and vocab to preserve

- split
- threshold
- region / leaf
- depth
- squared error
- greedy search
- overfitting
- prediction as the average target inside a region

Squared error has been intentionally explained because it is an early reusable
loss concept.

## Design notes

- Avoid overlap in the tree diagram when splits are added.
- Keep the ELI5 explanation of overfitting: memorizing noise can make the model
  worse on new examples.
- Regression algorithm menu marks this page as lesson 02.
