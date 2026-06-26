# Lesson context: Train a Neural Network

Use with `../../LESSON_PLAYBOOK.md`, `../../ML_ROADMAP.md`, and
`../../NEURAL-NETWORK-PLAN.md`.

## Role in the tree

Second neural-network foundation lesson. This page should bridge “we built a
network” and “now the network learns.”

Current page is a lightweight scaffold, not the final lesson.

## Intended teaching frame

The mountain comes next: loss creates the landscape, gradients point downhill,
and gradient descent updates parameters toward lower loss.

Key promise:

> Loss measures the miss, backpropagation assigns responsibility, and gradient
> descent turns those gradients into better parameters.

## Planned mini-labs

- **Residuals:** show actual minus prediction for individual examples.
- **Loss surface:** move a weight and watch error rise or fall.
- **Gradient descent:** step downhill; compare tiny, useful, and oversized
  learning rates.
- **Backpropagation:** highlight responsibility moving backward through edges.
- **Parameters vs hyperparameters:** learned weights and biases versus chosen
  settings like learning rate, epochs, and architecture.
- **Generalization:** compare training loss with held-out/new-example loss.

## Concepts to explain before the lab gets dense

- residual / error
- loss function
- MSE (Mean Squared Error)
- gradient
- gradient descent
- learning rate `η` (“eta”)
- backpropagation
- epoch
- batch
- parameter
- hyperparameter
- training examples vs held-out examples

## Design direction

Build up from neuron to network, and keep the 3Blue1Brown-ish alignment between
object diagram, arithmetic, and algebra.

The user specifically likes the “randomly walks down the mountain to the
valley” mental model for gradient descent, but the lesson should clarify that
gradient descent is guided by slope, not truly random wandering.

## Navigation

Neural-network path:

1. Build
2. Train
3. Apply

This page should link backward to `../build-neural-network/` and forward to
`../mlp-regression/` once the training foundation is strong enough.
