import { error, notice } from '@pnotify/core';
import galleryTemplate from '../template/gallery.hbs';
import * as basicLightbox from 'basiclightbox';

const refs = {
  btnSearch: document.querySelector('.search-form-btn'),
  gallery: document.querySelector('.gallery'),
  query: document.querySelector('.search-form-input'),
  form: document.querySelector('.search-form'),
};

const ImageFinder = {
  key: 'key=19823143-e5d054b038f568b2343c680be',
  page: 1,
  lenguage: 'en',
  baseURL:
    'https://pixabay.com/api/?image_type=photo&orientation=horizontal&q=',
};

refs.btnSearch.addEventListener('click', onClickSearch);
refs.gallery.addEventListener('click', onImageClick);

const Observer = new IntersectionObserver(loadMore, {
  rootMargin: '0px',
  threshold: 0.4,
});

async function getData() {
  const { baseURL, searchQuery, key, page, lenguage } = ImageFinder;
  const url = `${baseURL}${searchQuery}&page=${page}&lang=${lenguage}&per_page=20&${key}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const { hits, total } = data;
    if (!total) return notice('No results were found for your request.');
    const layout = galleryTemplate(hits);
    refs.gallery.insertAdjacentHTML('beforeend', layout);
    Observer.observe(refs.gallery.lastElementChild);
  } catch (e) {
    error(e);
  }
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}

function onClickSearch(event) {
  event.preventDefault();
  clearGallery();
  ImageFinder.page = 1;
  ImageFinder.searchQuery = refs.query.value;
  getData();
}

function onImageClick(event) {
  if (event.target.nodeName !== 'IMG') {
    return;
  }
  const src = event.target.dataset.source;
  basicLightbox
    .create(
      `
  	<img width="900" height="600" src=${src}>
  `,
    )
    .show();
}

function loadMore(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      ImageFinder.page += 1;
      getData();
    }
  });
}
