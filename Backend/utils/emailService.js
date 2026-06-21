// ────────────────────────────────────────────────────────────────
// Brevo HTTP API Transport
// Works on Render free tier (uses HTTPS REST API)
// ────────────────────────────────────────────────────────────────

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const SENDER_NAME = process.env.BREVO_SENDER_NAME;

console.log("✅ Email service: using Brevo HTTP API");
console.log("   Sender email:", SENDER_EMAIL);

// Send email via Brevo
const sendMail = async ({ to, subject, html }) => {
  if (!BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not defined in environment variables");
  }

  const recipients = (Array.isArray(to) ? to : [to]).map((email) => ({ email }));

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: SENDER_NAME,
        email: SENDER_EMAIL,
      },
      to: recipients,
      subject,
      htmlContent: html,
    }),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Brevo API error response:", responseData);
    throw new Error(responseData.message || "Failed to send email via Brevo");
  }

  console.log("Email sent via Brevo. Message ID:", responseData.messageId);
  return responseData;
};

// ────────────────────────────────────────────────────────────────
// Shared email wrapper with Skillify branding
// ────────────────────────────────────────────────────────────────
const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FFF4ED; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 40px 0; background-color: #FFF4ED;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(113, 111, 111, 0.05); border: 1px solid rgba(113, 111, 111, 0.15);">
          <tr>
            <td style="background-color: #1E1E1E; padding: 32px 40px; text-align: center; color: #ffffff;">
              <div style="display: inline-block; padding: 7px 16px; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 14px; background: rgba(255,255,255,0.05); color: #FF4F00;">Skillify</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">Build your career by shipping real projects</h1>
              <p style="margin: 8px 0 0; color: #A1A1AA; font-size: 13px;">Discover opportunities, collaborate with clients, and grow.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px; background-color: #FFF4ED;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: #ffffff; padding: 36px; border-radius: 12px; border: 1px solid rgba(113, 111, 111, 0.15);">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #FFF4ED; padding: 22px 28px; text-align: center; border-top: 1px solid rgba(113, 111, 111, 0.15);">
              <p style="margin: 0; color: #716F6F; font-size: 12px; font-weight: 700;">&copy; 2026 Skillify. All rights reserved.</p>
              <p style="margin: 8px 0 0; color: #A1A1AA; font-size: 11px;">If you didn't request this email, you can safely ignore it.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ────────────────────────────────────────────────────────────────
// Email senders
// ────────────────────────────────────────────────────────────────

