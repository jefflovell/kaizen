(() => {
  const release = {
    status: "DEPLOYED TO PROD",
    statusClass: "status-prod",
    version: "v1.2.0 - Lee Ramsey",
  };

  const lessons = [
    {
      id: "knn",
      number: "01",
      title: "k-Nearest Neighbors",
      status: "START HERE",
      statusClass: "status-stage",
      description: "Find nearby labeled examples and let the local neighborhood vote.",
      href: "../knn-classification/",
      linkLabel: "Explore k-NN",
    },
    {
      id: "tree",
      number: "02",
      title: "Decision Trees",
      status: "IN PROGRESS",
      statusClass: "status-progress",
      description: "Ask a sequence of feature questions until an example lands in a labeled leaf.",
      href: "../decision-tree-classification/",
      linkLabel: "Explore decision trees",
    },
    {
      id: "perceptron",
      number: "03",
      title: "Perceptron",
      subtitle: "Linear classifier",
      status: "BOUNDARY LAB",
      statusClass: "status-stage",
      description: "Score a point, guess a side, and move a straight boundary only when the guess is wrong.",
      href: "../classification/#classification-lab-title",
      linkLabel: "Explore the perceptron",
    },
    {
      id: "logistic",
      number: "04",
      title: "Logistic Regression",
      subtitle: "Probabilistic linear classifier",
      status: "DEPLOYED TO STAGE",
      statusClass: "status-stage",
      description: "Keep a linear boundary, turn its score into a probability, then classify with a threshold.",
      href: "../logistic-regression/",
      linkLabel: "Explore logistic regression",
    },
    {
      id: "bayes",
      number: "05",
      title: "Naive Bayes",
      status: "IN PROGRESS",
      statusClass: "status-progress",
      description: "Combine feature likelihoods to compare which category explains the evidence best.",
      href: "../naive-bayes-classification/",
      linkLabel: "Explore Naive Bayes",
    },
    {
      id: "svc",
      number: "06",
      title: "Support Vector Classifier",
      status: "IN PROGRESS",
      statusClass: "status-progress",
      description: "Find a separating boundary and make the margin around it as wide as possible.",
      href: "../support-vector-classification/",
      linkLabel: "Explore support vectors",
    },
    {
      id: "ensemble",
      number: "07",
      title: "Ensembles",
      status: "IN PROGRESS",
      statusClass: "status-progress",
      description: "Combine many imperfect decisions so the final vote is steadier than one model alone.",
      href: "../ensemble-classification/",
      linkLabel: "Explore ensembles",
    },
    {
      id: "neural",
      number: "08",
      title: "Neural Networks",
      status: "IN PROGRESS",
      statusClass: "status-progress",
      description: "Pass features through hidden layers so the boundary can bend when signals interact.",
      href: "../neural-network-classification/",
      linkLabel: "Explore neural networks",
    },
  ];

  const cardMarkup = (lesson, currentLesson) => {
    const isCurrent = lesson.id === currentLesson;
    const subtitle = lesson.subtitle ? `<small>${lesson.subtitle}</small>` : "";
    const action = isCurrent
      ? '<span class="algo-card-current" aria-current="page">Current lesson</span>'
      : `<a class="algo-card-link" href="${lesson.href}">${lesson.linkLabel}</a>`;

    return `
      <article class="algo-card${isCurrent ? " is-active" : ""}" data-classifier-card="${lesson.id}">
        <div class="card-meta">
          <span>${lesson.number}</span>
          <span class="classifier-card-release">
            <span class="issue-chip ${release.statusClass}">${release.status}</span>
            <span class="classifier-card-version">${release.version}</span>
          </span>
        </div>
        <h2>${lesson.title}${subtitle}</h2>
        <p>${lesson.description}</p>
        ${action}
      </article>
    `;
  };

  document.querySelectorAll("[data-classifier-navigation]").forEach((navigation) => {
    const currentLesson = navigation.dataset.current;

    navigation.innerHTML = `
      <p class="algorithm-path-label classifier-path-label">Classifier learning path</p>
      <div class="algo-grid classification-menu classifier-family-cards">
        ${lessons.map((lesson) => cardMarkup(lesson, currentLesson)).join("")}
      </div>
    `;
  });
})();
