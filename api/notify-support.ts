export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  console.log('[Notify Support] incoming request', req.method);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body: any = req.body;
  if (!body || typeof body === 'string') {
    const raw = typeof req.body === 'string'
      ? req.body
      : await new Promise<string>((resolve, reject) => {
          let data = '';
          req.on('data', chunk => { data += chunk; });
          req.on('end', () => resolve(data));
          req.on('error', reject);
        });

    try {
      body = raw ? JSON.parse(raw) : body;
    } catch (error) {
      console.error('[Notify Support] invalid JSON body', error);
      return res.status(400).json({ error: 'Invalid JSON body.' });
    }
  }

  const {
    username,
    topic,
    message,
    threadId,
    userId,
    screenshotBase64,
    screenshotUrl,
    eventType = 'support',
  } = body || {};

  if (!message || !topic) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('[Notify Support] Telegram credentials not configured');
    return res.status(200).json({ success: true, message: 'Support recorded. Telegram not configured on this deployment.', telegramConfigured: false });
  }

  const displayName = username || userId || 'Unknown client';
  const caption = `📩 *NEW SUPPORT MESSAGE* 📩\n\n*Topic:* ${topic}\n*From:* ${displayName}\n*Thread:* ${threadId || 'N/A'}\n\n*Message:* ${message}\n\n🕒 *Time:* ${new Date().toLocaleString()}`;

  try {
    let response: any = null;

    // Try sending photo if a screenshot URL is provided
    if (typeof screenshotUrl === 'string' && screenshotUrl.length > 0) {
      const photoBody = {
        chat_id: chatId,
        photo: screenshotUrl,
        caption,
        parse_mode: 'Markdown',
      };

      response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoBody),
      });
    }

    // If photo not sent yet and we have base64 image, attempt multipart upload
    if ((!response || !response.ok) && typeof screenshotBase64 === 'string' && screenshotBase64.startsWith('data:')) {
      const matches = screenshotBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const blob = new Blob([buffer], { type: mimeType });

        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('photo', blob, 'support_screenshot.png');
        formData.append('caption', caption);
        formData.append('parse_mode', 'Markdown');

        response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          body: formData,
        });
      } else {
        console.warn('[Notify Support] screenshot base64 parse failed');
      }
    }

    // Fallback to sendMessage if photo not sent
    if (!response || !response.ok) {
      const fallbackText = screenshotUrl ? `\n\nProof image available at: ${screenshotUrl}` : '';
      const fallbackBody = {
        chat_id: chatId,
        text: caption + '\n\n⚠️ (Screenshot unavailable or could not be uploaded.)' + fallbackText,
        parse_mode: 'Markdown',
      };

      response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fallbackBody),
      });
    }

    const result = await response.json();
    console.log('[Notify Support] telegram response status', response.status);

    if (!response.ok) {
      return res.status(502).json({ success: false, error: result.description || 'Telegram API error', telegramResponse: result });
    }

    return res.status(200).json({ success: true, message: 'Support notification sent to Telegram bot successfully!', telegramConfigured: true, telegramResponse: result });
  } catch (error: any) {
    console.error('[Notify Support] internal error', error);
    return res.status(500).json({ error: error?.message || 'Internal server error.', details: String(error) });
  }
}
