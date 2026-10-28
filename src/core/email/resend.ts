import { render } from '@react-email/components';
import { Resend, type CreateEmailOptions } from 'resend';

import type {
  EmailConfigs,
  EmailMessage,
  EmailProvider,
  EmailSendResult,
  MarketingEmailCompliance,
} from '.';
import { prepareMarketingEmail } from './marketing';

/**
 * Resend email provider configs
 * @docs https://resend.com/docs/send-with-nextjs
 */
export interface ResendConfigs extends EmailConfigs {
  apiKey: string;
  defaultFrom?: string;
  marketingCompliance?: MarketingEmailCompliance;
}

/**
 * Resend email provider implementation
 * @website https://resend.com/
 */
export class ResendProvider implements EmailProvider {
  readonly name = 'resend';
  configs: ResendConfigs;

  private client: Resend;

  constructor(configs: ResendConfigs) {
    this.configs = configs;
    this.client = new Resend(configs.apiKey);
  }

  async sendEmail(email: EmailMessage): Promise<EmailSendResult> {
    try {
      // Convert our format to Resend format
      const resendEmail: Partial<CreateEmailOptions> = {
        from: email.from || this.configs.defaultFrom || '',
        to: Array.isArray(email.to) ? email.to : [email.to],
        subject: email.subject,
      };

      let html = email.html;
      if (email.react) {
        // Explicitly render React to HTML for better compatibility (especially on Edge/Workers)
        html = await render(email.react);
      }
      const prepared = prepareMarketingEmail(
        {
          ...email,
          marketing: email.marketing ?? this.configs.marketingCompliance,
        },
        html,
        email.text
      );

      // Add optional fields only if they exist
      if (email.cc) {
        resendEmail.cc = Array.isArray(email.cc) ? email.cc : [email.cc];
      }
      if (email.bcc) {
        resendEmail.bcc = Array.isArray(email.bcc) ? email.bcc : [email.bcc];
      }
      if (prepared.text) {
        resendEmail.text = prepared.text;
      }
      if (prepared.html) {
        resendEmail.html = prepared.html;
      }
      if (email.replyTo) {
        resendEmail.replyTo = email.replyTo;
      }
      if (email.attachments) {
        resendEmail.attachments = email.attachments.map((att) => ({
          filename: att.filename,
          content: att.content,
          content_type: att.contentType,
        }));
      }
      if (email.tags) {
        resendEmail.tags = email.tags.map((tag) => ({
          name: 'category',
          value: tag,
        }));
      }
      if (email.headers || prepared.headers) {
        resendEmail.headers = {
          ...email.headers,
          ...prepared.headers,
        };
      }

      const result = await this.client.emails.send(
        resendEmail as CreateEmailOptions
      );

      if (result.error) {
        return {
          success: false,
          error: result.error.message,
          provider: this.name,
        };
      }

      return {
        success: true,
        messageId: result.data?.id,
        provider: this.name,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name,
      };
    }
  }
}

/**
 * Create Resend provider with configs
 */
export function createResendProvider(configs: ResendConfigs): ResendProvider {
  return new ResendProvider(configs);
}
