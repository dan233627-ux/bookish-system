import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit to handle base64 screenshots comfortably
  app.use(express.json({ limit: '20mb' }));

  // API Endpoint to send direct Telegram notification with screenshot
  app.post('/api/notify-deposit', async (req, res) => {
    try {
      const { username, planName, amount, paymentMethod, screenshotBase64 } = req.body;

      if (!username || !planName || !amount) {
        return res.status(400).json({ error: 'Missing required deposit information.' });
      }

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      console.log(`[Deposit Notification Service] Received deposit from ${username} for ${planName} (${amount}) via ${paymentMethod || 'Crypto'}`);

      if (!botToken || !chatId) {
        console.warn('[Deposit Notification Service] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured in environment variables.');
        return res.json({
          success: true,
          message: 'Deposit recorded on backend simulation. Telegram credentials are not configured in your .env yet. Please configure them to receive instant bot alerts.',
          telegramConfigured: false
        });
      }

      // Compose a visually appealing message caption for Telegram
      const caption = 
`👑 *NEW FOREX ROYAL DEPOSIT REPORT* 👑

👤 *Username:* ${username}
💼 *Investment Plan:* ${planName}
💰 *Capital Amount:* £${Number(amount).toLocaleString()}
💳 *Payment Gateway:* ${paymentMethod || 'Crypto Address'}
🕒 *Verification Time:* ${new Date().toLocaleString()}

✅ *Action:* Please verify the transaction screenshot attached below and activate the user's pool contract.`;

      let telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      let response;

      if (screenshotBase64 && screenshotBase64.startsWith('data:')) {
        // Decode base64 image and send as physical attachment
        const matches = screenshotBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const blob = new Blob([buffer], { type: mimeType });

          const formData = new FormData();
          formData.append('chat_id', chatId);
          formData.append('photo', blob, 'deposit_screenshot.png');
          formData.append('caption', caption);
          formData.append('parse_mode', 'Markdown');

          response = await fetch(telegramUrl, {
            method: 'POST',
            body: formData,
          });
        }
      }

      // Fallback to sendMessage if no screenshot or parsing failed
      if (!response || !response.ok) {
        const fallbackUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const fallbackBody = {
          chat_id: chatId,
          text: caption + '\n\n⚠️ (Note: Screenshot could not be uploaded or was missing)',
          parse_mode: 'Markdown'
        };

        response = await fetch(fallbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fallbackBody)
        });
      }

      const responseData = await response.json();
      if (!response.ok) {
        console.error('[Deposit Notification Service] Telegram API Error:', responseData);
        return res.status(502).json({
          success: false,
          error: responseData.description || 'Failed to send notification to Telegram.'
        });
      }

      console.log('[Deposit Notification Service] Telegram alert dispatched successfully!');
      return res.json({
        success: true,
        message: 'Deposit notification sent to Telegram bot successfully!',
        telegramConfigured: true
      });

    } catch (error: any) {
      console.error('[Deposit Notification Service] Internal Error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error.' });
    }
  });

  // Setup Vite dev server or serve production static assets
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Forex Royal Server] Running on http://0.0.0.0:${PORT} under NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch((err) => {
  console.error('[Forex Royal Server] Startup Failure:', err);
});
