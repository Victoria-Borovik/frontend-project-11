import onChange from 'on-change';
import { differenceBy, difference } from 'lodash';

const renderModal = (state, currId, modal, i18n) => {
  const {
    titleEl, descEl,
    linkEl, closeEl,
  } = modal;
  const [{ title, description, link }] = state.posts.filter((post) => post.id === currId);
  titleEl.textContent = title;
  descEl.textContent = description;
  linkEl.setAttribute('href', link);
  linkEl.textContent = i18n.t('modal.read');
  closeEl.textContent = i18n.t('modal.close');
};

const renderReadPosts = (prevIds, currIds) => {
  const newId = difference([...currIds], [...prevIds]);
  const readItem = document.querySelector(`a[data-id="${newId}"]`);
  readItem.classList.remove('fw-bold');
  readItem.classList.add('fw-normal', 'link-secondary');
};

const getDataList = (container, containerHeader) => {
  if (container.childNodes.length) {
    return container.querySelector('ul');
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

const createPostsList = (posts, btnName) => posts.map((post) => {
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
  postHeader.classList.add('fw-bold');
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

const renderPosts = (currValue, prevValue, container, containerHeader, btnName) => {
  const dataList = getDataList(container, containerHeader);
  const posts = (prevValue.length)
    ? differenceBy(currValue, prevValue, 'id')
    : currValue;

  const postsItems = createPostsList(posts, btnName);
  dataList.prepend(...postsItems);
};

const createFeedItem = ([{ title, description }]) => {
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
};

const renderFeeds = (currValue, prevValue, container, containerHeader) => {
  const dataList = getDataList(container, containerHeader);
  const feed = (prevValue.lengt)
    ? currValue
    : differenceBy(currValue, prevValue, 'id');
  const feedItem = createFeedItem(feed);

  dataList.prepend(feedItem);
};

const renderLoadingResponse = (currValue, elements, i18n) => {
  const { status, error } = currValue;
  const {
    feedbackEl, inputEl, formEl, submitEl,
  } = elements;
  switch (status) {
    case 'loading':
      submitEl.setAttribute('disabled', 'true');
      inputEl.setAttribute('disabled', 'true');
      break;
    case 'success':
      feedbackEl.textContent = i18n.t('loadingMessages.success');
      feedbackEl.classList.add('text-success');
      submitEl.removeAttribute('disabled');
      inputEl.removeAttribute('disabled');
      inputEl.focus();
      formEl.reset();
      break;
    case 'error':
      feedbackEl.textContent = i18n.t(error);
      feedbackEl.classList.add('text-danger');
      submitEl.removeAttribute('disabled');
      inputEl.removeAttribute('disabled');
      inputEl.classList.add('is-invalid');
      inputEl.focus();
      break;
    default:
      feedbackEl.textContent = i18n.t('loadingMessages.unknownErr');
      feedbackEl.classList.add('text-danger');
      submitEl.removeAttribute('disabled');
      inputEl.classList.add('is-invalid');
      inputEl.removeAttribute('disabled');
      inputEl.focus();
      break;
  }
};

const renderFormResponse = (currValue, elements, i18n) => {
  const { isValid, error } = currValue;
  const { feedbackEl, inputEl } = elements;
  if (isValid) {
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('text-success', 'text-danger');
    inputEl.classList.remove('is-invalid');
  } else {
    feedbackEl.textContent = i18n.t(error);
    feedbackEl.classList.add('text-danger');
    inputEl.classList.add('is-invalid');
    inputEl.focus();
  }
};

export default (state, elements, i18n) => onChange(state, (path, currValue, prevValue) => {
  const {
    formEl, feedbackEl, inputEl, submitEl,
    feedsEl, postsEl, modal,
  } = elements;

  switch (path) {
    case 'form':
      renderFormResponse(currValue, { feedbackEl, inputEl, formEl }, i18n);
      break;
    case 'loadingProcess':
      renderLoadingResponse(currValue, {
        feedbackEl, inputEl, formEl, submitEl,
      }, i18n);
      break;
    case 'feeds':
      renderFeeds(currValue, prevValue, feedsEl, i18n.t(path));
      break;
    case 'posts':
      renderPosts(currValue, prevValue, postsEl, i18n.t(path), i18n.t('button'));
      break;
    case 'uiState.readPostsId':
      renderReadPosts(prevValue, currValue);
      break;
    case 'uiState.modal.modalId':
      renderModal(state, currValue, modal, i18n);
      break;
    default:
      console.error(`Unknown state to change - ${path}`);
      break;
  }
});
