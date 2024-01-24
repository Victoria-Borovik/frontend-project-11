import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import watch from './view';
import resources from './locales/index';
import parse from './parser';

const addProxy = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.append('disableCache', 'true');
  proxyUrl.searchParams.append('url', url);
  return proxyUrl;
};

const validateUrl = (url, urls) => {
  yup.setLocale({
    mixed: {
      notOneOf: () => ('errors.rssDoubling'),
    },
    string: {
      url: () => ('errors.notValidUrl'),
    },
  });

  const schema = yup.string()
    .url()
    .notOneOf(urls);
  return schema.validate(url);
};

const app = () => {
  const state = {
    urls: [],
    error: '',
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
    const watchedState = watch(state, elements, i18nInstance);

    const loadUrl = (url) => (axios.get(url)
      .then((response) => {
        const { feed, posts } = parse(response.data.contents);
        feed.id = uniqueId();
        feed.url = url;
        watchedState.feeds = [...watchedState.feeds, feed];
        const postsWithId = posts.map((post) => ({ ...post, feedId: feed.id, id: uniqueId() }));
        watchedState.posts = [...watchedState.posts, ...postsWithId];
        watchedState.error = '';
        watchedState.urls.push(url);
      }).catch((error) => {
        if (error.isParsingError) {
          watchedState.error = 'errors.notValidRss';
        } else if (error.isAxiosError) {
          watchedState.error = 'errors.networkErr';
        } else {
          watchedState.error = 'errors.unknownErr';
        }
      })
    );

    const updatePosts = () => {
      watchedState.feeds.forEach(({ url, id }) => {
        axios.get(url).then((response) => {
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
      const url = formData.get('url');
      console.log(url);
      validateUrl(url, watchedState.urls)
        .then(() => {
          const proxyUrl = addProxy(url);
          loadUrl(proxyUrl);
          watchedState.urls.push(url);
        })
        .catch((error) => {
          watchedState.error = error.errors;
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
