export default (form, input, feedback) => (path, value) => {
  feedback.textContent = '';
  feedback.classList.remove('text-success', 'text-danger');
  input.classList.remove('is-invalid');

  switch (path) {
    case 'urls':
      console.log(value);
      feedback.textContent = 'RSS успешно загружен';
      feedback.classList.add('text-success');
      form.reset();
      input.focus();
      break;
    case 'error':
      console.log(value)
      feedback.textContent = value;
      feedback.classList.add('text-danger');
      input.classList.add('is-invalid');
      break;
    default:
      throw new Error('Unknown change');
  }
};
