# Lesson context: Linear Regression

Use with `../../LESSON_PLAYBOOK.md` and `../../ML_ROADMAP.md`.

## Role in the tree

First regression algorithm lesson. It introduces the idea that supervised
regression predicts a number by fitting a relationship between input features
and a numeric target.

## Current use case

GPU resale-price estimation. The lesson converts multiple performance signals
into a gaming performance index, then predicts resale price from that numeric
feature.

This is the “straight line” baseline for the regression path.

## Current learning loop

1. Read examples.
2. Measure error.
3. Fit the line.

## Interactive lab

Current lab: “A price model finds the trend.”

The learner can train one epoch, fit the model, reset the data, and move the
prediction input. The canvas shows GPU performance versus resale price and the
line changing as the model learns.

## Mechanics and vocab to preserve

- `ŷ` (“y-hat”): prediction
- `b₀`: intercept / baseline offset
- coefficient / slope
- feature
- residual / error
- MSE (Mean Squared Error)
- training epoch
- fitted line

The line should be explained as an equation trained to miss by less, not merely
as a visual trend.

## Design notes

- Regression algorithm menu marks this page as lesson 01.
- Backlink should return to the supervised-learning parent.
- Keep the equation cards legible; this page set the expectation that math is
  part of the lesson, not an appendix.