// Send verification email with a signed link
const sendVerificationEmail = async (email, verificationToken, name) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(verificationToken)}&email=${encodeURIComponent(email)}`;

    const content = `
              <h2 style="margin: 0 0 8px; color: #1E1E1E; font-size: 22px; font-weight: 700;">Verify Your Email</h2>
              <p style="margin: 0 0 24px; color: #716F6F; font-size: 15px; line-height: 1.6;">Thanks for signing up${name ? `, ${name}` : ""}! Use the button below to verify your Skillify account.</p>

              <div style="background-color: #FFF4ED; border: 1px solid rgba(255, 79, 0, 0.15); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 10px; color: #FF4F00; font-size: 13px; text-transform: uppercase; letter-spacing: 1.4px; font-weight: 700;">Verification Link</p>
                <p style="margin: 0; color: #716F6F; font-size: 14px; line-height: 1.7;">This secure link opens Skillify and verifies your account in one step.</p>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; padding: 14px 36px; background-color: #FF4F00; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 700; letter-spacing: 0.4px;">
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #716F6F; font-size: 13px; text-align: center; line-height: 1.6;">If the button does not work, copy and paste this link into your browser:<br><a href="${verificationUrl}" style="color: #FF4F00; text-decoration: none; word-break: break-all;">${verificationUrl}</a></p>
              <p style="margin: 18px 0 0; color: #A1A1AA; font-size: 12px; text-align: center;">This verification link expires in <strong style="color: #FF4F00;">24 hours</strong>.</p>
        `;

    await sendMail({
      to: email,
      subject: "Verify Your Skillify Account",
      html: emailWrapper(content),
    });
    console.log("Verification email sent to:", email);
    return true;
  } catch (error) {
    console.error("Verification email error:", error.message);
    throw new Error("Failed to send verification email");
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async (email, name) => {
  try {
    const content = `
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background-color: rgba(255, 79, 0, 0.1); border-radius: 50%; width: 72px; height: 72px; line-height: 72px; font-size: 36px; margin-bottom: 16px; color: #FF4F00;">&#10003;</div>
              </div>
              <h2 style="margin: 0 0 8px; color: #1E1E1E; font-size: 22px; font-weight: 700; text-align: center;">Welcome, ${name}!</h2>
              <p style="margin: 0 0 24px; color: #716F6F; font-size: 15px; line-height: 1.6; text-align: center;">Your email has been verified successfully. You're all set to start your journey on Skillify!</p>
              
              <div style="background-color: #FFF4ED; border: 1px solid rgba(255, 79, 0, 0.15); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #FF4F00; font-size: 18px; vertical-align: middle;">&#9733;</span>
                      <span style="color: #1E1E1E; font-size: 14px; margin-left: 8px; font-weight: 600;">Discover jobs and projects tailored for you</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #FF4F00; font-size: 18px; vertical-align: middle;">&#9733;</span>
                      <span style="color: #1E1E1E; font-size: 14px; margin-left: 8px; font-weight: 600;">Collaborate with clients worldwide</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #FF4F00; font-size: 18px; vertical-align: middle;">&#9733;</span>
                      <span style="color: #1E1E1E; font-size: 14px; margin-left: 8px; font-weight: 600;">Ship real projects &amp; grow your career</span>
                    </td>
                  </tr>
                </table>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.FRONTEND_URL}/login" 
                       style="display: inline-block; padding: 14px 40px; background-color: #FF4F00; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 700; letter-spacing: 0.5px;">
                      Get Started
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #A1A1AA; font-size: 13px; text-align: center;">Welcome aboard! &#127891;</p>
        `;

    await sendMail({
      to: email,
      subject: "Welcome to Skillify! 🎉",
      html: emailWrapper(content),
    });
    console.log("Welcome email sent to:", email);
    return true;
  } catch (error) {
    console.error("Welcome email error:", error.message);
    throw new Error("Failed to send welcome email");
  }
};

// Send password reset email with secure reset link
const sendPasswordResetEmail = async (email, name, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const content = `
              <h2 style="margin: 0 0 8px; color: #1E1E1E; font-size: 22px; font-weight: 700;">Reset Your Password</h2>
              <p style="margin: 0 0 24px; color: #716F6F; font-size: 15px; line-height: 1.6;">Hi ${name || "there"}, we received a request to reset your Skillify password. Use the button below to choose a new one.</p>

              <div style="background-color: #FFF4ED; border: 1px solid rgba(255, 79, 0, 0.15); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 10px; color: #FF4F00; font-size: 13px; text-transform: uppercase; letter-spacing: 1.4px; font-weight: 700;">Password Reset Requested</p>
                <p style="margin: 0; color: #716F6F; font-size: 14px; line-height: 1.7;">This link will take you directly to the secure password reset page inside Skillify.</p>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 14px 36px; background-color: #FF4F00; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 700; letter-spacing: 0.4px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #716F6F; font-size: 13px; text-align: center; line-height: 1.6;">If the button does not work, copy and paste this link into your browser:<br><a href="${resetUrl}" style="color: #FF4F00; text-decoration: none; word-break: break-all;">${resetUrl}</a></p>
              <p style="margin: 28px 0 0; color: #A1A1AA; font-size: 12px; text-align: center;">This reset link expires in <strong style="color: #FF4F00;">1 hour</strong>.</p>
        `;

    await sendMail({
      to: email,
      subject: "Reset Your Skillify Password",
      html: emailWrapper(content),
    });
    console.log("Password reset email sent to:", email);
    return true;
  } catch (error) {
    console.error("Password reset email error:", error.message);
    throw new Error("Failed to send password reset email");
  }
};

// Send account deletion confirmation email with secure token link
const sendDeleteAccountOtpEmail = async (email, token, name) => {
  try {
    const deleteUrl = `${process.env.FRONTEND_URL}/confirm-delete?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    const content = `
              <h2 style="margin: 0 0 8px; color: #DC2626; font-size: 22px; font-weight: 700;">Account Deletion Request</h2>
              <p style="margin: 0 0 24px; color: #716F6F; font-size: 15px; line-height: 1.6;">Hi ${name || "there"}, we received a request to permanently delete your Skillify account. Use the button below to confirm this action.</p>

              <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 10px; color: #DC2626; font-size: 13px; text-transform: uppercase; letter-spacing: 1.4px; font-weight: 700;">Deletion Confirmation Link</p>
                <p style="margin: 0; color: #7F1D1D; font-size: 14px; line-height: 1.7;">This secure link will confirm the deletion request and remove your account.</p>
              </div>

              <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #DC2626; font-size: 14px; font-weight: 600;">⚠️ Warning: This action is irreversible</p>
                <p style="margin: 8px 0 0; color: #7F1D1D; font-size: 13px; line-height: 1.5;">Deleting your account will permanently remove all your data including your profile, job posts, applications, and uploaded files. This cannot be undone.</p>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${deleteUrl}" 
                       style="display: inline-block; padding: 14px 36px; background-color: #DC2626; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 700; letter-spacing: 0.4px;">
                      Confirm Deletion
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #716F6F; font-size: 13px; text-align: center; line-height: 1.6;">If the button does not work, copy and paste this link into your browser:<br><a href="${deleteUrl}" style="color: #DC2626; text-decoration: none; word-break: break-all;">${deleteUrl}</a></p>
              <p style="margin: 18px 0 0; color: #A1A1AA; font-size: 12px; text-align: center;">This deletion link expires in <strong style="color: #DC2626;">15 minutes</strong>.</p>
        `;

    await sendMail({
      to: email,
      subject: "Confirm Your Skillify Account Deletion",
      html: emailWrapper(content),
    });
    console.log("Delete account token email sent to:", email);
    return true;
  } catch (error) {
    console.error("Delete account token email error:", error.message);
    throw new Error("Failed to send account deletion email");
  }
};

