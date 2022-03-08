const isEmptyKeyword = (keyword) => keyword.trim().length === 0;

const validateKeyword = (keyword) => {
  if (isEmptyKeyword(keyword)) {
    throw new Error('검색어를 입력해 주세요.');
  }
};

const URL =
  'https://622752939a5410d43ba3fbcd--modest-euler-778376.netlify.app/dummy/youtube/v3/search?';

const OPTIONS = {
  part: 'snippet',
  maxResults: 10,
  order: 'date',
};

const stringQuery = (props) => {
  const { url, keyword, pageToken, options } = props;
  const query = Object.entries(options).reduce(
    (acc, [key, value]) => (acc += `${key}=${value}&`),
    `${url}q=${keyword}&`
  );

  if (pageToken === '') {
    return query;
  }
  return `${query}pageToken=${pageToken}`;
};
const KEY = 'VIDEO_IDS';

const getStorageVideoIDs = (key) =>
  JSON.parse(window.localStorage.getItem(key)) || [];

const template = (json) => {
  const videoIds = getStorageVideoIDs(KEY);
  return json.items
    .map((item) => {
      const {
        id: { videoId },
        snippet: {
          thumbnails: {
            medium: { url },
          },
          publishTime,
          channelTitle,
          title,
        },
      } = item;

      const storeButton = videoIds.includes(videoId)
        ? ''
        : '<button class="video-item__save-button button">⬇ 저장</button>';
      const timeFormatter = publishTime.split('T')[0];
      return `
        <li class="video-item" data-video-id="${videoId}">
          <img
            src="${url}"
            alt="video-item-thumbnail" class="video-item__thumbnail">
          <h4 class="video-item__title">${title}</h4>
          <p class="video-item__channel-name">${channelTitle}</p>
          <p class="video-item__published-date">${timeFormatter}</p>
          ${storeButton}
        </li>
          `;
    })
    .join('');
};

const SKELETON_TEMPLATE = `
<div class="skeleton">
<div class="image"></div>
<p class="line"></p>
<p class="line"></p>
</div>
  `;

export default class SearchModal {
  constructor(element) {
    this.element = element;
    this.bindEvents();
    this.pageToken = '';
  }

  bindEvents() {
    this.element.addEventListener('click', this.storeIDHandler.bind(this));

    const dimmer = this.element.querySelector('.dimmer');
    dimmer.addEventListener('click', this.closeModalHandler.bind(this));

    const searchForm = this.element.querySelector('#search-form');
    searchForm.addEventListener('submit', this.searchHandler.bind(this));

    const videoList = this.element.querySelector('.video-list');
    videoList.addEventListener('scroll', this.scrollHandler.bind(this));
  }

  closeModalHandler() {
    this.element.classList.add('hide');
  }

  storeIDHandler(e) {
    if (e.target.className.includes('video-item__save-button')) {
      const videoID = e.target.closest('li').dataset.videoId;

      const videoIDs = getStorageVideoIDs(KEY);

      if (videoIDs.length > 99) {
        return;
      }

      window.localStorage.setItem(
        KEY,
        JSON.stringify(videoIDs.concat(videoID))
      );
    }
  }

  scrollHandler(e) {
    const { scrollTop, offsetHeight, scrollHeight } = e.target;

    const isNextScroll = scrollTop + offsetHeight >= scrollHeight;

    const searchInputKeyword = this.element.querySelector(
      '#search-input-keyword'
    );
    const keyword = searchInputKeyword.value;

    if (isNextScroll) {
      this.fetchData({
        url: URL,
        keyword,
        options: OPTIONS,
        pageToken: this.pageToken,
      });
    }
  }

  async searchHandler(e) {
    e.preventDefault();
    this.element.querySelector('.video-list').replaceChildren();

    const searchInputKeyword = this.element.querySelector(
      '#search-input-keyword'
    );
    const keyword = searchInputKeyword.value;
    const searchErrorMessage = this.element.querySelector(
      '#search-error-message'
    );

    try {
      validateKeyword(keyword);

      this.fetchData({
        url: URL,
        keyword,
        options: OPTIONS,
        pageToken: this.pageToken,
      });

      searchErrorMessage.textContent = '';
    } catch (error) {
      searchErrorMessage.textContent = '검색어를 입력해 주세요.';
    }
  }

  async fetchData(props) {
    this.element
      .querySelector('.video-list')
      .insertAdjacentHTML('beforeend', SKELETON_TEMPLATE.repeat(10));

    const result = await fetch(stringQuery(props));
    const json = await result.json();
    this.element.querySelectorAll('.skeleton').forEach((ele) => ele.remove());
    this.pageToken = json.nextPageToken;

    this.element
      .querySelector('.video-list')
      .insertAdjacentHTML('beforeend', template(json));
  }
}