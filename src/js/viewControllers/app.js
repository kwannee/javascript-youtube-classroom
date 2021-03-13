import $ from '../utils/DOM.js';
import {
  savedVideoListTemplate,
  emptyVideoListTemplate,
} from '../templates/videoList.js';
import { TO_WATCH_TYPE } from '../constants/filterType.js';

const $searchModal = $('#video-search-modal');
const $videoList = $('#video-list');
const $videoSearchInput = $('#video-search-input');

function openModal() {
  $searchModal.classList.add('open');
  $videoSearchInput.focus();
}

function closeModal() {
  $searchModal.classList.remove('open');
}

function renderSavedVideoList(videoInfos, videoListType) {
  const filteredVideoInfos =
    videoListType === TO_WATCH_TYPE
      ? [...videoInfos].filter(videoInfo => !videoInfo.isWatched)
      : [...videoInfos].filter(videoInfo => videoInfo.isWatched);

  $videoList.innerHTML = filteredVideoInfos.length
    ? savedVideoListTemplate(filteredVideoInfos)
    : emptyVideoListTemplate;
}

function showSnackBar(contents) {
  const $snackbar = $('#snack-bar');

  $snackbar.innerText = contents;
  $snackbar.classList.toggle('show');
  setTimeout(() => {
    $snackbar.classList.toggle('show');
  }, 3000);
}

function toggleFocusedModeButton() {
  $('#watched-video-display-button').classList.toggle('bg-cyan-100');
  $('#to-watch-video-display-button').classList.toggle('bg-cyan-100');
}

export {
  openModal,
  closeModal,
  renderSavedVideoList,
  showSnackBar,
  toggleFocusedModeButton,
};