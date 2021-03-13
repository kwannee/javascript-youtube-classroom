import { $, popMessage } from "../utils/dom.js";
import { getDataFromLocalStorage, setDataToLocalStorage } from "../utils/localStorage.js";
import {
  MENU,
  SECTION,
  STORAGE,
  CONFIRM_MESSAGE,
  SNACKBAR_MESSAGE,
  CLASS_NAME,
} from "../utils/constants.js";
import { createVideoTemplate } from "../utils/templates.js";

class VideoView {
  constructor() {
    this.selectDOM();
    this.initState();
    this.bindEvent();
  }

  async initState() {
    this.savedVideos = getDataFromLocalStorage(STORAGE.SAVED_VIDEOS, []);
    this.clickedMenu = MENU.WATCH_LATER;

    this.render();
  }

  setState({ savedVideos, clickedMenu }) {
    this.savedVideos = savedVideos ?? this.savedVideos;
    this.clickedMenu = clickedMenu ?? this.clickedMenu;

    this.render();
  }

  selectDOM() {
    this.$target = $(`.${CLASS_NAME.VIDEO_VIEW}`);
    this.$videoViewVideoWrapper = $(`.${CLASS_NAME.VIDEO_VIEW_VIDEO_WRAPPER}`);
    this.$snackbar = $(`.${CLASS_NAME.SNACKBAR}`);
  }

  bindEvent() {
    this.$videoViewVideoWrapper.addEventListener("click", e => {
      if (e.target.classList.contains(`${CLASS_NAME.WATCHED_CHECK}`)) {
        this.handleCheckWatched(e);
      }

      if (e.target.classList.contains(`${CLASS_NAME.TRASH_CAN}`)) {
        this.handleRemoveSaved(e);
      }
    });
  }

  handleCheckWatched(e) {
    const watchedVideoId = e.target.closest(`.${CLASS_NAME.CLIP_ACTIONS}`).dataset.videoId;
    const savedVideos = this.savedVideos.map(video => {
      if (video.videoId === watchedVideoId) {
        video.isWatched = !video.isWatched;
      }

      return video;
    });

    this.setState({ savedVideos });
    setDataToLocalStorage(STORAGE.SAVED_VIDEOS, this.savedVideos);

    const message = SNACKBAR_MESSAGE.MOVE(this.clickedMenu === MENU.WATCH_LATER ? "본" : "볼");
    popMessage(this.$snackbar, message);
  }

  handleRemoveSaved(e) {
    if (confirm(CONFIRM_MESSAGE.DELETE)) {
      const removeVideoId = e.target.closest(`.${CLASS_NAME.CLIP_ACTIONS}`).dataset.videoId;
      const savedVideos = this.savedVideos.filter(video => video.videoId !== removeVideoId);

      this.setState({ savedVideos });
      setDataToLocalStorage(STORAGE.SAVED_VIDEOS, this.savedVideos);
      popMessage(this.$snackbar, SNACKBAR_MESSAGE.DELETE);
    }
  }

  render() {
    if (this.clickedMenu === MENU.WATCH_LATER) {
      this.$videoViewVideoWrapper.innerHTML = this.savedVideos.length
        ? this.savedVideos
            .filter(video => !video.isWatched)
            .map(video => createVideoTemplate(video, SECTION.MAIN))
            .join("")
        : createNoWatchLaterTemplate();
    } else {
      this.$videoViewVideoWrapper.innerHTML = this.savedVideos.length
        ? this.savedVideos
            .filter(video => video.isWatched)
            .map(video => createVideoTemplate(video, SECTION.MAIN))
            .join("")
        : createNoWatchLaterTemplate();
    }
  }
}

const createNoWatchLaterTemplate = () =>
  `<div class='d-flex flex-col justify-center items-center no-search-result'>
    <img class='d-block no-saved-video-image' src='src/images/status/no_watch_later_video.png' alt='결과 없음'>
  </div>`;

export default VideoView;
