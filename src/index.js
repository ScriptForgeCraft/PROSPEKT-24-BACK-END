export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const fileId = url.searchParams.get('id');
    const fileName = url.searchParams.get('name') || 'download.zip';

    if (!fileId) {
      return new Response('Не указан ID файла', { status: 400 });
    }

    const apiKey = env.GOOGLE_API_KEY;
    const googleUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;

    const headers = new Headers();
    const referer = request.headers.get('Referer') || request.headers.get('Origin');
    if (referer) {
      headers.set('Referer', referer);
    }

    const googleResponse = await fetch(googleUrl, { headers });

    if (!googleResponse.ok) {
      return new Response('Ошибка при скачивании из Google Drive', { status: googleResponse.status });
    }

    const responseHeaders = new Headers(googleResponse.headers);
    responseHeaders.set('Content-Disposition', `attachment; filename="${fileName}"`);
    
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

    if (request.method === 'HEAD' || request.method === 'OPTIONS') {
      return new Response(null, { headers: responseHeaders });
    }

    return new Response(googleResponse.body, {
      status: googleResponse.status,
      headers: responseHeaders
    });
  }
};