'use strict';
const vscode = require('vscode');

// Plain-English explanations shown when hovering over Liquid code.
const GLOSSARY = {
  // Tags
  if: ['Shows the code inside only when a condition is true.', "{% if product.available %} In stock {% endif %}"],
  elsif: ['Another condition to check if the first "if" was false.'],
  else: ['What to show when none of the conditions above were true.'],
  unless: ['Opposite of "if": shows the code only when the condition is false.'],
  endif: ['Closes an "if".'],
  for: ['Repeats the code inside once for every item in a list.', "{% for product in collection.products %} {{ product.title }} {% endfor %}"],
  endfor: ['Closes a "for" loop.'],
  assign: ['Saves a value in a variable name so you can reuse it.', "{% assign sale = true %}"],
  capture: ['Saves a block of text/HTML into a variable.'],
  case: ['Picks different code depending on a value (like a menu of choices).'],
  when: ['One of the choices inside a "case".'],
  comment: ['A note for yourself. Visitors never see it.'],
  render: ['Inserts a small reusable file from the snippets folder.', "{% render 'price' %}"],
  section: ['Inserts a section file from the sections folder (or, inside a section, the current section).'],
  schema: ['Defines the settings shown in the Shopify Theme Editor for this section.'],
  form: ['Creates a working HTML form (add to cart, contact, login...).'],
  paginate: ['Splits a long list into pages (page 1, 2, 3...).'],
  liquid: ['Lets you write several Liquid tags without repeating {% %} each time.'],

  // Objects
  product: ['The product being shown (title, price, images...).', '{{ product.title }}'],
  'product.title': ['The name of the product.'],
  'product.price': ['Price in cents. Add "| money" to show it nicely, e.g. $19.99.', '{{ product.price | money }}'],
  'product.url': ['The web address of the product page.'],
  'product.description': ['The product description written in Shopify admin.'],
  'product.featured_image': ['The main product picture.'],
  'product.available': ['true if at least one variant is in stock.'],
  products: ['A list of products.'],
  collection: ['The collection (category) being shown, e.g. "Summer sale".'],
  collections: ['All collections in the store.'],
  cart: ['The customer\'s shopping cart.', '{{ cart.item_count }}'],
  shop: ['Info about your store (name, currency, URL).', '{{ shop.name }}'],
  customer: ['The logged-in customer. Empty if nobody is logged in.'],
  page: ['The current page (e.g. About us) or its details.'],
  article: ['A blog post.'],
  blog: ['A blog (a list of posts).'],
  settings: ['Values from Theme settings (colors, fonts...) chosen in the theme editor.', '{{ settings.colors_accent_1 }}'],
  'section.settings': ['Values the store owner typed in this section\'s panel in the theme editor.'],
  'section.id': ['A unique id for this section. Handy for CSS targeting.'],
  block: ['One item inside a section (e.g. one slide in a slideshow).'],
  template: ['The page type being shown, like "product" or "collection".'],
  request: ['Info about the current visit (page type, design mode...).'],
  routes: ['Standard store links (cart, account, search...).', "{{ routes.cart_url }}"],
  linklists: ['Menus created in Shopify admin > Navigation.'],
  content_for_header: ['Required. Shopify injects its own scripts here. Do not remove it from theme.liquid.'],
  content_for_layout: ['Required. This is where each page\'s content is placed in theme.liquid.'],
  forloop: ['Info about the current loop round (forloop.index, forloop.first, forloop.last).'],
  variant: ['One version of a product (e.g. size M, color red).'],
  image: ['A picture.'],
  title: ['The name/title of the thing in front of it.'],
  handle: ['The URL-friendly name, e.g. "blue-shirt".'],
  url: ['The web address of the thing in front of it.'],

  // Filters (the part after the | sign)
  money: ['Formats a number as a price with the currency symbol.', '{{ product.price | money }}'],
  image_url: ['Gets the web address of an image at a size you choose.', '{{ image | image_url: width: 600 }}'],
  image_tag: ['Turns an image into a ready-made <img> tag.'],
  img_url: ['Older way to get an image address. Prefer image_url.'],
  asset_url: ['Gives the web address of a file in the assets folder.', "{{ 'custom.css' | asset_url }}"],
  stylesheet_tag: ['Turns a CSS file address into a <link> tag.'],
  script_tag: ['Turns a JS file address into a <script> tag.'],
  t: ['Translate: looks up the wording in the locales folder.', "{{ 'general.search' | t }}"],
  escape: ['Makes text safe to print in HTML.'],
  upcase: ['MAKES TEXT CAPITAL LETTERS.'],
  downcase: ['makes text small letters.'],
  capitalize: ['Makes the first letter big.'],
  truncate: ['Cuts long text short.', '{{ product.title | truncate: 30 }}'],
  strip_html: ['Removes HTML tags from text.'],
  date: ['Formats a date.', "{{ article.published_at | date: '%b %d, %Y' }}"],
  default: ['Uses a backup value when the first one is empty.', "{{ product.title | default: 'Untitled' }}"],
  size: ['Counts items in a list or letters in text.'],
  append: ['Adds text at the end.'],
  prepend: ['Adds text at the start.'],
  replace: ['Swaps one piece of text for another.'],
  split: ['Cuts text into a list at a chosen character.'],
  join: ['Joins a list into one text with a chosen separator.'],
  json: ['Converts a value into JSON text for JavaScript.']
};

/** True when the cursor is inside {{ ... }} or {% ... %}. */
function insideLiquid(document, position) {
  const offset = document.offsetAt(position);
  const before = document.getText().slice(Math.max(0, offset - 3000), offset);
  const lastOpen = Math.max(before.lastIndexOf('{{'), before.lastIndexOf('{%'));
  const lastClose = Math.max(before.lastIndexOf('}}'), before.lastIndexOf('%}'));
  return lastOpen > lastClose;
}

function lookup(word, cursorIndex) {
  const parts = word.split('.');
  let acc = 0;
  let seg = 0;
  for (let i = 0; i < parts.length; i++) {
    if (cursorIndex <= acc + parts[i].length) { seg = i; break; }
    acc += parts[i].length + 1;
    seg = i;
  }
  const dotted = parts.slice(0, seg + 1).join('.');
  const candidates = [dotted, parts[seg]];
  for (const key of candidates) {
    if (Object.prototype.hasOwnProperty.call(GLOSSARY, key)) return { key, entry: GLOSSARY[key] };
  }
  return undefined;
}

function registerHover(context) {
  const provider = {
    provideHover(document, position) {
      if (!insideLiquid(document, position)) return undefined;
      const range = document.getWordRangeAtPosition(position, /[A-Za-z_][\w.]*/);
      if (!range) return undefined;
      const word = document.getText(range);
      const found = lookup(word, position.character - range.start.character);
      if (!found) return undefined;

      const md = new vscode.MarkdownString();
      md.appendMarkdown('**`' + found.key + '`** — ' + found.entry[0]);
      if (found.entry[1]) {
        md.appendMarkdown('\n\nExample:');
        md.appendCodeblock(found.entry[1], 'liquid');
      }
      return new vscode.Hover(md, range);
    }
  };
  context.subscriptions.push(vscode.languages.registerHoverProvider('liquid', provider));
}

module.exports = { registerHover };
