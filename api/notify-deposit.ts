export const config = {
  runtime: 'nodejs',
};

const jsonHeaders = {
  'Content-Type': 'application/json',
};

export default async function handler(request: Request): Promise<Response> {
  console.log('[Vercel Notify] incoming request', request.method, request.url);
  const requestHeaders: any = {};
  request.headers.forEach((value, key) => { requestHeaders[key] = value; });
  console.log('[Vercel Notify] request headers', requestHeaders);

  if (request.method !== 'POST') {
    console.warn('[Vercel Notify] invalid method', request.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: jsonHeaders,
    });
  }

  let body: any;
  try {
    body = await request.json();
    console.log('[Vercel Notify] request body', body);
  } catch (error) {
    console.error('[Vercel Notify] invalid JSON body', error);
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: jsonHeaders,
    });
  }

  const { username, planName, amount, paymentMethod, screenshotBase64 } = body || {};
  if (!username || !planName || amount === undefined || amount === null) {
    return new Response(JSON.stringify({ error: 'Missing required deposit information.' }), {
      status: 400,
      headers: jsonHeaders,
    });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Deposit recorded. Telegram credentials are not configured on this deployment.',
        telegramConfigured: false,
      }),
      {
        status: 200,
        headers: jsonHeaders,
      }
    );
  }

  const caption = `👑 *NEW FOREX ROYAL DEPOSIT REPORT* 👑

👤 *Username:* ${username}
💼 *Investment Plan:* ${planName}
💰 *Capital Amount:* £${Number(amount).toLocaleString()}
💳 *Payment Gateway:* ${paymentMethod || 'Crypto Address'}
🕒 *Verification Time:* ${new Date().toLocaleString()}

✅ *Action:* Please verify the transaction screenshot attached below and activate the user's pool contract.`;

  try {
    let response: Response | null = null;

    if (typeof screenshotBase64 === 'string' && screenshotBase64.startsWith('data:')) {
      const matches = screenshotBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const blob = new Blob([buffer], { type: mimeType });

        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('photo', blob, 'deposit_screenshot.png');
        formData.append('caption', caption);
        formData.append('parse_mode', 'Markdown');

        response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          body: formData,
        });
      }
    }

    if (!response || !response.ok) {
      const fallbackBody = {
        chat_id: chatId,
        text: caption + '\n\n⚠️ (Screenshot unavailable or could not be uploaded.)',
        parse_mode: 'Markdown',
      };

      response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fallbackBody),
      });
    }

    const result = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify({ success: false, error: result.description || 'Telegram API error.' }), {
        status: 502,
        headers: jsonHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Deposit notification sent to Telegram bot successfully!', telegramConfigured: true }), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Internal server error.' }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
}
