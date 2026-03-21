// A curated list of common disposable email domains
export const DISPOSABLE_EMAIL_DOMAINS = [
    "mailinator.com",
    "guerrillamail.com",
    "guerrillamail.net",
    "guerrillamail.org",
    "guerrillamail.biz",
    "guerrillamailblock.com",
    "sharklasers.com",
    "grr.la",
    "tempmail.com",
    "temp-mail.org",
    "10minutemail.com",
    "10minutemail.net",
    "throwawaymail.com",
    "getnada.com",
    "maildrop.cc",
    "yopmail.com",
    "dispostable.com",
    "mailnesia.com",
    "mailcatch.com",
    "bugmenot.com",
    "trashmail.com",
    "trashmail.net",
    "burnernote.com",
    "fakeinbox.com",
    "tempinbox.com",
    "mintemail.com",
    "mailperm.com",
    "moakt.com",
    "disposablemail.com",
    "generator.email",
    "tempmail.pro",
    "temp-mail.onl",
    "tmail.com",
    "instaddr.com",
    "anonaddy.com",
    "33mail.com",
    "mailchimp.app",
    "crazymailing.com",
    "emailondeck.com",
    "owlymail.com",
    "mail.tm",
    "mail.gw"
];

export function isDisposableEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}
