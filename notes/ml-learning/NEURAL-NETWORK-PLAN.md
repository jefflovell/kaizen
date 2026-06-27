# Neural network learning plan

Status: living plan. The Build a Neural Network foundation lesson now provides
the tone and interaction pattern for the neural-network sequence.

## Taxonomy decision

Neural networks are a model family, not a type of regression. They can support
classification, regression, ranking, representation learning, generation, and
control.

For the next release, keep the existing **Neural Networks** card in the
supervised regression path and link it to the first applied lesson:

`/notes/ml-learning/supervised/mlp-regression/`

The MLP page should identify itself as the doorway into the broader neural
network family. Do not create empty child pages yet. Show future lessons as
unlinked roadmap cards until each lesson exists.

When a second neural-network lesson is ready, add a family hub:

`/notes/ml-learning/neural-networks/`

That hub can sit beside the learning-regime taxonomy because the architectures
below cross supervised, unsupervised, self-supervised, and reinforcement
learning.

## Proposed neural-network family

1. **Multilayer perceptrons / feedforward networks**
   - The common foundation: neurons, layers, weights, biases, activations,
     forward passes, loss, gradients, and backpropagation.
   - First application: regression.

2. **Embeddings and neural recommenders**
   - Learn useful representations of users and items rather than relying only
     on hand-authored features.
   - Connects directly to the existing k-NN cold-start lesson and modern
     recommendation systems.

3. **Convolutional neural networks**
   - Preserve and exploit spatial locality.
   - Natural applications: images, video frames, audio spectrograms, and other
     grid-like data.

4. **Sequence models: RNNs, GRUs, and LSTMs**
   - Introduce recurrent state and memory across ordered observations.
   - Treat these as an important historical and conceptual bridge, not the
     endpoint of modern sequence modeling.

5. **Attention and transformers**
   - Let elements dynamically decide which other elements matter.
   - Connect sequence modeling to modern language, recommendation, vision, and
     multimodal systems.

6. **Autoencoders and representation learning**
   - Learn compressed internal representations without a traditional labeled
     target.
   - This branch belongs partly under unsupervised or self-supervised learning.

7. **Graph neural networks**
   - Pass information across explicit relationships between users, items,
     accounts, molecules, or other connected entities.
   - Add later if the site expands beyond the current foundational layer.

## First lesson: MLP regression

### Working title

**Multilayer Perceptron Regression**

Plain-language subtitle:

> A network of simple weighted units learns nonlinear interactions that one
> straight line cannot express.

### Applied question

> How much will a newly released streaming title be watched during its first
> week?

This extends the recommendation-system thread without reusing the exact k-NN
cold-start lesson. k-NN asks, “Which existing titles are nearby?” The MLP asks,
“What nonlinear combination of title, audience, timing, and context predicts a
numeric outcome?”

Suggested target:

- First-week watch hours per exposed household, or first-week completion rate.

Suggested input features:

- Audience affinity
- Franchise or talent awareness
- Genre/tone match
- Release timing
- Marketing awareness
- Runtime

Use six visible features at most. State clearly that real systems may ingest
large embeddings and many more contextual signals.

## Learning objectives

By the end of the lesson, a learner should be able to explain:

1. A neuron calculates a weighted sum, adds a bias, and applies an activation.
2. A hidden layer creates intermediate features rather than a final answer.
3. Nonlinear activations allow the network to learn interactions a purely
   linear stack cannot.
4. A forward pass produces a prediction.
5. A loss function measures how wrong the prediction is.
6. Backpropagation assigns responsibility backward through the network.
7. Gradient descent uses those gradients to update weights and biases.
8. Architecture choices and training settings are hyperparameters.
9. Lower training loss does not guarantee better performance on new examples.

## Teaching-tone decision from Build lesson

Carry forward the tone established in `supervised/build-neural-network/`:

- Show the intimidating formal object early, then promise to decode it. The
  learner should feel “I might actually understand this.”
- Use vivid but precise explanations. Examples: “the model sees an ordered list
  of numbers,” “weights decide how loudly a feature should speak,” “bias is a
  learned starting offset,” and “feedforward predicts; it does not train.”
- Keep analogies honest. Neural diagrams are a visual language for abstract
  computation, not a claim about biological neurons or human thought.
- State what has been simplified. In the streaming example, clean feature values
  stand in for messy upstream behavior, embeddings, retrieval, ranking, context,
  and feedback loops.
- Preserve the boundary between building/evaluating a network and training one.
  Build pages may mention training as future work, but should not teach loss,
  gradients, or backpropagation as if they are already happening.

## Interactive lab

### Primary stage: signal flow

Show a compact network:

- 6 input features
- 1 hidden layer with 4 neurons
- 1 numeric output

Connections should visibly encode:

- Sign with color
- Weight magnitude with line thickness or opacity
- Current signal flow with a brief pulse during a forward pass

Clicking a neuron or connection should reveal its current inputs, weight,
bias, pre-activation value, and activation.

### Controls

- Six feature sliders
- Activation toggle: Linear / ReLU
- Hidden-neuron count: 1–6
- Learning rate `η` (“eta”)
- **Run forward pass**
- **Train one example**
- **Train one epoch**
- Reset

Avoid unconstrained manual editing of every weight in the first version. A
single selected connection may be draggable as a focused experiment.

For foundation labs, use the Build lesson’s staged pattern:

1. **The diagram:** the visible object being assembled.
2. **The numbers:** readouts for the individual calculation, vector or matrix
   form, and current output.
3. **What to notice:** a dynamic note that names the conceptual change at the
   current step.
4. **Symbol key:** a compact decoder for notation used in the active lab.

