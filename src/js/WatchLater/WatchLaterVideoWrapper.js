import {
  MESSAGE,
  MAX_SAVED_VIDEOS_COUNT,
  LOCAL_STORAGE_KEY,
  CLASSNAME,
} from "../constants.js";
import messenger from "../Messenger.js";
import { $ } from "../utils/DOM.js";
import { VIDEO_TEMPLATE } from "../Video/template.js";
import { renderWatchLaterVideo } from "../Video/render.js";

export default class WatchLaterVideoWrapper {
  constructor() {
    this.watchLaterVideoItemsMap = new Map(
      JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEY.WATCH_LATER_VIDEO_ITEMS)
      )
    );

    this.watchLaterVideosMap = new Map();

    this.$noSavedVideoImage = $(
      `.${CLASSNAME.WATCH_LATER_CONTAINER} .${CLASSNAME.NO_SAVED_VIDEO_IMAGE}`
    );
    this.$watchLaterVideoWrapper = $(`.${CLASSNAME.WATCH_LATER_VIDEO_WRAPPER}`);

    messenger.addMessageListener(
      MESSAGE.SAVE_VIDEO_BUTTON_CLICKED,
      ({ videoId, item }) => {
        if (this.watchLaterVideosMap.has(videoId)) {
          this.deleteVideo(videoId);
          return;
        }
        this.saveVideoItem({ videoId, item });
      }
    );

    messenger.addMessageListener(
      MESSAGE.HIDE_IF_VIDEO_IS_SAVED,
      this.hideIfVideoIsSaved.bind(this)
    );

    this.$watchLaterVideoWrapper.addEventListener("click", (event) => {
      const { videoId } = event.target.parentElement.dataset;

      if (event.target.classList.contains(CLASSNAME.WATCHED_ICON)) {
        this.moveVideo(videoId);
      }

      if (event.target.classList.contains(CLASSNAME.DELETE_ICON)) {
        // eslint-disable-next-line no-alert
        if (window.confirm("정말 삭제하시겠습니까?")) {
          this.deleteVideo(videoId);
        }
      }
    });

    this.render();
  }

  moveVideo(videoId) {
    messenger.deliverMessage(MESSAGE.WATCHED_ICON_CLICKED, {
      videoId,
      item: this.watchLaterVideoItemsMap.get(videoId),
    });

    this.watchLaterVideoItemsMap.delete(videoId);

    this.updateLocalStorage();

    this.watchLaterVideosMap.get(videoId).remove();
    this.watchLaterVideosMap.delete(videoId);

    if (this.watchLaterVideosMap.size === 0) {
      $.show(this.$noSavedVideoImage);
    }
  }

  deleteVideo(videoId) {
    this.watchLaterVideoItemsMap.delete(videoId);

    this.updateLocalStorage();

    messenger.deliverMessage(MESSAGE.VIDEO_SAVED, {
      savedVideosCount: this.watchLaterVideoItemsMap.size,
    });

    this.watchLaterVideosMap.get(videoId).remove();
    this.watchLaterVideosMap.delete(videoId);

    if (this.watchLaterVideosMap.size === 0) {
      $.show(this.$noSavedVideoImage);
    }
  }

  saveVideoItem({ videoId, item }) {
    this.watchLaterVideoItemsMap.set(videoId, item);

    if (this.watchLaterVideoItemsMap.size > MAX_SAVED_VIDEOS_COUNT) {
      this.watchLaterVideoItemsMap = new Map(
        Array.from(this.watchLaterVideoItemsMap).slice(-MAX_SAVED_VIDEOS_COUNT)
      );
      this.$watchLaterVideoWrapper.children[
        this.$watchLaterVideoWrapper.childElementCount - 1
      ].remove();
    }

    this.updateLocalStorage();

    messenger.deliverMessage(MESSAGE.VIDEO_SAVED, {
      savedVideosCount: this.watchLaterVideoItemsMap.size,
    });

    this.renderSingleVideo(item);
  }

  updateLocalStorage() {
    localStorage.setItem(
      LOCAL_STORAGE_KEY.WATCH_LATER_VIDEO_ITEMS,
      JSON.stringify(this.watchLaterVideoItemsMap, (key, value) =>
        value instanceof Map ? Array.from(value) : value
      )
    );
  }

  hideIfVideoIsSaved({ videoId, callback }) {
    if (this.watchLaterVideoItemsMap.has(videoId)) {
      callback();
    }
  }

  render() {
    if (this.watchLaterVideoItemsMap.size === 0) {
      $.show(this.$noSavedVideoImage);
      return;
    }

    this.watchLaterVideoItemsMap.forEach(this.renderSingleVideo.bind(this));
  }

  renderSingleVideo(item) {
    $.hide(this.$noSavedVideoImage);

    this.$watchLaterVideoWrapper.insertAdjacentHTML(
      "afterBegin",
      VIDEO_TEMPLATE
    );

    const $video = this.$watchLaterVideoWrapper.children[0];
    renderWatchLaterVideo($video, item);

    const { videoId } = item.id;
    this.watchLaterVideosMap.set(videoId, $video);
  }
}
