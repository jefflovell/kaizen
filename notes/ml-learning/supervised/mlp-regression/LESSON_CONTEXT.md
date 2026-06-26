# Lesson context: Multilayer Perceptron Regression

Use with `../../LESSON_PLAYBOOK.md`, `../../ML_ROADMAP.md`, and
`../../NEURAL-NETWORK-PLAN.md`.

## Role in the tree

Applied neural-network regression practicum. This is the third step after:

1. Build a Neural Network
2. Train a Neural Network
3. Apply an MLP

The page is intentionally dense and should rely on the two foundation lessons
to carry basic neural-network concepts before the learner plays with the full
lab.

## Current use case

Streaming-title first-week completion prediction. The network combines title,
audience, timing, and context signals to predict a numeric outcome.

## Current learning loop

1. Pass signals forward.
2. Measure the loss.
3. Send responsibility backward.

## Interactive lab

Current lab: “A prediction travels through the network.”

The learner can adjust features, inspect neurons, run feedforward behavior, and
train examples / epochs. The lab should make nonlinear hidden-layer behavior
visible without drowning the learner before they understand the foundations.

## Mechanics and vocab to preserve

- MLP (Multilayer Perceptron)
- neuron / unit
- layer
- hidden layer
- weight
- bias
- activation
- ReLU (Rectified Linear Unit)
- feedforward pass
- loss
- gradient
- backpropagation
- epoch
- held-out loss
- capacity
- overfitting

## Future update notes

- Revisit this page after `train-neural-network/` is built. It can become more
  focused on applied exploration once loss, gradient descent, and backprop have
  their own interactive foundation.
- Keep the neural roadmap section concise; avoid making the applied MLP page
  carry every future architecture.

## Current pass plan

Now that `build-neural-network/` and `train-neural-network/` exist as
foundation lessons, this page should behave like the applied practicum:

1. Assume the learner can already name the basic parts of the network.
2. Use the lab to explore what an MLP is useful for in practice:
   - nonlinear interactions
   - capacity changes
   - training versus held-out behavior
   - trust limits for unfamiliar feature combinations
3. Keep the page dense, but add better guidance so the learner knows which
   experiment they are currently running.

## Implementation notes for this pass

- Keep the existing one-hidden-layer MLP demo and streaming-title completion
  use case.
- Add an applied workflow section before the lab:
  1. load or create a title profile
  2. choose activation and capacity
  3. train, then compare training and held-out loss
- Add a live coaching panel in the lab that reacts to the current state:
  - activation choice
  - hidden-neuron count
  - epoch count
  - held-out loss gap
  - challenge preset / out-of-distribution state
- Add a compact capacity/generalization readout so the page is less dependent
  on the learner interpreting the chart alone.
- Keep the Train lesson as the place for first principles. Avoid re-explaining
  gradient descent in full here.
- Bump the MLP script and stylesheet cache keys when the page changes.

## Handoff notes for future chat windows

Start with this file, then read:

1. `../../LESSON_PLAYBOOK.md`
2. `../../ML_ROADMAP.md`
3. `../../NEURAL-NETWORK-PLAN.md`
4. `../build-neural-network/LESSON_CONTEXT.md`
5. `../train-neural-network/LESSON_CONTEXT.md`
6. this page's `index.html` and `mlp-regression.js`

Future improvement ideas:

- Add a stronger visual explanation of hidden-neuron specialization after a few
  epochs.
- Let the learner compare two saved title profiles side by side.
- Add a small “why this prediction moved” explanation that ranks feature and
  hidden-neuron contributions.
- Consider a lightweight lesson summary at the end that links MLP regression
  back to the broader neural-network family without expanding into a full hub.
- If a future page introduces embeddings or neural recommenders, keep this page
  as the feedforward MLP bridge rather than turning it into recommender-system
  infrastructure.

Verification expectations:

- Feature sliders update prediction, target, residual, and neuron inspector.
- Mission buttons demonstrate the ReLU interaction story.
- Challenge presets update trust guidance.
- Hidden-neuron count updates parameter count and inspector safely.
- One-example training steps through forward/loss/backprop/apply.
- Epoch training changes training and held-out loss.
- Mobile layout has no horizontal overflow.
