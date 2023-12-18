import * as yup from 'yup';
import i18n from 'i18next';
import onChange from 'on-change';
import render from './view';
import resources from './locales/index';

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
    form: document.querySelector('form'),
    feedback: document.querySelector('.feedback'),
    input: document.querySelector('input'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const wachedState = onChange(state, render(elements, i18nInstance));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    validateUrl(url, wachedState.urls)
      .then(() => {
        wachedState.error = '';
        wachedState.urls.push(url);
      })
      .catch((error) => {
        wachedState.error = error.errors;
      });
  });
};

export default app;
