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

## Interactive lab

Current lab: “Object. Arithmetic. Algebra.”

The learner moves features and weights, adjusts bias, toggles activation
functions, changes hidden-neuron count, and runs a feedforward pass. The lab
shows the same system as:

- object diagram
- arithmetic
- algebra

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