Use precise state language. If no neuron or prediction exists yet, show
`<undefined>` rather than a decorative dash.

### Live outputs

- Predicted first-week outcome `ŷ` (“y-hat”)
- Actual target `y`
- Residual
- Mean Squared Error (MSE)
- Training epoch
- Training and held-out loss

### Guided experiments

1. **Linear stack:** Toggle every activation to linear and show that additional
   layers still collapse into one linear transformation.
2. **Nonlinear interaction:** Turn on ReLU and reveal a learned interaction,
   such as audience affinity mattering more when awareness is also high.
3. **One training step:** Highlight the forward pass, loss, backward
   responsibility signals, and resulting weight updates.
4. **Capacity:** Add neurons and show that greater flexibility can improve fit
   but overfit a small training set.
5. **Learning rate:** Compare cautious learning, productive learning, and
   unstable overshooting.

## Page structure

Follow `LESSON-TEMPLATE.md` with these lesson-specific sections:

1. Problem opener
2. From perceptron to network
3. Three-stage loop: forward pass, measure loss, update backward
4. Interactive lab
5. “What to watch”
6. Mechanics cards
7. Training and generalization
8. Vocabulary
9. Neural-network family roadmap
10. External deep dives

## Mechanics equations

Use scalar notation first, then show the compact vector form as an optional
translation.

### 1. Weighted input

`z = Σ(wᵢxᵢ) + b`

- `z` (“z”): the value before activation
- `Σ` (“capital sigma”): add the following terms
- `wᵢ` (“w sub i”): the weight for input `i`
- `xᵢ` (“x sub i”): input feature `i`
- `b` (“bias”): a learned offset

### 2. Activation

`a = f(z)`

For ReLU:

`ReLU(z) = max(0, z)`

- `a`: neuron activation
- `f`: activation function

### 3. Output prediction

`ŷ = Σ(vⱼaⱼ) + c`

- `ŷ` (“y-hat”): predicted numeric outcome
- `vⱼ` (“v sub j”): output weight from hidden neuron `j`
- `aⱼ` (“a sub j”): activation of hidden neuron `j`
- `c`: output-layer bias

### 4. Loss

`MSE = (1/n) Σ(yᵢ - ŷᵢ)²`

### 5. Update

`w ← w - η(∂L/∂w)`

- `←` (“becomes”): replace the old value with the new value
- `η` (“eta”): learning rate
- `∂L/∂w` (“partial L over partial w”): how sensitive loss is to this weight

Keep the full chain-rule derivation outside the first lesson. Explain
backpropagation as efficient responsibility accounting and link to a deeper
calculus treatment.

## Vocabulary

- Neuron / unit
- Layer
- Input layer
- Hidden layer
- Output layer
- Weight
- Bias
- Weighted sum
- Activation
- Activation function
- ReLU (Rectified Linear Unit)
- Forward pass
- Loss function
- Gradient
- Gradient descent
- Backpropagation
- Epoch
- Batch
- Parameter
- Hyperparameter
- Capacity
- Generalization

## Visualization and external-resource decision

### Recommended first version

Build the interactive MLP lab in vanilla HTML, CSS, Canvas/SVG, and JavaScript.
This preserves the site's dependency-light identity, lets the equations match
the implementation exactly, and keeps the learner inside the lesson.

### 3Blue1Brown

Link prominently to the 3Blue1Brown neural-network series as an optional visual
deep dive:

- Network structure
- Gradient descent
- Backpropagation intuition
- Backpropagation calculus

Do not embed or reproduce its animations in the first version. A video or
third-party interactive embed introduces loading, privacy, responsive, and
licensing considerations while reducing our control over lesson sequencing.
Use a styled external-resource card that opens the original lesson.

### TensorFlow Playground

Link to TensorFlow Playground as an optional open-ended sandbox after the
learner completes the guided lab. It is powerful and open source, but it is
classification-oriented and exposes many controls at once, so embedding it
inside the MLP regression lesson would distract from the lesson's numeric
prediction story.

Its Apache-2.0 source could inform a later advanced sandbox, provided required
license notices and attribution are retained.

### Manim

Use Manim only for authored, pre-rendered explanatory clips when motion adds
real pedagogical value—for example, showing backpropagation responsibility
flowing backward through the graph.

Manim is a Python animation-production tool, not the best runtime for a
dependency-free interactive webpage. Any Manim output should be exported as a
small video or image asset, with the live model still implemented in
JavaScript.

## Recommended delivery phases

### Phase 1: core MLP lesson

- Page prose and taxonomy
- Forward-pass network visualization
- Linear versus ReLU experiment
- Train one example / one epoch
- Loss and validation curves
- Mechanics and vocabulary
- External-resource cards

### Phase 2: deeper training inspection

- Select a connection and inspect its gradient
- Step backward layer by layer
- Batch-size experiment
- More explicit overfitting experiment

### Phase 3: next neural-network lesson

Build **Embeddings and Neural Recommenders** next. It is the strongest bridge
from the existing k-NN cold-start lesson to modern recommendation systems.

Only at this point add the neural-network family hub.

## Decisions to make before implementation

1. Target metric: watch hours per exposed household or completion rate.
2. Whether “Train one epoch” runs a deterministic toy dataset or a seeded
   stochastic mini-batch.
3. Whether the first version includes one hidden layer only or allows a second
   layer as an advanced toggle.
4. Whether external resources open in the same tab or a new tab.

Recommended defaults:

- Completion rate for intuitive 0–100% output
- Deterministic toy dataset for reproducible teaching
- One hidden layer in the main lab
- External resources in a new tab with clear labeling
