import * as yup from 'yup';
import i18n from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import watch from './view';
import resources from './locales/index';
import parse from './parser';

const normalizeUrl = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${url}`;

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
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const state = {
    urls: [],
    error: '',
    feeds: [],
    posts: [],
  };

  const elements = {
    formEl: document.querySelector('form'),
    feedbackEl: document.querySelector('.feedback'),
    inputEl: document.querySelector('input'),
    feedsEl: document.querySelector('.feeds'),
    postsEl: document.querySelector('.posts'),
  };

  const wachedState = watch(state, elements, i18nInstance);

  const loadUrl = (url) => (axios.get(url)
    .then((response) => {
      const { feed, posts } = parse(response.data.contents);
      feed.id = uniqueId();
      wachedState.feeds = [...wachedState.feeds, feed];
      const postsWithId = posts.map((post) => ({ ...post, id: feed.id }));
      wachedState.posts = [...wachedState.posts, ...postsWithId];
      wachedState.error = '';
      wachedState.urls.push(url);
    }).catch((error) => {
      if (error.isParsingError) {
        wachedState.error = 'errors.notValidRss';
      } else if (error.isAxiosError) {
        wachedState.error = 'errors.networkErr';
      } else {
        wachedState.error = 'errors.unknownErr';
      }
    })
  );

  elements.formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    validateUrl(url, wachedState.urls)
      .then(() => {
        const normalizedUrl = normalizeUrl(url);
        loadUrl(normalizedUrl);
      })
      .catch((error) => {
        wachedState.error = error.errors;
      });
  });
};

export default app;
