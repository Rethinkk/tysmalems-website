# Tysma | Lems Website

Official website for Tysma | Lems, international tax consultants.

This is a static website prototype containing:

- Homepage with rotating hero photography
- Approach page with separate rotating photography
- Journal landing, category and article templates
- Local CMS Desk prototype for page media, footer social links and Journal content
- SEO support files: sitemap, RSS, robots and llms.txt
- Vercel contact form endpoint at `/api/contact`
- Organization and website structured data
- Favicon, web manifest and social sharing image metadata

The CMS Desk currently stores content in browser localStorage. A production CMS integration can replace that storage layer later without changing the public page structure.

## Contact Form

The contact form sends through the Vercel serverless function in `api/contact.js`.

Set these environment variables in Vercel:

- `RESEND_API_KEY`
- `CONTACT_FROM`, for example `Tysma | Lems <website@tysmalems.com>`
- `CONTACT_TO`, defaults to `info@tysmalems.com` if omitted

Resend requires an API key and a verified sending domain before production delivery.

## Search Console

After Google Search Console provides the verification token, add its meta verification tag to the public HTML pages and submit `sitemap.xml`.