// Send final account deleted confirmation email (Post-deletion notification)
const sendAccountDeletedConfirmationEmail = async (email, name) => {
  try {
    const content = `
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background-color: #FFF4ED; border-radius: 50%; width: 72px; height: 72px; line-height: 72px; font-size: 32px; margin-bottom: 16px; color: #FF4F00;">👋</div>
              </div>
              <h2 style="margin: 0 0 8px; color: #1E1E1E; font-size: 22px; font-weight: 700; text-align: center;">Account Deleted</h2>
              <p style="margin: 0 0 24px; color: #716F6F; font-size: 15px; line-height: 1.6; text-align: center;">Hi ${name || "there"}, this email confirms that your Skillify account has been permanently deleted as requested.</p>
              
              <div style="background-color: #FFF4ED; border: 1px solid rgba(255, 79, 0, 0.15); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: left;">
                <p style="margin: 0 0 12px; color: #1E1E1E; font-size: 14px; font-weight: 600;">As per your request, we have removed:</p>
                <ul style="margin: 0; padding-left: 20px; color: #716F6F; font-size: 14px; line-height: 1.6;">
                  <li>Your personal profile and settings</li>
                  <li>All your uploaded files (resume, pictures)</li>
                  <li>Jobs you have posted</li>
                  <li>Your job applications</li>
                </ul>
              </div>

              <p style="margin: 0; color: #A1A1AA; font-size: 14px; text-align: center;">We're sorry to see you go! If you ever want to return, you can always <a href="${process.env.FRONTEND_URL}/signup" style="color: #FF4F00; text-decoration: none; font-weight: 600;">create a new account</a>.</p>
        `;

    await sendMail({
      to: email,
      subject: "Account Successfully Deleted - Skillify",
      html: emailWrapper(content),
    });
    console.log("Account deleted confirmation email sent to:", email);
    return true;
  } catch (error) {
    console.error("Account deleted confirmation email error:", error.message);
    // Don't throw here to avoid preventing the actual account deletion from succeeding
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendDeleteAccountOtpEmail,
  sendAccountDeletedConfirmationEmail,
};
