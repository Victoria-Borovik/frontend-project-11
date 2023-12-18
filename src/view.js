const renderResponse = (containers, i18n) => {
  Object.entries(containers).forEach(([name, container]) => {
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');

    const cardName = document.createElement('div');
    cardName.classList.add('card-body');

    const cardTitle = document.createElement('h2');
    cardTitle.classList.add('card-title', 'h4');
    cardTitle.textContent = i18n.t(name);
    cardName.append(cardTitle);

    const cardList = document.createElement('ul');
    cardList.classList.add('list-group', 'border-0', 'rounded-0');
    card.append(cardName, cardList);

    container.append(card);
  });
};

export default (elements, i18n) => (path, value) => {
  console.log(elements);

  const {
    form, feedback, input,
    feeds, posts,
  } = elements;

  feedback.textContent = '';
  feedback.classList.remove('text-success', 'text-danger');
  input.classList.remove('is-invalid');

  switch (path) {
    case 'urls':
      feedback.textContent = i18n.t('validationMessage.success');
      feedback.classList.add('text-success');
      form.reset();
      input.focus();
      renderResponse({ feeds, posts }, i18n);
      break;
    case 'error':
      feedback.textContent = i18n.t(value);
      feedback.classList.add('text-danger');
      input.classList.add('is-invalid');
      break;
    default:
      throw new Error('Unknown change');
  }
};
