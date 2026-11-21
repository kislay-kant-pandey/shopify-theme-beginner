# Shopify Theme Beginner Helper

A VS Code extension that lets a complete beginner edit a Shopify theme without getting lost.

## What it does

| Feature | How it helps a beginner |
| --- | --- |
| **Theme Files** sidebar (bag icon) | Files grouped with plain names ("Pages", "Sections", "Styles & scripts") and a one-line explanation next to the important ones. |
| **What do you want to change?** | Pick "Footer", "Product page", "Colors, fonts" and so on, and the right file opens. Also in the status bar. |
| **Hover help** | Hover over any Liquid word (`{% for %}`, `product.price`, `| money`) to see what it means, with an example. |
| **Snippets** | Type `img`, `for-products`, `schema`, `button`... and press Tab. |
| **Create a new section** | Generates a working section file with editable settings. |
| **Set up my own CSS file** | Creates `assets/custom.css` and adds the link to `theme.liquid` for you (asks first). |
| **Live preview / Upload / Download** | Runs Shopify CLI for you. Upload and Download ask for confirmation first. |

## Try it

1. Open this folder in VS Code and press **F5**. A second window opens.
2. In that window, open a Shopify theme folder (for example Dawn).
3. Click the bag icon in the left bar.

## Needs

- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) for preview, upload and download: `npm install -g @shopify/cli`
- The official **Shopify Liquid** extension for colored Liquid code. The plugin offers to install it once.

## Before publishing

Change `publisher` in `package.json` to your own publisher name.
