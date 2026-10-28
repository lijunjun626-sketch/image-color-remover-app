import type { EmailMessage, MarketingEmailCompliance } from '.';

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return entities[character];
  });
}

function validateCompliance(
  compliance: MarketingEmailCompliance | undefined
): MarketingEmailCompliance {
  if (!compliance?.unsubscribeUrl || !compliance?.postalAddress) {
    throw new Error(
      'Marketing emails require both an unsubscribe URL and a valid postal address.'
    );
  }

  try {
    const url = new URL(compliance.unsubscribeUrl);
    if (url.protocol !== 'https:' && url.protocol !== 'mailto:') {
      throw new Error('unsupported protocol');
    }
  } catch {
    throw new Error('Marketing emails require a valid unsubscribe URL.');
  }

  return compliance;
}

/**
 * Marketing messages are rejected unless the caller supplies both pieces of
 * CAN-SPAM footer information. Transactional messages intentionally bypass
 * this helper because they do not promote a product or service.
 */
export function prepareMarketingEmail(
  email: EmailMessage,
  html?: string,
  text?: string
): {
  html?: string;
  text?: string;
  headers?: Record<string, string>;
} {
  if (email.category !== 'marketing') return { html, text };

  const compliance = validateCompliance(email.marketing);
  const unsubscribeUrl = escapeHtml(compliance.unsubscribeUrl);
  const postalAddress = escapeHtml(compliance.postalAddress).replace(
    /\n/g,
    '<br />'
  );
  const footer = `<hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0" />
<p style="font:12px/18px Arial,sans-serif;color:#6b7280;margin:0">
  You are receiving this email because you signed up for updates from this service.<br />
  <a href="${unsubscribeUrl}">Unsubscribe from marketing emails</a><br />
  ${postalAddress}
</p>`;
  const plainFooter = `\n\n---\nUnsubscribe from marketing emails: ${compliance.unsubscribeUrl}\n${compliance.postalAddress}`;

  return {
    html: `${html || ''}${footer}`,
    text: `${text || ''}${plainFooter}`,
    headers: {
      'List-Unsubscribe': `<${compliance.unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}
