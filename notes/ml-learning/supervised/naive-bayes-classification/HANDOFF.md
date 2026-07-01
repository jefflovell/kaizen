# Handoff: Naive Bayes Classification

Use this with:

- `../../ML_ROADMAP.md`
- `../../LESSON_PLAYBOOK.md`
- `../classification/LESSON_CONTEXT.md`

## Lesson role

This lesson follows k-NN in the classifier sequence. It should contrast local
voting with evidence scoring: Naive Bayes predicts by asking which class makes
the observed features less surprising.

## Current teaching target

Teach Naive Bayes as:

1. start with a class prior `P(y)`,
2. estimate feature likelihoods `P(xᵢ | y)` for each class,
3. combine the likelihoods under the naive independence assumption,
4. choose the class with the larger score,
5. audit correlated clues, sparse history, and smoothing.

## Neural-network sequence learnings to preserve

- Mechanism before slogan. Do not say “evidence stacks up” unless the page
  shows priors and likelihood contributions.
- Define notation before shorthand: `P(y)` is the class prior, `P(xᵢ | y)` is
  the likelihood of feature `xᵢ` if class `y` were true, and `Π` means multiply.
- Trust is earned by representative frequency estimates. A rare or new phrase
  can make likelihood estimates shaky even when smoothing prevents zero scores.
- Keep the independence assumption concrete: correlated clues can cause the
  model to count the same underlying signal more than once.

## Current implementation

- Page: `index.html`
- Lab script: `naive-bayes-classification.js`
- Shared production styles: `styles.css` classifier production rules plus
  Bayes score/evidence bars.

The lab uses log scores so the likelihood products can be shown as additive
evidence bars. It computes spam and not-spam scores, normalizes a spam posterior
for the readout, and updates trust notes for close scores, correlated clues, and
sparse-history warnings.

## Good next pass

- Add an explicit smoothing toggle or “unseen feature” switch.
- Consider showing a tiny frequency table for one feature under spam vs
  not-spam.
- Keep this lesson focused on classification evidence, not text-processing
  pipelines.
