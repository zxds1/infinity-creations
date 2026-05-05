# SEO & AI Agent Discovery Implementation Guide

## Overview

This document outlines the SEO and AI agent discovery optimizations implemented for Maridadi Creations.

---

## ✅ Implemented Features

### 1. Intent-Based Category Pages

5 high-converting location/intent-based pages created:

- **[/custom-banners-nairobi](./src/pages/CustomBannersPage.tsx)** - Custom banners targeting "custom banners Nairobi" searches
- **[/vehicle-branding-nairobi](./src/pages/VehicleBrandingPage.tsx)** - Vehicle branding targeting "boda boda branding" searches
- **[/photo-mounts-kenya](./src/pages/PhotoMountsPage.tsx)** - Photo mounts targeting local searches
- **[/custom-stickers-nairobi](./src/pages/CustomStickersPage.tsx)** - Custom stickers targeting laptop/vinyl sticker searches
- **[/custom-jewellery-kenya](./src/pages/CustomJewelleryPage.tsx)** - Personalized jewellery for bridal/gift market

Each page includes:
- **Title Tags**: Optimized for primary and secondary keywords
- **Meta Descriptions**: Clear call-to-action focused
- **H1 Tags**: Intent-based headlines
- **Structured Data**: JSON-LD schema.org markup (LocalBusiness, Product)
- **FAQ Sections**: AI-friendly Q&A with FAQ schema

### 2. SEO Meta Component

Created `[SEOMeta.tsx](./src/components/SEOMeta.tsx)` for consistent meta tag management:
- Page-specific titles and descriptions
- Open Graph tags for social sharing
- Twitter card support
- Canonical URLs
- Structured data (Schema.org JSON-LD)

### 3. FAQ Component

Created `[FAQ.tsx](./src/components/FAQ.tsx)` for:
- Interactive Q&A sections on each service page
- **Schema.org FAQ markup** for AI agent extraction
- Automatic AI-friendly structured data generation

### 4. Internal Linking

All category pages link to:
- Shop with pre-filled search queries: `/shop?query=banners`
- Related services (e.g., banners → vehicle branding)
- Main homepage and navigation

---

## 🔗 URL Structure & Internal Links

### Primary Routes
```
/ → Home
/shop → Shop (generic)
/custom-banners-nairobi → Custom banners (SEO optimized)
/vehicle-branding-nairobi → Vehicle branding (SEO optimized)
/photo-mounts-kenya → Photo mounts (SEO optimized)
/custom-stickers-nairobi → Custom stickers (SEO optimized)
/custom-jewellery-kenya → Custom jewellery (SEO optimized)
```

### Alias Routes (for flexibility)
```
/banners → Custom banners page
/vehicle-branding → Vehicle branding page
/photo-mounts → Photo mounts page
/stickers → Stickers page
/jewellery → Jewellery page
```

---

## 📍 LOCAL SEO - NEXT STEPS

### 1. Google Business Profile Setup

**Action**: Create/optimize Google Business Profile at https://business.google.com

**Required Information**:
- Business Name: Maridadi Creations
- Category: Printing service, Graphic design
- Address: [Your Nairobi address]
- Phone: [Contact number]
- Website: https://maridadi.co.ke
- Hours: [Business hours]

**Optimization**:
- Add 10-15 high-quality photos of your work
- Write detailed service descriptions
- Add all service categories:
  - Printing service
  - Graphic design
  - Custom branding
  - Custom jewellery services (if applicable)

### 2. Local Search Optimization

**Keywords to target**:
- "custom banners Nairobi"
- "boda boda branding Kenya"
- "photo mounts Nairobi"
- "custom stickers Kenya"
- "custom jewellery designer Nairobi"

### 3. Local Citations

Submit business to:
- Google My Business
- Bing Places
- Local Kenya directories
- Industry-specific directories

---

## 🖼️ IMAGE SEO OPTIMIZATION

### Best Practices

For all product images, follow this pattern:

