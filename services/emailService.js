const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    // Create transporter - You'll need to configure this with your email provider
    this.transporter = nodemailer.createTransport({
      // Gmail configuration (you can change this to your preferred email service)
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "your-email@gmail.com", // Add to environment variables
        pass: process.env.EMAIL_PASS || "your-app-password", // Use app-specific password for Gmail
      },
    });

    // Verify transporter configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error("Email transporter configuration error:", error);
      }
    });
  }

  // Generate email templates
  generateEmailTemplate(type, data) {
    const { userName, carNumber, expiryDate, daysRemaining, reminderType } =
      data;

    const templates = {
      insurance: {
        subject: `🚨 Insurance Reminder - ${
          daysRemaining === 0 ? "Expires Today!" : `${daysRemaining} Days Left`
        }`,
        html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h2 style="color: #e53e3e; text-align: center; margin-bottom: 20px;">
                                🚗 Car Insurance Reminder
                            </h2>
                            
                            <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
                                Dear <strong>${userName}</strong>,
                            </p>
                            
                            <div style="background-color: ${
                              daysRemaining <= 1 ? "#fed7d7" : "#fef5e7"
                            }; 
                                        padding: 20px; border-radius: 8px; margin: 20px 0; 
                                        border-left: 4px solid ${
                                          daysRemaining <= 1
                                            ? "#e53e3e"
                                            : "#f6ad55"
                                        };">
                                <p style="margin: 0; font-size: 16px; color: #333;">
                                    Your car insurance for vehicle <strong>${carNumber}</strong> 
                                    ${
                                      daysRemaining === 0
                                        ? "expires <strong>TODAY</strong>"
                                        : daysRemaining === 1
                                        ? "expires <strong>TOMORROW</strong>"
                                        : `expires in <strong>${daysRemaining} days</strong>`
                                    }
                                </p>
                                <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
                                    Expiry Date: <strong>${new Date(
                                      expiryDate
                                    ).toLocaleDateString("en-IN")}</strong>
                                </p>
                            </div>
                            
                            <div style="margin: 25px 0;">
                                <h3 style="color: #333; margin-bottom: 10px;">Important Reminders:</h3>
                                <ul style="color: #666; line-height: 1.6;">
                                    <li>Driving without valid insurance is illegal and can result in penalties</li>
                                    <li>Renew your insurance before the expiry date to avoid coverage gaps</li>
                                    <li>Keep your insurance documents handy while driving</li>
                                    <li>Compare different insurance providers for the best deals</li>
                                </ul>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://www.policybazaar.com/motor-insurance/" 
                                   style="background-color: #3182ce; color: white; padding: 12px 25px; 
                                          text-decoration: none; border-radius: 5px; font-weight: bold;">
                                    Renew Insurance Now
                                </a>
                            </div>
                            
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
                            
                            <p style="font-size: 12px; color: #888; text-align: center; margin: 0;">
                                This is an automated reminder from ${
                                  process.env.EMAIL_FROM_NAME ||
                                  "Car Management System"
                                }<br>
                                � ${
                                  process.env.EMAIL_USER ||
                                  "your-email@gmail.com"
                                }
                            </p>
                        </div>
                    </div>
                `,
      },
      puc: {
        subject: `🔧 PUC Certificate Reminder - ${
          daysRemaining === 0 ? "Expires Today!" : `${daysRemaining} Days Left`
        }`,
        html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h2 style="color: #38a169; text-align: center; margin-bottom: 20px;">
                                🔧 PUC Certificate Reminder
                            </h2>
                            
                            <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
                                Dear <strong>${userName}</strong>,
                            </p>
                            
                            <div style="background-color: ${
                              daysRemaining <= 1 ? "#fed7d7" : "#f0fff4"
                            }; 
                                        padding: 20px; border-radius: 8px; margin: 20px 0; 
                                        border-left: 4px solid ${
                                          daysRemaining <= 1
                                            ? "#e53e3e"
                                            : "#38a169"
                                        };">
                                <p style="margin: 0; font-size: 16px; color: #333;">
                                    Your PUC certificate for vehicle <strong>${carNumber}</strong> 
                                    ${
                                      daysRemaining === 0
                                        ? "expires <strong>TODAY</strong>"
                                        : daysRemaining === 1
                                        ? "expires <strong>TOMORROW</strong>"
                                        : `expires in <strong>${daysRemaining} days</strong>`
                                    }
                                </p>
                                <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
                                    Expiry Date: <strong>${new Date(
                                      expiryDate
                                    ).toLocaleDateString("en-IN")}</strong>
                                </p>
                            </div>
                            
                            <div style="margin: 25px 0;">
                                <h3 style="color: #333; margin-bottom: 10px;">Important Reminders:</h3>
                                <ul style="color: #666; line-height: 1.6;">
                                    <li>Valid PUC certificate is mandatory for all vehicles</li>
                                    <li>Driving without valid PUC can result in fines</li>
                                    <li>PUC testing should be done at authorized centers</li>
                                    <li>Carry your PUC certificate while driving</li>
                                </ul>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <div style="background-color: #edf2f7; padding: 15px; border-radius: 5px;">
                                    <p style="margin: 0; color: #4a5568; font-weight: bold;">
                                        Find nearest PUC center or book online
                                    </p>
                                </div>
                            </div>
                            
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
                            
                            <p style="font-size: 12px; color: #888; text-align: center; margin: 0;">
                                This is an automated reminder from ${
                                  process.env.EMAIL_FROM_NAME ||
                                  "Car Management System"
                                }<br>
                                � ${
                                  process.env.EMAIL_USER ||
                                  "your-email@gmail.com"
                                }
                            </p>
                        </div>
                    </div>
                `,
      },

      passwordReset: {
        subject: `🔒 Password Reset OTP - Car Management System`,
        html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h2 style="color: #4f46e5; text-align: center; margin-bottom: 20px;">
                                🔒 Password Reset Request
                            </h2>
                            
                            <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
                                Hello,
                            </p>
                            
                            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                                You requested to reset your password. Use the OTP below to reset your password:
                            </p>
                            
                            <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                                <h1 style="color: #4f46e5; font-size: 32px; letter-spacing: 8px; margin: 0; font-family: monospace;">
                                    ${data.otp}
                                </h1>
                                <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">
                                    This OTP is valid for 15 minutes
                                </p>
                            </div>
                            
                            <div style="background-color: #fef5e7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                                <p style="margin: 0; font-size: 14px; color: #92400e;">
                                    <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                                </p>
                            </div>
                            
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
                            
                            <p style="font-size: 12px; color: #888; text-align: center; margin: 0;">
                                This is an automated message from ${
                                  process.env.EMAIL_FROM_NAME ||
                                  "Car Management System"
                                }<br>
                                📧 ${
                                  process.env.EMAIL_USER ||
                                  "your-email@gmail.com"
                                }
                            </p>
                        </div>
                    </div>
                `,
      },
    };

    return templates[type] || templates.insurance;
  }

  // Send email
  async sendEmail(to, subject, html) {
    try {
      const fromName = process.env.EMAIL_FROM_NAME || "Car Management System";
      const fromEmail = process.env.EMAIL_USER || "your-email@gmail.com";

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: to,
        subject: subject,
        html: html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Send reminder email
  async sendReminderEmail(userData) {
    const template = this.generateEmailTemplate(
      userData.reminderType,
      userData
    );
    return await this.sendEmail(
      userData.email,
      template.subject,
      template.html
    );
  }

  // Generate 7-character OTP
  generateOTP() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let otp = "";
    for (let i = 0; i < 7; i++) {
      otp += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return otp;
  }

  // Send password reset OTP
  async sendPasswordResetOTP(email, otp) {
    try {
      const template = this.generateEmailTemplate("passwordReset", { otp });
      return await this.sendEmail(email, template.subject, template.html);
    } catch (error) {
      console.error("Failed to send password reset OTP:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
