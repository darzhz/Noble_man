export const LOADING_IMAGES = [
  '/loading/loading-bond.jpg',
  '/loading/loading-cityline.jpg',
  '/loading/loading-couple.jpg',
  '/loading/loading-dog.jpg',
  '/loading/loading-ellen.jpg',
  '/loading/loading-gothic.jpg',
  '/loading/loading-logan_paul.jpg',
  '/loading/loading-mand_and_dog.jpg',
  '/loading/loading-soldier.jpg',
] as const;

let didPreload = false;

export function preloadLoadingImages() {
  if (didPreload || typeof window === 'undefined') return;
  didPreload = true;

  LOADING_IMAGES.forEach((src) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  });
}
