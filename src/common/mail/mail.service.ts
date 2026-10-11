import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SettingsService } from '../../modules/settings/settings.service';

// Escapes user input before it is inserted into email HTML
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(
    private config: ConfigService,
    private settings: SettingsService,
  ) {
    // Environment variables are strings: convert the port explicitly
    const port = Number(this.config.get('SMTP_PORT', 587));

    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port,
      secure: port === 465,
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  private async siteName(): Promise<string> {
    return (await this.settings.get())?.siteName || 'Notification';
  }

  // Full SMTP_FROM ("Name <address>") is used as is; a bare address gets the site name as sender name
  private async from(): Promise<string | { name: string; address: string }> {
    const from = this.config.get<string>('SMTP_FROM', '');
    return from.includes('<') ? from : { name: await this.siteName(), address: from };
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: await this.from(),
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`);
      throw error;
    }
  }

  async sendContactNotification(data: { fullName: string; email: string; phone?: string; subject: string; message: string }) {
    const adminEmail = this.config.get('SMTP_TO');
    const html = `
      <h3>New contact message — ${esc(await this.siteName())}</h3>
      <p><strong>From:</strong> ${esc(data.fullName)} (${esc(data.email)})</p>
      <p><strong>Phone:</strong> ${esc(data.phone || 'Not provided')}</p>
      <p><strong>Subject:</strong> ${esc(data.subject)}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${esc(data.message)}</p>
    `;

    return this.sendMail(adminEmail, `[Contact] ${data.subject} - ${data.fullName}`, html);
  }

  async sendLeadNotification(data: any) {
    const adminEmail = this.config.get('SMTP_TO');

    const dimensions = [data.lengthCm, data.widthCm, data.heightCm].every(Boolean)
      ? `${esc(data.lengthCm)} × ${esc(data.widthCm)} × ${esc(data.heightCm)} cm`
      : 'Not provided';

    const modeMap: Record<string, string> = {
      AIR: 'Air', SEA: 'Sea', ROAD: 'Road', MULTI: 'Multimodal',
    };
    const categoryMap: Record<string, string> = {
      DOCUMENT: 'Document', PARCEL: 'Parcel', FREIGHT: 'Freight',
      FRAGILE: 'Fragile', PERISHABLE: 'Perishable', DANGEROUS: 'Dangerous goods',
    };

    const html = `
      <h3>New quote request — ${esc(await this.siteName())}</h3>
      <p><strong>From:</strong> ${esc(data.fullName)}${data.company ? ` — ${esc(data.company)}` : ''}</p>
      <p><strong>Email:</strong> ${esc(data.email)}</p>
      <p><strong>Phone:</strong> ${esc(data.phone || 'Not provided')}</p>
      <hr />
      <p><strong>Shipment details:</strong></p>
      <ul>
        <li><strong>Origin:</strong> ${esc(data.originCity)}, ${esc(data.originCountry)}</li>
        <li><strong>Destination:</strong> ${esc(data.destinationCity)}, ${esc(data.destinationCountry)}</li>
        <li><strong>Mode:</strong> ${esc(modeMap[data.transportMode] ?? data.transportMode ?? 'Not provided')}</li>
        <li><strong>Category:</strong> ${esc(categoryMap[data.category] ?? data.category ?? 'Not provided')}</li>
        <li><strong>Weight:</strong> ${esc(data.weightKg)} kg</li>
        <li><strong>Dimensions:</strong> ${dimensions}</li>
      </ul>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${esc(data.message || 'No message')}</p>
    `;

    return this.sendMail(adminEmail, `[Quote] New request from ${data.fullName}`, html);
  }
}
