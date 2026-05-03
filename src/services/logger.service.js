import env from '../config/env.js';

export const logErrorToSlack = async (err, req) => {
    if (!env.SLACK_WEBHOOK_URL) return;

    try {
        const payload = {
            text: '🚨 *Error 5XX en BildyApp*',
            attachments: [
                {
                    color: '#ff0000',
                    fields: [
                        { title: 'Timestamp', value: new Date().toISOString(), short: true },
                        { title: 'Método',    value: req.method,              short: true },
                        { title: 'Ruta',      value: req.originalUrl,         short: true },
                        { title: 'Error',     value: err.message,             short: false },
                        { title: 'Stack',     value: `\`\`\`${err.stack?.slice(0, 500) ?? 'N/A'}\`\`\``, short: false }
                    ]
                }
            ]
        };

        await fetch(env.SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (slackErr) {
        console.error('[Slack] Error enviando notificación:', slackErr.message);
    }
};
