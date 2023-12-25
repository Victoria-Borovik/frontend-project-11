import onChange from 'on-change';
import { differenceBy } from 'lodash';

const createDataList = (container, containerHeader) => {
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
};

const createPostsList = (posts, btnName) => posts.map((post) => {
  const {
    title, link, id,
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
  postHeader.dataset.id = id;
  postHeader.textContent = title;

  const postSubmit = document.createElement('button');
  postSubmit.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  postSubmit.setAttribute('type', 'button');
  postSubmit.dataset.id = id;
  postSubmit.dataset.bsToggle = 'modal';
  postSubmit.dataset.bsTarget = '#modal';
  postSubmit.textContent = btnName;

  postItem.append(postHeader, postSubmit);
  return postItem;
});

const renderPosts = (currValue, prevValue, container, containerHeader, btnName) => {
  if (!prevValue.length) {
    createDataList(container, containerHeader);
  }
  const dataList = container.querySelector('ul');
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
  if (!prevValue.length) {
    createDataList(container, containerHeader);
  }
  const dataList = container.querySelector('ul');
  const feed = (prevValue.lengt)
    ? currValue
    : differenceBy(currValue, prevValue, 'id');
  const feedItem = createFeedItem(feed);

  dataList.prepend(feedItem);
};

export default (state, elements, i18n) => onChange(state, (path, currValue, prevValue) => {
  const {
    formEl, feedbackEl, inputEl,
    feedsEl, postsEl,
  } = elements;

  feedbackEl.textContent = '';
  feedbackEl.classList.remove('text-success', 'text-danger');
  inputEl.classList.remove('is-invalid');

  switch (path) {
    case 'urls':
      feedbackEl.textContent = i18n.t('validationMessage.success');
      feedbackEl.classList.add('text-success');
      formEl.reset();
      inputEl.focus();
      break;
    case 'error':
      feedbackEl.textContent = i18n.t(currValue);
      feedbackEl.classList.add('text-danger');
      inputEl.classList.add('is-invalid');
      break;
    case 'feeds':
      renderFeeds(currValue, prevValue, feedsEl, i18n.t(path));
      break;
    case 'posts':
      renderPosts(currValue, prevValue, postsEl, i18n.t(path), i18n.t('button'));
      break;
    default:
      throw new Error('Unknown change');
  }
});
