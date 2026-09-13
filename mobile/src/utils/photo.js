import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export const MAX_PHOTO_EDGE = 1600;
export const PHOTO_COMPRESSION = 0.62;

function approximateBase64Bytes(base64 = '') {
  return Math.ceil((base64.length * 3) / 4);
}

export async function compressPickedPhoto(asset) {
  const context = ImageManipulator.manipulate(asset.uri);
  const width = Number(asset.width) || 0;
  const height = Number(asset.height) || 0;

  if (width >= height && width > MAX_PHOTO_EDGE) {
    context.resize({ width: MAX_PHOTO_EDGE, height: null });
  } else if (height > width && height > MAX_PHOTO_EDGE) {
    context.resize({ width: null, height: MAX_PHOTO_EDGE });
  }

  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({
    compress: PHOTO_COMPRESSION,
    format: SaveFormat.JPEG,
    base64: true,
  });

  if (!result.base64) {
    throw new Error('Unable to compress this photo.');
  }

  return {
    uri: result.uri,
    dataUri: `data:image/jpeg;base64,${result.base64}`,
    width: result.width,
    height: result.height,
    bytes: approximateBase64Bytes(result.base64),
  };
}

export function formatCompressedPhotoInfo(photo) {
  return `${photo.width}×${photo.height} · ${Math.max(1, Math.round(photo.bytes / 1024))} KB`;
}
