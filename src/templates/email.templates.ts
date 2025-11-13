export const emailVerificationTemplate = (token: string) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Подтверждение смены email</h1>
          <p>Вы запросили смену email адреса.</p>
          <p>Для подтверждения перейдите по ссылке:</p>
          <a href="${verificationLink}" class="button">Подтвердить email</a>
          <p>Или скопируйте ссылку:</p>
          <p>${verificationLink}</p>
          <div class="footer">
            <p>Ссылка действительна 15 минут.</p>
            <p>Если вы не запрашивали смену email, проигнорируйте это письмо.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const passwordResetTemplate = (token: string) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #f44336;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Сброс пароля</h1>
          <p>Вы запросили сброс пароля.</p>
          <p>Для сброса пароля перейдите по ссылке:</p>
          <a href="${resetLink}" class="button">Сбросить пароль</a>
          <p>Или скопируйте ссылку:</p>
          <p>${resetLink}</p>
          <div class="footer">
            <p>Ссылка действительна 15 минут.</p>
            <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
