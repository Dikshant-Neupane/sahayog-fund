import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend() {
    if (!_resend) {
        const key = process.env.RESEND_API_KEY;
        if (!key) throw new Error('RESEND_API_KEY is not set.');
        _resend = new Resend(key);
    }
    return _resend;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const FROM_EMAIL = 'SahayogFund <noreply@sahayogfund.org>';

// ===== Campaign Submission Confirmation =====
export async function sendCampaignSubmissionEmail({
    to,
    organizationName,
    representativeName,
    campaignId,
}: {
    to: string;
    organizationName: string;
    representativeName: string;
    campaignId: string;
}) {
    return getResend().emails.send({
        from: FROM_EMAIL,
        to,
        subject: `Campaign Submitted - ${organizationName} | SahayogFund`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#1A202C;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:24px;">
  <div style="text-align:center;padding:24px 0;">
    <h1 style="color:#fff;font-size:24px;margin:0;">🇳🇵 SahayogFund</h1>
    <p style="color:#B4C6E7;font-size:14px;">Transparent Giving on Solana</p>
  </div>
  <div style="background:#151921;border:1px solid rgba(220,20,60,0.2);border-radius:16px;padding:32px;">
    <h2 style="color:#fff;margin:0 0 16px;">✅ Campaign Submitted!</h2>
    <p style="color:#B4C6E7;line-height:1.6;">
      Namaste ${representativeName},<br><br>
      Your campaign for <strong style="color:#fff;">${organizationName}</strong> has been submitted for verification.
    </p>
    <div style="background:rgba(34,163,93,0.1);border:1px solid rgba(34,163,93,0.3);border-radius:12px;padding:16px;margin:20px 0;">
      <p style="color:#22A35D;font-weight:600;margin:0 0 8px;">What happens next?</p>
      <ol style="color:#B4C6E7;line-height:1.8;margin:0;padding-left:20px;">
        <li>Our team reviews your submission (1-3 business days)</li>
        <li>We schedule a verification call or site visit</li>
        <li>Upon approval, your campaign goes live!</li>
      </ol>
    </div>
    <p style="color:#7A8DB5;font-size:13px;">
      Campaign ID: <code style="color:#F7B32B;">${campaignId}</code><br>
      Track status: <a href="${APP_URL}/verify?id=${campaignId}" style="color:#DC143C;">Check Status →</a>
    </p>
  </div>
  <div style="text-align:center;padding:24px 0;">
    <p style="color:#7A8DB5;font-size:12px;">© 2026 SahayogFund | Powered by Solana</p>
  </div>
</div>
</body>
</html>`,
    });
}

// ===== Verification Status Change =====
export async function sendVerificationStatusEmail({
    to,
    organizationName,
    representativeName,
    status,
    notes,
    campaignId,
}: {
    to: string;
    organizationName: string;
    representativeName: string;
    status: string;
    notes?: string;
    campaignId: string;
}) {
    const statusConfig: Record<string, { emoji: string; title: string; color: string; message: string }> = {
        scheduled: {
            emoji: '📅',
            title: 'Verification Scheduled',
            color: '#F7B32B',
            message: 'We have scheduled a verification meeting for your campaign. Please check the details below.',
        },
        verified: {
            emoji: '✅',
            title: 'Campaign Verified!',
            color: '#22A35D',
            message: 'Congratulations! Your campaign has been verified and is now live on SahayogFund. Donors can now contribute to your cause.',
        },
        rejected: {
            emoji: '❌',
            title: 'Verification Unsuccessful',
            color: '#DC143C',
            message: 'Unfortunately, we were unable to verify your campaign at this time. Please review the notes below for details.',
        },
        pending: {
            emoji: '⏳',
            title: 'Status Updated',
            color: '#B4C6E7',
            message: 'Your campaign status has been updated.',
        },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return getResend().emails.send({
        from: FROM_EMAIL,
        to,
        subject: `${config.emoji} ${config.title} - ${organizationName} | SahayogFund`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#1A202C;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:24px;">
  <div style="text-align:center;padding:24px 0;">
    <h1 style="color:#fff;font-size:24px;margin:0;">🇳🇵 SahayogFund</h1>
  </div>
  <div style="background:#151921;border:1px solid ${config.color}33;border-radius:16px;padding:32px;">
    <h2 style="color:${config.color};margin:0 0 16px;">${config.emoji} ${config.title}</h2>
    <p style="color:#B4C6E7;line-height:1.6;">
      Namaste ${representativeName},<br><br>
      ${config.message}
    </p>
    ${notes ? `
    <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin:20px 0;border-left:3px solid ${config.color};">
      <p style="color:#B4C6E7;font-size:13px;margin:0 0 4px;font-weight:600;">Notes:</p>
      <p style="color:#B4C6E7;margin:0;line-height:1.6;">${notes}</p>
    </div>
    ` : ''}
    <p style="color:#7A8DB5;font-size:13px;">
      Campaign: <strong style="color:#fff;">${organizationName}</strong><br>
      Campaign ID: <code style="color:#F7B32B;">${campaignId}</code>
    </p>
  </div>
  <div style="text-align:center;padding:24px 0;">
    <p style="color:#7A8DB5;font-size:12px;">© 2026 SahayogFund | Powered by Solana</p>
  </div>
</div>
</body>
</html>`,
    });
}

// ===== Donation Receipt =====
export async function sendDonationReceiptEmail({
    to,
    donorName,
    amountSol,
    campaignTitle,
    txSignature,
}: {
    to: string;
    donorName: string;
    amountSol: number;
    campaignTitle: string;
    txSignature: string;
}) {
    return getResend().emails.send({
        from: FROM_EMAIL,
        to,
        subject: `🌺 Donation Receipt - ${amountSol} SOL to ${campaignTitle}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#1A202C;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:24px;">
  <div style="text-align:center;padding:24px 0;">
    <h1 style="color:#fff;font-size:24px;margin:0;">🇳🇵 SahayogFund</h1>
  </div>
  <div style="background:#151921;border:1px solid rgba(34,163,93,0.3);border-radius:16px;padding:32px;">
    <h2 style="color:#22A35D;margin:0 0 16px;">🌺 Thank You, ${donorName}!</h2>
    <p style="color:#B4C6E7;line-height:1.6;">
      Your donation of <strong style="color:#fff;font-size:18px;">${amountSol} SOL</strong> 
      to <strong style="color:#fff;">${campaignTitle}</strong> has been confirmed on the Solana blockchain.
    </p>
    <div style="background:rgba(34,163,93,0.1);border-radius:12px;padding:16px;margin:20px 0;">
      <p style="color:#7A8DB5;font-size:13px;margin:0;">Transaction:</p>
      <a href="https://explorer.solana.com/tx/${txSignature}?cluster=devnet" 
         style="color:#DC143C;font-size:12px;word-break:break-all;" target="_blank">
        ${txSignature}
      </a>
    </div>
    <p style="color:#B4C6E7;">Every contribution makes a difference. धन्यवाद! 🙏</p>
  </div>
  <div style="text-align:center;padding:24px 0;">
    <p style="color:#7A8DB5;font-size:12px;">© 2026 SahayogFund | Powered by Solana</p>
  </div>
</div>
</body>
</html>`,
    });
}
