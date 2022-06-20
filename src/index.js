import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
const axios = require('axios');

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const button = document.querySelector('.load-more');

let lightbox = new SimpleLightbox('.gallery div a', {
  captionsData: 'alt',
  captionDelay: 250,
});

form.addEventListener('submit', onSubmit);
button.addEventListener('click', onButtonClick);

let page;
let request;
let totalPages;

async function onSubmit(e) {
  page = 1;
  e.preventDefault();
  button.classList.remove('shown');
  gallery.innerHTML = '';
  request = e.target.elements.searchQuery.value;
  try {
    const response = await fetchImage(request);
    if (response.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      Notify.success(`Hooray! we found ${response.totalHits} images`);
      renderGallery(response.hits);
      scroll();
      lightbox.refresh();
      e.target.reset();
      totalPages = Math.ceil(response.totalHits / 40);
      button.classList.add('shown');
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function onButtonClick() {
  try {
    page += 1;
    const response = await fetchImage(request, page);
    renderGallery(response.hits);
    scroll();
    lightbox.refresh();
    if (page === totalPages) {
      button.classList.remove('shown');
      Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function fetchImage(request, pageNum) {
  const APIurl = 'https://pixabay.com/api/';
  const KEY = '28129129-feff09d42f949c4b372c861bc';
  try {
    const response = await axios.get(`${APIurl}`, {
      params: {
        key: KEY,
        q: `${request}`,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page: pageNum,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

function renderGallery(array) {
  const markup = array
    .map(img => {
      return `
    <div class="photo-card">
    <a class="gallery-item" href="${img.largeImageURL}">
        <img src="${img.webformatURL}" alt="${img.tags}" loading="lazy" />
    </a>
    <div class="info">
        <p class="info-item">
        <b>Likes</b><br> ${img.likes}
        </p>
        <p class="info-item">
        <b>Views</b><br>${img.views}
        </p>
        <p class="info-item">
        <b>Comments</b><br>${img.comments}
        </p>
        <p class="info-item">
        <b>Downloads</b><br>${img.downloads}
        </p>
    </div>
    </div>
            `;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}

function scroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
