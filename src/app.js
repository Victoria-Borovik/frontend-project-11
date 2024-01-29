import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import watch from './view';
import resources from './locales/index';
import customErrors from './locales/customErrors';
import parse from './parser';

const addProxy = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.append('disableCache', 'true');
  proxyUrl.searchParams.append('url', url);
  return proxyUrl.toString();
};

const validateUrl = (url, urls) => {
  const schema = yup.string().url().notOneOf(urls);
  return schema.validate(url)
    .then(() => null)
    .catch((error) => error.message);
};

const app = () => {
  const state = {
    form: {
      isValid: false,
      error: null,
    },
    loadingProcess: {
      status: null,
      error: null,
    },
    feeds: [],
    posts: [],
    uiState: {
      readPostsId: [],
      modal: {
        modalId: '',
      },
    },
  };

  const elements = {
    formEl: document.querySelector('form'),
    feedbackEl: document.querySelector('.feedback'),
    inputEl: document.querySelector('input'),
    feedsEl: document.querySelector('.feeds'),
    postsEl: document.querySelector('.posts'),
    modal: {
      titleEl: document.querySelector('.modal-title'),
      descEl: document.querySelector('.modal-body'),
      linkEl: document.querySelector('.modal-footer a'),
      closeEl: document.querySelector('.modal-footer button[type="button"]'),
    },
  };

  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    yup.setLocale(customErrors);

    const watchedState = watch(state, elements, i18nInstance);

    const loadUrl = (url) => {
      watchedState.loadingProcess = { status: 'loading', error: null };
      return axios.get(addProxy(url))
        .then((response) => {
          const { feed, posts } = parse(response.data.contents);
          feed.id = uniqueId();
          feed.url = url;
          watchedState.feeds = [...watchedState.feeds, feed];
          const postsWithId = posts.map((post) => ({ ...post, feedId: feed.id, id: uniqueId() }));
          watchedState.posts = [...watchedState.posts, ...postsWithId];
          watchedState.loadingProcess = { status: 'success', error: null };
        }).catch((error) => {
          if (error.isParsingError) {
            watchedState.loadingProcess = { status: 'error', error: 'loadingMessages.notValidRss' };
          } else if (error.isAxiosError) {
            watchedState.loadingProcess = { status: 'error', error: 'loadingMessages.networkErr' };
          } else {
            watchedState.loadingProcess = { status: 'error', error: 'loadingMessages.unknownErr' };
          }
        });
    };

    const updatePosts = () => {
      watchedState.feeds.forEach(({ url, id }) => {
        axios.get(addProxy(url)).then((response) => {
          const { posts } = parse(response.data.contents);
          const prevPostsLinks = watchedState.posts
            .filter((post) => post.feedId === id)
            .map((post) => post.link);
          const newPosts = posts
            .filter((post) => !prevPostsLinks.includes(post.link))
            .map((post) => ({ ...post, feedId: id, id: uniqueId() }));
          if (newPosts.length) {
            watchedState.posts = [...watchedState.posts, ...newPosts];
          }
        }).catch((err) => {
          throw new Error(`Update posts error. ${err}`);
        });
      });
      setTimeout(updatePosts, 5000);
    };

    elements.formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url').trim();
      const urls = watchedState.feeds.map((feed) => feed.url);
      validateUrl(url, urls)
        .then((error) => {
          if (error) {
            watchedState.form = { isValid: false, error };
            return;
          }
          watchedState.form = { isValid: true, error: null };
          loadUrl(url);
        });
    });
    updatePosts();

    elements.postsEl.addEventListener('click', (e) => {
      const { id } = e.target.dataset;
      if (!id) return;
      watchedState.uiState.readPostsId = [...watchedState.uiState.readPostsId, id];
      watchedState.uiState.modal.modalId = id;
    });
  });
};

export default app;
