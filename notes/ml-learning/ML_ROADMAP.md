# ML learning roadmap

Use this file as the low-cost taxonomy anchor for the ML notes. It records what
exists, what is planned, and how pages should relate to each other.

## Top-level learning regimes

- **Supervised learning:** examples include inputs and known answers.
- **Unsupervised learning:** examples have no explicit answer; the model looks
  for structure.
- **Semi-supervised learning:** a small labeled set is combined with many
  unlabeled examples.
- **Reinforcement learning:** an agent learns from actions, rewards, and state.

The current build is focused on supervised learning.

On the learning-types overview, treat each top-level regime as a Story ticket.
Supervised learning is currently `IN PROGRESS`; unsupervised,
semi-supervised, and reinforcement learning are `TO DO` roadmap cards. The
unfinished cards should remain visibly present but lightly greyed so they read
as planned work rather than active links.

## Supervised learning taxonomy

Supervised learning splits into two foundational task types:

1. **Classification:** predict a category.
2. **Regression:** predict a number.

Backlinks should preserve this hierarchy:

`algorithm page → supervised task page → supervised learning → learning types`

## Current supervised pages

### Classification

- `supervised/classification/`
  - Purpose: classification family overview.
  - Recommended first algorithm: k-nearest neighbors, because distance and
    local voting are inspectable before introducing a learned update rule.
  - Perceptron remains an optional linear decision-boundary deep dive, with its
    `−1/+1` label convention stated explicitly.
  - Child pages now exist for logistic regression, k-nearest
    neighbors, Naive Bayes, decision trees, support vector classification,
    ensemble classification, and neural-network classification.
  - Each child page has a production lab and handoff doc. The labs make each
    model answer an inspectable question about boundaries, probability, votes,
    likelihoods, margins, aggregation, or hidden representations.

### Regression

- `supervised/linear-regression/`
  - Straight-line numeric prediction.
- `supervised/regularized-linear-models/`
  - Ridge (L2) and Lasso (L1) as one page.
- `supervised/decision-tree-regression/`
  - Rule-based numeric prediction with splits, depth, and overfitting.
- `supervised/knn-regression/`
  - Nearby examples, cold start, and similarity-based prediction.
- `supervised/support-vector-regression/`
  - Error-tolerant margins and support vectors for numeric prediction.
- `supervised/random-forest-regression/`
  - Bagged trees; many imperfect trees voting together.
- `supervised/gradient-boosting-regression/`
  - Sequential trees correcting prior mistakes.
- `supervised/mlp-regression/`
  - Applied neural-network regression lab.

### Neural-network foundations

- `supervised/build-neural-network/`
  - Features, vectors, weights, bias, activations, hidden layer, feedforward.
- `supervised/train-neural-network/`
  - Training lesson: parameters, loss, gradients, gradient descent,
    backpropagation, learning rate, epochs, and generalization.
  - Key teaching point: this is where the machine changes weights and biases
    from examples, which is the "learning" in machine learning.

Neural networks are a model family, not only regression. For now they live
inside the supervised sequence because the existing lessons are supervised. If
the family grows into embeddings, transformers, autoencoders, or generative
models, create a broader neural-network hub.

## Recommended near-term order

1. Audit `knn-classification/` as the classification entry lesson: reduce
   notation load, add guided experiments, and make scaling failure visible.
2. Audit `decision-tree-classification/`: use overlapping or non-monotonic
   regions that visibly reward recursive splits.
3. Audit `logistic-regression/`: label probability contours, the threshold, and
   the decision boundary as separate objects.
4. Audit `naive-bayes-classification/`: make the independence assumption and
   its failure mode inspectable, not merely stated.
5. Audit `support-vector-classification/`: distinguish boundary, margin, and
   support vectors directly on the chart.
6. Audit the ensemble pages: expose disagreement among component models before
   showing the aggregate.
7. Tighten `train-neural-network/`, then revisit `mlp-regression/`; keep
   optimizer choice separate from model definition.
8. Build unsupervised learning only after the supervised spine feels coherent.

## Planned neural-network mini-labs

The training lesson should use small, focused interactions before the all-up MLP
lab. Teach the mechanism before the metaphor: define parameters, weights, bias,
loss, gradients, and learning rate in inspectable language before using compact
phrases like "downhill."

- **Loss map:** show a two-parameter heat map where each point is one setting
  of two weights and color shows loss.
- **Gradient descent:** trace the machine-driven parameter updates across the
  loss map; compare learning rates.
- **Residuals:** show prediction minus actual for individual examples.
- **Backpropagation:** show gradients for weights and bias; avoid leaning on
  "responsibility" until the concrete gradient numbers are visible.
- **Parameters vs. hyperparameters:** weights and biases are learned;
  architecture and learning rate are chosen by the builder.
- **Generalization:** compare training improvement with held-out examples.

Revision lesson from `train-neural-network/`: when copy feels pithy but
self-referential, slow down. Say what the learner can see and name who changes
what. Example: "the machine changes the parameters using the loss signal" is
stronger than "gradient descent changes the parameters" because it connects the
mechanism to machine learning itself.

## Future expansion ideas

- Logistic regression as the natural classification counterpart to linear
  regression.
- Decision-tree classification as a sibling to tree regression.
- Clustering under unsupervised learning.
- Dimensionality reduction and embeddings as a bridge from k-NN to neural
  recommenders.
- Attention and transformers after feedforward networks are no longer arcane.
