  // cf: https://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobi|Android/i.test(navigator.userAgent);
}

export { isMobile };
