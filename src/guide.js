'use strict';

// Plain-English help for the files beginners see most often.
const FILE_HELP = {
  'layout/theme.liquid': 'Frame around every page (<head>, header, footer)',
  'sections/header.liquid': 'Top of the site: logo, menu, cart icon',
  'sections/footer.liquid': 'Bottom of the site: links, newsletter',
  'sections/main-product.liquid': 'Main area of the product page',
  'sections/main-collection-product-grid.liquid': 'Product grid on collection pages',
  'sections/main-cart-items.liquid': 'List of items on the cart page',
  'sections/cart-drawer.liquid': 'Slide-out cart',
  'templates/index.json': 'Homepage: which sections show, and in what order',
  'templates/product.json': 'Product page: which sections show',
  'templates/collection.json': 'Collection page: which sections show',
  'templates/cart.json': 'Cart page: which sections show',
  'config/settings_schema.json': 'Options shown in Theme settings (colors, fonts)',
  'config/settings_data.json': 'Saved Theme settings values (use the online editor instead)',
  'assets/base.css': 'Main stylesheet (colors, spacing, fonts)',
  'assets/custom.css': 'Your own CSS',
  'locales/en.default.json': 'English wording used across the theme'
};

const CATEGORIES = [
  { dir: 'layout', label: 'Page frame', icon: 'layout', help: 'layout/ - the frame that wraps every page' },
  { dir: 'templates', label: 'Pages', icon: 'file', help: 'templates/ - which sections each page type uses' },
  { dir: 'sections', label: 'Sections', icon: 'symbol-structure', help: 'sections/ - big building blocks (header, banner, product...)' },
  { dir: 'snippets', label: 'Snippets', icon: 'symbol-snippet', help: 'snippets/ - small reusable pieces' },
  { dir: 'config', label: 'Settings', icon: 'settings-gear', help: 'config/ - theme settings (colors, fonts)' },
  { dir: 'assets', label: 'Styles & scripts', icon: 'symbol-color', help: 'assets/ - CSS, JavaScript and images' },
  { dir: 'locales', label: 'Text & translations', icon: 'globe', help: 'locales/ - the words used in the theme' }
];

// "What do you want to change?" -> the first file in `files` that exists is opened.
const TASKS = [
  { label: 'Logo or menu (top of site)', hint: 'header', files: ['sections/header.liquid'] },
  { label: 'Footer (bottom of site)', hint: 'footer', files: ['sections/footer.liquid'] },
  {
    label: 'Homepage layout',
    hint: 'which sections show on the homepage',
    files: ['templates/index.json', 'templates/index.liquid'],
    note: 'Tip: reordering homepage sections is easiest in the online Theme Editor (Customize).'
  },
  {
    label: 'Product page',
    hint: 'product title, price, buy button',
    files: ['sections/main-product.liquid', 'sections/product-template.liquid', 'templates/product.json']
  },
  {
    label: 'Collection page',
    hint: 'product grid',
    files: ['sections/main-collection-product-grid.liquid', 'sections/collection-template.liquid', 'templates/collection.json']
  },
  {
    label: 'Cart',
    hint: 'cart page and drawer',
    files: ['sections/main-cart-items.liquid', 'sections/cart-template.liquid', 'sections/cart-drawer.liquid']
  },
  {
    label: 'Colors, fonts, spacing',
    hint: 'main stylesheet',
    files: ['assets/base.css', 'assets/theme.css', 'assets/theme.scss.liquid', 'config/settings_schema.json'],
    note: 'Tip: basic colors and fonts can also be changed in the online Theme Editor > Theme settings, with no code.'
  },
  { label: 'Add my own CSS', hint: 'safe place for your styles', special: 'customCss' },
  {
    label: 'Words / text used in the theme',
    hint: 'translations',
    files: ['locales/en.default.json', 'locales/en.json']
  },
  { label: 'Add a brand-new section', hint: 'creates a ready-made file', special: 'newSection' }
];

module.exports = { FILE_HELP, CATEGORIES, TASKS };
