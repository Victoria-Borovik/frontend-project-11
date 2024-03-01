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

const getLoadingError = (error) => {
  if (error.isParsingError) {
    return 'loadingMessages.notValidRss';
  }
  if (error.isAxiosError) {
    return 'loadingMessages.networkErr';
  }
  return 'loadingMessages.unknownErr';
};

const app = () => {
  const state = {
    form: {
      isValid: false,
      error: null,
    },
    loadingProcess: {
      status: 'idle',
      error: null,
    },
    feeds: [],
    posts: [],
    uiState: {
      seenPostIds: new Set(),
      modal: {
        modalId: null,
      },
    },
  };

  const elements = {
    form: document.querySelector('form'),
    feedback: document.querySelector('.feedback'),
    input: document.querySelector('input'),
    submit: document.querySelector('[type="submit"]'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: {
      title: document.querySelector('.modal-title'),
      description: document.querySelector('.modal-body'),
      link: document.querySelector('.modal-footer a'),
      close: document.querySelector('.modal-footer button[type="button"]'),
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
          const relatedPosts = posts.map((post) => ({ ...post, feedId: feed.id, id: uniqueId() }));
          watchedState.posts = [...relatedPosts, ...watchedState.posts];
          watchedState.loadingProcess = { status: 'success', error: null };
        }).catch((error) => {
          watchedState.loadingProcess = { status: 'error', error: getLoadingError(error) };
        });
    };

    const updatePosts = () => {
      const updatedPosts = (watchedState.feeds.map(({ url, id }) => (
        axios.get(addProxy(url)).then((response) => {
          const { posts } = parse(response.data.contents);
          const prevPostsLinks = watchedState.posts
            .filter((post) => post.feedId === id)
            .map((post) => post.link);
          const newPostsLinks = posts.filter((post) => !prevPostsLinks.includes(post.link));
          if (!newPostsLinks.length) return;
          const newPosts = newPostsLinks.map((post) => ({ ...post, feedId: id, id: uniqueId() }));
          watchedState.posts = [...newPosts, ...watchedState.posts];
        }).catch(console.error)
      )));
      Promise.all(updatedPosts).then(() => setTimeout(updatePosts, 5000));
    };

    elements.form.addEventListener('submit', (e) => {
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

    elements.posts.addEventListener('click', (e) => {
      const { id } = e.target.dataset;
      if (!id) return;
      watchedState.uiState.seenPostIds.add(id);
      watchedState.uiState.modal.modalId = id;
    });
    updatePosts();
  });
};

export default app;
