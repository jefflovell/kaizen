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
