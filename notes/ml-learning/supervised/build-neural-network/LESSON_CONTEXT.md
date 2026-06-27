# Lesson context: Build a Neural Network

Use with `../../LESSON_PLAYBOOK.md`, `../../ML_ROADMAP.md`, and
`../../NEURAL-NETWORK-PLAN.md`.

## Role in the tree

First neural-network foundation lesson. It comes before training and before the
applied MLP regression lab.

This page should make the structure of a neural network feel concrete before
introducing gradient descent or backpropagation.

## Current use case

Streaming-title completion prediction for one title, one audience, and one
numeric prediction. This is a stripped-down supervised model, not a complete
end-to-end recommender.

Current visible features:

- audience-title affinity
- title awareness
- tone preference match

The page explains these as compressed behavior signals and names what was
abstracted away: user sequences, item embeddings, device/session context,
availability, household composition, retrieval, exploration, business rules,
and feedback loops.

## Current build path

1. Features → vector
2. One neuron
3. Bias
4. Activation
5. Hidden layer
6. Feedforward

## Current teaching tone

This page now sets the tone benchmark for neural-network foundation lessons.
Future edits should keep the “intimidating object, then demystify it” promise:

- show a formal neural-network diagram early enough that the learner recognizes
  the real object they are trying to understand
- then decode it as symbols for arithmetic, not as biological truth
- use vivid but precise copy: serious enough for the math, generous enough for a
  beginner
- make simplifications explicit: the small vector exists so the mechanism can be
  seen, not because production recommenders are simple
- preserve the Build/Train boundary; this page evaluates a network but does not
  teach learning, loss, gradients, or backpropagation

## Interactive lab

Current lab: “Object. Arithmetic. Algebra.”

The learner moves features and weights, adjusts bias, toggles activation
functions, changes hidden-neuron count, and runs a feedforward pass. The lab
shows the same system as:

- object diagram
- arithmetic
- algebra

Current lab labels and notes:

- left panel: **The diagram**
- right panel: **The numbers**
- readouts: **Individual feature**, **Title as feature vector**, and
  **Network output**
- initial output state: `<undefined>` until a neuron exists
- dynamic **What to notice** card for each build step
- compact **Symbol key** for `x`, `x₁`, `w`, `b`, `z`, and `a`

The core stage-one idea to preserve: the model does not see a title, genre, or
audience. It sees an ordered list of numbers, and the order gives each number
its meaning.

Tone examples to carry forward:

- “weights decide how loudly one feature should speak”
- “bias is the neuron’s learned starting opinion”
- “activation decides what leaves the neuron”
- “a hidden layer repeats the same little ritual several times”
- “feedforward predicts; it does not train”

## Mechanics and vocab to preserve

- feature
- vector
- weight
- bias
- neuron / unit
- activation
- activation function
- ReLU (Rectified Linear Unit)
- sigmoid
- hidden layer
- output layer
- feedforward pass
- parameter

The page should answer “what is this, how does it work, why is it useful” for
each new neural concept.

## Design notes

- Feature labels inside the SVG need deliberate line breaks so they do not
  intersect node circles.
- Stage-one controls should emphasize features before weights appear.
- This page is a conceptual ramp; do not overload it with training mechanics.
- The opening formal diagram should remain crisp and slightly intimidating:
  directed edges with arrowheads, ellipses for omitted nodes, input vector,
  hidden-layer labels, output node, and compact equations.
- If dynamic JavaScript or shared CSS changes, bump the relevant cache key on
  `index.html`.
