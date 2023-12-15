import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import render from './view.js';

const validateUrl = (url, urls) => {
  const schema = yup.string().required()
    .url('Ссылка должна быть валидным URL')
    .notOneOf(urls, 'RSS уже сущесвует');
  return schema.validate(url);
};

const app = () => {
  const state = {
    urls: [],
    error: '',
  };

  const form = document.querySelector('form');
  const feedback = document.querySelector('.feedback');
  const input = form.querySelector('input#url-input');

  const wachedState = onChange(state, render(form, input, feedback));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    validateUrl(url, wachedState.urls)
      .then(() => {
        axios.get(url)
          .then(console.log)
          .catch(() => console.log('err'))
        wachedState.error = '';
        wachedState.urls.push(url);
      })
      .catch((error) => {
        wachedState.error = error.errors;
      });
  });
};

export default app;
