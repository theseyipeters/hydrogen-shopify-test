import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {getSitemap} from '@shopify/hydrogen';

export async function loader({
  request,
  params,
  context: {storefront},
}: LoaderFunctionArgs) {
  const response = await getSitemap({
    storefront,
    request,
    params,
    // locales: ['EN-US', 'EN-CA', 'FR-CA'],
    getLink: ({type, baseUrl, handle, locale}) => {
      return `${baseUrl}/${type}/${handle}`;
    },
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}
