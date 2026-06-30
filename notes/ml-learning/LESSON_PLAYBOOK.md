# ML lesson playbook

Use this file as the low-cost context anchor for future machine-learning notes.
It captures the teaching voice, page conventions, and interaction standards for
the ML section. Use `LESSON-TEMPLATE.md` for the detailed page scaffold.

## Teaching promise

Each lesson should answer three questions:

1. **What is this?** Name the model or concept in plain English before notation.
2. **How does it work?** Show the moving parts, then connect them to equations.
3. **Why is it useful?** Ground the method in a lived, modern use case.

Aim for ELI5-to-ELI16: approachable enough for a curious beginner, but honest
enough that the math and vocabulary are not hand-waved away.

## Voice and pedagogy

- Start with a concrete decision, not an abstract definition.
- Prefer “watch this change” over “trust this explanation.”
- Introduce terms before using them as load-bearing concepts.
- Keep prose tight, vivid, and practical. No textbook fog machine.
- Make the learner feel oriented: “here is the object, here is the arithmetic,
  here is the algebra.”
- When a concept first appears, explain what it is, how it works, and why it
  helps.

### Revision Pattern: Mechanism Before Slogan

When a lesson starts to sound polished but abstract, slow the copy down and
name the mechanism in inspectable terms.

- Define load-bearing terms before using them. For neural networks, explain
  that parameters are learnable internal numbers, and that weights and biases
  are parameters.
- Make agency clear. If the lesson is about training, say that the machine is
  changing parameters from examples; that automatic parameter update is the
  "learning" in machine learning.
- Prefer concrete state changes over pithy summaries. "The update rule changes
  this weight from 0.2000 to 0.2325" teaches more than "gradient descent
  improves the model."
- Keep metaphors accountable to the visual. If the screen shows a 2D heat map,
  call it a map or slice before calling anything a mountain. If you use
  "downhill," explain what moves and what counts as lower.
- Treat user critique as a signal to update context docs, not only page copy,
  when it reveals a repeatable teaching rule.

### Current tone benchmark

The preferred voice is polished but not bloodless: a curious teacher with enough
formal confidence to show the intimidating object first, then enough generosity
to decode it piece by piece.

- Use a serious diagram, equation, or system artifact as a hook when it helps:
  “this looks forbidding; by the end, each piece will have a job you can point
  to.”
- Keep the drama in service of clarity. A phrase like “a city of machinery” is
  welcome when it helps the learner feel why a simplification exists.
- Avoid long pontification. Compress the worldview into a few vivid sentences,
  then return to the mechanism.
- Prefer “the model does not see a title; it sees an ordered list of numbers”
  over vague statements like “the model uses data.”
- Name simplifications explicitly. Small teaching models are not toy because the
  real system is simple; they are small so the mechanism can be seen.
- Separate analogy from reality. Neural-network diagrams are useful symbols for
  reasoning about an abstract machine; they are not how biological neurons work
  or how humans think.

### Applied lesson voice

When a lesson follows a long conceptual sequence, let the page acknowledge the
journey. A short recap can say what the reader already earned, then move into
the applied problem with a little momentum. This is not license for vague hype:
the next paragraph still has to name the concrete mechanism.

- Use emotional continuity to orient the learner, not to replace explanation.
  A memorable line or cultural reference can work when it marks a transition
  from foundation to application.
- After the tonal lift, return immediately to the applied question, the inputs,
  the model choice, and the trust problem the learner will inspect.
- Avoid “marketing copy” claims such as “powerful in combination” unless the
  page says how the combination is represented. For neural nets, that usually
  means hidden neurons combine weighted signals, apply an activation function,
  and pass learned intermediate values forward.
- Write “why this model?” as a tradeoff. A deeper model gives intermediate
  places to combine signals, but the lesson should still ask when that
  flexibility is trustworthy and when it is a liability.
- Let labs feel like instruments. Readouts should be prominent, controls should
  live near the visual system they affect, and animations should reveal order or
  mechanism rather than act as decorative motion.

## Standard lesson shape

