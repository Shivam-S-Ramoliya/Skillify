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
<body style="margin: 0; padding: 0; background: linear-gradient(180deg, #eef2ff 0%, #faf5ff 48%, #ffffff 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 24px 64px rgba(79, 70, 229, 0.16); border: 1px solid rgba(255, 255, 255, 0.65);">
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #a855f7 100%); padding: 32px 40px; text-align: center; color: #ffffff;">
              <div style="display: inline-block; padding: 7px 16px; border: 1px solid rgba(255,255,255,0.28); border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 14px; background: rgba(255,255,255,0.12);">Skillify</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">Build your career by shipping real projects</h1>
              <p style="margin: 10px 0 0; color: #e9d5ff; font-size: 13px; letter-spacing: 0.6px;">Discover opportunities, collaborate with clients, and grow.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 24px 24px; background: linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.9) 100%);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: #ffffff; padding: 40px 36px; border-radius: 0 0 20px 20px; border: 1px solid #e5e7eb; border-top: none;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: #f8fafc; padding: 22px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #4f46e5; font-size: 12px; font-weight: 700;">&copy; 2026 Skillify. All rights reserved.</p>
              <p style="margin: 8px 0 0; color: #94a3b8; font-size: 11px;">If you didn't request this email, you can safely ignore it.</p>
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
              <h2 style="margin: 0 0 8px; color: #1E3A8A; font-size: 22px; font-weight: 700;">Verify Your Email</h2>
              <p style="margin: 0 0 24px; color: #6B7280; font-size: 15px; line-height: 1.6;">Thanks for signing up${name ? `, ${name}` : ""}! Use the button below to verify your Skillify account.</p>

              <div style="background: linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%); border: 1px solid #C7D2FE; border-radius: 14px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 10px; color: #4338CA; font-size: 13px; text-transform: uppercase; letter-spacing: 1.4px; font-weight: 700;">Verification Link</p>
                <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.7;">This secure link opens Skillify and verifies your account in one step.</p>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%); color: #ffffff; text-decoration: none; border-radius: 999px; font-size: 15px; font-weight: 700; letter-spacing: 0.4px; box-shadow: 0 10px 24px rgba(79, 70, 229, 0.28);">
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #64748B; font-size: 13px; text-align: center; line-height: 1.6;">If the button does not work, copy and paste this link into your browser:<br><a href="${verificationUrl}" style="color: #4f46e5; text-decoration: none; word-break: break-all;">${verificationUrl}</a></p>
              <p style="margin: 18px 0 0; color: #9CA3AF; font-size: 12px; text-align: center;">This verification link expires in <strong style="color: #4f46e5;">24 hours</strong>.</p>
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
                <div style="display: inline-block; background-color: #DCFCE7; border-radius: 50%; width: 72px; height: 72px; line-height: 72px; font-size: 36px; margin-bottom: 16px; color: #22C55E;">&#10003;</div>
              </div>
              <h2 style="margin: 0 0 8px; color: #1E3A8A; font-size: 22px; font-weight: 700; text-align: center;">Welcome, ${name}!</h2>
              <p style="margin: 0 0 24px; color: #6B7280; font-size: 15px; line-height: 1.6; text-align: center;">Your email has been verified successfully. You're all set to start your journey on Skillify!</p>
              
              <div style="background-color: #EFF6FF; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #2563EB; font-size: 18px; vertical-align: middle;">&#9733;</span>
                      <span style="color: #374151; font-size: 14px; margin-left: 8px;">Discover jobs and projects tailored for you</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #2563EB; font-size: 18px; vertical-align: middle;">&#9733;</span>
                      <span style="color: #374151; font-size: 14px; margin-left: 8px;">Collaborate with clients worldwide</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #2563EB; font-size: 18px; vertical-align: middle;">&#9733;</span>
                      <span style="color: #374151; font-size: 14px; margin-left: 8px;">Ship real projects &amp; grow your career</span>
                    </td>
                  </tr>
                </table>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.FRONTEND_URL}/login" 
                       style="display: inline-block; padding: 14px 40px; background-color: #2563EB; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; letter-spacing: 0.5px;">
                      Get Started
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #9CA3AF; font-size: 13px; text-align: center;">Welcome aboard! &#127891;</p>
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
              <h2 style="margin: 0 0 8px; color: #1E3A8A; font-size: 22px; font-weight: 700;">Reset Your Password</h2>
              <p style="margin: 0 0 24px; color: #6B7280; font-size: 15px; line-height: 1.6;">Hi ${name || "there"}, we received a request to reset your Skillify password. Use the button below to choose a new one.</p>

              <div style="background: linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%); border: 1px solid #C7D2FE; border-radius: 14px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 10px; color: #4338CA; font-size: 13px; text-transform: uppercase; letter-spacing: 1.4px; font-weight: 700;">Password Reset Requested</p>
                <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.7;">This link will take you directly to the secure password reset page inside Skillify.</p>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%); color: #ffffff; text-decoration: none; border-radius: 999px; font-size: 15px; font-weight: 700; letter-spacing: 0.4px; box-shadow: 0 10px 24px rgba(79, 70, 229, 0.28);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #64748B; font-size: 13px; text-align: center; line-height: 1.6;">If the button does not work, copy and paste this link into your browser:<br><a href="${resetUrl}" style="color: #4f46e5; text-decoration: none; word-break: break-all;">${resetUrl}</a></p>
              <p style="margin: 18px 0 0; color: #9CA3AF; font-size: 12px; text-align: center;">This reset link expires in <strong style="color: #4f46e5;">1 hour</strong>.</p>
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
              <h2 style="margin: 0 0 8px; color: #991b1b; font-size: 22px; font-weight: 700;">Account Deletion Request</h2>
              <p style="margin: 0 0 24px; color: #6B7280; font-size: 15px; line-height: 1.6;">Hi ${name || "there"}, we received a request to permanently delete your Skillify account. Use the button below to confirm this action.</p>

              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%); border: 1px solid #fecaca; border-radius: 14px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 10px; color: #b91c1c; font-size: 13px; text-transform: uppercase; letter-spacing: 1.4px; font-weight: 700;">Deletion Confirmation Link</p>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.7;">This secure link will confirm the deletion request and remove your account.</p>
              </div>

              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 600;">⚠️ Warning: This action is irreversible</p>
                <p style="margin: 8px 0 0; color: #7f1d1d; font-size: 13px; line-height: 1.5;">Deleting your account will permanently remove all your data including your profile, job posts, applications, and uploaded files. This cannot be undone.</p>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${deleteUrl}" 
                       style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #dc2626 0%, #e11d48 100%); color: #ffffff; text-decoration: none; border-radius: 999px; font-size: 15px; font-weight: 700; letter-spacing: 0.4px; box-shadow: 0 10px 24px rgba(220, 38, 38, 0.28);">
                      Confirm Deletion
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #64748B; font-size: 13px; text-align: center; line-height: 1.6;">If the button does not work, copy and paste this link into your browser:<br><a href="${deleteUrl}" style="color: #dc2626; text-decoration: none; word-break: break-all;">${deleteUrl}</a></p>
              <p style="margin: 18px 0 0; color: #9CA3AF; font-size: 12px; text-align: center;">This deletion link expires in <strong style="color: #dc2626;">15 minutes</strong>.</p>
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
                <div style="display: inline-block; background-color: #f3f4f6; border-radius: 50%; width: 72px; height: 72px; line-height: 72px; font-size: 32px; margin-bottom: 16px; color: #6b7280;">👋</div>
              </div>
              <h2 style="margin: 0 0 8px; color: #1f2937; font-size: 22px; font-weight: 700; text-align: center;">Account Deleted</h2>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6; text-align: center;">Hi ${name || "there"}, this email confirms that your Skillify account has been permanently deleted as requested.</p>
              
              <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: left;">
                <p style="margin: 0 0 12px; color: #374151; font-size: 14px; font-weight: 600;">As per your request, we have removed:</p>
                <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  <li>Your personal profile and settings</li>
                  <li>All your uploaded files (resume, pictures)</li>
                  <li>Jobs you have posted</li>
                  <li>Your job applications</li>
                </ul>
              </div>

              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">We're sorry to see you go! If you ever want to return, you can always <a href="${process.env.FRONTEND_URL}/signup" style="color: #2563EB; text-decoration: none; font-weight: 600;">create a new account</a>.</p>
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
