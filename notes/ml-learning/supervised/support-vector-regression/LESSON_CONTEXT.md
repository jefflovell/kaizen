# Lesson context: Support Vector Regression

Use with `../../LESSON_PLAYBOOK.md` and `../../ML_ROADMAP.md`.

## Role in the tree

Regression lesson for margin-based prediction. SVR introduces the idea that
small errors can be treated as “close enough,” while points outside the
tolerance tube become support vectors.

## Current use case

Rideshare pickup-time prediction. The model estimates how long someone waits
for pickup under conditions such as distance and traffic.

Use “pickup” or “arrival” language, not “trip,” because the target is waiting
time before the ride starts.

## Current learning loop

1. Draw a prediction.
2. Allow a margin.
3. Learn from the misses.

## Interactive lab

Current lab: “Close enough is a modeling decision.”

The learner can change `ε` (“epsilon”), penalty `C`, kernel shape, and selected
arrival examples. Points inside the margin are tolerated; unusually fast or slow
arrivals outside the tube pull on the model.

Support vectors should have realistic variability, not all sit exactly on the
tube edge or all on the same side.

## Mechanics and vocab to preserve

- margin / epsilon tube
- `ε` (“epsilon”): tolerated error
- support vector
- penalty `C`
- kernel
- nonlinearity
- transformed feature space
- intercept
- residual / error
- `Lε` (“epsilon-insensitive loss”)

Kernel and nonlinearity are first appearances here, so explain them gently:
kernels let the model behave as if the data were viewed through a different
feature space; nonlinearity means the pattern does not have to be one straight
line.

## Design notes

- Keep equation-card font sizes aligned; the loss card was sensitive to
  oversized and undersized styling.
- Ground intercept in the pickup context: baseline wait when the visible
  feature contribution is zero, not just an abstract axis crossing.
- A price/surge note can exist as a non-interactive callout, but do not confuse
  the primary target of pickup waiting time.