**Filename**: `custom-banner-design-nairobi.jpg`
```
Format: [product]-[descriptor]-[location].jpg
```

**Alt Text**: `"Custom printed banner for retail shop in Nairobi with business logo"`
```
Format: [What] + [Use case] + [Location qualifier]
```

### Image Properties
- Compress for web (< 100KB)
- Use descriptive filenames (not: banner1.jpg, image-123.jpg)
- Add alt text to all product photos
- Include location context in alt text

---

## 🧠 AI AGENT DISCOVERY OPTIMIZATION

### How AI Agents Find You

1. **Structured Data**: Schema.org JSON-LD in `<head>`
2. **Clear Descriptions**: Explicit service descriptions
3. **FAQ Sections**: Q&A that AI can extract
4. **Consistent Naming**: Same terms across pages

### Implementation on Each Page

Each category page includes:

✅ **Explicit Service Description**
```
"Professional custom banners for events, shops, promotions, and displays. Design included. Fast turnaround. Made in Nairobi."
```

✅ **Structured FAQ Sections** (with Schema.org markup)
```
Q: How much does a custom banner cost in Nairobi?
A: Pricing depends on size, material, and design complexity...
```

✅ **Schema.org LocalBusiness Markup**
```json
{
  "@type": "LocalBusiness",
  "name": "Maridadi Creations - Custom Banners Nairobi",
  "areaServed": "Nairobi, Kenya",
  "priceRange": "KES 2500 - KES 50000"
}
```

---

## 📈 CONTENT STRATEGY

### Blog/Content Ideas to Add

These will drive organic traffic and AI discovery:

1. "5 Best Banner Designs for Small Businesses in Nairobi"
2. "How to Brand Your Boda Boda: Complete Guide"
3. "Photo Mount Ideas for Wedding Memories"
4. "Custom Stickers vs Pre-made: What's Right for You?"
5. "Custom Jewellery Gift Ideas in Kenya"
6. "DIY vs Professional Branding: Cost Comparison"

**Template for content pages**:
- H1: Target keyword
- H2: Why this matters
- H2: How-to or tips
- FAQ section
- Internal links to product pages
- CTA to shop

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] **Verify Routes**: All 5 category pages working at clean URLs
- [ ] **Test Meta Tags**: Use Google Search Console to test meta tags
- [ ] **Mobile Test**: Check responsiveness on mobile
- [ ] **FAQ Testing**: Verify FAQ schema markup renders correctly
- [ ] **Image Optimization**: Add proper filenames and alt text to product photos
- [ ] **Setup Google Business Profile**: Create/optimize profile
- [ ] **Submit to Google Search Console**: Verify domain ownership
- [ ] **Add Sitemap**: XML sitemap with new URLs
- [ ] **robots.txt**: Ensure crawling is enabled
- [ ] **Canonicals**: Verify canonical tags on all pages

---

## 🔄 ONGOING SEO TASKS

### Monthly
- Monitor Google Search Console for impressions
- Check ranking for target keywords
- Add user-generated content/reviews

### Quarterly
- Add new content/blog posts
- Audit internal links
- Update Google Business Profile with new photos

### Annually
- Audit page performance
- Update keyword strategy
- Review and refresh old content

---

## 📊 RECOMMENDED TOOLS

1. **Google Search Console** (Free)
   - Monitor search performance
   - Submit sitemap
   - Check for errors

2. **Google Business Profile** (Free)
   - Local SEO optimization
   - Customer reviews

3. **SEO Tools** (Optional)
   - Ubersuggest ($24/month)
   - Semrush ($120/month)
   - Ahrefs ($99/month)

---

## ✨ Key Differentiation

This SEO strategy targets:

✅ **High-intent local searches** (not generic "design platform")
✅ **Service-driven keywords** (banners, branding, jewellery)
✅ **Location-specific** (Nairobi, Kenya)
✅ **AI agent friendly** (structured data, clear descriptions, FAQs)

**Result**: Better ranking for searches people actually use to find your services + improved AI discovery.

