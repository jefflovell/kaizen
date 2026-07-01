# Handoff: Logistic Regression Classification

Use this with:

- `../../ML_ROADMAP.md`
- `../../LESSON_PLAYBOOK.md`
- `../classification/LESSON_CONTEXT.md`

## Lesson role

This is the first classifier sibling after the perceptron foundation. It should
feel like a natural step from “a straight boundary guesses a side” to “a
straight boundary can also produce an inspectable probability.”

## Current teaching target

Teach logistic regression as:

1. a learned linear score `z = w · x + b`,
2. a sigmoid conversion from score to probability,
3. a threshold that turns probability into a class action,
4. a calibration/trust question rather than blind faith in the printed number.

## Neural-network sequence learnings to preserve

- Mechanism before slogan. Do not say “probability makes the model smarter”
  unless the copy explains that sigmoid maps the linear score into `[0, 1]`.
- Define terms before shorthand: `z` is the linear score, `p` is the probability,
  `t` is the threshold, and `ŷ` (“y-hat”) is the predicted class.
- Treat trust as evidence-based. A confident probability is useful only if
  held-out or recent examples show calibration.
- Keep the lab instrument-like: readouts prominent, controls near the chart,
  and motion/state changes tied to the calculation.

## Current implementation

- Page: `index.html`
- Lab script: `logistic-regression.js`
- Shared production styles: `styles.css` under classifier production lab rules.

The lab computes feature-weighted score, sigmoid probability, threshold decision,
margin from cutoff, and a trust note. Presets set meaningful cases, while sliders
let the reader perturb evidence and threshold independently.

## Good next pass

- Add a small calibration strip comparing predicted probability buckets with
  observed held-out frequencies.
- Consider showing the linear boundary in a small two-feature inset once the
  sigmoid chart is stable.
- Keep the page linked from `../classification/` and preserve the sibling next
  nav to k-NN.
