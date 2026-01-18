import Mailgen from "mailgen";
import nodeMailer from "nodemailer";

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Task Manager",
      link: "https://taskmanagerlink.com",
    },
  });

  // Does not support HTML
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  // Supports Html
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const transporter = nodeMailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  const mail = {
    from: "mail.taskmanager@example.com",
    to: options.email,
    subject: options.subject,
    text: emailTextual, //if not compatible with html then automatically goes for textual.
    html: emailHtml,
  };

  // since it has the tendency to fail
  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error("Email service failed!", error);
  }
};

const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our App! we'r excited to have you on board",
      action: {
        instructions:
          "To verify your email Please click on the following button",
        button: {
          color: "#22BC66",
          text: "Verify Email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};
const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our App! we'r excited to have you on board",
      action: {
        instructions:
          "To reset your password, Please click on the following button",
        button: {
          color: "#22BC66",
          text: "Reset Password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
};
