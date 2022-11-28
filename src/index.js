import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import { throttle } from 'throttle-debounce';

let getEl = selector => document.querySelector(selector);

const searchForm = getEl('.search-form');
const searchInput = getEl('.search-form__input');
const btnSearch = getEl('.search-form__btn');
const gallery = getEl('.gallery');
const btnLoadMore = getEl('.load-more-btn');
const cardHeight = 320;
let lastResultCount = 0;
let lastSearch = "";
let currentPage = 1;
let pageHeight = document.body.getBoundingClientRect().height;
let viewHeight = visualViewport.height;
let gallerySimpleLightbox = new SimpleLightbox('.gallery a');

btnLoadMore.style.display = 'none';

async function getImage(inputValue, pageNumber = 1) {
 axios.get('https://pixabay.com/api/', {
    params: {
      key: '31325871-0cde844d39520f6c11f9b55e1',
      q: inputValue,
      image_type: "photo",
      orientation: "horizontal",
     safesearch: true,
      per_page: 40,
     page: pageNumber
    }
  })
		.then(response => response.data)
		.then(response => {
			lastResultCount = response.totalHits;
			if (response.hits.length == 0) {
				Notify.warning('Sorry, there are no images matching your search query. Please try again.');
			} else {
				if (currentPage == 1) {
					Notify.success(`Hooray! We found ${response.totalHits} images.`);
				} else {
					Notify.success(`Hooray! We loaded more images.`);
				}
				gallery.insertAdjacentHTML("beforeend", renderImageList(response.hits));
				gallerySimpleLightbox.refresh();
				pageHeight = document.body.getBoundingClientRect().height;
			}
		})
		.catch(error => Notify.warning('Sorry, there are no images matching your search query. Please try again.'))
}

function renderImageList(images) {
	return images.map(image => {
		return `<div class="photo-card">
       <a href="${image.largeImageURL}">
       <img class="photo-card__img" src="${image.webformatURL}" alt="${image.tags}" title="${image.tags}" loading="lazy"/></a>
        <div class="info">
          <p class="info-item">
            <b>Likes</b> <span class="info-item-value"> ${image.likes} </span>
          </p>
          <p class="info-item">
            <b>Views</b> <span class="info-item-value">${image.views}</span>  
            </p>
            <p class="info-item">
              <b>Comments</b> <span class="info-item-value">${image.comments}</span>  
            </p>
            <p class="info-item">
              <b>Downloads</b> <span class="info-item-value">${image.downloads}</span> 
            </p>
        </div>
    </div>`;
	}).join('');
}

searchForm.addEventListener("submit", event => {
	event.preventDefault();
	gallery.innerHTML = "";
	currentPage = 1;
	lastSearch = searchInput.value.trim();
	if (lastSearch) {
		getImage(lastSearch);
	}
});

document.addEventListener('scroll', throttle(
	500, (e) => {
		if ((window.scrollY + viewHeight + cardHeight * 2) >= pageHeight) {
			if ((currentPage * 40) < lastResultCount) {
				currentPage += 1;
				getImage(lastSearch, currentPage);
			}
		}
	}));
addEventListener("resize", (event) => {
	viewHeight = visualViewport.height;
});