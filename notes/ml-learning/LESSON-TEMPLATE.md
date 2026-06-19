# Interactive ML lesson standard

Use this structure for foundational algorithm lessons.

## 1. Start with the problem

- Open with a concrete question or real-world decision.
- Explain what the algorithm contributes before introducing notation.
- State whether the lesson predicts a category, number, ranking, action, or representation.

## 2. Show the learning loop

Summarize the algorithm in three plain-language stages. These stages should align with the interactive controls and the mechanics equations later on the page.

## 3. Make it interactive

- Let readers manipulate the examples, model, or model choice.
- Show live state such as prediction, error, neighbors, depth, accuracy, or coefficients.
- Include a short “What to watch” list that directs attention to meaningful changes.

## 4. Explain how it is built

Add a three-card `mechanics-section`:

1. Calculate or represent the input.
2. Make or evaluate the model decision.
3. Train, update, select, or aggregate the result.

Each card must include:

- The actual equation or rule used by the demonstration.
- A plain-English explanation tied to visible behavior.
- Definitions for every symbol introduced.

### Notation accessibility rule

On first use, write the symbol, how it is spoken, and what it means.

- `ŷ` (“y-hat”): the predicted value.
- `η` (“eta”): the learning rate.
- `μ` (“mu”): a population mean.
- `σ` (“lowercase sigma”): commonly a standard deviation.
- `Σ` (“capital sigma”): a summation, or instruction to add a sequence of values.
- `xᵢ` or `x_i` (“x sub i”): the value named `x` for example or position `i`.
- `x²` (“x squared”): `x` multiplied by itself.
- `MSE` (Mean Squared Error): the average squared prediction error.

Do not assume a reader can pronounce, type, or search for mathematical notation. Expand acronyms on first use and distinguish uppercase from lowercase Greek letters when their meanings differ.

## 5. Preserve the vocabulary

Add a compact `terms-section` containing the model-specific terms a reader should remember. Prefer concise cards over long prose, but do not hide foundational definitions exclusively in tooltips.

Tooltips may later reinforce notation or provide reminders. They should not be the only source of an essential definition.

## 6. Validate the lesson

- Confirm equations match the running implementation.
- Confirm mechanics language matches what the interactive visualization displays.
- Test the primary interaction and its visible state change.
- Check desktop and mobile layouts for overflow, clipping, and unreadable notation.
- Bump the shared stylesheet cache key when introducing shared lesson styles.