1. Problem opener
2. Plain-English model framing
3. What / how / why explanation
4. Interactive lab
5. Mechanics or equation cards
6. Vocabulary cards
7. What to watch / guided experiments
8. Takeaways
9. Parent and sibling navigation

Not every page needs every section at the same weight, but each lesson should
include an interaction, at least one mechanics pass, and a compact vocabulary
section.

## Interaction standard

Every algorithm page should let the learner perturb something and see a model
response. Good controls include:

- changing a feature value
- moving a point or example
- changing a model parameter or hyperparameter
- toggling model choice
- stepping through a training update
- comparing training behavior to new-example behavior

The lab should include short instructions that say what to manipulate and what
to notice. Avoid decorative controls that do not teach a mechanism.

For multi-step labs, pair the visible system with compact guidance that changes
as the learner moves:

- a short “Try it” instruction naming the specific control to move
- a “What to notice” note naming the conceptual change
- a small symbol key when notation appears
- readouts that use precise state language such as `<undefined>`, `z`, `a`,
  prediction, residual, or loss instead of ambiguous placeholders

Avoid generic labels like “view” when a more concrete label exists. Prefer “The
diagram,” “The numbers,” “Individual feature,” “Title as feature vector,” or
“Network output.”

## Math and notation standard

Use equations, but make them searchable and speakable.

- Expand acronyms on first use: `MSE` (Mean Squared Error).
- Spell symbols in human language: `ŷ` (“y-hat”), `η` (“eta”), `λ` (“lambda”).
- Distinguish case when it matters: `σ` (“lowercase sigma”) vs. `Σ` (“capital
  sigma”).
- Explain subscripts: `xᵢ` (“x sub i”) means the value of feature or example
  `i`.
- Tie every equation to visible behavior in the lab.

If the page uses a formula, the implementation should match the formula or
clearly say it is a simplified teaching approximation.

## Vocabulary standard

Use compact vocab cards for terms that become reusable across lessons:

- feature
- vector
- parameter
- hyperparameter
- coefficient / weight
- bias / intercept
- prediction
- residual / error
- loss function
- gradient
- training example
- held-out or new-example behavior

Do not hide essential definitions only in tooltips. Tooltips can reinforce; the
page still needs a visible first explanation.

## Visual and layout conventions

- Keep lab frames visually distinct from explanatory copy.
- Use cards for dense concepts and callouts for “this is the thing to notice.”
- Watch for overflow on equation cards, SVG labels, sliders, and mobile widths.
- Backlinks should move one level up the taxonomy, not skip parents.
- If a shared style changes, bump the relevant CSS cache key on edited pages.

When a lesson opens with a complex formal diagram, make it technically legible
rather than decorative:

- show the real object learners expect to encounter later, even if it looks
  intimidating at first
- include labels for layers, inputs, outputs, weights, and key equations
- use ellipses to imply scale without drawing every node
- then immediately explain that the lesson will decode the symbols one operation
  at a time

## Analogy library

Use varied examples so the section does not become one-note:

- GPU performance and market segmentation
- streaming cold start, catalog retrieval, and recommender signals
- rideshare pickup-time prediction
- first-week title completion or watch behavior
- content fit: audience affinity, awareness, tone, timing, and context

Prefer examples with enough “play” to support sliders, outliers, uncertainty,
or tradeoffs.

## Current neural-network teaching arc

Neural nets are deep enough to deserve a small sequence:

1. **Build a neural network:** features, vectors, weights, bias, activations,
   hidden layers, and feedforward signal flow.
2. **Training a neural network:** loss, residuals, gradients, learning rate,
   gradient descent, backpropagation, epochs, and generalization.
3. **Apply an MLP:** use the full lab to explore nonlinear prediction,
   capacity, and overfitting.

The sequence should build from neuron to network, and from object diagram to
arithmetic to algebra.

For the neural-network sequence, preserve the distinction between:

- **Build:** representation and feedforward evaluation; no learning yet.
- **Training:** loss, gradients, backpropagation, and machine-driven parameter
  updates; this is where the "learning" in machine learning becomes visible.
- **Apply:** capacity, nonlinear fit, generalization, and overfitting.
