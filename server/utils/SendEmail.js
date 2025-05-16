const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user, code) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.code = code;
    this.from = `Abdulhamid Gouda <${process.env.EMAIL_FROM}>`;
  }

  // Create
  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // This is the insecure option
      },
    });
  }

  // Send
  async send(message, subject) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: message,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  // Password reset email
  async sendPasswordReset(protocol, host) {
    const message = `Hello ${this.firstname},

        We received a request to reset your password on your account.

        Please click on the following link to reset your password (valid for 10 minutes):

        ${this.code}


        If you did not request a password reset, please ignore this email.`;
    await this.send(message, 'Your password reset link (valid for 10 minutes)');
  }

  async sendWelcome() {
    const message = `Hi ${this.firstname},\n Welcome to the Family!\nYou’ve successfully registered, and your journey with us has just begun.\nEnjoy your journey with us!\n`;
    await this.send(message, 'Welcome to the eventify Family!');
  }
};
