export default (data, parser = new DOMParser()) => {
  const doc = parser.parseFromString(data, 'application/xml');
  const errorNode = doc.querySelector('parsererror');

  if (errorNode) {
    const error = new Error(errorNode);
    error.isParsingError = true;
    throw error;
  }

  const feed = {
    title: doc.querySelector('channel title').textContent,
    description: doc.querySelector('channel description').textContent,
  };

  const posts = Array.from(doc.querySelectorAll('item')).map((item) => ({
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    link: item.querySelector('link').textContent,
  }));

  return { feed, posts };
};
