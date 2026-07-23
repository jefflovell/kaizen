(() => {
  const lessons = [
    {
      id: "linear",
      number: "01",
      title: "Linear Regression",
      description: "Fit an explainable straight-line relationship between features and a number.",
      href: "../linear-regression/",
      linkLabel: "Explore linear regression",
    },
    {
      id: "tree",
      number: "02",
      title: "Decision Trees",
      description: "Split the feature space into regions with different numeric estimates.",
      href: "../decision-tree-regression/",
      linkLabel: "Explore decision trees",
    },
    {
      id: "knn",
      number: "03",
      title: "k-Nearest Neighbors",
      description: "Average the outcomes of nearby examples instead of fitting one global rule.",
      href: "../knn-regression/",
      linkLabel: "Explore k-NN regression",
    },
    {
      id: "regularized",
      number: "04",
      title: "Regularized Linear Models",
      description: "Use Ridge or Lasso penalties to control complexity and overfitting.",
      href: "../regularized-linear-models/",
      linkLabel: "Explore regularized models",
    },
    {
      id: "svr",
      number: "05",
      title: "Support Vector Regression",
      description: "Fit a function that ignores small errors inside a tolerated margin.",
      href: "../support-vector-regression/",
      linkLabel: "Explore support vector regression",
    },
    {
      id: "forest",
      number: "06",
      title: "Random Forest",
      description: "Average many varied regression trees into one steadier tabular forecast.",
      href: "../random-forest-regression/",
      linkLabel: "Explore random forests",
    },
    {
      id: "boosting",
      number: "07",
      title: "Gradient Boosting",
      description: "Build a sequence of small trees that correct the residuals left behind.",
      href: "../gradient-boosting-regression/",
      linkLabel: "Explore gradient boosting",
    },
    {
      id: "neural",
      number: "08",
      title: "Neural Network Regression",
      description: "Learn nonlinear feature interactions through hidden layers and trained weights.",
      href: "../mlp-regression/",
      linkLabel: "Explore neural regression",
    },
  ];

  const cardMarkup = (lesson, currentLesson) => {
    const isCurrent = lesson.id === currentLesson;
    const action = isCurrent
      ? '<span class="algo-card-current" aria-current="page">Current lesson</span>'
      : `<a class="algo-card-link" href="${lesson.href}">${lesson.linkLabel}</a>`;

    return `
      <article class="algo-card${isCurrent ? " is-active" : ""}" data-regression-card="${lesson.id}">
        <span>${lesson.number}</span>
        <h2>${lesson.title}</h2>
        <p>${lesson.description}</p>
        ${action}
      </article>
    `;
  };

  document.querySelectorAll("[data-regression-navigation]").forEach((grid) => {
    const currentLesson = grid.dataset.current;
    grid.innerHTML = lessons.map((lesson) => cardMarkup(lesson, currentLesson)).join("");
  });
})();
