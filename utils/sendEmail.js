const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email using Resend.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 */
async function sendEmail(to, subject, html) {
  try {
    console.log("Preparing to send email...");
    console.log("To:", to);
    console.log("Subject:", subject);

    const email = await resend.emails.send({
      from: "no-reply@devbyjess.com",
      to,
      subject,
      html,
    });

    console.log("Email sent!");
    console.log("Resend email ID:", email.id);
    console.log("Full response:", email);
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
  }
}

module.exports = sendEmail;
