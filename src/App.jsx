import React, { useState } from 'react';
import { Download, Plus, Trash2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

const CSSCustomizer = () => {
  const [activeSection, setActiveSection] = useState('start');
  const [copied, setCopied] = useState(false);

  // Font State
  const [fonts, setFonts] = useState([]);

  // Colors State
  const [colors, setColors] = useState({
    body: '',
    heading: '',
    button: '',
    hover: '',
    brand: '',
    background: ''
  });

  // Dark theme toggle
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Auto-populate colors when dark mode is toggled ON (only if fields are empty)
  const handleDarkThemeToggle = () => {
    const newIsDarkTheme = !isDarkTheme;
    setIsDarkTheme(newIsDarkTheme);
    
    if (newIsDarkTheme) {
      // Only set background default if field is empty
      setColors(prev => ({
        body: prev.body,
        heading: prev.heading,
        button: prev.button,
        hover: prev.hover,
        brand: prev.brand,
        background: prev.background || '#000000'
      }));
    }
  };

  // Function to check if a color is light or dark
  const isLightColor = (color) => {
    // Convert hex to RGB
    let r, g, b;
    
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      r = parseInt(hex.substr(0, 2), 16);
      g = parseInt(hex.substr(2, 2), 16);
      b = parseInt(hex.substr(4, 2), 16);
    } else if (color.startsWith('rgb')) {
      const matches = color.match(/\d+/g);
      if (matches) {
        r = parseInt(matches[0]);
        g = parseInt(matches[1]);
        b = parseInt(matches[2]);
      }
    } else {
      return true; // Default to light if can't parse
    }
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5; // Returns true if light, false if dark
  };

  // Typography State
  const [typography, setTypography] = useState({
    enableFonts: true,
    bodyFont: '',
    bodyFallback: 'Arial',
    headingFont: '',
    headingFallback: 'Arial',
    headingFontWeight: '',
    headingTextTransform: '',
    buttonFont: '',
    buttonFallback: 'Arial',
    bodySize: '',
    titleSize: '',
    titleLineHeight: '',
    titleSizeMobile: '',
    subtitleSize: '',
    subtitleSizeMobile: '',
    textTransform: 'uppercase',
    linkUnderline: false
  });

  // Fallback font options - simplified to just show font names
  const fallbackFontOptions = [
    { value: 'Arial', label: 'Arial', generic: 'sans-serif' },
    { value: 'Helvetica', label: 'Helvetica', generic: 'sans-serif' },
    { value: '"Helvetica Neue"', label: 'Helvetica Neue', generic: 'sans-serif' },
    { value: 'Verdana', label: 'Verdana', generic: 'sans-serif' },
    { value: 'Tahoma', label: 'Tahoma', generic: 'sans-serif' },
    { value: '"Trebuchet MS"', label: 'Trebuchet MS', generic: 'sans-serif' },
    { value: '"Segoe UI"', label: 'Segoe UI', generic: 'sans-serif' },
    { value: 'Georgia', label: 'Georgia', generic: 'serif' },
    { value: '"Times New Roman"', label: 'Times New Roman', generic: 'serif' },
    { value: 'Times', label: 'Times', generic: 'serif' },
    { value: 'Garamond', label: 'Garamond', generic: 'serif' },
    { value: '"Courier New"', label: 'Courier New', generic: 'monospace' },
    { value: 'Courier', label: 'Courier', generic: 'monospace' },
    { value: 'Monaco', label: 'Monaco', generic: 'monospace' },
    { value: 'Consolas', label: 'Consolas', generic: 'monospace' },
    { value: 'sans-serif', label: 'Sans-serif (generic)', generic: 'sans-serif' },
    { value: 'serif', label: 'Serif (generic)', generic: 'serif' },
    { value: 'monospace', label: 'Monospace (generic)', generic: 'monospace' },
    { value: 'cursive', label: 'Cursive (generic)', generic: 'cursive' },
    { value: 'fantasy', label: 'Fantasy (generic)', generic: 'fantasy' },
    { value: 'system-ui', label: 'System UI', generic: 'system-ui' }
  ];

  // Function to get the generic family for a fallback font
  const getGenericFamily = (fallbackFont) => {
    const option = fallbackFontOptions.find(opt => opt.value === fallbackFont);
    return option ? option.generic : 'sans-serif';
  };

  // Function to build font stack with generic family
  const buildFontStack = (primaryFont, fallbackFont) => {
    const generic = getGenericFamily(fallbackFont);
    
    // If fallback is already a generic family, just use it
    if (fallbackFont === generic) {
      return `"${primaryFont}", ${generic}`;
    }
    
    // Otherwise, add both the fallback and its generic family
    return `"${primaryFont}", ${fallbackFont}, ${generic}`;
  };

  // Function to suggest fallback based on font name
  const suggestFallback = (fontName) => {
    const lowerName = fontName.toLowerCase();
    
    // Check for monospace keywords
    if (lowerName.includes('mono') || lowerName.includes('courier') || lowerName.includes('console') || lowerName.includes('code')) {
      return 'Courier';
    }
    
    // Check for serif keywords
    if (lowerName.includes('serif') || lowerName.includes('times') || lowerName.includes('garamond') || lowerName.includes('georgia') || lowerName.includes('baskerville') || lowerName.includes('playfair')) {
      return 'Georgia';
    }
    
    // Check for cursive/script keywords
    if (lowerName.includes('script') || lowerName.includes('cursive') || lowerName.includes('handwriting')) {
      return 'cursive';
    }
    
    // Default to Arial for most modern fonts
    return 'Arial';
  };

  // Function to get fallback for a font by its name
  const getFontFallback = (fontName) => {
    if (!fontName) return 'Arial';
    
    // Search through all fonts
    for (const font of fonts) {
      // Check Google families
      if (font.type === 'google' && font.googleFamilies) {
        const family = font.googleFamilies.find(f => 
          (typeof f === 'object' ? f.name : f) === fontName
        );
        if (family) {
          return typeof family === 'object' ? (family.fallback || 'Arial') : 'Arial';
        }
      }
      // Check Typekit families
      if (font.type === 'typekit' && font.typekitFamilies) {
        const family = font.typekitFamilies.find(f => 
          (typeof f === 'object' ? f.name : f) === fontName
        );
        if (family) {
          return typeof family === 'object' ? (family.fallback || 'Arial') : 'Arial';
        }
      }
      // Check custom font name
      if (font.type === 'custom' && font.name === fontName) {
        return font.fallback || 'Arial';
      }
    }
    
    return 'Arial';
  };

  // Element-specific styles
  const [elementStyles, setElementStyles] = useState({
    buttons: {
      borderRadius: '0px',
      border: '1px solid var(--color-button)',
      borderWidth: '',
      borderStyle: '',
      primaryType: 'solid', // 'solid' or 'outlined'
      primaryColor: '',
      primaryBg: 'var(--color-background)',
      primaryBorderRadius: '8px',
      primaryHoverType: 'solid', // 'solid' or 'outlined'
      hoverColor: '',
      hoverBg: 'var(--color-hover)',
      primaryBorderWidth: '1px',
      primaryBorderStyle: 'solid',
      primaryBorderColor: 'button', // references colors.button
      primaryHoverBorderWidth: '1px',
      primaryHoverBorderStyle: 'solid',
      primaryHoverBorderColor: 'button', // references colors.button
      secondaryType: 'outlined', // 'solid' or 'outlined'
      secondaryColor: '',
      secondaryBg: 'var(--color-background)',
      secondaryBorderRadius: '8px',
      secondaryHoverType: 'outlined', // 'solid' or 'outlined'
      secondaryHoverColor: '',
      secondaryHoverBg: '',
      secondaryBorderWidth: '1px',
      secondaryBorderStyle: 'solid',
      secondaryBorderColor: '', // defaults to button color when empty
      secondaryHoverBorderWidth: '1px',
      secondaryHoverBorderStyle: 'solid',
      secondaryHoverBorderColor: 'button', // references colors.button
      transition: 'all 0.3s ease'
    },
    inputs: {
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      borderColor: '#cccccc',
      borderRadius: '4px'
    },
    modals: {
      backgroundColor: '#000000',
      textColor: 'var(--color-body)',
      borderColor: '#6e6e6e',
      padding: '16px',
      darkMode: false
    },
    lists: {
      backgroundColor: 'var(--color-background)',
      padding: '4px 8px',
      margin: '4px 0',
      listStyle: 'disc'
    }
  });

  // Custom CSS snippets
  const [customSnippets, setCustomSnippets] = useState([
    {
      id: 1,
      name: 'Plugin Margin Fix',
      selector: '#plugins-wrapper>div.ui.equal.height.grid.stackable.tour-page',
      properties: 'margin-top: 14px !important;'
    },
    {
      id: 2,
      name: 'Hero Image Position',
      selector: '.TourPage-Gallery',
      properties: 'margin-top: 80px !important;'
    }
  ]);

  // Function to get all available font families (including individual Typekit families)
  const getAllFontFamilies = () => {
    const families = [];
    fonts.forEach(font => {
      if (font.type === 'typekit' && font.typekitFamilies && font.typekitFamilies.length > 0) {
        // Add each Typekit family as a separate option
        font.typekitFamilies.forEach(family => {
          const familyName = typeof family === 'object' ? family.name : family;
          if (familyName && familyName.trim()) {
            families.push({ value: familyName, label: familyName, sourceFont: font, familyData: family });
          }
        });
      } else if (font.type === 'google' && font.googleFamilies && font.googleFamilies.length > 0) {
        // Add each Google Font family as a separate option
        font.googleFamilies.forEach(family => {
          const familyName = typeof family === 'object' ? family.name : family;
          if (familyName && familyName.trim()) {
            families.push({ value: familyName, label: familyName, sourceFont: font, familyData: family });
          }
        });
      } else if (font.name) {
        // Add regular fonts (custom) or fonts without families specified
        families.push({ value: font.name, label: font.name, sourceFont: font });
      }
    });
    return families;
  };

  // Add new font
  const addFont = () => {
    setFonts([...fonts, {
      id: Date.now(),
      name: '',
      type: 'google',
      googleLink: '',
      googleFamilies: [], // Array of { name, fallback } objects
      typekitUrl: '',
      typekitFamilies: [], // Array of { name, fallback } objects
      fallback: 'Arial', // Default fallback for custom fonts
      files: [{ url: '', weight: 'normal', style: 'normal' }]
    }]);
  };

  // Update font
  const updateFont = (id, field, value) => {
    setFonts(fonts.map(font => {
      if (font.id === id) {
        const updates = { ...font, [field]: value };
        
        // If updating Google Font link, try to extract all font family names
        if (field === 'googleLink' && value) {
          // Match all family= parameters (handles multiple families)
          const familyMatches = value.matchAll(/family=([^:&]+)/g);
          const families = [];
          for (const match of familyMatches) {
            const familyName = match[1].replace(/\+/g, ' ');
            families.push({ name: familyName, fallback: 'Arial' });
          }
          if (families.length > 0) {
            updates.googleFamilies = families;
            // Set name to first family for backwards compatibility
            updates.name = families[0].name;
          }
        }
        
        return updates;
      }
      return font;
    }));
  };

  // Delete font
  const deleteFont = (id) => {
    setFonts(fonts.filter(font => font.id !== id));
  };

  // Add font file
  const addFontFile = (fontId) => {
    setFonts(fonts.map(font => 
      font.id === fontId 
        ? { ...font, files: [...font.files, { url: '', weight: 'normal', style: 'normal' }] }
        : font
    ));
  };

  // Update font file
  const updateFontFile = (fontId, fileIndex, field, value) => {
    setFonts(fonts.map(font => 
      font.id === fontId 
        ? { 
            ...font, 
            files: font.files.map((file, idx) => 
              idx === fileIndex ? { ...file, [field]: value } : file
            )
          }
        : font
    ));
  };

  // Delete font file
  const deleteFontFile = (fontId, fileIndex) => {
    setFonts(fonts.map(font => 
      font.id === fontId 
        ? { ...font, files: font.files.filter((_, idx) => idx !== fileIndex) }
        : font
    ));
  };

  // Handle section navigation
  const handleSectionChange = (newSection) => {
    setActiveSection(newSection);
  };

  // Add custom snippet
  const addSnippet = () => {
    setCustomSnippets([...customSnippets, {
      id: Date.now(),
      name: '',
      selector: '',
      properties: ''
    }]);
  };

  // Update snippet
  const updateSnippet = (id, field, value) => {
    setCustomSnippets(customSnippets.map(snippet => 
      snippet.id === id ? { ...snippet, [field]: value } : snippet
    ));
  };

  // Delete snippet
  const deleteSnippet = (id) => {
    setCustomSnippets(customSnippets.filter(snippet => snippet.id !== id));
  };

  // Generate CSS
  const generateCSS = () => {
    let css = '';

    // Font Faces - Typekit ALWAYS first, then Google, then Custom (only if fonts enabled)
    if (typography.enableFonts) {
      // 1. Adobe Typekit fonts first
      fonts.forEach(font => {
        if (font.type === 'typekit' && font.typekitUrl) {
          css += `@import url("${font.typekitUrl}");

`;
        }
      });

      // 2. Google Fonts second
      fonts.forEach(font => {
        if (font.type === 'google' && font.googleLink) {
          css += `@import url('${font.googleLink}');

`;
        }
      });

      // 3. Custom fonts last
      fonts.forEach(font => {
        if (font.type === 'custom' && font.files.length > 0) {
          font.files.forEach(file => {
            if (file.url) {
              css += `@font-face {
  font-family: '${font.name}';
  src: url('${file.url}') format('opentype');
  font-weight: ${file.weight};
  font-style: ${file.style};
  font-display: swap;
}

`;
            }
          });
        }
      });
    }

    // CSS Variables
    css += `/* Variables */
:root {${colors.body ? `
  --color-body: ${colors.body};` : ''}${colors.heading ? `
  --color-heading: ${colors.heading};` : ''}${colors.button ? `
  --color-button: ${colors.button};` : ''}${colors.hover ? `
  --color-hover: ${colors.hover};` : ''}${colors.brand ? `
  --color-brand: ${colors.brand};` : ''}${colors.background ? `
  --color-background: ${colors.background};` : ''}${typography.bodyFont ? `
  --font-body: ${buildFontStack(typography.bodyFont, getFontFallback(typography.bodyFont))};` : ''}${typography.headingFont ? `
  --font-heading: ${buildFontStack(typography.headingFont, getFontFallback(typography.headingFont))};` : ''}${typography.buttonFont ? `
  --font-button: ${buildFontStack(typography.buttonFont, getFontFallback(typography.buttonFont))};` : ''}
  --transition: ${elementStyles.buttons.transition};
  --text-transform: ${typography.textTransform};
}

`;

    // Dark Theme Styles
    if (isDarkTheme) {
      css += `/* enable transparent plugin elements for dark mode */
#iframe_wrapper {
  background: var(--color-background) !important;
}

.Plugins-TourPage-GlanceWrapper .TourPage-Glance .ui.grid .row:nth-child(2n) {
  background-color: transparent !important;
}

.TourPage-About, .Plugins-TourPage-GlanceWrapper, .grid.tour-page #booking-container, #request-booking-mobile {
  background: transparent;
}

.Plugins-TourPage-GlanceWrapper {
  color: var(--color-body) !important;
}

.CheckoutSummary-Container {
  background: transparent;
}

.multi-select-wrapper .ui.multi-select-options {
  background-color: transparent;
}

.CheckoutSummary-ContentBox.Subtotal-PriceBreakdown .CheckoutSummary-PriceBreakDown {
  background: transparent;
}

.CheckoutSummary .item-subtitle {
  color: var(--color-body);
}

.CheckoutNavigationController .multi-select-wrapper .ui.multi-select-dropdown .text {
  color: #333333;
}

.TourPage-BookingDetails .BookingRequest-form .multi-select-wrapper .ui.multi-select-dropdown {
  color: #333333;
}

.CheckoutSummary {
  color: var(--color-body) !important;
}

.ConfirmationDefault .ui.grid.Confirmation-grid .column.ConfirmationDefault-Column.right {
  background: transparent !important;
}

.css-1mji04y, .css-1mji04y {
  /* cancelation policy on checkout and confirmation summary */
  color: var(--color-body) !important;
}

@media screen and (max-width: 767px) {
  .CheckoutSummary {
    background: transparent;
  }
}

`;
    }

    // Base Typography
    css += `/* Typography */
body {${colors.body ? `
  color: var(--color-body) !important;` : ''}${typography.bodyFont ? `
  font-family: var(--font-body) !important;` : ''}
  font-weight: normal !important;
  font-style: normal;${colors.background ? `
  background: var(--color-background);` : ''}${typography.bodySize ? `
  font-size: ${typography.bodySize} !important;` : ''}
}

h1, h2, h3, h4, h5, h6, .infoPanel .tourName {${typography.headingFont ? `
  font-family: var(--font-heading) !important;` : ''}${typography.headingFontWeight ? `
  font-weight: ${typography.headingFontWeight} !important;` : ''}${colors.heading ? `
  color: var(--color-heading) !important;` : ''}${typography.headingTextTransform ? `
  text-transform: ${typography.headingTextTransform} !important;` : ''}
}

${typography.titleSize || typography.titleLineHeight ? `.tour-title, .TourPage-About-title {${typography.titleSize ? `
  font-size: ${typography.titleSize} !important;` : ''}${typography.titleLineHeight ? `
  line-height: ${typography.titleLineHeight} !important;` : ''}
}

` : ''}${typography.subtitleSize ? `.tour-tagline, .TourPage-About-tagline {
  font-size: ${typography.subtitleSize} !important;
}

` : ''}`;

    // Title color override
    if (colors.titleOverride) {
      css += `.tour-title, .TourPage-About-title {
  color: ${colors.titleOverride} !important;
}

`;
    }

    // Subtitle color override
    if (colors.subtitleOverride) {
      css += `.tour-tagline, .TourPage-About-tagline {
  color: ${colors.subtitleOverride} !important;
}

`;
    }

    // Link underline
    if (typography.linkUnderline) {
      css += `.TourPage-About-description a, .contains-brand-link a {
  text-decoration: underline !important;
}

`;
    }

    // Buttons
    css += `/* Buttons */
.button, .ui.anygreen.button, .TourPage-ContactGuide-submit-button.ui.large.button,
#request-booking-mobile .ui.button, .ConfirmationContainer .ButtonContainer .ui.button,
.CheckoutNavigationController button.BookingRequest-submit, [data-testid="update-email-btn"],
.rescheduleModal .modalActions .submitButton, .contactModal .modalActions .submitButton, .ConfirmationDefault .GoGAdditionalInfoButton, [data-testid="apply-filter"] {${typography.buttonFont ? `
  font-family: var(--font-button) !important;` : ''}
  font-weight: normal !important;
  color: ${elementStyles.buttons.primaryColor} !important;
  background: ${elementStyles.buttons.primaryBg} !important;
  border-radius: ${elementStyles.buttons.borderRadius} !important;
  transition: var(--transition) !important;
  text-transform: var(--text-transform) !important;
  border: ${elementStyles.buttons.border} !important;
}

.button:hover, .ui.anygreen.button:hover, .TourPage-ContactGuide-submit-button.ui.large.button:hover,
.ConfirmationContainer .ButtonContainer .ui.button:hover, .CheckoutNavigationController button.BookingRequest-submit:hover, .ConfirmationDefault .GoGAdditionalInfoButton:hover, .rescheduleModal .modalActions .submitButton:hover, .contactModal .modalActions .submitButton:hover, [data-testid="apply-filter"]:hover {
  background-color: ${elementStyles.buttons.hoverBg} !important;
  color: ${elementStyles.buttons.hoverColor} !important;
}

/* Secondary Buttons */
.ui.basic.button, .DiscountCodeContainer .DiscountCode-Input .ui.button,
[data-testid="dont-cancel-btn"], .ModifyBooking .ModifyBooking-Column.left .actionButtons .rescheduleButton,
.ModifyBooking .ModifyBooking-Column.left .actionButtons .contactButton,
.TourPage-ContactGuide-link.ui.basic.button {${typography.buttonFont ? `
  font-family: var(--font-button) !important;` : ''}
  font-weight: normal !important;
  color: ${elementStyles.buttons.secondaryColor || 'var(--color-button)'} !important;
  background: ${elementStyles.buttons.secondaryBg} !important;
  border-radius: ${elementStyles.buttons.borderRadius} !important;
  transition: var(--transition) !important;
  text-transform: var(--text-transform) !important;
  border: ${elementStyles.buttons.border} !important;
}

`;

    // Input Fields
    css += `/* Input Fields */
input[type='text'], input[type='email'], input[type='search'], input[type='password'] {
  background-color: ${elementStyles.inputs.backgroundColor} !important;
  color: ${elementStyles.inputs.textColor} !important;
  border: 1px solid ${elementStyles.inputs.borderColor} !important;
  border-radius: ${elementStyles.inputs.borderRadius} !important;
}

`;

    // Modals
    css += `/* Modals */
.ui.modal > .content {
  background: ${elementStyles.modals.backgroundColor};
  color: ${elementStyles.modals.textColor};
}

.rescheduleModal, .contactModal, .confirm-email-modal {
  background-color: ${elementStyles.modals.backgroundColor} !important;
  border: 1px solid ${elementStyles.modals.borderColor} !important;
  color: ${elementStyles.modals.textColor} !important;
  padding: ${elementStyles.modals.padding} !important;
}

[data-testid="modal-main-overlay"] {
  background-color: ${elementStyles.modals.backgroundColor} !important;
  pointer-events: auto;
  padding: ${elementStyles.modals.padding} !important;
}

`;

    // Modal Dark Mode
    if (elementStyles.modals.darkMode) {
      css += `/* Modal Dark Mode */
[data-testid="modal-main-overlay"] {
  background: var(--color-background) !important;
}

.Confirmation-MessageGuide-Content {
  background: var(--color-background) !important;
}

.css-lrd4iz {
  /* update email address modal field label */
  color: var(--color-body) !important;
}

.ui.modal > .content {
  background: var(--color-background);
}

`;
    }
    // Lists
    css += `/* Lists */
li {
  background: ${elementStyles.lists.backgroundColor} !important;
  padding: ${elementStyles.lists.padding};
  margin: ${elementStyles.lists.margin};
  list-style: ${elementStyles.lists.listStyle};
}

`;

    // Mobile Styles
    if (typography.titleSizeMobile || typography.subtitleSizeMobile) {
      css += `/* Mobile Styles */
@media (max-width: 600px) {${typography.titleSizeMobile ? `
  .tour-title, .TourPage-About-title {
    font-size: ${typography.titleSizeMobile} !important;
  }
` : ''}${typography.subtitleSizeMobile ? `
  .tour-tagline, .TourPage-About-tagline {
    font-size: ${typography.subtitleSizeMobile} !important;
  }
` : ''}}

`;
    }

    // Custom Snippets
    if (customSnippets.length > 0) {
      css += `/* Custom CSS Snippets */\n`;
      customSnippets.forEach(snippet => {
        if (snippet.selector && snippet.properties) {
          css += `/* ${snippet.name || 'Custom Snippet'} */\n`;
          css += `${snippet.selector} {\n  ${snippet.properties}\n}\n\n`;
        }
      });
    }

    return css;
  };

  // Export CSS
  const exportCSS = () => {
    const css = generateCSS();
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-styles.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy CSS
  const copyCSS = () => {
    const css = generateCSS();
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadLightTheme = () => {
    setColors({
      body: '#333333',
      heading: '#1a1a1a',
      button: '',
      hover: '',
      brand: '',
      background: '#ffffff'
    });
    setIsDarkTheme(false);
  };

  const loadDarkTheme = () => {
    setColors({
      body: '#ffffff',
      heading: '#ffffff',
      button: '',
      hover: '',
      brand: '',
      background: '#000000'
    });
    setIsDarkTheme(true);
  };

  // Calculate summary stats
  const getSummaryStats = () => {
    const fontCount = fonts.filter(f => f.name).length;
    const colorCount = Object.values(colors).filter(c => c).length;
    const hasFonts = typography.enableFonts && fontCount > 0;
    const hasColors = colorCount > 0;
    const hasTypography = typography.titleSize || typography.subtitleSize || typography.bodySize;
    const hasButtons = elementStyles.buttons.primaryColor || elementStyles.buttons.borderRadius !== '0px';
    const needsStripe = true; // Always show as reminder
    
    return {
      fontCount,
      colorCount,
      hasFonts,
      hasColors,
      hasTypography,
      hasButtons,
      needsStripe,
      darkTheme: isDarkTheme
    };
  };

  const sections = [
    { id: 'start', label: 'Getting Started', icon: '🚀' },
    { id: 'fonts', label: 'Fonts', icon: '🔤' },
    { id: 'colors', label: 'Colors', icon: '🎨' },
    { id: 'typography', label: 'Typography', icon: '📝' },
    { id: 'buttons', label: 'Buttons', icon: '🔘' },
    { id: 'inputs', label: 'Input Fields', icon: '📋' },
    { id: 'modals', label: 'Modals', icon: '🪟' },
    { id: 'lists', label: 'Lists', icon: '📄' },
    { id: 'custom', label: 'Custom CSS', icon: '⚙️' }
  ];

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '32px',
          color: 'white'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '8px'
          }}>AnyRoad Plugin Style Studio</h1>
          <p style={{
            margin: 0,
            fontSize: '16px',
            opacity: 0.9
          }}>Configure custom CSS for the booking experience</p>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          borderBottom: '2px solid #f0f0f0',
          background: '#fafafa'
        }}>
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => handleSectionChange(section.id)}
              style={{
                flex: '0 0 auto',
                padding: '16px 24px',
                border: 'none',
                background: activeSection === section.id ? 'white' : 'transparent',
                color: activeSection === section.id ? '#667eea' : '#666',
                fontWeight: activeSection === section.id ? '600' : '500',
                cursor: 'pointer',
                fontSize: '14px',
                borderBottom: activeSection === section.id ? '3px solid #667eea' : '3px solid transparent',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ marginRight: '8px' }}>{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>

        {/* Split Screen Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Panel - Settings */}
          <div style={{ 
            flex: '0 0 55%', 
            overflowY: 'auto', 
            padding: '32px',
            borderRight: '2px solid #f0f0f0'
          }}>
          {/* Getting Started Section */}
          {activeSection === 'start' && (
            <div>
              <h2 style={{ marginBottom: '24px', fontSize: '24px', color: '#333' }}>Getting Started</h2>

              {/* Theme Presets */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', color: '#667eea', marginBottom: '16px' }}>Quick Start Templates</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <button
                    onClick={loadLightTheme}
                    style={{
                      padding: '20px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                      border: '2px solid #667eea',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>☀️</div>
                    <div style={{ fontWeight: '600', fontSize: '16px', color: '#333', marginBottom: '4px' }}>Light Theme</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Light background, dark text</div>
                  </button>

                  <button
                    onClick={loadDarkTheme}
                    style={{
                      padding: '20px',
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                      border: '2px solid #764ba2',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌙</div>
                    <div style={{ fontWeight: '600', fontSize: '16px', color: '#fff', marginBottom: '4px' }}>Dark Theme</div>
                    <div style={{ fontSize: '12px', color: '#ccc' }}>Dark background, light text</div>
                  </button>
                </div>
              </div>

              {/* About This Tool */}
              <div style={{ background: '#f0f4ff', padding: '24px', borderRadius: '12px', marginBottom: '32px', border: '1px solid #667eea' }}>
                <h3 style={{ fontSize: '18px', color: '#667eea', marginTop: 0, marginBottom: '16px' }}>📘 What This Tool Does</h3>
                <p style={{ margin: '0 0 12px 0', lineHeight: '1.6', color: '#333' }}>
                  This tool generates custom CSS stylesheets for <strong>AnyRoad booking plugins</strong>. 
                  Your CSS will control the appearance of:
                </p>
                <ul style={{ margin: '0 0 12px 20px', padding: 0, lineHeight: '1.8', color: '#333' }}>
                  <li>Guest checkout flow</li>
                  <li>Experience listings and details</li>
                  <li>Booking forms and payment screens</li>
                  <li>Confirmation pages</li>
                </ul>
              </div>

              {/* Important Note */}
              <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '12px', marginBottom: '32px', border: '2px solid #ffc107' }}>
                <h3 style={{ fontSize: '16px', color: '#856404', marginTop: 0, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>⚠️</span>
                  <span>Important: Two Configuration Levels</span>
                </h3>
                <p style={{ margin: 0, lineHeight: '1.6', color: '#856404' }}>
                  CSS must be applied in both locations in AnyRoad Admin:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                  <div style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #ffc107' }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: '#856404' }}>1. Plugin Level</div>
                    <div style={{ fontSize: '13px', color: '#856404' }}>Admin → Plugins → Your Plugin</div>
                  </div>
                  <div style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #ffc107' }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: '#856404' }}>2. User Level</div>
                    <div style={{ fontSize: '13px', color: '#856404' }}>Admin → Users → User Settings</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fonts Section */}
          {activeSection === 'fonts' && (
            <div>
              <h2 style={{ marginBottom: '16px', fontSize: '24px', color: '#333' }}>Font Management</h2>

              {/* Contextual Help Banner */}
              <div style={{
                background: '#f0f4ff',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid #667eea',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#555'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '4px', color: '#667eea' }}>💡 About Fonts</div>
                <div>Your fonts will be used for <strong>Body Text</strong>, <strong>Headings</strong>, and <strong>Buttons</strong> throughout the booking experience.</div>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Configure your custom fonts, Google Fonts, or Adobe Typekit
                </p>
                <button
                  onClick={addFont}
                  style={{
                    padding: '10px 20px',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600'
                      }}
                    >
                      <Plus size={16} /> Add Font
                    </button>
                  </div>

              {fonts.map((font, fontIndex) => (
                <div key={font.id} style={{
                  background: '#f9f9f9',
                  padding: '24px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>Font {fontIndex + 1}</h3>
                    {fonts.length > 1 && (
                      <button
                        onClick={() => deleteFont(font.id)}
                        style={{
                          background: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Font Type
                    </label>
                    <select
                      value={font.type}
                      onChange={(e) => updateFont(font.id, 'type', e.target.value)}
                      style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="custom">Custom Font Files</option>
                      <option value="google">Google Fonts</option>
                      <option value="typekit">Adobe Typekit</option>
                    </select>
                  </div>

                  {font.type === 'google' && (
                    <div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                          Google Font Link
                        </label>
                        <input
                          type="text"
                          value={font.googleLink || ''}
                          onChange={(e) => updateFont(font.id, 'googleLink', e.target.value)}
                          placeholder="Paste the full Google Fonts link, e.g., https://fonts.googleapis.com/css2?family=Chakra+Petch..."
                          style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                        <small style={{ display: 'block', marginTop: '6px', color: '#666', fontSize: '12px' }}>
                          Get this from <a href="https://fonts.google.com" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>fonts.google.com</a> - select "@import" and copy the URL from inside url('...')
                        </small>
                      </div>
                      
                      {font.googleLink && font.googleFamilies && font.googleFamilies.length > 0 && (
                        <div style={{ 
                          background: '#e8f5e9', 
                          border: '1px solid #4caf50', 
                          borderRadius: '6px', 
                          padding: '12px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ fontWeight: '600', color: '#2e7d32', marginBottom: '6px', fontSize: '13px' }}>
                            ✓ {font.googleFamilies.length} Font {font.googleFamilies.length === 1 ? 'Family' : 'Families'} Detected
                          </div>
                          <div style={{ color: '#2e7d32', fontSize: '12px', lineHeight: '1.5' }}>
                            {font.googleFamilies.map((family, i) => {
                              const familyName = typeof family === 'object' ? family.name : family;
                              return (
                                <span key={i}>
                                  <strong>"{familyName}"</strong>{i < font.googleFamilies.length - 1 ? ', ' : ''}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {font.googleLink && (!font.googleFamilies || font.googleFamilies.length === 0) && (
                        <div style={{ 
                          background: '#fff3cd', 
                          border: '1px solid #ffc107', 
                          borderRadius: '6px', 
                          padding: '12px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ fontWeight: '600', color: '#856404', marginBottom: '6px', fontSize: '13px' }}>
                            ⚠️ Could not auto-detect font families
                          </div>
                          <div style={{ color: '#856404', fontSize: '12px', lineHeight: '1.5' }}>
                            Please add the font family names manually below.
                          </div>
                        </div>
                      )}

                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '8px' 
                        }}>
                          <label style={{ fontWeight: '600', color: '#667eea' }}>
                            Font Families <span style={{ color: '#d32f2f' }}>*</span>
                          </label>
                          <button
                            onClick={() => {
                              const currentFamilies = font.googleFamilies || [];
                              updateFont(font.id, 'googleFamilies', [...currentFamilies, { name: '', fallback: 'Arial' }]);
                            }}
                            style={{
                              padding: '4px 12px',
                              background: '#667eea',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            + Add Family
                          </button>
                        </div>
                        <small style={{ display: 'block', marginBottom: '12px', color: '#666', fontSize: '12px' }}>
                          One Google Fonts URL can include multiple font families. Each has its own fallback font.
                        </small>
                        {(font.googleFamilies || []).map((family, familyIndex) => {
                          const familyName = typeof family === 'object' ? family.name : family;
                          const familyFallback = typeof family === 'object' ? family.fallback : 'Arial';
                          return (
                            <div key={familyIndex} style={{ 
                              background: '#f5f5f5', 
                              padding: '12px', 
                              borderRadius: '8px', 
                              marginBottom: '12px',
                              border: '1px solid #e0e0e0'
                            }}>
                              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#555' }}>
                                    Family Name
                                  </label>
                                  <input
                                    type="text"
                                    value={familyName}
                                    onChange={(e) => {
                                      const newFamilies = [...(font.googleFamilies || [])];
                                      newFamilies[familyIndex] = { 
                                        name: e.target.value, 
                                        fallback: familyFallback 
                                      };
                                      updateFont(font.id, 'googleFamilies', newFamilies);
                                      if (familyIndex === 0) {
                                        updateFont(font.id, 'name', e.target.value);
                                      }
                                    }}
                                    placeholder="e.g., Barlow Semi Condensed"
                                    style={{
                                      width: '100%',
                                      padding: '10px',
                                      border: '2px solid #667eea',
                                      borderRadius: '6px',
                                      fontSize: '14px',
                                      background: familyName ? '#e8f5e9' : 'white'
                                    }}
                                  />
                                </div>
                                <button
                                  onClick={() => {
                                    const newFamilies = (font.googleFamilies || []).filter((_, i) => i !== familyIndex);
                                    updateFont(font.id, 'googleFamilies', newFamilies);
                                    if (newFamilies.length > 0) {
                                      const firstFamily = newFamilies[0];
                                      updateFont(font.id, 'name', typeof firstFamily === 'object' ? firstFamily.name : firstFamily);
                                    }
                                  }}
                                  style={{
                                    padding: '10px',
                                    background: '#ff4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#555' }}>
                                    Fallback Font
                                  </label>
                                  <select
                                    value={familyFallback}
                                    onChange={(e) => {
                                      const newFamilies = [...(font.googleFamilies || [])];
                                      newFamilies[familyIndex] = { 
                                        name: familyName, 
                                        fallback: e.target.value 
                                      };
                                      updateFont(font.id, 'googleFamilies', newFamilies);
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '10px',
                                      border: '1px solid #ddd',
                                      borderRadius: '6px',
                                      fontSize: '14px',
                                      background: 'white'
                                    }}
                                  >
                                    <optgroup label="Sans-serif">
                                      {fallbackFontOptions.filter(f => f.generic === 'sans-serif' && f.value !== 'sans-serif').map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Serif">
                                      {fallbackFontOptions.filter(f => f.generic === 'serif' && f.value !== 'serif').map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Monospace">
                                      {fallbackFontOptions.filter(f => f.generic === 'monospace' && f.value !== 'monospace').map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Generic">
                                      {fallbackFontOptions.filter(f => f.value === f.generic || f.label.includes('generic')).map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </optgroup>
                                  </select>
                                </div>
                                <button
                                  onClick={() => {
                                    const newFamilies = [...(font.googleFamilies || [])];
                                    newFamilies[familyIndex] = { 
                                      name: familyName, 
                                      fallback: suggestFallback(familyName) 
                                    };
                                    updateFont(font.id, 'googleFamilies', newFamilies);
                                  }}
                                  style={{
                                    padding: '10px 16px',
                                    background: '#667eea',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                  }}
                                  title="Auto-suggest fallback"
                                >
                                  Auto
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {(!font.googleFamilies || font.googleFamilies.length === 0) && (
                          <div 
                            onClick={() => updateFont(font.id, 'googleFamilies', [{ name: '', fallback: 'Arial' }])}
                            style={{
                              padding: '16px',
                              border: '2px dashed #667eea',
                              borderRadius: '6px',
                              textAlign: 'center',
                              color: '#667eea',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            Click to add font family name
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {font.type === 'typekit' && (
                    <div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                          Adobe Typekit CSS URL
                        </label>
                        <input
                          type="text"
                          value={font.typekitUrl || ''}
                          onChange={(e) => updateFont(font.id, 'typekitUrl', e.target.value)}
                          placeholder="e.g., https://use.typekit.net/mch3imj.css"
                          style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                        <small style={{ display: 'block', marginTop: '6px', color: '#666', fontSize: '12px' }}>
                          Get this from your Adobe Fonts project
                        </small>
                      </div>
                      
                      <div style={{ 
                        background: '#e3f2fd', 
                        border: '1px solid #2196f3', 
                        borderRadius: '6px', 
                        padding: '12px',
                        marginBottom: '16px'
                      }}>
                        <div style={{ fontWeight: '600', color: '#1565c0', marginBottom: '6px', fontSize: '13px' }}>
                          ℹ️ Multiple Font Families
                        </div>
                        <div style={{ color: '#1565c0', fontSize: '12px', lineHeight: '1.5' }}>
                          A single Typekit CSS file can contain multiple font families. Add each font family name below.
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <label style={{ fontWeight: '600', color: '#667eea', fontSize: '14px' }}>
                            Font Families <span style={{ color: '#d32f2f' }}>*</span>
                          </label>
                          <button
                            onClick={() => {
                              const newFamilies = [...(font.typekitFamilies || []), { name: '', fallback: 'Arial' }];
                              updateFont(font.id, 'typekitFamilies', newFamilies);
                            }}
                            style={{
                              padding: '6px 12px',
                              background: '#667eea',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Plus size={14} /> Add Font
                          </button>
                        </div>

                        {(!font.typekitFamilies || font.typekitFamilies.length === 0) && (
                          <div style={{ 
                            padding: '12px',
                            background: '#f5f5f5',
                            borderRadius: '6px',
                            fontSize: '13px',
                            color: '#666',
                            fontStyle: 'italic',
                            textAlign: 'center'
                          }}>
                            Click "Add Font" to add font families from your Typekit CSS (e.g., "civane-normal", "industry")
                          </div>
                        )}

                        {font.typekitFamilies && font.typekitFamilies.map((family, idx) => {
                          const familyName = typeof family === 'object' ? family.name : family;
                          const familyFallback = typeof family === 'object' ? family.fallback : 'Arial';
                          return (
                            <div key={idx} style={{ 
                              background: '#f5f5f5', 
                              padding: '12px', 
                              borderRadius: '8px', 
                              marginBottom: '12px',
                              border: '1px solid #e0e0e0'
                            }}>
                              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#555' }}>
                                    Family Name
                                  </label>
                                  <input
                                    type="text"
                                    value={familyName}
                                    onChange={(e) => {
                                      const newFamilies = [...font.typekitFamilies];
                                      newFamilies[idx] = { name: e.target.value, fallback: familyFallback };
                                      updateFont(font.id, 'typekitFamilies', newFamilies);
                                    }}
                                    placeholder="e.g., civane-normal"
                                    style={{
                                      width: '100%',
                                      padding: '10px',
                                      border: '2px solid #667eea',
                                      borderRadius: '6px',
                                      fontSize: '14px',
                                      background: familyName && familyName.trim() ? '#e8f5e9' : 'white'
                                    }}
                                  />
                                </div>
                                <button
                                  onClick={() => {
                                    const newFamilies = font.typekitFamilies.filter((_, i) => i !== idx);
                                    updateFont(font.id, 'typekitFamilies', newFamilies);
                                  }}
                                  style={{
                                    padding: '10px',
                                    background: '#ef5350',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#555' }}>
                                    Fallback Font
                                  </label>
                                  <select
                                    value={familyFallback}
                                    onChange={(e) => {
                                      const newFamilies = [...font.typekitFamilies];
                                      newFamilies[idx] = { name: familyName, fallback: e.target.value };
                                      updateFont(font.id, 'typekitFamilies', newFamilies);
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '10px',
                                      border: '1px solid #ddd',
                                      borderRadius: '6px',
                                      fontSize: '14px',
                                      background: 'white'
                                    }}
                                  >
                                    <optgroup label="Sans-serif">
                                      {fallbackFontOptions.filter(f => f.generic === 'sans-serif' && f.value !== 'sans-serif').map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Serif">
                                      {fallbackFontOptions.filter(f => f.generic === 'serif' && f.value !== 'serif').map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Monospace">
                                      {fallbackFontOptions.filter(f => f.generic === 'monospace' && f.value !== 'monospace').map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Generic">
                                      {fallbackFontOptions.filter(f => f.value === f.generic || f.label.includes('generic')).map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </optgroup>
                                  </select>
                                </div>
                                <button
                                  onClick={() => {
                                    const newFamilies = [...font.typekitFamilies];
                                    newFamilies[idx] = { name: familyName, fallback: suggestFallback(familyName) };
                                    updateFont(font.id, 'typekitFamilies', newFamilies);
                                  }}
                                  style={{
                                    padding: '10px 16px',
                                    background: '#667eea',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                  }}
                                  title="Auto-suggest fallback"
                                >
                                  Auto
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Only show Font Family Name for Custom fonts (Google and Typekit have their own families UI) */}
                  {font.type === 'custom' && (
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '600', 
                        color: '#555'
                      }}>
                        Font Family Name
                      </label>
                      <input
                        type="text"
                        value={font.name}
                        onChange={(e) => updateFont(font.id, 'name', e.target.value)}
                        placeholder="e.g., SweetSans"
                        style={{
                          width: '100%',
                          minWidth: 0,
                          boxSizing: 'border-box',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  )}

                  {/* Fallback Font - Only for custom fonts (Google/Typekit have per-family fallbacks) */}
                  {font.type === 'custom' && (
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                        Fallback Font
                      </label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                        <select
                          value={font.fallback || 'Arial'}
                          onChange={(e) => updateFont(font.id, 'fallback', e.target.value)}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px',
                            background: 'white'
                          }}
                        >
                          <optgroup label="Sans-serif Fonts">
                            {fallbackFontOptions.filter(f => f.generic === 'sans-serif' && f.value !== 'sans-serif').map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Serif Fonts">
                            {fallbackFontOptions.filter(f => f.generic === 'serif' && f.value !== 'serif').map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Monospace Fonts">
                            {fallbackFontOptions.filter(f => f.generic === 'monospace' && f.value !== 'monospace').map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Generic Families">
                            {fallbackFontOptions.filter(f => f.value === f.generic || f.label.includes('generic')).map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </optgroup>
                        </select>
                        <button
                          onClick={() => updateFont(font.id, 'fallback', suggestFallback(font.name))}
                          style={{
                            padding: '10px 16px',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            whiteSpace: 'nowrap'
                          }}
                          title="Auto-suggest based on font name"
                        >
                          Auto
                        </button>
                      </div>
                      <small style={{ display: 'block', marginTop: '6px', color: '#666', fontSize: '12px' }}>
                        Used when this font fails to load
                      </small>
                    </div>
                  )}

                  {font.type === 'custom' && (
                    <div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <label style={{ fontWeight: '600', color: '#555' }}>Font Files</label>
                        <button
                          onClick={() => addFontFile(font.id)}
                          style={{
                            background: '#764ba2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Plus size={12} /> Add Variant
                        </button>
                      </div>

                      {font.files.map((file, fileIndex) => (
                        <div key={fileIndex} style={{
                          background: 'white',
                          padding: '16px',
                          borderRadius: '8px',
                          marginBottom: '12px',
                          border: '1px solid #e0e0e0'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#666' }}>
                              Variant {fileIndex + 1}
                            </span>
                            {font.files.length > 1 && (
                              <button
                                onClick={() => deleteFontFile(font.id, fileIndex)}
                                style={{
                                  background: 'transparent',
                                  color: '#ff4444',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '0',
                                  fontSize: '12px'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>

                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#666' }}>
                              Font File URL
                            </label>
                            <input
                              type="text"
                              value={file.url}
                              onChange={(e) => updateFontFile(font.id, fileIndex, 'url', e.target.value)}
                              placeholder="https://example.com/font.otf"
                              style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '13px'
                              }}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#666' }}>
                                Weight
                              </label>
                              <select
                                value={file.weight}
                                onChange={(e) => updateFontFile(font.id, fileIndex, 'weight', e.target.value)}
                                style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                                  padding: '8px',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  fontSize: '13px'
                                }}
                              >
                                <option value="normal">Normal (400)</option>
                                <option value="bold">Bold (700)</option>
                                <option value="100">Thin (100)</option>
                                <option value="200">Extra Light (200)</option>
                                <option value="300">Light (300)</option>
                                <option value="500">Medium (500)</option>
                                <option value="600">Semi Bold (600)</option>
                                <option value="800">Extra Bold (800)</option>
                                <option value="900">Black (900)</option>
                              </select>
                            </div>

                            <div>
                              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#666' }}>
                                Style
                              </label>
                              <select
                                value={file.style}
                                onChange={(e) => updateFontFile(font.id, fileIndex, 'style', e.target.value)}
                                style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                                  padding: '8px',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  fontSize: '13px'
                                }}
                              >
                                <option value="normal">Normal</option>
                                <option value="italic">Italic</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Colors Section */}
          {activeSection === 'colors' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>Color Palette</h2>
                
                {/* Dark Theme Toggle */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '12px',
                  background: '#f9f9f9',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <label style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: '#555',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}>
                    Dark Theme
                  </label>
                  <div 
                    onClick={() => handleDarkThemeToggle()}
                    style={{
                      width: '50px',
                      height: '28px',
                      background: isDarkTheme ? '#667eea' : '#ddd',
                      borderRadius: '14px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.3s',
                      border: isDarkTheme ? '2px solid #667eea' : '2px solid #ccc'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      background: 'white',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '2px',
                      left: isDarkTheme ? '26px' : '2px',
                      transition: 'left 0.3s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#777',
                    minWidth: '35px'
                  }}>
                    {isDarkTheme ? 'On' : 'Off'}
                  </span>
                </div>
              </div>

              {isDarkTheme && (
                <div style={{
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '24px',
                  fontSize: '13px',
                  color: '#856404',
                  lineHeight: '1.5'
                }}>
                  <strong>Dark Theme Enabled:</strong> Additional CSS will be generated to enable transparent backgrounds and proper color inheritance for plugin elements.
                </div>
              )}

              {/* Contextual Help Banner */}
              <div style={{
                background: '#f0f4ff',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid #667eea',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#555'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '4px', color: '#667eea' }}>💡 About Colors</div>
                <div>These colors will be used across the entire booking experience. Leave fields blank to use plugin defaults.</div>
              </div>
              
              {/* Text Colors Group */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  color: '#667eea', 
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid #667eea'
                }}>
                  Text Colors
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div style={{
                    background: '#f9f9f9',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600',
                      color: '#555'
                    }}>
                      Body Text Color
                    </label>
                    <p style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '12px', 
                      color: '#777',
                      lineHeight: '1.4'
                    }}>
                      General text color
                    </p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: '60px', height: '60px', flexShrink: 0 }}>
                        <input
                          type="color"
                          value={colors.body || '#000000'}
                          onChange={(e) => setColors({ ...colors, body: e.target.value })}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            opacity: colors.body ? 1 : 0,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        {!colors.body && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px dashed #ccc',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: '#999',
                            fontWeight: '500',
                            background: 'transparent',
                            pointerEvents: 'none'
                          }}>
                            select
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={colors.body}
                        onChange={(e) => setColors({ ...colors, body: e.target.value })}
                        placeholder="#000000"
                        style={{
                          flex: 1,
                         minWidth: 0,
                          minWidth: 0,
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{
                    background: '#f9f9f9',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600',
                      color: '#555'
                    }}>
                      Heading Color
                    </label>
                    <p style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '12px', 
                      color: '#777',
                      lineHeight: '1.4'
                    }}>
                      Titles, subtitles, and headings
                    </p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: '60px', height: '60px', flexShrink: 0 }}>
                        <input
                          type="color"
                          value={colors.heading || '#000000'}
                          onChange={(e) => setColors({ ...colors, heading: e.target.value })}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            opacity: colors.heading ? 1 : 0,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        {!colors.heading && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px dashed #ccc',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: '#999',
                            fontWeight: '500',
                            background: 'transparent',
                            pointerEvents: 'none'
                          }}>
                            select
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={colors.heading}
                        onChange={(e) => setColors({ ...colors, heading: e.target.value })}
                        placeholder="#000000"
                        style={{
                          flex: 1,
                         minWidth: 0,
                          minWidth: 0,
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Element Colors Group */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  color: '#764ba2', 
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid #764ba2'
                }}>
                  Elements
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  {['button', 'hover', 'brand', 'background'].map((key) => (
                    <div key={key} style={{
                      background: '#f9f9f9',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '12px', 
                        fontWeight: '600',
                        color: '#555',
                        textTransform: 'capitalize'
                      }}>
                        {key} Color
                      </label>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '60px', height: '60px', flexShrink: 0 }}>
                          <input
                            type="color"
                            value={colors[key] || '#000000'}
                            onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                            style={{
                              width: '100%',
                              height: '100%',
                              border: '2px solid #ddd',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              opacity: colors[key] ? 1 : 0,
                              position: 'absolute',
                              top: 0,
                              left: 0
                            }}
                          />
                          {!colors[key] && (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              border: '2px dashed #ccc',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              color: '#999',
                              fontWeight: '500',
                              background: 'transparent',
                              pointerEvents: 'none'
                            }}>
                              select
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={colors[key]}
                          onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                          style={{
                            flex: 1,
                           minWidth: 0,
                            minWidth: 0,
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'monospace'
                          }}
                        />
                      </div>
                      
                      {/* Warning for dark background without dark theme */}
                      {key === 'background' && !isLightColor(colors.background) && !isDarkTheme && (
                        <div style={{
                          marginTop: '12px',
                          background: '#ffebee',
                          border: '1px solid #ef5350',
                          borderRadius: '6px',
                          padding: '10px',
                          fontSize: '12px',
                          color: '#c62828',
                          lineHeight: '1.5'
                        }}>
                          <strong>⚠️ Dark Background Detected</strong>
                          <div style={{ marginTop: '4px' }}>
                            Your background color is dark. For proper text legibility and plugin transparency, please enable <strong>Dark Theme</strong> above.
                          </div>
                        </div>
                      )}
                      
                      {/* Success message for dark background with dark theme */}
                      {key === 'background' && !isLightColor(colors.background) && isDarkTheme && (
                        <div style={{
                          marginTop: '12px',
                          background: '#e8f5e9',
                          border: '1px solid #66bb6a',
                          borderRadius: '6px',
                          padding: '10px',
                          fontSize: '12px',
                          color: '#2e7d32',
                          lineHeight: '1.5'
                        }}>
                          ✓ Dark theme is enabled for your dark background
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Text Color Overrides */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    color: '#999', 
                    margin: 0,
                    paddingBottom: '8px',
                    borderBottom: '2px solid #ddd'
                  }}>
                    Advanced: Text Color Overrides
                  </h3>
                  <span style={{ 
                    fontSize: '11px', 
                    color: '#999',
                    fontStyle: 'italic',
                    paddingBottom: '8px'
                  }}>
                    (Optional)
                  </span>
                </div>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#666', 
                  marginBottom: '16px',
                  lineHeight: '1.5'
                }}>
                  Override the heading color for specific elements. Leave empty to use the default heading color.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div style={{
                    background: '#fafafa',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600',
                      color: '#666'
                    }}>
                      Title Color Override
                    </label>
                    <p style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '11px', 
                      color: '#888',
                      lineHeight: '1.4'
                    }}>
                      Main page title color (if different from heading)
                    </p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: '60px', height: '60px', flexShrink: 0 }}>
                        <input
                          type="color"
                          value={colors.titleOverride || '#000000'}
                          onChange={(e) => setColors({ ...colors, titleOverride: e.target.value })}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            opacity: colors.titleOverride ? 1 : 0,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        {!colors.titleOverride && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px dashed #ccc',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: '#999',
                            fontWeight: '500',
                            background: 'transparent',
                            pointerEvents: 'none'
                          }}>
                            select
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={colors.titleOverride || ''}
                        onChange={(e) => setColors({ ...colors, titleOverride: e.target.value })}
                        placeholder="Leave empty to use heading color"
                        style={{
                          flex: 1,
                         minWidth: 0,
                          minWidth: 0,
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>
                    {colors.titleOverride && (
                      <button
                        onClick={() => {
                          const newColors = { ...colors };
                          delete newColors.titleOverride;
                          setColors(newColors);
                        }}
                        style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          background: 'transparent',
                          color: '#d32f2f',
                          border: '1px solid #d32f2f',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}
                      >
                        Clear Override
                      </button>
                    )}
                  </div>

                  <div style={{
                    background: '#fafafa',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600',
                      color: '#666'
                    }}>
                      Subtitle Color Override
                    </label>
                    <p style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '11px', 
                      color: '#888',
                      lineHeight: '1.4'
                    }}>
                      Tagline/subtitle color (if different from heading)
                    </p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: '60px', height: '60px', flexShrink: 0 }}>
                        <input
                          type="color"
                          value={colors.subtitleOverride || '#000000'}
                          onChange={(e) => setColors({ ...colors, subtitleOverride: e.target.value })}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            opacity: colors.subtitleOverride ? 1 : 0,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        {!colors.subtitleOverride && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px dashed #ccc',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: '#999',
                            fontWeight: '500',
                            background: 'transparent',
                            pointerEvents: 'none'
                          }}>
                            select
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={colors.subtitleOverride || ''}
                        onChange={(e) => setColors({ ...colors, subtitleOverride: e.target.value })}
                        placeholder="Leave empty to use heading color"
                        style={{
                          flex: 1,
                         minWidth: 0,
                          minWidth: 0,
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>
                    {colors.subtitleOverride && (
                      <button
                        onClick={() => {
                          const newColors = { ...colors };
                          delete newColors.subtitleOverride;
                          setColors(newColors);
                        }}
                        style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          background: 'transparent',
                          color: '#d32f2f',
                          border: '1px solid #d32f2f',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}
                      >
                        Clear Override
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Typography Section */}
          {activeSection === 'typography' && (
            <div>
              <h2 style={{ marginBottom: '16px', fontSize: '24px', color: '#333' }}>Typography Settings</h2>

              {/* Contextual Help Banner */}
              <div style={{
                background: '#f0f4ff',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid #667eea',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#555'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '4px', color: '#667eea' }}>💡 Size Fields</div>
                <div>Leave size fields blank to use plugin defaults.</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#667eea' }}>Headings</h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Font Family
                    </label>
                    <select
                      value={typography.headingFont}
                      onChange={(e) => setTypography({ ...typography, headingFont: e.target.value })}
                      style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Default</option>
                      {getAllFontFamilies().length > 0 && (
                        <optgroup label="Custom Fonts">
                          {getAllFontFamilies().map(family => (
                            <option key={family.value} value={family.value}>{family.label}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    {getAllFontFamilies().length === 0 && (
                      <small style={{ display: 'block', marginTop: '6px', color: '#888', fontSize: '12px' }}>
                        Add fonts in <span style={{ color: '#667eea', cursor: 'pointer' }} onClick={() => setActiveSection('fonts')}>Font Management</span> to see options here
                      </small>
                    )}
                  </div>

                  <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                        Font Weight
                      </label>
                      <select
                        value={typography.headingFontWeight}
                        onChange={(e) => setTypography({ ...typography, headingFontWeight: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          background: 'white'
                        }}
                      >
                        <option value="">Default</option>
                        <option value="100">100 - Thin</option>
                        <option value="200">200 - Extra Light</option>
                        <option value="300">300 - Light</option>
                        <option value="400">400 - Normal</option>
                        <option value="500">500 - Medium</option>
                        <option value="600">600 - Semi Bold</option>
                        <option value="700">700 - Bold</option>
                        <option value="800">800 - Extra Bold</option>
                        <option value="900">900 - Black</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                        Text Transform
                      </label>
                      <select
                        value={typography.headingTextTransform}
                        onChange={(e) => setTypography({ ...typography, headingTextTransform: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          background: 'white'
                        }}
                      >
                        <option value="">Default</option>
                        <option value="none">None</option>
                        <option value="uppercase">UPPERCASE</option>
                        <option value="lowercase">lowercase</option>
                        <option value="capitalize">Capitalize</option>
                      </select>
                    </div>
                  </div>

                  {/* Title Size */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', color: '#555' }}>
                      Title Size
                    </label>
                    <small style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '12px' }}>
                      Font size for main headings
                    </small>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Desktop
                        </label>
                        <input
                          type="text"
                          value={typography.titleSize}
                          onChange={(e) => setTypography({ ...typography, titleSize: e.target.value })}
                          placeholder="36px"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Mobile
                        </label>
                        <input
                          type="text"
                          value={typography.titleSizeMobile}
                          onChange={(e) => setTypography({ ...typography, titleSizeMobile: e.target.value })}
                          placeholder="20px"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Line Height
                    </label>
                    <input
                      type="text"
                      value={typography.titleLineHeight}
                      onChange={(e) => setTypography({ ...typography, titleLineHeight: e.target.value })}
                      placeholder="1"
                      style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Subtitle Size */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', color: '#555' }}>
                      Subtitle Size
                    </label>
                    <small style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '12px' }}>
                      Font size for secondary headings
                    </small>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Desktop
                        </label>
                        <input
                          type="text"
                          value={typography.subtitleSize}
                          onChange={(e) => setTypography({ ...typography, subtitleSize: e.target.value })}
                          placeholder="18px"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Mobile
                        </label>
                        <input
                          type="text"
                          value={typography.subtitleSizeMobile}
                          onChange={(e) => setTypography({ ...typography, subtitleSizeMobile: e.target.value })}
                          placeholder="14px"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>


                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#667eea' }}>Body Text</h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Font Family
                    </label>
                    <select
                      value={typography.bodyFont}
                      onChange={(e) => setTypography({ ...typography, bodyFont: e.target.value })}
                      style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Default</option>
                      {getAllFontFamilies().length > 0 && (
                        <optgroup label="Custom Fonts">
                          {getAllFontFamilies().map(family => (
                            <option key={family.value} value={family.value}>{family.label}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    {getAllFontFamilies().length === 0 && (
                      <small style={{ display: 'block', marginTop: '6px', color: '#888', fontSize: '12px' }}>
                        Add fonts in <span style={{ color: '#667eea', cursor: 'pointer' }} onClick={() => setActiveSection('fonts')}>Font Management</span> to see options here
                      </small>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Font Size
                    </label>
                    <input
                      type="text"
                      value={typography.bodySize}
                      onChange={(e) => setTypography({ ...typography, bodySize: e.target.value })}
                      placeholder="14px"
                      style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>


                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#667eea' }}>Buttons</h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Font Family
                    </label>
                    <select
                      value={typography.buttonFont}
                      onChange={(e) => setTypography({ ...typography, buttonFont: e.target.value })}
                      style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Default</option>
                      {getAllFontFamilies().length > 0 && (
                        <optgroup label="Custom Fonts">
                          {getAllFontFamilies().map(family => (
                            <option key={family.value} value={family.value}>{family.label}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    {getAllFontFamilies().length === 0 && (
                      <small style={{ display: 'block', marginTop: '6px', color: '#888', fontSize: '12px' }}>
                        Add fonts in <span style={{ color: '#667eea', cursor: 'pointer' }} onClick={() => setActiveSection('fonts')}>Font Management</span> to see options here
                      </small>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Text Transform
                    </label>
                    <select
                      value={typography.textTransform}
                      onChange={(e) => setTypography({ ...typography, textTransform: e.target.value })}
                      style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="none">None</option>
                      <option value="uppercase">Uppercase</option>
                      <option value="lowercase">Lowercase</option>
                      <option value="capitalize">Capitalize</option>
                    </select>
                  </div>
              </div>

                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#667eea' }}>Links</h3>
                  
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', color: '#555' }}>
                      <input
                        type="checkbox"
                        checked={typography.linkUnderline}
                        onChange={(e) => setTypography({ ...typography, linkUnderline: e.target.checked })}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer'
                        }}
                      />
                      Link Underline
                    </label>
                    <small style={{ display: 'block', marginTop: '8px', color: '#777', fontSize: '12px' }}>
                      Applies to links in tour descriptions and brand links
                    </small>
                  </div>
                </div>
                </div>
            </div>
          )}

          {/* Buttons Section */}
          {activeSection === 'buttons' && (
            <div>
              <h2 style={{ marginBottom: '24px', fontSize: '24px', color: '#333' }}>Button Styles</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#667eea' }}>Primary Button</h3>
                  
                  {/* Button Type Selector */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Button Type
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      gap: '0', 
                      background: '#e5e7eb',
                      borderRadius: '8px',
                      padding: '4px',
                      position: 'relative'
                    }}>
                      <button
                        onClick={() => setElementStyles({
                          ...elementStyles,
                          buttons: { ...elementStyles.buttons, primaryType: 'solid' }
                        })}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          background: elementStyles.buttons.primaryType === 'solid' ? '#667eea' : 'transparent',
                          color: elementStyles.buttons.primaryType === 'solid' ? 'white' : '#6b7280',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                          zIndex: 1
                        }}
                      >
                        Solid
                      </button>
                      <button
                        onClick={() => setElementStyles({
                          ...elementStyles,
                          buttons: { ...elementStyles.buttons, primaryType: 'outlined' }
                        })}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          background: elementStyles.buttons.primaryType === 'outlined' ? '#667eea' : 'transparent',
                          color: elementStyles.buttons.primaryType === 'outlined' ? 'white' : '#6b7280',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                          zIndex: 1
                        }}
                      >
                        Outlined
                      </button>
                    </div>
                  </div>

                  {/* Text Color - always shown */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Text Color
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                        <input
                          type="color"
                          value={elementStyles.buttons.primaryColor || '#000000'}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            buttons: { ...elementStyles.buttons, primaryColor: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            opacity: elementStyles.buttons.primaryColor ? 1 : 0,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        {!elementStyles.buttons.primaryColor && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px dashed #ccc',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: '#999',
                            fontWeight: '500',
                            background: 'transparent',
                            pointerEvents: 'none'
                          }}>
                            select
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={elementStyles.buttons.primaryColor}
                        onChange={(e) => setElementStyles({
                          ...elementStyles,
                          buttons: { ...elementStyles.buttons, primaryColor: e.target.value }
                        })}
                        placeholder="#ffffff"
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Background - only for solid */}
                  {elementStyles.buttons.primaryType === 'solid' && (
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                        Background
                      </label>
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          gap: '12px', 
                          alignItems: 'center',
                          padding: '12px',
                          background: '#fff',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: colors.button || '#f5f5f5',
                            border: colors.button ? '2px solid #ddd' : '2px dashed #ccc',
                            borderRadius: '6px',
                            flexShrink: 0
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontSize: '13px', 
                              fontFamily: 'monospace',
                              color: colors.button ? '#333' : '#999'
                            }}>
                              {colors.button || 'Not set'}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#999',
                              marginTop: '2px'
                            }}>
                              Using button color
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveSection('colors')}
                          style={{
                            marginTop: '8px',
                            padding: '6px 12px',
                            background: 'transparent',
                            color: '#667eea',
                            border: '1px solid #667eea',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '500',
                            width: '100%'
                          }}
                        >
                          → Configure in Colors
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Border Settings - only for outlined */}
                  {elementStyles.buttons.primaryType === 'outlined' && (
                    <>
                      <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end', alignItems: 'flex-end' }}>
                        <div style={{ flex: '0 0 140px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                            Border Width
                          </label>
                          <input
                            type="text"
                            value={elementStyles.buttons.primaryBorderWidth}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              buttons: { ...elementStyles.buttons, primaryBorderWidth: e.target.value }
                            })}
                            placeholder="1px"
                            style={{
                              width: '100%',
                              boxSizing: 'border-box',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                            Border Style
                          </label>
                          <select
                            value={elementStyles.buttons.primaryBorderStyle}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              buttons: { ...elementStyles.buttons, primaryBorderStyle: e.target.value }
                            })}
                            style={{
                              width: '100%',
                              boxSizing: 'border-box',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px',
                              background: 'white'
                            }}
                          >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="double">Double</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                          Border Color
                        </label>
                        <div>
                          <div style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            alignItems: 'center',
                            padding: '12px',
                            background: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px'
                          }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: colors.button || '#f5f5f5',
                              border: colors.button ? '2px solid #ddd' : '2px dashed #ccc',
                              borderRadius: '6px',
                              flexShrink: 0
                            }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontSize: '13px', 
                                fontFamily: 'monospace',
                                color: colors.button ? '#333' : '#999'
                              }}>
                                {colors.button || 'Not set'}
                              </div>
                              <div style={{
                                fontSize: '11px',
                                color: '#999',
                                marginTop: '2px'
                              }}>
                                Using button color
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveSection('colors')}
                            style={{
                              marginTop: '8px',
                              padding: '6px 12px',
                              background: 'transparent',
                              color: '#667eea',
                              border: '1px solid #667eea',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '500',
                              width: '100%'
                            }}
                          >
                            → Configure in Colors
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Border Radius */}
                  <div style={{ marginTop: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Border Radius
                    </label>
                    <input
                      type="text"
                      value={elementStyles.buttons.primaryBorderRadius}
                      onChange={(e) => setElementStyles({
                        ...elementStyles,
                        buttons: { ...elementStyles.buttons, primaryBorderRadius: e.target.value }
                      })}
                      placeholder="e.g., 8px or 50%"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Hover Type Selector */}
                  <div style={{ marginTop: '24px', marginBottom: '24px', paddingTop: '24px', borderTop: '2px solid #e0e0e0' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Hover Effect Type
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      gap: '0', 
                      background: '#e5e7eb',
                      borderRadius: '8px',
                      padding: '4px',
                      position: 'relative'
                    }}>
                      <button
                        onClick={() => setElementStyles({
                          ...elementStyles,
                          buttons: { ...elementStyles.buttons, primaryHoverType: 'solid' }
                        })}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          background: elementStyles.buttons.primaryHoverType === 'solid' ? '#667eea' : 'transparent',
                          color: elementStyles.buttons.primaryHoverType === 'solid' ? 'white' : '#6b7280',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                          zIndex: 1
                        }}
                      >
                        Solid
                      </button>
                      <button
                        onClick={() => setElementStyles({
                          ...elementStyles,
                          buttons: { ...elementStyles.buttons, primaryHoverType: 'outlined' }
                        })}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          background: elementStyles.buttons.primaryHoverType === 'outlined' ? '#667eea' : 'transparent',
                          color: elementStyles.buttons.primaryHoverType === 'outlined' ? 'white' : '#6b7280',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                          zIndex: 1
                        }}
                      >
                        Outlined
                      </button>
                    </div>
                  </div>

                  {/* Hover Text Color - always shown */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Hover Text Color
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                        <input
                          type="color"
                          value={elementStyles.buttons.hoverColor || '#000000'}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            buttons: { ...elementStyles.buttons, hoverColor: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            opacity: elementStyles.buttons.hoverColor ? 1 : 0,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        {!elementStyles.buttons.hoverColor && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px dashed #ccc',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: '#999',
                            fontWeight: '500',
                            background: 'transparent',
                            pointerEvents: 'none'
                          }}>
                            select
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={elementStyles.buttons.hoverColor}
                        onChange={(e) => setElementStyles({
                          ...elementStyles,
                          buttons: { ...elementStyles.buttons, hoverColor: e.target.value }
                        })}
                        placeholder="#ffffff"
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Hover Background - only for solid */}
                  {elementStyles.buttons.primaryHoverType === 'solid' && (
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                        Hover Background
                      </label>
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          gap: '12px', 
                          alignItems: 'center',
                          padding: '12px',
                          background: '#fff',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: colors.hover || '#f5f5f5',
                            border: colors.hover ? '2px solid #ddd' : '2px dashed #ccc',
                            borderRadius: '6px',
                            flexShrink: 0
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontSize: '13px', 
                              fontFamily: 'monospace',
                              color: colors.hover ? '#333' : '#999'
                            }}>
                              {colors.hover || 'Not set'}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#999',
                              marginTop: '2px'
                            }}>
                              Using hover color
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveSection('colors')}
                          style={{
                            marginTop: '8px',
                            padding: '6px 12px',
                            background: 'transparent',
                            color: '#667eea',
                            border: '1px solid #667eea',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '500',
                            width: '100%'
                          }}
                        >
                          → Configure in Colors
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Hover Border Settings - only for outlined */}
                  {elementStyles.buttons.primaryHoverType === 'outlined' && (
                    <>
                      <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                        <div style={{ flex: '0 0 140px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                            Hover Border Width
                          </label>
                          <input
                            type="text"
                            value={elementStyles.buttons.primaryHoverBorderWidth}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              buttons: { ...elementStyles.buttons, primaryHoverBorderWidth: e.target.value }
                            })}
                            placeholder="1px"
                            style={{
                              width: '100%', boxSizing: 'border-box',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                            Hover Border Style
                          </label>
                          <select
                            value={elementStyles.buttons.primaryHoverBorderStyle}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              buttons: { ...elementStyles.buttons, primaryHoverBorderStyle: e.target.value }
                            })}
                            style={{
                              width: '100%', boxSizing: 'border-box',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px',
                              background: 'white'
                            }}
                          >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="double">Double</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                          Hover Border Color
                        </label>
                        <div>
                          <div style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            alignItems: 'center',
                            padding: '12px',
                            background: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px'
                          }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: colors.button || '#f5f5f5',
                              border: colors.button ? '2px solid #ddd' : '2px dashed #ccc',
                              borderRadius: '6px',
                              flexShrink: 0
                            }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontSize: '13px', 
                                fontFamily: 'monospace',
                                color: colors.button ? '#333' : '#999'
                              }}>
                                {colors.button || 'Not set'}
                              </div>
                              <div style={{
                                fontSize: '11px',
                                color: '#999',
                                marginTop: '2px'
                              }}>
                                Using button color
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveSection('colors')}
                            style={{
                              marginTop: '8px',
                              padding: '6px 12px',
                              background: 'transparent',
                              color: '#667eea',
                              border: '1px solid #667eea',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '500',
                              width: '100%'
                            }}
                          >
                            → Configure in Colors
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#667eea' }}>Secondary Button</h3>
                  
                  {/* Button Type Selector */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Button Type
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      gap: '0', 
                      background: '#e5e7eb',
                      borderRadius: '8px',
                      padding: '4px',
                      position: 'relative'
                    }}>
                      <button
                        onClick={() => setElementStyles({
                          ...elementStyles,
                          buttons: { ...elementStyles.buttons, secondaryType: 'solid' }
                        })}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          background: elementStyles.buttons.secondaryType === 'solid' ? '#667eea' : 'transparent',
                          color: elementStyles.buttons.secondaryType === 'solid' ? 'white' : '#6b7280',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                          zIndex: 1
                        }}
                      >
                        Solid
                      </button>
                      <button
                        onClick={() => setElementStyles({
                          ...elementStyles,
                          buttons: { ...elementStyles.buttons, secondaryType: 'outlined' }
                        })}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          background: elementStyles.buttons.secondaryType === 'outlined' ? '#667eea' : 'transparent',
                          color: elementStyles.buttons.secondaryType === 'outlined' ? 'white' : '#6b7280',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                          zIndex: 1
                        }}
                      >
                        Outlined
                      </button>
                    </div>
                  </div>

                  {/* Text Color - always shown */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Text Color
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                        <input
                          type="color"
                          value={(elementStyles.buttons.secondaryColor || colors.button || '#000000')}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            buttons: { ...elementStyles.buttons, secondaryColor: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            opacity: (elementStyles.buttons.secondaryColor || colors.button) ? 1 : 0,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        {!(elementStyles.buttons.secondaryColor || colors.button) && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px dashed #ccc',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: '#999',
                            fontWeight: '500',
                            background: 'transparent',
                            pointerEvents: 'none'
                          }}>
                            select
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          value={elementStyles.buttons.secondaryColor}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            buttons: { ...elementStyles.buttons, secondaryColor: e.target.value }
                          })}
                          placeholder={colors.button || '#000000'}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'monospace'
                          }}
                        />
                        <div style={{
                          fontSize: '11px',
                          color: '#999',
                          marginTop: '4px'
                        }}>
                          {elementStyles.buttons.secondaryColor ? 'Custom override' : `Default: ${colors.button || 'button color'}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Background - only for solid */}
                  {elementStyles.buttons.secondaryType === 'solid' && (
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                        Background
                      </label>
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          gap: '12px', 
                          alignItems: 'center',
                          padding: '12px',
                          background: '#fff',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: colors.background || '#f5f5f5',
                            border: colors.background ? '2px solid #ddd' : '2px dashed #ccc',
                            borderRadius: '6px',
                            flexShrink: 0
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontSize: '13px', 
                              fontFamily: 'monospace',
                              color: colors.background ? '#333' : '#999'
                            }}>
                              {colors.background || 'Not set'}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#999',
                              marginTop: '2px'
                            }}>
                              Using background color
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveSection('colors')}
                          style={{
                            marginTop: '8px',
                            padding: '6px 12px',
                            background: 'transparent',
                            color: '#667eea',
                            border: '1px solid #667eea',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '500',
                            width: '100%'
                          }}
                        >
                          → Configure in Colors
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Border Settings - only for outlined */}
                  {elementStyles.buttons.secondaryType === 'outlined' && (
                    <>
                      <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                        <div style={{ flex: '0 0 140px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                            Border Width
                          </label>
                          <input
                            type="text"
                            value={elementStyles.buttons.secondaryBorderWidth}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              buttons: { ...elementStyles.buttons, secondaryBorderWidth: e.target.value }
                            })}
                            placeholder="1px"
                            style={{
                              width: '100%', boxSizing: 'border-box',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                            Border Style
                          </label>
                          <select
                            value={elementStyles.buttons.secondaryBorderStyle}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              buttons: { ...elementStyles.buttons, secondaryBorderStyle: e.target.value }
                            })}
                            style={{
                              width: '100%', boxSizing: 'border-box',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px',
                              background: 'white'
                            }}
                          >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="double">Double</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                          Border Color
                        </label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                            <input
                              type="color"
                              value={(elementStyles.buttons.secondaryBorderColor || colors.button || '#000000')}
                              onChange={(e) => setElementStyles({
                                ...elementStyles,
                                buttons: { ...elementStyles.buttons, secondaryBorderColor: e.target.value }
                              })}
                              style={{
                                width: '100%',
                                height: '100%',
                                border: '2px solid #ddd',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                opacity: (elementStyles.buttons.secondaryBorderColor || colors.button) ? 1 : 0,
                                position: 'absolute',
                                top: 0,
                                left: 0
                              }}
                            />
                            {!(elementStyles.buttons.secondaryBorderColor || colors.button) && (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                border: '2px dashed #ccc',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                color: '#999',
                                fontWeight: '500',
                                background: 'transparent',
                                pointerEvents: 'none'
                              }}>
                                select
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <input
                              type="text"
                              value={elementStyles.buttons.secondaryBorderColor}
                              onChange={(e) => setElementStyles({
                                ...elementStyles,
                                buttons: { ...elementStyles.buttons, secondaryBorderColor: e.target.value }
                              })}
                              placeholder={colors.button || '#000000'}
                              style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontFamily: 'monospace'
                              }}
                            />
                            <div style={{
                              fontSize: '11px',
                              color: '#999',
                              marginTop: '4px'
                            }}>
                              {elementStyles.buttons.secondaryBorderColor ? 'Custom override' : `Default: ${colors.button || 'button color'}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Border Radius */}
                  <div style={{ marginTop: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Border Radius
                    </label>
                    <input
                      type="text"
                      value={elementStyles.buttons.secondaryBorderRadius}
                      onChange={(e) => setElementStyles({
                        ...elementStyles,
                        buttons: { ...elementStyles.buttons, secondaryBorderRadius: e.target.value }
                      })}
                      placeholder="e.g., 8px or 50%"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Hover Type Selector */}
                  <div style={{ marginTop: '24px', marginBottom: '24px', paddingTop: '24px', borderTop: '2px solid #e0e0e0' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Hover Effect Type
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      gap: '0', 
                      background: '#e5e7eb',
                      borderRadius: '8px',
                      padding: '4px',
                      position: 'relative'
                    }}>
                      <button
                        onClick={() => setElementStyles({
                          ...elementStyles,
                          buttons: { ...elementStyles.buttons, secondaryHoverType: 'solid' }
                        })}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          background: elementStyles.buttons.secondaryHoverType === 'solid' ? '#667eea' : 'transparent',
                          color: elementStyles.buttons.secondaryHoverType === 'solid' ? 'white' : '#6b7280',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                          zIndex: 1
                        }}
                      >
                        Solid
                      </button>
                      <button
                        onClick={() => setElementStyles({
                          ...elementStyles,
                          buttons: { ...elementStyles.buttons, secondaryHoverType: 'outlined' }
                        })}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          background: elementStyles.buttons.secondaryHoverType === 'outlined' ? '#667eea' : 'transparent',
                          color: elementStyles.buttons.secondaryHoverType === 'outlined' ? 'white' : '#6b7280',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.2s ease',
                          zIndex: 1
                        }}
                      >
                        Outlined
                      </button>
                    </div>
                  </div>

                  {/* Hover Text Color - always shown */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Hover Text Color
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                        <input
                          type="color"
                          value={elementStyles.buttons.secondaryHoverColor || '#000000'}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            buttons: { ...elementStyles.buttons, secondaryHoverColor: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            opacity: elementStyles.buttons.secondaryHoverColor ? 1 : 0,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        {!elementStyles.buttons.secondaryHoverColor && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px dashed #ccc',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: '#999',
                            fontWeight: '500',
                            background: 'transparent',
                            pointerEvents: 'none'
                          }}>
                            select
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={elementStyles.buttons.secondaryHoverColor}
                        onChange={(e) => setElementStyles({
                          ...elementStyles,
                          buttons: { ...elementStyles.buttons, secondaryHoverColor: e.target.value }
                        })}
                        placeholder="#ffffff"
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Hover Background - only for solid */}
                  {elementStyles.buttons.secondaryHoverType === 'solid' && (
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                        Hover Background
                      </label>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                          <input
                            type="color"
                            value={elementStyles.buttons.secondaryHoverBg || '#000000'}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              buttons: { ...elementStyles.buttons, secondaryHoverBg: e.target.value }
                            })}
                            style={{
                              width: '100%',
                              height: '100%',
                              border: '2px solid #ddd',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              opacity: elementStyles.buttons.secondaryHoverBg ? 1 : 0,
                              position: 'absolute',
                              top: 0,
                              left: 0
                            }}
                          />
                          {!elementStyles.buttons.secondaryHoverBg && (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              border: '2px dashed #ccc',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              color: '#999',
                              fontWeight: '500',
                              background: 'transparent',
                              pointerEvents: 'none'
                            }}>
                              select
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={elementStyles.buttons.secondaryHoverBg}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            buttons: { ...elementStyles.buttons, secondaryHoverBg: e.target.value }
                          })}
                          placeholder="#ffffff"
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Hover Border Settings - only for outlined */}
                  {elementStyles.buttons.secondaryHoverType === 'outlined' && (
                    <>
                      <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                        <div style={{ flex: '0 0 140px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                            Hover Border Width
                          </label>
                          <input
                            type="text"
                            value={elementStyles.buttons.secondaryHoverBorderWidth}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              buttons: { ...elementStyles.buttons, secondaryHoverBorderWidth: e.target.value }
                            })}
                            placeholder="1px"
                            style={{
                              width: '100%', boxSizing: 'border-box',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                            Hover Border Style
                          </label>
                          <select
                            value={elementStyles.buttons.secondaryHoverBorderStyle}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              buttons: { ...elementStyles.buttons, secondaryHoverBorderStyle: e.target.value }
                            })}
                            style={{
                              width: '100%', boxSizing: 'border-box',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px',
                              background: 'white'
                            }}
                          >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="double">Double</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                          Hover Border Color
                        </label>
                        <div>
                          <div style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            alignItems: 'center',
                            padding: '12px',
                            background: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px'
                          }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: colors.button || '#f5f5f5',
                              border: colors.button ? '2px solid #ddd' : '2px dashed #ccc',
                              borderRadius: '6px',
                              flexShrink: 0
                            }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontSize: '13px', 
                                fontFamily: 'monospace',
                                color: colors.button ? '#333' : '#999'
                              }}>
                                {colors.button || 'Not set'}
                              </div>
                              <div style={{
                                fontSize: '11px',
                                color: '#999',
                                marginTop: '2px'
                              }}>
                                Using button color
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveSection('colors')}
                            style={{
                              marginTop: '8px',
                              padding: '6px 12px',
                              background: 'transparent',
                              color: '#667eea',
                              border: '1px solid #667eea',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '500',
                              width: '100%'
                            }}
                          >
                            → Configure in Colors
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#667eea' }}>Global Settings</h3>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Hover Transition
                    </label>
                    <select
                      value={elementStyles.buttons.transition}
                      onChange={(e) => setElementStyles({
                        ...elementStyles,
                        buttons: { ...elementStyles.buttons, transition: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="none">None</option>
                      <option value="all 0.15s ease">Fast (0.15s)</option>
                      <option value="all 0.2s ease">Quick (0.2s)</option>
                      <option value="all 0.3s ease">Normal (0.3s)</option>
                      <option value="all 0.4s ease">Smooth (0.4s)</option>
                      <option value="all 0.5s ease">Slow (0.5s)</option>
                      <option value="all 0.3s ease-in-out">Ease In-Out (0.3s)</option>
                      <option value="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)">Material (0.3s)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Input Fields Section */}
          {activeSection === 'inputs' && (
            <div>
              <h2 style={{ marginBottom: '24px', fontSize: '24px', color: '#333' }}>Input Field Styles</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {[
                  { key: 'backgroundColor', label: 'Background Color', type: 'color' },
                  { key: 'textColor', label: 'Text Color', type: 'color' },
                  { key: 'borderColor', label: 'Border Color', type: 'color' },
                  { key: 'borderRadius', label: 'Border Radius', type: 'text' }
                ].map(field => (
                  <div key={field.key} style={{ 
                    background: '#f9f9f9', 
                    padding: '20px', 
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#555' }}>
                      {field.label}
                    </label>
                    {field.type === 'color' ? (
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '60px', height: '60px', flexShrink: 0 }}>
                          <input
                            type="color"
                            value={elementStyles.inputs[field.key] || '#000000'}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              inputs: { ...elementStyles.inputs, [field.key]: e.target.value }
                            })}
                            style={{
                              width: '100%',
                              height: '100%',
                              border: '2px solid #ddd',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              opacity: elementStyles.inputs[field.key] ? 1 : 0,
                              position: 'absolute',
                              top: 0,
                              left: 0
                            }}
                          />
                          {!elementStyles.inputs[field.key] && (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              border: '2px dashed #ccc',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              color: '#999',
                              fontWeight: '500',
                              background: 'transparent',
                              pointerEvents: 'none'
                            }}>
                              select
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={elementStyles.inputs[field.key]}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            inputs: { ...elementStyles.inputs, [field.key]: e.target.value }
                          })}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={elementStyles.inputs[field.key]}
                        onChange={(e) => setElementStyles({
                          ...elementStyles,
                          inputs: { ...elementStyles.inputs, [field.key]: e.target.value }
                        })}
                        style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modals Section */}
          {activeSection === 'modals' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>Modal Styles</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ fontWeight: '600', cursor: 'pointer' }}>Modal Dark Mode</label>
                  <div onClick={() => setElementStyles({ 
                    ...elementStyles, 
                    modals: { ...elementStyles.modals, darkMode: !elementStyles.modals.darkMode }
                  })}
                    style={{ width: '50px', height: '28px', background: elementStyles.modals.darkMode ? '#9333ea' : '#ddd',
                      borderRadius: '14px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                    <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                      position: 'absolute', top: '4px', left: elementStyles.modals.darkMode ? '26px' : '4px',
                      transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                  </div>
                  <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                    {elementStyles.modals.darkMode ? 'On' : 'Off'}
                  </span>
                </div>
              </div>

              {elementStyles.modals.darkMode && (
                <div style={{ 
                  background: '#fef3c7', 
                  border: '1px solid #f59e0b', 
                  borderRadius: '8px', 
                  padding: '12px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#92400e'
                }}>
                  <strong>ℹ️ Modal Dark Mode Enabled</strong> - Modals will use background color variable
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {[
                  { key: 'backgroundColor', label: 'Background Color', type: 'color' },
                  { key: 'textColor', label: 'Text Color', type: 'text' },
                  { key: 'borderColor', label: 'Border Color', type: 'color' },
                  { key: 'padding', label: 'Padding', type: 'text' }
                ].map(field => (
                  <div key={field.key} style={{ 
                    background: '#f9f9f9', 
                    padding: '20px', 
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#555' }}>
                      {field.label}
                    </label>
                    {field.type === 'color' ? (
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '60px', height: '60px', flexShrink: 0 }}>
                          <input
                            type="color"
                            value={elementStyles.modals[field.key] || '#000000'}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              modals: { ...elementStyles.modals, [field.key]: e.target.value }
                            })}
                            style={{
                              width: '100%',
                              height: '100%',
                              border: '2px solid #ddd',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              opacity: elementStyles.modals[field.key] ? 1 : 0,
                              position: 'absolute',
                              top: 0,
                              left: 0
                            }}
                          />
                          {!elementStyles.modals[field.key] && (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              border: '2px dashed #ccc',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              color: '#999',
                              fontWeight: '500',
                              background: 'transparent',
                              pointerEvents: 'none'
                            }}>
                              select
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={elementStyles.modals[field.key]}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            modals: { ...elementStyles.modals, [field.key]: e.target.value }
                          })}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={elementStyles.modals[field.key]}
                        onChange={(e) => setElementStyles({
                          ...elementStyles,
                          modals: { ...elementStyles.modals, [field.key]: e.target.value }
                        })}
                        style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lists Section */}
          {activeSection === 'lists' && (
            <div>
              <h2 style={{ marginBottom: '24px', fontSize: '24px', color: '#333' }}>List Styles</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {[
                  { key: 'backgroundColor', label: 'Background Color', type: 'text' },
                  { key: 'padding', label: 'Padding', type: 'text' },
                  { key: 'margin', label: 'Margin', type: 'text' },
                  { key: 'listStyle', label: 'List Style', type: 'select', options: ['disc', 'circle', 'square', 'none'] }
                ].map(field => (
                  <div key={field.key} style={{ 
                    background: '#f9f9f9', 
                    padding: '20px', 
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#555' }}>
                      {field.label}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={elementStyles.lists[field.key]}
                        onChange={(e) => setElementStyles({
                          ...elementStyles,
                          lists: { ...elementStyles.lists, [field.key]: e.target.value }
                        })}
                        style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={elementStyles.lists[field.key]}
                        onChange={(e) => setElementStyles({
                          ...elementStyles,
                          lists: { ...elementStyles.lists, [field.key]: e.target.value }
                        })}
                        style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom CSS Section */}
          {activeSection === 'custom' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>Custom CSS Snippets</h2>
                <button
                  onClick={addSnippet}
                  style={{
                    padding: '10px 20px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600'
                  }}
                >
                  <Plus size={16} /> Add Snippet
                </button>
              </div>

              {customSnippets.map((snippet, index) => (
                <div key={snippet.id} style={{
                  background: '#f9f9f9',
                  padding: '24px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>
                      Snippet {index + 1}
                    </h3>
                    <button
                      onClick={() => deleteSnippet(snippet.id)}
                      style={{
                        background: '#ff4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Snippet Name
                    </label>
                    <input
                      type="text"
                      value={snippet.name}
                      onChange={(e) => updateSnippet(snippet.id, 'name', e.target.value)}
                      placeholder="e.g., Hero Image Position"
                      style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      CSS Selector
                    </label>
                    <input
                      type="text"
                      value={snippet.selector}
                      onChange={(e) => updateSnippet(snippet.id, 'selector', e.target.value)}
                      placeholder="e.g., .TourPage-Gallery"
                      style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      CSS Properties
                    </label>
                    <textarea
                      value={snippet.properties}
                      onChange={(e) => updateSnippet(snippet.id, 'properties', e.target.value)}
                      placeholder="margin-top: 80px !important;"
                      rows={4}
                      style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              ))}

              {customSnippets.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#999',
                  background: '#f9f9f9',
                  borderRadius: '12px',
                  border: '2px dashed #ddd'
                }}>
                  No custom snippets yet. Click "Add Snippet" to create one.
                </div>
              )}
            </div>
          )}

          {/* Preview & Export Section */}
          </div>

          {/* Right Panel - Preview & Export (Always Visible) */}
          <div style={{ 
            flex: '0 0 45%', 
            display: 'flex',
            flexDirection: 'column',
            background: '#f9fafb'
          }}>
            {/* Sticky Header */}
            <div style={{
              padding: '24px',
              borderBottom: '2px solid #e5e7eb',
              background: 'white'
            }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#333' }}>Preview &amp; Export</h2>
              
              {/* Summary Stats */}
              <div style={{
                background: '#f9f9f9',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '13px', color: '#333' }}>
                  What's Included:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                  {getSummaryStats().hasFonts && (
                    <div style={{ color: '#22c55e' }}>✓ {getSummaryStats().fontCount} Custom Font{getSummaryStats().fontCount !== 1 ? 's' : ''}</div>
                  )}
                  {!getSummaryStats().hasFonts && (
                    <div style={{ color: '#999' }}>○ No custom fonts</div>
                  )}
                  {getSummaryStats().hasColors && (
                    <div style={{ color: '#22c55e' }}>✓ {getSummaryStats().colorCount} Color{getSummaryStats().colorCount !== 1 ? 's' : ''} defined</div>
                  )}
                  {!getSummaryStats().hasColors && (
                    <div style={{ color: '#999' }}>○ No colors defined</div>
                  )}
                  {getSummaryStats().darkTheme && (
                    <div style={{ color: '#22c55e' }}>✓ Dark theme enabled</div>
                  )}
                  {getSummaryStats().hasTypography && (
                    <div style={{ color: '#22c55e' }}>✓ Typography customizations</div>
                  )}
                  {getSummaryStats().hasButtons && (
                    <div style={{ color: '#22c55e' }}>✓ Button styles</div>
                  )}
                  <div style={{ color: '#f59e0b', marginTop: '4px' }}>
                    ⚠️ Stripe configuration needed separately
                  </div>
                </div>
              </div>

              {/* Deployment Checklist */}
              <details style={{ marginBottom: '16px' }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  color: '#667eea',
                  padding: '8px',
                  background: '#f0f4ff',
                  borderRadius: '6px',
                  border: '1px solid #667eea'
                }}>
                  📋 Deployment Checklist
                </summary>
                <div style={{ padding: '12px', fontSize: '12px', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px', color: '#333' }}>Testing:</div>
                  <div style={{ marginLeft: '16px', marginBottom: '12px' }}>
                    □ Upload CSS to S3 staging bucket<br/>
                    □ Add stylesheet URL to Admin Plugin settings<br/>
                    □ Test in incognito browser window<br/>
                    □ Check all booking screens<br/>
                    □ Test on mobile device
                  </div>
                  <div style={{ fontWeight: '600', marginBottom: '8px', color: '#333' }}>Production:</div>
                  <div style={{ marginLeft: '16px' }}>
                    □ Upload CSS to S3 production bucket<br/>
                    □ Configure at Plugin Level (Admin → Plugins)<br/>
                    □ Configure at User Level (Admin → Users)<br/>
                    □ Configure Stripe fields JSON separately<br/>
                    □ Verify on live booking page
                  </div>
                </div>
              </details>

              <div style={{ 
                display: 'flex', 
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={exportCSS}
                  style={{
                    padding: '10px 20px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  <Download size={16} /> Download CSS
                </button>

                <button
                  onClick={copyCSS}
                  style={{
                    padding: '10px 20px',
                    background: copied ? '#22c55e' : '#764ba2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'background 0.2s'
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Scrollable CSS Preview */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              background: '#1e1e1e'
            }}>
              <div style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '20px',
                fontSize: '12px',
                fontFamily: 'Monaco, Consolas, monospace',
                minHeight: '100%'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {generateCSS()}
                </pre>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default CSSCustomizer;
