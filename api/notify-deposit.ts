export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  console.log('[Vercel Notify] incoming request', req.method, req.url || req.originalUrl);
  console.log('[Vercel Notify] request headers', req.headers);

  if (req.method !== 'POST') {
    console.warn('[Vercel Notify] invalid method', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
      console.error('[Vercel Notify] invalid JSON body', error);
      return res.status(400).json({ error: 'Invalid JSON body.' });
    }
  }

  console.log('[Vercel Notify] request body', body);

  const {
    username,
    planName,
    amount,
    paymentMethod,
    screenshotBase64,
    screenshotUrl,
    eventType = 'deposit',
    email,
    walletAddress,
  } = body || {};

  const isAccountOpened = eventType === 'account_opened';
  const isWithdrawal = eventType === 'withdrawal';
  const displayName = username || email || 'Unknown client';

  if (isAccountOpened) {
    if (!displayName) {
      return res.status(400).json({ error: 'Missing required account information.' });
    }
  } else if (!username || !planName || amount === undefined || amount === null) {
    return res.status(400).json({ error: 'Missing required payment information.' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('[Vercel Notify] missing Telegram credentials');
    return res.status(200).json({
      success: true,
      message: 'Payment recorded. Telegram credentials are not configured on this deployment.',
      telegramConfigured: false,
    });
  }

  const caption = isAccountOpened
    ? `👑 *NEW FOREX ROYAL ACCOUNT OPENED* 👑

👤 *Client:* ${displayName}
📧 *Email:* ${email || 'Not provided'}
💼 *Wallet:* ${walletAddress || 'Not provided'}
🕒 *Registration Time:* ${new Date().toLocaleString()}

✅ *Action:* Review the new client account and welcome them into the platform.`
    : isWithdrawal
    ? `⚠️ *WITHDRAWAL FEE PROOF SUBMITTED* ⚠️

👤 *Username:* ${username}
💼 *Payout Wallet:* ${walletAddress || 'Not provided'}
💳 *Payment Currency:* ${paymentMethod || 'Crypto'}
💰 *Fee Amount:* £${Number(amount).toLocaleString()}
🕒 *Submission Time:* ${new Date().toLocaleString()}

✅ *Action:* Please review the withdrawal fee screenshot and approve or decline the withdrawal request.`
    : `👑 *NEW FOREX ROYAL DEPOSIT REPORT* 👑

👤 *Username:* ${username}
💼 *Investment Plan:* ${planName}
💰 *Capital Amount:* £${Number(amount).toLocaleString()}
💳 *Payment Gateway:* ${paymentMethod || 'Crypto Address'}
🕒 *Verification Time:* ${new Date().toLocaleString()}

✅ *Action:* Please verify the transaction screenshot attached below and activate the user's pool contract.`;

  try {
    let response: any = null;

    if (typeof screenshotUrl === 'string' && screenshotUrl.length > 0) {
      const photoBody = {
        chat_id: chatId,
        photo: screenshotUrl,
        caption,
        parse_mode: 'Markdown',
      };

      response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(photoBody),
      });
    }

    if ((!response || !response.ok) && typeof screenshotBase64 === 'string' && screenshotBase64.startsWith('data:')) {
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
      } else {
        console.warn('[Vercel Notify] screenshot base64 parse failed', screenshotBase64?.slice(0, 100));
      }
    }

    if (!response || !response.ok) {
      const fallbackText = screenshotUrl ? `

Proof image available at: ${screenshotUrl}` : '';
      const fallbackBody = {
        chat_id: chatId,
        text: caption + '\n\n⚠️ (Screenshot unavailable or could not be uploaded.)' + fallbackText,
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
    console.log('[Vercel Notify] telegram response status', response.status, 'body', result);

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        error: result.description || 'Telegram API error.',
        telegramResponse: result,
      });
    }

    return res.status(200).json({
      success: true,
      message: isAccountOpened ? 'Account-opened notification sent to Telegram bot successfully!' : 'Deposit notification sent to Telegram bot successfully!',
      telegramConfigured: true,
      telegramResponse: result,
    });
  } catch (error: any) {
    console.error('[Vercel Notify] internal error', error);
    return res.status(500).json({
      error: error?.message || 'Internal server error.',
      details: String(error),
    });
  }
}
