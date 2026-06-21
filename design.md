---
version: alpha
name: Zapier
description: Warm orange. Friendly illustration-driven.
colors:
  primary: "#1E1E1E"
  secondary: "#716F6F"
  tertiary: "#FF4F00"
  neutral: "#FFF4ED"
  surface: "#FFFFFF"
  on-primary: "#FFFFFF"
typography:
  display:
    fontFamily: Inter
    fontSize: 4.25rem
    fontWeight: 700
    letterSpacing: "-0.03em"
  h1:
    fontFamily: Inter
    fontSize: 2.2rem
    fontWeight: 700
  body:
    fontFamily: Inter
    fontSize: 0.98rem
    lineHeight: 1.6
  label:
    fontFamily: Inter
    fontSize: 0.74rem
    fontWeight: 600
    letterSpacing: "0.04em"
rounded:
  sm: 6px
  md: 10px
  lg: 16px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px 20px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: 24px
---
## Overview

Zapier: automation-platform palette — warm orange accent, illustration-driven marketing surface, approachable sans.

## Colors

The palette is built around high-contrast neutrals and a single accent that drives interaction.

- **Primary (`#1E1E1E`):** Headlines and core text.
- **Secondary (`#716F6F`):** Borders, captions, and metadata.
- **Tertiary (`#FF4F00`):** The sole driver for interaction. Reserve it.
- **Neutral (`#FFF4ED`):** The page foundation.

## Typography

- **display:** Inter 4.25rem
- **h1:** Inter 2.2rem
- **body:** Inter 0.98rem
- **label:** Inter 0.74rem

## Do's and Don'ts

- **Do** use Tertiary for exactly one action per screen.
- **Do** let Neutral carry the composition — negative space is a feature.
- **Don't** introduce gradients. This system is flat on purpose.
- **Don't** mix Tertiary with alternate accents; the single-accent rule is load-bearing.
