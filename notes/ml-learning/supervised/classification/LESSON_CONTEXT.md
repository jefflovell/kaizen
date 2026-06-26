# Lesson context: Classification

Use with `../../LESSON_PLAYBOOK.md` and `../../ML_ROADMAP.md`.

## Role in the tree

Canonical classification task page. The old `../classifiers/` address is a
redirect; do not build new work there.

Classification predicts a category. This page currently teaches the perceptron
as the first classification model and acts as the classification sibling to the
regression path.

## Current use case and model

The lab teaches a perceptron learning a boundary from labeled examples. The
reader should understand that a classifier scores an example, guesses a class,
then updates after mistakes.

## Current learning loop

1. Train on labels.
2. Adjust after mistakes.
3. Predict without labels.

## Interactive lab

Current lab: “A perceptron learns a boundary.”

The interaction should make the decision boundary, misclassified points, and
parameter updates visible. Preserve the feeling that the model is correcting
itself from labeled feedback.

## Mechanics and vocab to preserve

- perceptron
- classifier
- label
- feature
- weight
- bias
- activation / step rule
- learning rate `η` (“eta”)
- prediction
- mistake-driven update

Keep notation speakable and searchable. Continue using equation cards and vocab
cards as the standard evolves.

## Future update notes

- This page is likely due for a pass after neural-network training, especially
  to align card styling and notation language.
- Planned classifier siblings include logistic regression, k-nearest neighbors,
  Naive Bayes, decision trees, support vector classifiers, ensembles, and
  neural networks.
- When classifier child pages arrive, keep this page as the task-family
  overview, not a dumping ground for every model.
