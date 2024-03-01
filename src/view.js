import onChange from 'on-change';

const renderModal = (state, currId, modal, i18n) => {
  const {
    title, description,
    link, close,
  } = modal;
  const post = state.posts.find(({ id }) => id === currId);
  if (post) {
    title.textContent = post.title;
    description.textContent = post.description;
    link.setAttribute('href', post.link);
    link.textContent = i18n.t('modal.read');
    close.textContent = i18n.t('modal.close');
  }
};

const getDataList = (container, containerHeader) => {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardName = document.createElement('div');
  cardName.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = containerHeader;
  cardName.append(cardTitle);

  const cardList = document.createElement('ul');
  cardList.classList.add('list-group', 'border-0', 'rounded-0');
  card.append(cardName, cardList);
  container.append(card);
  return cardList;
};

const renderPosts = ({ posts, uiState }, container, containerHeader, btnName) => {
  const dataList = getDataList(container, containerHeader);
  const postItems = posts.map((post) => {
    const {
      title, link, feedId, id,
    } = post;

    const postItem = document.createElement('li');
    postItem.classList.add(
      'list-group-item',
      'd-flex',
      'border-0',
      'border-end-0',
      'justify-content-between',
      'align-items-start',
    );

    const postHeader = document.createElement('a');
    if (uiState.seenPostIds.has(id)) {
      postHeader.classList.add('fw-normal', 'link-secondary');
    } else {
      postHeader.classList.add('fw-bold');
    }
    postHeader.setAttribute('href', link);
    postHeader.setAttribute('target', '_blank');
    postHeader.setAttribute('rel', 'noopener noreferrer');
    postHeader.dataset.feedId = feedId;
    postHeader.dataset.id = id;
    postHeader.textContent = title;

    const postSubmit = document.createElement('button');
    postSubmit.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    postSubmit.setAttribute('type', 'button');
    postSubmit.dataset.feedId = feedId;
    postSubmit.dataset.id = id;
    postSubmit.dataset.bsToggle = 'modal';
    postSubmit.dataset.bsTarget = '#modal';
    postSubmit.textContent = btnName;
    postItem.append(postHeader, postSubmit);
    return postItem;
  });

  dataList.append(...postItems);
};

const renderFeeds = ({ feeds }, container, containerHeader) => {
  const dataList = getDataList(container, containerHeader);
  const feedItems = feeds.map(({ title, description }) => {
    const feedItem = document.createElement('li');
    feedItem.classList.add('list-group-item', 'border-0', 'border-end-0');

    const feedHeader = document.createElement('h3');
    feedHeader.classList.add('h6', 'm-0');
    feedHeader.textContent = title;

    const feedDesc = document.createElement('p');
    feedDesc.classList.add('m-0', 'small', 'text-black-50');
    feedDesc.textContent = description;
    feedItem.append(feedHeader, feedDesc);

    return feedItem;
  });

  dataList.append(...feedItems);
};

const renderLoadingResponse = (value, elements, i18n) => {
  console.log(value);
  const { status, error } = value;
  const {
    feedback, input, form, submit,
  } = elements;
  switch (status) {
    case 'loading':
      submit.setAttribute('disabled', 'true');
      input.setAttribute('disabled', 'true');
      break;
    case 'success':
      feedback.textContent = i18n.t('loadingMessages.success');
      feedback.classList.add('text-success');
      submit.removeAttribute('disabled');
      input.removeAttribute('disabled');
      input.focus();
      form.reset();
      break;
    case 'error':
      feedback.textContent = i18n.t(error);
      feedback.classList.add('text-danger');
      submit.removeAttribute('disabled');
      input.removeAttribute('disabled');
      input.classList.add('is-invalid');
      input.focus();
      break;
    default:
      break;
  }
};

const renderFormResponse = (value, elements, i18n) => {
  const { isValid, error } = value;
  const { feedback, input } = elements;
  if (isValid) {
    feedback.textContent = '';
    feedback.classList.remove('text-success', 'text-danger');
    input.classList.remove('is-invalid');
  } else {
    feedback.textContent = i18n.t(error);
    feedback.classList.add('text-danger');
    input.classList.add('is-invalid');
    input.focus();
  }
};

export default (state, elements, i18n) => onChange(state, (path, value) => {
  const {
    form, feedback, input, submit,
    feeds, posts, modal,
  } = elements;

  switch (path) {
    case 'form':
      renderFormResponse(value, { feedback, input, form }, i18n);
      break;
    case 'loadingProcess':
      renderLoadingResponse(value, {
        feedback, input, form, submit,
      }, i18n);
      break;
    case 'feeds':
      renderFeeds(state, feeds, i18n.t(path));
      break;
    case 'posts':
      renderPosts(state, posts, i18n.t(path), i18n.t('button'));
      break;
    case 'uiState.seenPostIds':
      renderPosts(state, posts, i18n.t(path), i18n.t('button'));
      break;
    case 'uiState.modal.modalId':
      renderModal(state, value, modal, i18n);
      break;
    default:
      console.error(`Unknown state to change - ${path}`);
      break;
  }
});
