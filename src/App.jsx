import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Download, Plus, Trash2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

// Fallback font options - defined outside component to avoid recreation on each render
const FALLBACK_FONT_OPTIONS = [
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

const CSSCustomizer = () => {
  const [activeSection, setActiveSection] = useState('start');
  const [copied, setCopied] = useState(false);

  // Font State
  const [fonts, setFonts] = useState([]);

  // Colors State
  const [colors, setColors] = useState({
    body: '',
    heading: '',
    link: '',
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
        link: prev.link,
        button: prev.button,
        hover: prev.hover,
        brand: prev.brand,
        background: prev.background || '#000000'
      }));
    }
  };

  // Function to check if a color is light or dark
  const isLightColor = (color) => {
    if (!color || typeof color !== 'string') return true; // Default to light if invalid
    
    // Convert hex to RGB
    let r, g, b;
    
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      if (hex.length === 3) {
        // Handle shorthand hex (#FFF)
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length >= 6) {
        r = parseInt(hex.substr(0, 2), 16);
        g = parseInt(hex.substr(2, 2), 16);
        b = parseInt(hex.substr(4, 2), 16);
      } else {
        return true; // Invalid hex, default to light
      }
    } else if (color.startsWith('rgb')) {
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        r = parseInt(matches[0]);
        g = parseInt(matches[1]);
        b = parseInt(matches[2]);
      } else {
        return true; // Invalid rgb, default to light
      }
    } else {
      return true; // Default to light if can't parse
    }
    
    // Check for NaN values
    if (isNaN(r) || isNaN(g) || isNaN(b)) return true;
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5; // Returns true if light, false if dark
  };

  // Typography State
  const [typography, setTypography] = useState({
    bodyFont: '',
    bodyFallback: 'Arial',
    bodyFontWeight: '',
    bodyTextTransform: '',
    bodyLineHeight: '',
    headingFont: '',
    headingFallback: 'Arial',
    headingFontWeight: '',
    headingTextTransform: '',
    headingLetterSpacing: '',
    headingSize: '',
    headingLineHeight: '',
    buttonFont: '',
    buttonFallback: 'Arial',
    buttonFontWeight: '',
    buttonLineHeight: '',
    buttonFontSize: '',
    buttonLetterSpacing: '',
    bodySize: '',
    titleSize: '',
    titleLineHeight: '',
    titleSizeMobile: '',
    subtitleSize: '',
    subtitleSizeMobile: '',
    textTransform: 'none',
    linkUnderline: false,
    checkoutH2FontSize: ''
  });

  // Helper to check if a color value is "transparent"
  const isTransparent = (color) => {
    return color && color.toLowerCase().trim() === 'transparent';
  };

  // Checkerboard pattern style for transparent preview
  const transparentCheckerboard = {
    background: `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                 linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                 linear-gradient(45deg, transparent 75%, #ccc 75%), 
                 linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
    backgroundSize: '16px 16px',
    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
  };

  // Function to get the generic family for a fallback font
  const getGenericFamily = (fallbackFont) => {
    const option = FALLBACK_FONT_OPTIONS.find(opt => opt.value === fallbackFont);
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
      border: '1px solid var(--color-button)',
      borderWidth: '',
      borderStyle: '',
      primaryType: 'solid', // 'solid' or 'outlined'
      primaryColor: '',
      primaryBg: 'var(--color-background)',
      primaryBorderRadius: '',
      primaryHoverType: 'solid', // 'solid' or 'outlined'
      hoverColor: '',
      hoverBg: '',
      primaryBorderWidth: '1px',
      primaryBorderStyle: 'solid',
      primaryBorderColor: 'button', // references colors.button
      primaryHoverBorderWidth: '1px',
      primaryHoverBorderStyle: 'solid',
      primaryHoverBorderColor: 'button', // references colors.button
      secondaryType: 'outlined', // 'solid' or 'outlined'
      secondaryColor: '',
      secondaryBg: '', // defaults to button color when solid
      secondaryBorderRadius: '',
      secondaryHoverType: 'solid', // 'solid' or 'outlined'
      secondaryHoverColor: '',
      secondaryHoverBg: '',
      secondaryBorderWidth: '1px',
      secondaryBorderStyle: 'solid',
      secondaryBorderColor: '', // defaults to button color when empty
      secondaryHoverBorderWidth: '1px',
      secondaryHoverBorderStyle: 'solid',
      secondaryHoverBorderColor: 'button', // references colors.button
      primaryTransition: 'none',
      secondaryTransition: 'none',
      // Mobile Experience List Button
      mobileListButtonWidth: '',
      mobileListButtonMarginTop: '',
      mobileListButtonMarginLeft: '',
      mobileListButtonHeight: '',
      mobileListButtonPaddingTop: '',
      // Purchase CTA Button
      purchaseButtonHeight: ''
    },
    inputs: {
      backgroundColor: '',
      textColor: '',
      borderColor: '',
      borderRadius: ''
    },
    modals: {
      backgroundColor: '',
      textColor: '',
      borderColor: '',
      padding: '',
      darkMode: false
    },
    lists: {
      backgroundColor: '',
      padding: '',
      margin: '',
      listStyle: 'Default'
    },
    experienceCard: {
      borderWidth: '',
      borderStyle: 'solid',
      borderColor: ''
    },
    atAGlance: {
      zebraStripingColor: ''
    },
    dividers: {
      color: '',
      thickness: '',
      style: 'solid'
    },
    checkoutSummary: {
      backgroundColor: '',
      dividerColor: ''
    }
  });

  // Advanced CSS toggles
  const [advancedCSS, setAdvancedCSS] = useState({
    pluginMarginFix: true,
    autoExpandDescription: false,
    contactGuideAlignment: true,
    mobileCheckoutTitleColor: true,
    discountCodeButtonHeight: true,
    discountCodeButtonFontSize: '',
    discountCodeButtonPaddingTop: ''
  });

  // Custom CSS snippets
  const [customSnippets, setCustomSnippets] = useState([]);

  // Collapsible sections state
  const [advancedButtonsExpanded, setAdvancedButtonsExpanded] = useState(false);

  // Import configuration state
  const [importCSS, setImportCSS] = useState('');
  const [importStatus, setImportStatus] = useState({ type: '', message: '' });

  // Inject fonts into page for live previews
  useEffect(() => {
    // Remove existing font style tag if it exists
    const existingStyle = document.getElementById('preview-fonts');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Build font imports/definitions
    let fontCSS = '';
    fonts.forEach(font => {
      if (font.type === 'typekit' && font.typekitUrl) {
        fontCSS += `@import url("${font.typekitUrl}");\n`;
      } else if (font.type === 'google' && font.googleLink) {
        fontCSS += `@import url('${font.googleLink}');\n`;
      } else if (font.type === 'custom' && font.files && font.files.length > 0) {
        // Generate @font-face for each custom font file
        font.files.forEach(file => {
          // Detect format from URL
          let format = 'woff2';
          if (file.url.includes('.woff2')) format = 'woff2';
          else if (file.url.includes('.woff')) format = 'woff';
          else if (file.url.includes('.ttf')) format = 'truetype';
          else if (file.url.includes('.otf')) format = 'opentype';
          
          fontCSS += `@font-face {
  font-family: "${font.name}";
  src: url('${file.url}') format('${format}');
  font-weight: ${file.weight || 'normal'};
  font-style: ${file.style || 'normal'};
  font-display: swap;
}
`;
        });
      }
    });

    // Inject font imports if any exist
    if (fontCSS) {
      const style = document.createElement('style');
      style.id = 'preview-fonts';
      style.textContent = fontCSS;
      document.head.appendChild(style);
    }
  }, [fonts]);

  // Scroll to top when navigating between sections
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSection]);

  // Parse and import CSS configuration
  const parseAndImportCSS = (cssText) => {
    try {
      // Reset status
      setImportStatus({ type: '', message: '' });
      
      if (!cssText || !cssText.trim()) {
        setImportStatus({ type: 'error', message: 'Please paste a CSS configuration to import.' });
        return;
      }

      // Normalize the CSS text
      const normalizedCSS = cssText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      
      let importedCount = 0;

      // Parse CSS Variables from :root
      const rootMatch = normalizedCSS.match(/:root\s*\{([^}]+)\}/);
      if (rootMatch) {
        const rootContent = rootMatch[1];
        
        // Extract colors
        const colorBody = rootContent.match(/--color-body:\s*([^;]+);/);
        const colorHeading = rootContent.match(/--color-heading:\s*([^;]+);/);
        const colorLink = rootContent.match(/--color-link:\s*([^;]+);/);
        const colorButton = rootContent.match(/--color-button:\s*([^;]+);/);
        const colorHover = rootContent.match(/--color-hover:\s*([^;]+);/);
        const colorBrand = rootContent.match(/--color-brand:\s*([^;]+);/);
        const colorBackground = rootContent.match(/--color-background:\s*([^;]+);/);

        const newColors = { ...colors };
        if (colorBody) { newColors.body = colorBody[1].trim(); importedCount++; }
        if (colorHeading) { newColors.heading = colorHeading[1].trim(); importedCount++; }
        if (colorLink) { newColors.link = colorLink[1].trim(); importedCount++; }
        if (colorButton) { newColors.button = colorButton[1].trim(); importedCount++; }
        if (colorHover) { newColors.hover = colorHover[1].trim(); importedCount++; }
        if (colorBrand) { newColors.brand = colorBrand[1].trim(); importedCount++; }
        if (colorBackground) { newColors.background = colorBackground[1].trim(); importedCount++; }
        setColors(newColors);

        // Extract font families from variables (just the primary font name)
        const fontBody = rootContent.match(/--font-body:\s*['"]?([^'",;]+)/);
        const fontHeading = rootContent.match(/--font-heading:\s*['"]?([^'",;]+)/);
        const fontButton = rootContent.match(/--font-button:\s*['"]?([^'",;]+)/);

        const newTypography = { ...typography };
        if (fontBody) { newTypography.bodyFont = fontBody[1].trim().replace(/['"]/g, ''); importedCount++; }
        if (fontHeading) { newTypography.headingFont = fontHeading[1].trim().replace(/['"]/g, ''); importedCount++; }
        if (fontButton) { newTypography.buttonFont = fontButton[1].trim().replace(/['"]/g, ''); importedCount++; }
        setTypography(prev => ({ ...prev, ...newTypography }));
      }

      // Check for dark theme (look for iframe_wrapper background)
      if (normalizedCSS.includes('#iframe_wrapper') && normalizedCSS.includes('background: var(--color-background)')) {
        setIsDarkTheme(true);
        importedCount++;
      }

      // Parse @import for Google Fonts
      const googleImports = normalizedCSS.matchAll(/@import\s+url\(['"]?(https:\/\/fonts\.googleapis\.com[^'")\s]+)['"]?\)/g);
      const newFonts = [...fonts];
      
      for (const match of googleImports) {
        const googleLink = match[1];
        // Extract font families from URL
        const familyMatches = googleLink.matchAll(/family=([^:&]+)/g);
        const families = [];
        for (const fam of familyMatches) {
          const familyName = decodeURIComponent(fam[1].replace(/\+/g, ' '));
          families.push({ name: familyName, fallback: 'Arial' });
        }
        
        if (families.length > 0) {
          newFonts.push({
            id: Date.now() + Math.random(),
            name: families[0].name,
            type: 'google',
            googleLink: googleLink,
            googleFamilies: families,
            typekitUrl: '',
            typekitFamilies: [],
            fallback: 'Arial',
            files: [{ url: '', weight: 'normal', style: 'normal' }]
          });
          importedCount++;
        }
      }

      // Parse @import for Adobe Typekit
      const typekitImports = normalizedCSS.matchAll(/@import\s+url\(['"]?(https:\/\/use\.typekit\.net[^'")\s]+)['"]?\)/g);
      for (const match of typekitImports) {
        const typekitUrl = match[1];
        newFonts.push({
          id: Date.now() + Math.random(),
          name: 'Typekit Font',
          type: 'typekit',
          googleLink: '',
          googleFamilies: [],
          typekitUrl: typekitUrl,
          typekitFamilies: [], // User will need to add family names manually
          fallback: 'Arial',
          files: [{ url: '', weight: 'normal', style: 'normal' }]
        });
        importedCount++;
      }

      // Parse @font-face for custom fonts
      const fontFaceMatches = normalizedCSS.matchAll(/@font-face\s*\{([^}]+)\}/g);
      for (const match of fontFaceMatches) {
        const fontFaceContent = match[1];
        const fontFamily = fontFaceContent.match(/font-family:\s*['"]?([^'";\n]+)['"]?/);
        const srcUrl = fontFaceContent.match(/src:\s*url\(['"]?([^'")\s]+)['"]?\)/);
        const fontWeight = fontFaceContent.match(/font-weight:\s*([^;\n]+)/);
        const fontStyle = fontFaceContent.match(/font-style:\s*([^;\n]+)/);

        if (fontFamily && srcUrl) {
          const familyName = fontFamily[1].trim();
          // Check if we already have this font
          const existingFont = newFonts.find(f => f.type === 'custom' && f.name === familyName);
          
          if (existingFont) {
            // Add file to existing font
            existingFont.files.push({
              url: srcUrl[1].trim(),
              weight: fontWeight ? fontWeight[1].trim() : 'normal',
              style: fontStyle ? fontStyle[1].trim() : 'normal'
            });
          } else {
            // Create new font entry
            newFonts.push({
              id: Date.now() + Math.random(),
              name: familyName,
              type: 'custom',
              googleLink: '',
              googleFamilies: [],
              typekitUrl: '',
              typekitFamilies: [],
              fallback: 'Arial',
              files: [{
                url: srcUrl[1].trim(),
                weight: fontWeight ? fontWeight[1].trim() : 'normal',
                style: fontStyle ? fontStyle[1].trim() : 'normal'
              }]
            });
            importedCount++;
          }
        }
      }

      setFonts(newFonts);

      // Parse typography settings from body
      const bodyMatch = normalizedCSS.match(/body\s*\{([^}]+)\}/);
      if (bodyMatch) {
        const bodyContent = bodyMatch[1];
        const bodySize = bodyContent.match(/font-size:\s*([^;!]+)/);
        const bodyLineHeight = bodyContent.match(/line-height:\s*([^;!]+)/);
        const bodyTextTransform = bodyContent.match(/text-transform:\s*([^;!]+)/);
        
        setTypography(prev => ({
          ...prev,
          bodySize: bodySize ? bodySize[1].trim() : prev.bodySize,
          bodyLineHeight: bodyLineHeight ? bodyLineHeight[1].trim() : prev.bodyLineHeight,
          bodyTextTransform: bodyTextTransform ? bodyTextTransform[1].trim() : prev.bodyTextTransform
        }));
        if (bodySize || bodyLineHeight || bodyTextTransform) importedCount++;
      }

      // Parse heading settings
      const headingMatch = normalizedCSS.match(/h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6[^{]*\{([^}]+)\}/);
      if (headingMatch) {
        const headingContent = headingMatch[1];
        const fontWeight = headingContent.match(/font-weight:\s*([^;!]+)/);
        const textTransform = headingContent.match(/text-transform:\s*([^;!]+)/);
        const fontSize = headingContent.match(/font-size:\s*([^;!]+)/);
        const lineHeight = headingContent.match(/line-height:\s*([^;!]+)/);
        const letterSpacing = headingContent.match(/letter-spacing:\s*([^;!]+)/);
        
        setTypography(prev => ({
          ...prev,
          headingFontWeight: fontWeight ? fontWeight[1].trim() : prev.headingFontWeight,
          headingTextTransform: textTransform ? textTransform[1].trim() : prev.headingTextTransform,
          headingSize: fontSize ? fontSize[1].trim() : prev.headingSize,
          headingLineHeight: lineHeight ? lineHeight[1].trim() : prev.headingLineHeight,
          headingLetterSpacing: letterSpacing ? letterSpacing[1].trim() : prev.headingLetterSpacing
        }));
        if (fontWeight || textTransform || fontSize || lineHeight || letterSpacing) importedCount++;
      }

      // Parse title sizes
      const titleMatch = normalizedCSS.match(/\.tour-title[^{]*\{([^}]+)\}/);
      if (titleMatch) {
        const titleContent = titleMatch[1];
        const titleSize = titleContent.match(/font-size:\s*([^;!]+)/);
        const titleLineHeight = titleContent.match(/line-height:\s*([^;!]+)/);
        
        setTypography(prev => ({
          ...prev,
          titleSize: titleSize ? titleSize[1].trim() : prev.titleSize,
          titleLineHeight: titleLineHeight ? titleLineHeight[1].trim() : prev.titleLineHeight
        }));
        if (titleSize || titleLineHeight) importedCount++;
      }

      // Parse mobile title sizes
      const mobileTitleMatch = normalizedCSS.match(/@media\s*\(max-width:\s*600px\)[^{]*\{[^}]*\.tour-title[^{]*\{([^}]+)\}/);
      if (mobileTitleMatch) {
        const mobileContent = mobileTitleMatch[1];
        const titleSizeMobile = mobileContent.match(/font-size:\s*([^;!]+)/);
        
        if (titleSizeMobile) {
          setTypography(prev => ({
            ...prev,
            titleSizeMobile: titleSizeMobile[1].trim()
          }));
          importedCount++;
        }
      }

      // Parse subtitle sizes from mobile media query
      const mobileSubtitleMatch = normalizedCSS.match(/@media\s*\(max-width:\s*600px\)[^{]*\{[^}]*\.TourPage-About-subtitle[^{]*\{([^}]+)\}/);
      if (mobileSubtitleMatch) {
        const mobileContent = mobileSubtitleMatch[1];
        const subtitleSizeMobile = mobileContent.match(/font-size:\s*([^;!]+)/);
        
        if (subtitleSizeMobile) {
          setTypography(prev => ({
            ...prev,
            subtitleSizeMobile: subtitleSizeMobile[1].trim()
          }));
          importedCount++;
        }
      }

      // Parse Checkout H2 Font Size
      const checkoutH2Match = normalizedCSS.match(/\.CheckoutPage\s+h2[^{]*\{([^}]+)\}/);
      if (checkoutH2Match) {
        const checkoutH2Content = checkoutH2Match[1];
        const fontSize = checkoutH2Content.match(/font-size:\s*([^;!]+)/);
        
        if (fontSize) {
          setTypography(prev => ({
            ...prev,
            checkoutH2FontSize: fontSize[1].trim()
          }));
          importedCount++;
        }
      }
      
      // Also check for .CheckoutSection h2
      if (!checkoutH2Match) {
        const checkoutSectionH2Match = normalizedCSS.match(/\.CheckoutSection\s+h2[^{]*\{([^}]+)\}/);
        if (checkoutSectionH2Match) {
          const checkoutH2Content = checkoutSectionH2Match[1];
          const fontSize = checkoutH2Content.match(/font-size:\s*([^;!]+)/);
          
          if (fontSize) {
            setTypography(prev => ({
              ...prev,
              checkoutH2FontSize: fontSize[1].trim()
            }));
            importedCount++;
          }
        }
      }

      // Parse mobile Experience List button
      const mobileListButtonMatch = normalizedCSS.match(/@media\s*\(max-width:\s*600px\)[^{]*\{[^}]*\.book-tour-btn[^{]*\{([^}]+)\}/);
      if (mobileListButtonMatch) {
        const mobileButtonContent = mobileListButtonMatch[1];
        const width = mobileButtonContent.match(/width:\s*([^;!]+)/);
        const marginTop = mobileButtonContent.match(/margin-top:\s*([^;!]+)/);
        const marginLeft = mobileButtonContent.match(/margin-left:\s*([^;!]+)/);
        const height = mobileButtonContent.match(/height:\s*([^;!]+)/);
        const paddingTop = mobileButtonContent.match(/padding-top:\s*([^;!]+)/);
        
        const updates = {};
        if (width) updates.mobileListButtonWidth = width[1].trim();
        if (marginTop) updates.mobileListButtonMarginTop = marginTop[1].trim();
        if (marginLeft) updates.mobileListButtonMarginLeft = marginLeft[1].trim();
        if (height) updates.mobileListButtonHeight = height[1].trim();
        if (paddingTop) updates.mobileListButtonPaddingTop = paddingTop[1].trim();
        
        if (Object.keys(updates).length > 0) {
          setElementStyles(prev => ({
            ...prev,
            buttons: { ...prev.buttons, ...updates }
          }));
          importedCount++;
        }
      }

      // Parse Purchase CTA Button
      const purchaseButtonMatch = normalizedCSS.match(/\.ConfirmationContainer\s+\.ButtonContainer\s+\.ui\.button\s*\{([^}]+)\}/);
      if (purchaseButtonMatch) {
        const purchaseButtonContent = purchaseButtonMatch[1];
        const height = purchaseButtonContent.match(/height:\s*([^;!]+)/);
        
        if (height) {
          setElementStyles(prev => ({
            ...prev,
            buttons: { ...prev.buttons, purchaseButtonHeight: height[1].trim() }
          }));
          importedCount++;
        }
      }

      // Parse primary button properties
      const buttonMatch = normalizedCSS.match(/\.button[^{]*\{([^}]+)\}/);
      if (buttonMatch) {
        const buttonContent = buttonMatch[1];
        const borderRadius = buttonContent.match(/border-radius:\s*([^;!]+)/);
        const textTransform = buttonContent.match(/text-transform:\s*([^;!]+)/);
        const transition = buttonContent.match(/transition:\s*([^;!]+)/);
        const background = buttonContent.match(/background:\s*([^;!]+)/);
        const color = buttonContent.match(/color:\s*([^;!]+)/);
        const border = buttonContent.match(/border:\s*([^;!]+)/);
        const fontSize = buttonContent.match(/font-size:\s*([^;!]+)/);
        const lineHeight = buttonContent.match(/line-height:\s*([^;!]+)/);
        const fontWeight = buttonContent.match(/font-weight:\s*([^;!]+)/);
        const letterSpacing = buttonContent.match(/letter-spacing:\s*([^;!]+)/);
        
        // Detect button type (solid vs outlined)
        if (background) {
          const bgValue = background[1].trim().toLowerCase();
          const isOutlined = bgValue === 'transparent' || bgValue.includes('rgba(0, 0, 0, 0)') || bgValue.includes('rgba(0,0,0,0)');
          setElementStyles(prev => ({
            ...prev,
            buttons: { 
              ...prev.buttons, 
              primaryType: isOutlined ? 'outlined' : 'solid'
            }
          }));
          importedCount++;
        }
        
        // Parse text color
        if (color) {
          setElementStyles(prev => ({
            ...prev,
            buttons: { 
              ...prev.buttons, 
              primaryColor: color[1].trim()
            }
          }));
          importedCount++;
        }
        
        // Parse border (shorthand)
        if (border) {
          const borderValue = border[1].trim();
          const borderParts = borderValue.split(/\s+/);
          
          if (borderParts.length >= 3) {
            setElementStyles(prev => ({
              ...prev,
              buttons: {
                ...prev.buttons,
                primaryBorderWidth: borderParts[0],
                primaryBorderStyle: borderParts[1],
                primaryBorderColor: 'button' // Store as 'button' to reference variable
              }
            }));
            importedCount++;
          }
        }
        
        if (borderRadius) {
          const radiusValue = borderRadius[1].trim();
          setElementStyles(prev => ({
            ...prev,
            buttons: { 
              ...prev.buttons, 
              primaryBorderRadius: radiusValue
            }
          }));
          importedCount++;
        }
        
        if (textTransform) {
          setTypography(prev => ({ ...prev, textTransform: textTransform[1].trim() }));
        }
        
        if (fontSize) {
          setTypography(prev => ({ ...prev, buttonFontSize: fontSize[1].trim() }));
          importedCount++;
        }
        
        if (lineHeight) {
          setTypography(prev => ({ ...prev, buttonLineHeight: lineHeight[1].trim() }));
          importedCount++;
        }
        
        if (fontWeight) {
          setTypography(prev => ({ ...prev, buttonFontWeight: fontWeight[1].trim() }));
          importedCount++;
        }
        
        if (letterSpacing) {
          setTypography(prev => ({ ...prev, buttonLetterSpacing: letterSpacing[1].trim() }));
          importedCount++;
        }
        
        if (transition) {
          const transitionValue = transition[1].trim();
          setElementStyles(prev => ({
            ...prev,
            buttons: { 
              ...prev.buttons, 
              primaryTransition: transitionValue
            }
          }));
          importedCount++;
        }
      }

      // Parse secondary button properties
      const secondaryButtonMatch = normalizedCSS.match(/\.ui\.basic\.button[^{]*\{([^}]+)\}/);
      if (secondaryButtonMatch) {
        const buttonContent = secondaryButtonMatch[1];
        const borderRadius = buttonContent.match(/border-radius:\s*([^;!]+)/);
        const transition = buttonContent.match(/transition:\s*([^;!]+)/);
        const background = buttonContent.match(/background:\s*([^;!]+)/);
        const color = buttonContent.match(/color:\s*([^;!]+)/);
        const border = buttonContent.match(/border:\s*([^;!]+)/);
        
        // Detect button type (solid vs outlined)
        if (background) {
          const bgValue = background[1].trim().toLowerCase();
          const isOutlined = bgValue === 'transparent' || bgValue.includes('rgba(0, 0, 0, 0)') || bgValue.includes('rgba(0,0,0,0)');
          
          const updates = {
            secondaryType: isOutlined ? 'outlined' : 'solid'
          };
          
          // If solid, capture the background color
          if (!isOutlined) {
            updates.secondaryBg = background[1].trim();
          }
          
          setElementStyles(prev => ({
            ...prev,
            buttons: { 
              ...prev.buttons, 
              ...updates
            }
          }));
          importedCount++;
        }
        
        // Parse text color
        if (color) {
          setElementStyles(prev => ({
            ...prev,
            buttons: { 
              ...prev.buttons, 
              secondaryColor: color[1].trim()
            }
          }));
          importedCount++;
        }
        
        // Parse border (shorthand)
        if (border) {
          const borderValue = border[1].trim();
          const borderParts = borderValue.split(/\s+/);
          
          if (borderParts.length >= 3) {
            setElementStyles(prev => ({
              ...prev,
              buttons: {
                ...prev.buttons,
                secondaryBorderWidth: borderParts[0],
                secondaryBorderStyle: borderParts[1],
                secondaryBorderColor: borderParts.slice(2).join(' ')
              }
            }));
            importedCount++;
          }
        }
        
        if (borderRadius) {
          const radiusValue = borderRadius[1].trim();
          setElementStyles(prev => ({
            ...prev,
            buttons: { 
              ...prev.buttons, 
              secondaryBorderRadius: radiusValue
            }
          }));
          importedCount++;
        }
        
        if (transition) {
          const transitionValue = transition[1].trim();
          setElementStyles(prev => ({
            ...prev,
            buttons: { 
              ...prev.buttons, 
              secondaryTransition: transitionValue
            }
          }));
          importedCount++;
        }
      }

      // Parse primary button hover properties
      const primaryHoverMatch = normalizedCSS.match(/\.button:hover[^{]*\{([^}]+)\}/);
      if (primaryHoverMatch) {
        const hoverContent = primaryHoverMatch[1];
        const background = hoverContent.match(/background:\s*([^;!]+)/);
        const color = hoverContent.match(/color:\s*([^;!]+)/);
        const border = hoverContent.match(/border:\s*([^;!]+)/);
        
        // Detect button hover type (solid vs outlined)
        if (background) {
          const bgValue = background[1].trim().toLowerCase();
          const isOutlined = bgValue === 'transparent' || bgValue.includes('rgba(0, 0, 0, 0)') || bgValue.includes('rgba(0,0,0,0)');
          
          const updates = {
            primaryHoverType: isOutlined ? 'outlined' : 'solid'
          };
          
          // If solid, capture the background color
          if (!isOutlined) {
            updates.hoverBg = background[1].trim();
          }
          
          setElementStyles(prev => ({
            ...prev,
            buttons: { 
              ...prev.buttons, 
              ...updates
            }
          }));
          importedCount++;
        }
        
        // Parse hover text color
        if (color) {
          setElementStyles(prev => ({
            ...prev,
            buttons: { 
              ...prev.buttons, 
              hoverColor: color[1].trim()
            }
          }));
          importedCount++;
        }
        
        // Parse hover border (shorthand)
        if (border) {
          const borderValue = border[1].trim();
          const borderParts = borderValue.split(/\s+/);
          
          if (borderParts.length >= 3) {
            setElementStyles(prev => ({
              ...prev,
              buttons: {
                ...prev.buttons,
                primaryHoverBorderWidth: borderParts[0],
                primaryHoverBorderStyle: borderParts[1],
                primaryHoverBorderColor: 'button' // Store as 'button' to reference variable
              }
            }));
            importedCount++;
          }
        }
      }

      // Parse secondary button hover properties
      const secondaryHoverMatch = normalizedCSS.match(/\.ui\.basic\.button:hover[^{]*\{([^}]+)\}/);
      if (secondaryHoverMatch) {
        const hoverContent = secondaryHoverMatch[1];
        const background = hoverContent.match(/background:\s*([^;!]+)/);
        const color = hoverContent.match(/color:\s*([^;!]+)/);
        const border = hoverContent.match(/border:\s*([^;!]+)/);
        
        // Detect button hover type (solid vs outlined)
        if (background) {
          const bgValue = background[1].trim().toLowerCase();
          const isOutlined = bgValue === 'transparent' || bgValue.includes('rgba(0, 0, 0, 0)') || bgValue.includes('rgba(0,0,0,0)');
          
          const updates = {
            secondaryHoverType: isOutlined ? 'outlined' : 'solid'
          };
          
          // If solid, capture the background color
          if (!isOutlined) {
            updates.secondaryHoverBg = background[1].trim();
          }
          
          setElementStyles(prev => ({
            ...prev,
            buttons: { 
              ...prev.buttons, 
              ...updates
            }
          }));
          importedCount++;
        }
        
        // Parse hover text color
        if (color) {
          setElementStyles(prev => ({
            ...prev,
            buttons: { 
              ...prev.buttons, 
              secondaryHoverColor: color[1].trim()
            }
          }));
          importedCount++;
        }
        
        // Parse hover border (shorthand)
        if (border) {
          const borderValue = border[1].trim();
          const borderParts = borderValue.split(/\s+/);
          
          if (borderParts.length >= 3) {
            setElementStyles(prev => ({
              ...prev,
              buttons: {
                ...prev.buttons,
                secondaryHoverBorderWidth: borderParts[0],
                secondaryHoverBorderStyle: borderParts[1],
                secondaryHoverBorderColor: 'button' // Store as 'button' to reference variable
              }
            }));
            importedCount++;
          }
        }
      }

      // Parse link underline setting
      if (normalizedCSS.includes('text-decoration: underline')) {
        setTypography(prev => ({ ...prev, linkUnderline: true }));
        importedCount++;
      }

      // Parse experience card border
      const experienceCardMatch = normalizedCSS.match(/\.tour-wrapper\s+a[^{]*\{([^}]+)\}/);
      if (experienceCardMatch) {
        const cardContent = experienceCardMatch[1];
        const border = cardContent.match(/border:\s*([^;!]+)/);
        
        if (border) {
          const borderValue = border[1].trim();
          // Parse border shorthand: "1px solid #000"
          const borderParts = borderValue.split(/\s+/);
          
          if (borderParts.length >= 3) {
            setElementStyles(prev => ({
              ...prev,
              experienceCard: {
                ...prev.experienceCard,
                borderWidth: borderParts[0],
                borderStyle: borderParts[1],
                borderColor: borderParts.slice(2).join(' ')
              }
            }));
            importedCount++;
          }
        }
      }

      // Parse At A Glance zebra striping
      const atAGlanceMatch = normalizedCSS.match(/\.Plugins-TourPage-GlanceWrapper\s+\.TourPage-Glance\s+\.ui\.grid\s+\.row:nth-child\(2n\)[^{]*\{([^}]+)\}/);
      if (atAGlanceMatch) {
        const glanceContent = atAGlanceMatch[1];
        const backgroundColor = glanceContent.match(/background(?:-color)?:\s*([^;!]+)/);
        
        if (backgroundColor) {
          setElementStyles(prev => ({
            ...prev,
            atAGlance: {
              ...prev.atAGlance,
              zebraStripingColor: backgroundColor[1].trim()
            }
          }));
          importedCount++;
        }
      }

      // Parse Dividers
      const dividerMatch = normalizedCSS.match(/\.CheckoutQuestion[^{]*\{[^}]*border-bottom:\s*([^;!]+)/);
      if (dividerMatch) {
        const borderValue = dividerMatch[1].trim();
        // Parse border shorthand: "1px solid #e6e6e6"
        const borderParts = borderValue.split(/\s+/);
        
        if (borderParts.length >= 3) {
          setElementStyles(prev => ({
            ...prev,
            dividers: {
              ...prev.dividers,
              thickness: borderParts[0],
              style: borderParts[1],
              color: borderParts.slice(2).join(' ')
            }
          }));
          importedCount++;
        }
      }
      
      // Also check for .Confirmation-Body .separator background
      if (!dividerMatch) {
        const separatorMatch = normalizedCSS.match(/\.Confirmation-Body\s+\.separator\s*\{[^}]*background:\s*([^;!]+)/);
        if (separatorMatch) {
          const backgroundColor = separatorMatch[1].trim();
          
          setElementStyles(prev => ({
            ...prev,
            dividers: {
              ...prev.dividers,
              color: backgroundColor
            }
          }));
          importedCount++;
        }
      }

      // Parse Checkout Summary
      const checkoutSummaryMatch = normalizedCSS.match(/\.CheckoutSummary-Container[^{]*\{[^}]*background:\s*([^;!]+)/);
      if (checkoutSummaryMatch) {
        const backgroundColor = checkoutSummaryMatch[1].trim();
        
        setElementStyles(prev => ({
          ...prev,
          checkoutSummary: {
            ...prev.checkoutSummary,
            backgroundColor: backgroundColor
          }
        }));
        importedCount++;
      }
      
      // Also check for ConfirmationDefault selector
      if (!checkoutSummaryMatch) {
        const confirmationDefaultMatch = normalizedCSS.match(/\.ConfirmationDefault[^{]*\.ConfirmationDefault-Column\.right[^{]*\{[^}]*background:\s*([^;!]+)/);
        if (confirmationDefaultMatch) {
          const backgroundColor = confirmationDefaultMatch[1].trim();
          
          setElementStyles(prev => ({
            ...prev,
            checkoutSummary: {
              ...prev.checkoutSummary,
              backgroundColor: backgroundColor
            }
          }));
          importedCount++;
        }
      }

      // Parse Checkout Summary Divider
      const checkoutSummaryDividerMatch = normalizedCSS.match(/\.CheckoutSummary-ContentBox[^{]*\{[^}]*border-bottom:\s*[^;]*solid\s+([^;!]+)/);
      if (checkoutSummaryDividerMatch) {
        const dividerColor = checkoutSummaryDividerMatch[1].trim();
        
        setElementStyles(prev => ({
          ...prev,
          checkoutSummary: {
            ...prev.checkoutSummary,
            dividerColor: dividerColor
          }
        }));
        importedCount++;
      }

      // Parse input fields
      const inputMatch = normalizedCSS.match(/input\[type='text'\][^{]*\{([^}]+)\}/);
      if (inputMatch) {
        const inputContent = inputMatch[1];
        const backgroundColor = inputContent.match(/background(?:-color)?:\s*([^;!]+)/);
        const textColor = inputContent.match(/color:\s*([^;!]+)/);
        const borderMatch = inputContent.match(/border:\s*([^;!]+)/);
        const borderRadius = inputContent.match(/border-radius:\s*([^;!]+)/);
        
        const inputUpdates = {};
        if (backgroundColor) inputUpdates.backgroundColor = backgroundColor[1].trim();
        if (textColor) inputUpdates.textColor = textColor[1].trim();
        if (borderRadius) inputUpdates.borderRadius = borderRadius[1].trim();
        
        // Parse border for color
        if (borderMatch) {
          const borderValue = borderMatch[1].trim();
          const borderParts = borderValue.split(/\s+/);
          if (borderParts.length >= 3) {
            inputUpdates.borderColor = borderParts.slice(2).join(' ');
          }
        }
        
        if (Object.keys(inputUpdates).length > 0) {
          setElementStyles(prev => ({
            ...prev,
            inputs: { ...prev.inputs, ...inputUpdates }
          }));
          importedCount++;
        }
      }

      // Parse modals
      const modalMatch = normalizedCSS.match(/\.ui\.modal[^{]*\{([^}]+)\}/);
      if (modalMatch) {
        const modalContent = modalMatch[1];
        const backgroundColor = modalContent.match(/background(?:-color)?:\s*([^;!]+)/);
        const textColor = modalContent.match(/color:\s*([^;!]+)/);
        const borderMatch = modalContent.match(/border:\s*([^;!]+)/);
        const padding = modalContent.match(/padding:\s*([^;!]+)/);
        
        const modalUpdates = {};
        if (backgroundColor) modalUpdates.backgroundColor = backgroundColor[1].trim();
        if (textColor) modalUpdates.textColor = textColor[1].trim();
        if (padding) modalUpdates.padding = padding[1].trim();
        
        // Parse border for color
        if (borderMatch) {
          const borderValue = borderMatch[1].trim();
          const borderParts = borderValue.split(/\s+/);
          if (borderParts.length >= 3) {
            modalUpdates.borderColor = borderParts.slice(2).join(' ');
          }
        }
        
        if (Object.keys(modalUpdates).length > 0) {
          setElementStyles(prev => ({
            ...prev,
            modals: { ...prev.modals, ...modalUpdates }
          }));
          importedCount++;
        }
      }

      // Parse modal dark mode
      if (normalizedCSS.includes('[data-testid="modal-main-overlay"]') && 
          normalizedCSS.includes('background: var(--color-background)')) {
        setElementStyles(prev => ({
          ...prev,
          modals: { ...prev.modals, darkMode: true }
        }));
        importedCount++;
      }

      // Parse lists
      const listMatch = normalizedCSS.match(/li\s*\{([^}]+)\}/);
      if (listMatch) {
        const listContent = listMatch[1];
        const backgroundColor = listContent.match(/background(?:-color)?:\s*([^;!]+)/);
        const padding = listContent.match(/padding:\s*([^;!]+)/);
        const margin = listContent.match(/margin:\s*([^;!]+)/);
        const listStyle = listContent.match(/list-style:\s*([^;!]+)/);
        
        const listUpdates = {};
        if (backgroundColor) listUpdates.backgroundColor = backgroundColor[1].trim();
        if (padding) listUpdates.padding = padding[1].trim();
        if (margin) listUpdates.margin = margin[1].trim();
        if (listStyle) listUpdates.listStyle = listStyle[1].trim();
        
        if (Object.keys(listUpdates).length > 0) {
          setElementStyles(prev => ({
            ...prev,
            lists: { ...prev.lists, ...listUpdates }
          }));
          importedCount++;
        }
      }

      // Parse Advanced CSS options
      if (normalizedCSS.includes('#plugins-wrapper>div.ui.equal.height.grid.stackable.tour-page') &&
          normalizedCSS.includes('margin-top: 14px')) {
        setAdvancedCSS(prev => ({ ...prev, pluginMarginFix: true }));
        importedCount++;
      }

      if (normalizedCSS.includes('.TourPage-About-description') &&
          normalizedCSS.includes('height: auto')) {
        setAdvancedCSS(prev => ({ ...prev, autoExpandDescription: true }));
        importedCount++;
      }

      if (normalizedCSS.includes('.TourPage-ContactGuide-link.ui.basic.button .ContactGuide-link-text') &&
          normalizedCSS.includes('display: inline')) {
        setAdvancedCSS(prev => ({ ...prev, contactGuideAlignment: true }));
        importedCount++;
      }

      if (normalizedCSS.includes('.MobileCheckout-CoverPhoto span.text .title .name') &&
          normalizedCSS.includes('color: #ffffff')) {
        setAdvancedCSS(prev => ({ ...prev, mobileCheckoutTitleColor: true }));
        importedCount++;
      }

      // Parse Discount Code Button Height Fix
      const discountCodeButtonMatch = normalizedCSS.match(/\.DiscountCodeContainer\s+\.DiscountCode-Input\s+\.ui\.button\s*\{([^}]+)\}/);
      if (discountCodeButtonMatch) {
        const buttonContent = discountCodeButtonMatch[1];
        const fontSize = buttonContent.match(/font-size:\s*([^;!]+)/);
        const paddingTop = buttonContent.match(/padding-top:\s*([^;!]+)/);
        
        if (buttonContent.includes('height:') && buttonContent.includes('47px')) {
          setAdvancedCSS(prev => ({ 
            ...prev, 
            discountCodeButtonHeight: true,
            discountCodeButtonFontSize: fontSize ? fontSize[1].trim() : '',
            discountCodeButtonPaddingTop: paddingTop ? paddingTop[1].trim() : ''
          }));
          importedCount++;
        }
      }

      // Parse custom CSS snippets section
      const newSnippets = [];
      
      // Look for the "Custom CSS Snippets" section
      const customSectionMatch = normalizedCSS.match(/\/\*\s*Custom CSS Snippets\s*\*\/([\s\S]*?)(?=\/\*\s*(?!Custom:|Snippet)|$)/);
      
      if (customSectionMatch) {
        const customSection = customSectionMatch[1];
        // Parse individual snippets: /* Name */ selector { properties }
        const snippetMatches = customSection.matchAll(/\/\*\s*([^*]+?)\s*\*\/\s*([^{]+)\s*\{([^}]+)\}/g);
        
        for (const match of snippetMatches) {
          const name = match[1].trim();
          const selector = match[2].trim();
          const properties = match[3].trim();
          
          if (selector && properties) {
            newSnippets.push({
              id: Date.now() + Math.random(),
              name: name || 'Imported Snippet',
              selector: selector,
              properties: properties
            });
            importedCount++;
          }
        }
      }
      
      // Also look for any CSS rules after standard sections that might be custom
      // These are rules that don't match known selectors
      const knownSelectors = [
        ':root', 'body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        '.button', '.ui.button', '.ui.anygreen', '.ui.basic',
        '.tour-title', '.tour-tagline', '.TourPage', '.CheckoutSummary',
        '.ConfirmationContainer', '.ButtonContainer', '.BookingRequest', '.infoPanel',
        '#iframe_wrapper', '#request-booking', '.Plugins-',
        '.ModifyBooking', '.DiscountCode', '.rescheduleModal',
        '.contactModal', '.multi-select', '.css-', '@font-face',
        '@import', '@media', '.ConfirmationDefault', '.Confirmation-grid', '.ConfirmationDefault-Column', '.GoG',
        'a ', 'a:', 'input', 'select', 'textarea', '.field',
        // Advanced CSS selectors
        '#plugins-wrapper', '.TourPage-About-description', 
        '.TourPage-ContactGuide-link', '.ContactGuide-link-text',
        '.MobileCheckout-CoverPhoto', '.DiscountCode-Input',
        // Element selectors
        'li', '.tour-wrapper', '.ui.modal', '.ui.grid', '.TourPage-Glance',
        '.book-tour-btn', '.CheckoutNavigationController', '.BookingRequest-submit',
        // Divider selectors
        '.CheckoutDesktopPage', '.CheckoutPersonal', '.CheckoutPayment', '.DiscountCodeContainer',
        '.CheckoutQuestion', '.MessageGuideContainer', '.CheckoutPage', '.CheckoutSection', 
        '.CheckoutSummary-Container', '.CheckoutSummary-ContentBox', '.TourPage-About-hr',
        '.Subtotal-PriceBreakdown', '.CheckoutSummary-PriceBreakDown', '.t-mobile',
        '.Confirmation-Body', '.separator'
      ];
      
      // Find all CSS rules
      const allRules = normalizedCSS.matchAll(/([^{}@]+)\s*\{([^{}]+)\}/g);
      
      for (const match of allRules) {
        const selector = match[1].trim();
        const properties = match[2].trim();
        
        // Skip if it's a known/standard selector
        const isKnownSelector = knownSelectors.some(known => 
          selector.toLowerCase().includes(known.toLowerCase()) ||
          selector.startsWith(':root') ||
          selector.startsWith('@')
        );
        
        // Skip if already captured in custom snippets section
        const alreadyCaptured = newSnippets.some(s => 
          s.selector === selector && s.properties === properties
        );
        
        // Skip empty or very short properties (likely parsed incorrectly)
        if (!isKnownSelector && !alreadyCaptured && properties.length > 5 && selector.length > 1) {
          // Check if this looks like a custom selector (has a class or id)
          if (selector.includes('.') || selector.includes('#')) {
            // Look for a comment before this rule to use as name
            const selectorIndex = normalizedCSS.indexOf(selector);
            const beforeRule = selectorIndex > 0 ? normalizedCSS.substring(Math.max(0, selectorIndex - 200), selectorIndex) : '';
            const commentMatch = beforeRule.match(/\/\*\s*([^*]+?)\s*\*\/\s*$/);
            
            newSnippets.push({
              id: Date.now() + Math.random(),
              name: commentMatch ? commentMatch[1].trim() : 'Imported Custom Rule',
              selector: selector,
              properties: properties
            });
            importedCount++;
          }
        }
      }
      
      if (newSnippets.length > 0) {
        setCustomSnippets(prev => [...prev, ...newSnippets]);
      }

      if (importedCount > 0) {
        setImportStatus({ 
          type: 'success', 
          message: `Successfully imported ${importedCount} configuration${importedCount > 1 ? 's' : ''}! Review the settings in each section.` 
        });
        setImportCSS(''); // Clear the textarea on success
      } else {
        setImportStatus({ 
          type: 'warning', 
          message: 'No recognizable configuration found. Make sure you\'re pasting CSS exported from this tool.' 
        });
      }

    } catch (error) {
      console.error('Import error:', error);
      setImportStatus({ 
        type: 'error', 
        message: 'Error parsing CSS. Please check the format and try again.' 
      });
    }
  };

  // Memoized function to get all available font families (including individual Typekit families)
  const fontFamilies = useMemo(() => {
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
  }, [fonts]);

  // Helper function for backward compatibility
  const getAllFontFamilies = useCallback(() => fontFamilies, [fontFamilies]);

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

    // Font Faces - Typekit ALWAYS first, then Google, then Custom
    const hasFontDefinitions = fonts.some(f => 
      (f.type === 'typekit' && f.typekitUrl) || 
      (f.type === 'google' && f.googleLink) || 
      (f.type === 'custom' && f.files.some(file => file.url))
    );
    
    if (hasFontDefinitions) {
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

    // CSS Variables - only generate if there are any variables to define
    const hasColorVars = colors.body || colors.heading || colors.button || colors.hover || colors.brand || colors.background;
    const hasFontVars = typography.bodyFont || typography.headingFont || typography.buttonFont;
    
    if (hasColorVars || hasFontVars) {
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
}

`;
    }

    // Background Color - Transparent Plugin Elements
    if (colors.background) {
      css += `/* Transparent Plugin Elements */
.TourPage-About, .Plugins-TourPage-GlanceWrapper, .grid.tour-page #booking-container, #request-booking-mobile, .ar-radio-item {
  background: transparent !important;
}

`;
    }

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

    // Base Typography - only generate if there are customizations
    const hasBodyStyles = colors.body || typography.bodyFont || colors.background || typography.bodySize || typography.bodyFontWeight || typography.bodyTextTransform || typography.bodyLineHeight;
    const hasHeadingStyles = typography.headingFont || typography.headingFontWeight || colors.heading || typography.headingTextTransform || typography.headingLetterSpacing;
    
    if (hasBodyStyles || hasHeadingStyles || typography.titleSize || typography.titleLineHeight || typography.subtitleSize) {
      css += `/* Typography */
`;
      
      // Body styles
      if (hasBodyStyles) {
        css += `body {${colors.body ? `
  color: var(--color-body) !important;` : ''}${typography.bodyFont ? `
  font-family: var(--font-body) !important;` : ''}${typography.bodyFontWeight ? `
  font-weight: ${typography.bodyFontWeight} !important;` : `
  font-weight: normal !important;`}
  font-style: normal;${colors.background ? `
  background: var(--color-background);` : ''}${typography.bodySize ? `
  font-size: ${typography.bodySize} !important;` : ''}${typography.bodyLineHeight ? `
  line-height: ${typography.bodyLineHeight} !important;` : ''}${typography.bodyTextTransform && typography.bodyTextTransform !== 'none' ? `
  text-transform: ${typography.bodyTextTransform} !important;` : ''}
}

`;
      }
      
      // Additional body color selectors
      if (colors.body) {
        css += `.BookingRequest-Addons .BookingRequest-Addons-addon .name, .BookingRequest-Addons .BookingRequest-Addons-addon .description, .BookingRequest-Addons .BookingRequest-Addons-addon .price, .tour-description, .tour-dates-available, .book-tour-details, .TourPage-About-description, .TourPage-BookingDetails,
.TourPage-BookingDetails .BookingRequest-form .ui.dropdown .text.default, .CheckoutSummary-ContentBox table td, .css-lkdkks {
  color: var(--color-body) !important;
}

`;
      }
      
      // Heading styles
      if (hasHeadingStyles) {
        css += `h1, h2, h3, h4, h5, h6, .infoPanel .tourName {${typography.headingFont ? `
  font-family: var(--font-heading) !important;` : ''}${typography.headingFontWeight ? `
  font-weight: ${typography.headingFontWeight} !important;` : ''}${colors.heading ? `
  color: var(--color-heading) !important;` : ''}${typography.headingTextTransform ? `
  text-transform: ${typography.headingTextTransform} !important;` : ''}${typography.headingLetterSpacing ? `
  letter-spacing: ${typography.headingLetterSpacing} !important;` : ''}
}

`;
      }

      // Title styles
      if (typography.titleSize || typography.titleLineHeight) {
        css += `.tour-title, .TourPage-About-title {${typography.titleSize ? `
  font-size: ${typography.titleSize} !important;` : ''}${typography.titleLineHeight ? `
  line-height: ${typography.titleLineHeight} !important;` : ''}
}

`;
      }
      
      // Subtitle styles
      if (typography.subtitleSize) {
        css += `.tour-tagline, .TourPage-About-tagline {
  font-size: ${typography.subtitleSize} !important;
}

`;
      }
    }

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

    // Checkout H2 Font Size
    if (typography.checkoutH2FontSize) {
      css += `/* Checkout H2 Font Size */
.CheckoutPage h2,
.CheckoutSection h2 {
  font-size: ${typography.checkoutH2FontSize} !important;
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

    // Buttons - only generate if there are customizations or colors that buttons would use
    const hasButtonCustomizations = typography.buttonFont || 
                                    typography.buttonFontWeight ||
                                    typography.buttonLineHeight ||
                                    typography.buttonFontSize ||
                                    elementStyles.buttons.primaryColor || 
                                    elementStyles.buttons.hoverColor ||
                                    elementStyles.buttons.secondaryColor ||
                                    elementStyles.buttons.primaryBorderRadius ||
                                    elementStyles.buttons.secondaryBorderRadius;
    const hasButtonColors = colors.button || colors.hover || colors.background;
    
    // Check if primary button block would have any properties
    const hasPrimaryButtonProperties = typography.buttonFont ||
                                       typography.buttonFontWeight ||
                                       elementStyles.buttons.primaryColor ||
                                       colors.button ||
                                       elementStyles.buttons.primaryBorderRadius ||
                                       (elementStyles.buttons.hoverBg || elementStyles.buttons.hoverColor) ||
                                       (typography.textTransform && typography.textTransform !== 'none') ||
                                       typography.buttonLineHeight ||
                                       typography.buttonFontSize;
    
    // Check if secondary button block would have any properties
    const hasSecondaryButtonProperties = typography.buttonFont ||
                                         typography.buttonFontWeight ||
                                         elementStyles.buttons.secondaryColor ||
                                         colors.button ||
                                         colors.background ||
                                         elementStyles.buttons.secondaryBorderRadius ||
                                         (elementStyles.buttons.secondaryHoverBg || elementStyles.buttons.secondaryHoverColor) ||
                                         (typography.textTransform && typography.textTransform !== 'none') ||
                                         typography.buttonLineHeight ||
                                         typography.buttonFontSize;
    
    if (hasButtonCustomizations || hasButtonColors) {
      // Primary Button Block
      if (hasPrimaryButtonProperties) {
        css += `/* Buttons */
.button, .ui.anygreen.button, .TourPage-ContactGuide-submit-button.ui.large.button,
#request-booking-mobile .ui.button, .ConfirmationContainer .ButtonContainer .ui.button,
.CheckoutNavigationController button.BookingRequest-submit, [data-testid="update-email-btn"],
.rescheduleModal .modalActions .submitButton, .contactModal .modalActions .submitButton, .ConfirmationDefault .GoGAdditionalInfoButton, [data-testid="apply-filter"] {${typography.buttonFont ? `
  font-family: var(--font-button) !important;` : ''}${typography.buttonFontWeight ? `
  font-weight: ${typography.buttonFontWeight} !important;` : ''}${elementStyles.buttons.primaryType === 'outlined' ? (colors.button ? `
  color: ${elementStyles.buttons.primaryColor || 'var(--color-button)'} !important;
  background: transparent !important;` : '') : `${elementStyles.buttons.primaryColor ? `
  color: ${elementStyles.buttons.primaryColor} !important;` : ''}${colors.button ? `
  background: var(--color-button) !important;` : ''}`}${elementStyles.buttons.primaryBorderRadius ? `
  border-radius: ${elementStyles.buttons.primaryBorderRadius} !important;` : ''}${(elementStyles.buttons.hoverBg || elementStyles.buttons.hoverColor) && elementStyles.buttons.primaryTransition && elementStyles.buttons.primaryTransition !== 'none' ? `
  transition: ${elementStyles.buttons.primaryTransition} !important;` : ''}${typography.textTransform && typography.textTransform !== 'none' ? `
  text-transform: ${typography.textTransform} !important;` : ''}${typography.buttonLineHeight ? `
  line-height: ${typography.buttonLineHeight} !important;` : ''}${typography.buttonFontSize ? `
  font-size: ${typography.buttonFontSize} !important;` : ''}${typography.buttonLetterSpacing ? `
  letter-spacing: ${typography.buttonLetterSpacing} !important;` : ''}${colors.button ? `
  border: ${elementStyles.buttons.primaryType === 'solid' ? '1px solid var(--color-button)' : `${elementStyles.buttons.primaryBorderWidth} ${elementStyles.buttons.primaryBorderStyle} ${elementStyles.buttons.primaryBorderColor === 'button' ? 'var(--color-button)' : elementStyles.buttons.primaryBorderColor}`} !important;` : ''}
}
${elementStyles.buttons.hoverBg || elementStyles.buttons.hoverColor || (elementStyles.buttons.primaryHoverType === 'outlined' && colors.button) || (elementStyles.buttons.primaryHoverType === 'solid' && colors.hover) ? `
.button:hover, .ui.anygreen.button:hover, .TourPage-ContactGuide-submit-button.ui.large.button:hover,
.ConfirmationContainer .ButtonContainer .ui.button:hover, .CheckoutNavigationController button.BookingRequest-submit:hover, .ConfirmationDefault .GoGAdditionalInfoButton:hover, .rescheduleModal .modalActions .submitButton:hover, .contactModal .modalActions .submitButton:hover, [data-testid="apply-filter"]:hover {${elementStyles.buttons.primaryHoverType === 'outlined' ? (colors.button ? `
  color: ${elementStyles.buttons.hoverColor || 'var(--color-button)'} !important;
  background: transparent !important;` : '') : elementStyles.buttons.primaryHoverType === 'solid' ? (colors.hover ? `
  color: ${elementStyles.buttons.hoverColor || '#ffffff'} !important;
  background: var(--color-hover) !important;` : '') : `${elementStyles.buttons.hoverBg ? `
  background-color: ${elementStyles.buttons.hoverBg} !important;` : ''}${elementStyles.buttons.hoverColor ? `
  color: ${elementStyles.buttons.hoverColor} !important;` : ''}`}${(elementStyles.buttons.primaryHoverType === 'solid' && colors.hover) ? `
  border: 1px solid var(--color-hover) !important;` : (elementStyles.buttons.primaryHoverType === 'outlined' && colors.button) ? `
  border: ${elementStyles.buttons.primaryHoverBorderWidth} ${elementStyles.buttons.primaryHoverBorderStyle} ${elementStyles.buttons.primaryHoverBorderColor === 'button' ? 'var(--color-button)' : elementStyles.buttons.primaryHoverBorderColor} !important;` : ''}
}
` : ''}`;
      }

      // Checkout Navigation Button Font Size
      if (typography.buttonFontSize) {
        css += `/* Checkout Navigation Button */
.CheckoutNavigationController button.BookingRequest-submit {
  font-size: ${typography.buttonFontSize} !important;
}

`;
      }
      
      // Secondary Button Block
      if (hasSecondaryButtonProperties) {
        css += `/* Secondary Buttons */
.ui.basic.button, .DiscountCodeContainer .DiscountCode-Input .ui.button,
[data-testid="dont-cancel-btn"], .ModifyBooking .ModifyBooking-Column.left .actionButtons .rescheduleButton,
.ModifyBooking .ModifyBooking-Column.left .actionButtons .contactButton,
.TourPage-ContactGuide-link.ui.basic.button {${typography.buttonFont ? `
  font-family: var(--font-button) !important;` : ''}${typography.buttonFontWeight ? `
  font-weight: ${typography.buttonFontWeight} !important;` : ''}${elementStyles.buttons.secondaryType === 'solid' ? (colors.button ? `
  color: ${elementStyles.buttons.secondaryColor || '#ffffff'} !important;
  background: ${elementStyles.buttons.secondaryBg || 'var(--color-button)'} !important;` : '') : `${(elementStyles.buttons.secondaryColor || colors.button) ? `
  color: ${elementStyles.buttons.secondaryColor || 'var(--color-button)'} !important;` : ''}${colors.background ? `
  background: ${elementStyles.buttons.secondaryBg} !important;` : ''}`}${elementStyles.buttons.secondaryBorderRadius ? `
  border-radius: ${elementStyles.buttons.secondaryBorderRadius} !important;` : ''}${(elementStyles.buttons.secondaryHoverBg || elementStyles.buttons.secondaryHoverColor) && elementStyles.buttons.secondaryTransition && elementStyles.buttons.secondaryTransition !== 'none' ? `
  transition: ${elementStyles.buttons.secondaryTransition} !important;` : ''}${typography.textTransform && typography.textTransform !== 'none' ? `
  text-transform: ${typography.textTransform} !important;` : ''}${typography.buttonLineHeight ? `
  line-height: ${typography.buttonLineHeight} !important;` : ''}${typography.buttonFontSize ? `
  font-size: ${typography.buttonFontSize} !important;` : ''}${typography.buttonLetterSpacing ? `
  letter-spacing: ${typography.buttonLetterSpacing} !important;` : ''}${colors.button || elementStyles.buttons.secondaryBg ? `
  border: ${elementStyles.buttons.secondaryType === 'solid' ? `1px solid ${elementStyles.buttons.secondaryBg || 'var(--color-button)'}` : `${elementStyles.buttons.secondaryBorderWidth} ${elementStyles.buttons.secondaryBorderStyle} ${elementStyles.buttons.secondaryBorderColor || 'var(--color-button)'}`} !important;` : ''}
}
${elementStyles.buttons.secondaryHoverBg || elementStyles.buttons.secondaryHoverColor || (elementStyles.buttons.secondaryHoverType === 'solid' && colors.button) || (elementStyles.buttons.secondaryHoverType === 'outlined' && colors.button) ? `
.ui.basic.button:hover, .DiscountCodeContainer .DiscountCode-Input .ui.button:hover,
[data-testid="dont-cancel-btn"]:hover, .ModifyBooking .ModifyBooking-Column.left .actionButtons .rescheduleButton:hover,
.ModifyBooking .ModifyBooking-Column.left .actionButtons .contactButton:hover,
.TourPage-ContactGuide-link.ui.basic.button:hover {${elementStyles.buttons.secondaryHoverType === 'solid' ? (colors.button ? `
  color: ${elementStyles.buttons.secondaryHoverColor || '#ffffff'} !important;
  background: ${elementStyles.buttons.secondaryHoverBg || 'var(--color-button)'} !important;` : '') : (elementStyles.buttons.secondaryHoverType === 'outlined' && colors.button) ? `
  color: ${elementStyles.buttons.secondaryHoverColor || 'var(--color-button)'} !important;` : `${elementStyles.buttons.secondaryHoverBg ? `
  background-color: ${elementStyles.buttons.secondaryHoverBg} !important;` : ''}${elementStyles.buttons.secondaryHoverColor ? `
  color: ${elementStyles.buttons.secondaryHoverColor} !important;` : ''}`}${(elementStyles.buttons.secondaryHoverType === 'solid' && (colors.button || elementStyles.buttons.secondaryHoverBg)) ? `
  border: 1px solid ${elementStyles.buttons.secondaryHoverBg || 'var(--color-button)'} !important;` : (elementStyles.buttons.secondaryHoverType === 'outlined' && colors.button) ? `
  border: ${elementStyles.buttons.secondaryHoverBorderWidth} ${elementStyles.buttons.secondaryHoverBorderStyle} var(--color-button) !important;` : ''}
}
` : ''}
`;
      }
    }

    // Secondary Button - Contact Guide Link Text Color
    if (elementStyles.buttons.secondaryColor) {
      css += `/* Secondary Button - Contact Guide Link Text */
.TourPage-ContactGuide-link.ui.basic.button .ContactGuide-link-text,
.TourPage-ContactGuide-link.ui.basic.button .icon.anyfont {
  color: ${elementStyles.buttons.secondaryColor} !important;
}

`;
    }

    // Button Font Size - Checkout Navigation Button Height
    if (typography.buttonFontSize) {
      css += `/* Checkout Navigation Button */
.CheckoutNavigationController button.BookingRequest-submit {
  height: 50px !important;
}

`;
    }

    // Advanced CSS - Discount Code Button Height Fix
    // This comes after button CSS blocks to ensure it has priority
    if (advancedCSS.discountCodeButtonHeight) {
      css += `/* Advanced CSS - Discount Code Button Height Fix */
.DiscountCodeContainer .DiscountCode-Input .ui.button {
  height: 47px !important;${advancedCSS.discountCodeButtonFontSize ? `
  font-size: ${advancedCSS.discountCodeButtonFontSize} !important;` : ''}${advancedCSS.discountCodeButtonPaddingTop ? `
  padding-top: ${advancedCSS.discountCodeButtonPaddingTop} !important;` : ''}
}

`;
    }

    // Input Fields - only generate if properties are defined
    if (elementStyles.inputs.backgroundColor || elementStyles.inputs.textColor || elementStyles.inputs.borderColor || elementStyles.inputs.borderRadius) {
      css += `/* Input Fields */
input[type='text'], input[type='email'], input[type='search'], input[type='password'] {${elementStyles.inputs.backgroundColor ? `
  background-color: ${elementStyles.inputs.backgroundColor} !important;` : ''}${elementStyles.inputs.textColor ? `
  color: ${elementStyles.inputs.textColor} !important;` : ''}${elementStyles.inputs.borderColor ? `
  border: 1px solid ${elementStyles.inputs.borderColor} !important;` : ''}${elementStyles.inputs.borderRadius ? `
  border-radius: ${elementStyles.inputs.borderRadius} !important;` : ''}
}

`;
    }

    // Modals - only generate if properties are defined
    if (elementStyles.modals.backgroundColor || elementStyles.modals.textColor || elementStyles.modals.borderColor || elementStyles.modals.padding) {
      css += `/* Modals */
`;
      
      // .ui.modal > .content
      if (elementStyles.modals.backgroundColor || elementStyles.modals.textColor) {
        css += `.ui.modal > .content {${elementStyles.modals.backgroundColor ? `
  background: ${elementStyles.modals.backgroundColor};` : ''}${elementStyles.modals.textColor ? `
  color: ${elementStyles.modals.textColor};` : ''}
}

`;
      }
      
      // Specific modal classes
      if (elementStyles.modals.backgroundColor || elementStyles.modals.borderColor || elementStyles.modals.textColor || elementStyles.modals.padding) {
        css += `.rescheduleModal, .contactModal, .confirm-email-modal {${elementStyles.modals.backgroundColor ? `
  background-color: ${elementStyles.modals.backgroundColor} !important;` : ''}${elementStyles.modals.borderColor ? `
  border: 1px solid ${elementStyles.modals.borderColor} !important;` : ''}${elementStyles.modals.textColor ? `
  color: ${elementStyles.modals.textColor} !important;` : ''}${elementStyles.modals.padding ? `
  padding: ${elementStyles.modals.padding} !important;` : ''}
}

`;
      }
      
      // Modal overlay
      if (elementStyles.modals.backgroundColor || elementStyles.modals.padding) {
        css += `[data-testid="modal-main-overlay"] {${elementStyles.modals.backgroundColor ? `
  background-color: ${elementStyles.modals.backgroundColor} !important;` : ''}
  pointer-events: auto;${elementStyles.modals.padding ? `
  padding: ${elementStyles.modals.padding} !important;` : ''}
}

`;
      }
    }

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
    // Only generate Lists section if there are properties to declare
    if (elementStyles.lists.backgroundColor || colors.background || elementStyles.lists.padding || elementStyles.lists.margin || (elementStyles.lists.listStyle && elementStyles.lists.listStyle !== 'Default')) {
      css += `/* Lists */
li {${elementStyles.lists.backgroundColor || colors.background ? `
  background: ${elementStyles.lists.backgroundColor || 'var(--color-background)'} !important;` : ''}${elementStyles.lists.padding ? `
  padding: ${elementStyles.lists.padding};` : ''}${elementStyles.lists.margin ? `
  margin: ${elementStyles.lists.margin};` : ''}${elementStyles.lists.listStyle && elementStyles.lists.listStyle !== 'Default' ? `
  list-style: ${elementStyles.lists.listStyle};` : ''}
}

`;
    }

    // Experience List Card
    // Only generate if there are border properties to declare
    if (elementStyles.experienceCard.borderWidth || elementStyles.experienceCard.borderColor || (elementStyles.experienceCard.borderStyle && elementStyles.experienceCard.borderStyle !== 'solid')) {
      const hasBorder = elementStyles.experienceCard.borderWidth || elementStyles.experienceCard.borderColor;
      css += `/* Experience List Card */
.tour-wrapper a {${hasBorder ? `
  border: ${elementStyles.experienceCard.borderWidth || '1px'} ${elementStyles.experienceCard.borderStyle || 'solid'} ${elementStyles.experienceCard.borderColor || 'var(--color-button)'} !important;` : ''}
}

`;
    }

    // At A Glance - Zebra Striping
    if (elementStyles.atAGlance.zebraStripingColor) {
      css += `/* At A Glance - Zebra Striping */
.Plugins-TourPage-GlanceWrapper .TourPage-Glance .ui.grid .row:nth-child(2n) {
  background-color: ${elementStyles.atAGlance.zebraStripingColor} !important;
}

`;
    }

    // Dividers
    // Only generate if user has customized from defaults (1px solid #e6e6e6)
    if (elementStyles.dividers.color || elementStyles.dividers.thickness || (elementStyles.dividers.style && elementStyles.dividers.style !== 'solid')) {
      const borderValue = `${elementStyles.dividers.thickness || '1px'} ${elementStyles.dividers.style || 'solid'} ${elementStyles.dividers.color || '#e6e6e6'}`;
      
      css += `/* Dividers */
.CheckoutDesktopPage .ColumnContainer .CheckoutPersonal,
.CheckoutDesktopPage .ColumnContainer .CheckoutPayment,
.CheckoutDesktopPage .DiscountCodeContainer,
.CheckoutQuestion,
.TourPage-About-hr {
  border-bottom: ${borderValue};
}

.Plugins-TourPage-GlanceWrapper .TourPage-Glance {
  border-top: ${borderValue};
}

.MessageGuideContainer,
.DiscountCodeContainer.t-mobile {
  border-bottom: ${borderValue};
  border-top: ${borderValue};
}

.Confirmation-Body .separator {
  background: ${elementStyles.dividers.color || '#e6e6e6'};
}

`;
    }

    // Checkout Summary
    // Background color - only generate if user has configured it
    if (elementStyles.checkoutSummary.backgroundColor) {
      css += `/* Checkout Summary - Background */
.CheckoutSummary-Container,
.CheckoutSummary-ContentBox.Subtotal-PriceBreakdown .CheckoutSummary-PriceBreakDown,
.ConfirmationDefault .ui.grid.Confirmation-grid .column.ConfirmationDefault-Column.right {
  background: ${elementStyles.checkoutSummary.backgroundColor} !important;
}

@media screen and (max-width: 767px) {
  .CheckoutSummary {
    background: ${elementStyles.checkoutSummary.backgroundColor} !important;
  }
}

`;
    }

    // Checkout Summary - Divider
    // Only generate if user has configured a divider color
    if (elementStyles.checkoutSummary.dividerColor) {
      css += `/* Checkout Summary - Divider */
.CheckoutSummary-ContentBox {
  border-bottom: 1px solid ${elementStyles.checkoutSummary.dividerColor} !important;
}

`;
    }


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

    // Mobile Experience List Button
    if (elementStyles.buttons.mobileListButtonWidth || 
        elementStyles.buttons.mobileListButtonHeight || 
        elementStyles.buttons.mobileListButtonMarginTop || 
        elementStyles.buttons.mobileListButtonMarginLeft || 
        elementStyles.buttons.mobileListButtonPaddingTop) {
      css += `/* Mobile Experience List Button */
@media (max-width: 600px) {
  .book-tour-btn {${elementStyles.buttons.mobileListButtonWidth ? `
    width: ${elementStyles.buttons.mobileListButtonWidth} !important;` : ''}${elementStyles.buttons.mobileListButtonMarginTop ? `
    margin-top: ${elementStyles.buttons.mobileListButtonMarginTop} !important;` : ''}${elementStyles.buttons.mobileListButtonMarginLeft ? `
    margin-left: ${elementStyles.buttons.mobileListButtonMarginLeft} !important;` : ''}${elementStyles.buttons.mobileListButtonHeight ? `
    height: ${elementStyles.buttons.mobileListButtonHeight} !important;` : ''}${elementStyles.buttons.mobileListButtonPaddingTop ? `
    padding-top: ${elementStyles.buttons.mobileListButtonPaddingTop} !important;` : ''}
  }
}

`;
    }

    // Purchase CTA Button
    if (elementStyles.buttons.purchaseButtonHeight) {
      css += `/* Purchase CTA Button */
.ConfirmationContainer .ButtonContainer .ui.button {
  height: ${elementStyles.buttons.purchaseButtonHeight} !important;
}

`;
    }

    // Advanced CSS
    if (advancedCSS.pluginMarginFix) {
      css += `/* Advanced CSS - Plugin Margin Fix */
#plugins-wrapper>div.ui.equal.height.grid.stackable.tour-page {
  margin-top: 14px !important;
}

`;
    }

    if (advancedCSS.autoExpandDescription) {
      css += `/* Advanced CSS - Auto-Expand Experience Description */
.TourPage-About-description {
  height: auto !important;
}
.TourPage-About-description:after, .TourPage-About-description-more {
  display: none !important;
}

`;
    }

    if (advancedCSS.contactGuideAlignment) {
      css += `/* Advanced CSS - Contact Guide Button Alignment Fix */
.TourPage-ContactGuide-link.ui.basic.button .ContactGuide-link-text {
  display: inline !important;
}

`;
    }

    if (advancedCSS.mobileCheckoutTitleColor) {
      css += `/* Advanced CSS - Mobile Checkout Title Color Fix */
.MobileCheckout-CoverPhoto span.text .title .name {
  color: #ffffff !important;
}

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

  // Memoized CSS for preview (avoids regenerating on every render)
  const generatedCSS = useMemo(() => generateCSS(), [
    fonts, colors, typography, elementStyles, isDarkTheme, advancedCSS, customSnippets
  ]);

  // Export CSS
  const exportCSS = () => {
    const css = generatedCSS;
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
    navigator.clipboard.writeText(generatedCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadDarkTheme = () => {
    setColors({
      body: '#ffffff',
      heading: '#ffffff',
      link: '',
      button: '',
      hover: '',
      brand: '',
      background: '#000000'
    });
    setIsDarkTheme(true);
  };

  // Memoized summary stats
  const summaryStats = useMemo(() => {
    const fontCount = fonts.filter(f => f.name || f.googleLink || f.typekitUrl).length;
    const colorCount = Object.values(colors).filter(c => c).length;
    const hasFonts = fontCount > 0 || typography.bodyFont || typography.headingFont || typography.buttonFont;
    const hasColors = colorCount > 0;
    const hasTypography = typography.titleSize || typography.subtitleSize || typography.bodySize;
    const hasButtons = elementStyles.buttons.primaryColor || elementStyles.buttons.primaryBorderRadius || elementStyles.buttons.secondaryBorderRadius;
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
  }, [fonts, colors, typography, elementStyles.buttons, isDarkTheme]);

  // Helper function for backward compatibility
  const getSummaryStats = useCallback(() => summaryStats, [summaryStats]);

  const sections = [
    { id: 'start', label: 'Getting Started', icon: '🚀' },
    { id: 'fonts', label: 'Fonts', icon: '🔤' },
    { id: 'colors', label: 'Colors', icon: '🎨' },
    { id: 'typography', label: 'Typography', icon: '📝' },
    { id: 'buttons', label: 'Buttons', icon: '🔘' },
    { id: 'elements', label: 'Elements', icon: '📋' },
    { id: 'modals', label: 'Modals', icon: '🪟' },
    { id: 'advanced', label: 'Advanced CSS', icon: '🔧' },
    { id: 'custom', label: 'Custom CSS', icon: '⚙️' }
  ];

  return (
    <>
      <style>{`
        @import url("https://use.typekit.net/pdl3uhj.css");
      `}</style>
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'soleil, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden'
      }}>
      {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4860FF 0%, #2DC5B8 100%)',
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
                color: activeSection === section.id ? '#3D57FF' : '#666',
                fontWeight: activeSection === section.id ? '600' : '500',
                cursor: 'pointer',
                fontSize: '14px',
                borderBottom: activeSection === section.id ? '3px solid #3D57FF' : '3px solid transparent',
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
                <h3 style={{ fontSize: '16px', color: '#666', marginBottom: '12px', fontWeight: '500' }}>Quick Start Templates</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  <button
                    onClick={loadDarkTheme}
                    style={{
                      padding: '16px',
                      background: '#f9f9f9',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f9f9f9'}
                  >
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#333', marginBottom: '4px' }}>Dark Theme</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>Dark background</div>
                  </button>

                  <button
                    style={{
                      padding: '16px',
                      background: '#f9f9f9',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      cursor: 'not-allowed',
                      textAlign: 'left',
                      opacity: 0.6
                    }}
                    disabled
                  >
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#333', marginBottom: '4px' }}>Template 2</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>Coming soon</div>
                  </button>

                  <button
                    style={{
                      padding: '16px',
                      background: '#f9f9f9',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      cursor: 'not-allowed',
                      textAlign: 'left',
                      opacity: 0.6
                    }}
                    disabled
                  >
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#333', marginBottom: '4px' }}>Template 3</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>Coming soon</div>
                  </button>

                  <button
                    style={{
                      padding: '16px',
                      background: '#f9f9f9',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      cursor: 'not-allowed',
                      textAlign: 'left',
                      opacity: 0.6
                    }}
                    disabled
                  >
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#333', marginBottom: '4px' }}>Template 4</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>Coming soon</div>
                  </button>
                </div>
              </div>

              {/* About This Tool */}
              <div style={{ background: '#EBF5FF', padding: '24px', borderRadius: '12px', marginBottom: '32px', border: '1px solid #2E6AB3' }}>
                <h3 style={{ fontSize: '18px', color: '#1E4A7D', marginTop: 0, marginBottom: '16px' }}>📘 What This Tool Does</h3>
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

              {/* Import Configuration */}
              <div style={{ background: '#f9f9f9', padding: '24px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                <h3 style={{ fontSize: '18px', color: '#333333', marginTop: 0, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>📥</span>
                  <span>Import Existing Configuration</span>
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                  Have a CSS file previously exported from this tool? Paste it below to restore your settings and make updates.
                </p>
                
                <textarea
                  value={importCSS}
                  onChange={(e) => setImportCSS(e.target.value)}
                  placeholder="Paste your exported CSS here..."
                  style={{
                    width: '100%',
                    minHeight: '150px',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    marginBottom: '12px'
                  }}
                />
                
                {importStatus.message && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    background: importStatus.type === 'success' ? '#d4edda' : 
                               importStatus.type === 'warning' ? '#fff3cd' : '#f8d7da',
                    border: `1px solid ${importStatus.type === 'success' ? '#28a745' : 
                                        importStatus.type === 'warning' ? '#ffc107' : '#dc3545'}`,
                    color: importStatus.type === 'success' ? '#155724' : 
                           importStatus.type === 'warning' ? '#856404' : '#721c24',
                    fontSize: '14px'
                  }}>
                    {importStatus.type === 'success' && '✓ '}
                    {importStatus.type === 'warning' && '⚠ '}
                    {importStatus.type === 'error' && '✕ '}
                    {importStatus.message}
                  </div>
                )}
                
                <button
                  onClick={() => parseAndImportCSS(importCSS)}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #3D57FF 0%, #5a72ff 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(61, 87, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Download size={16} />
                  Import Configuration
                </button>
                
                <p style={{ margin: '16px 0 0 0', fontSize: '12px', color: '#888', lineHeight: '1.5' }}>
                  <strong>Note:</strong> Importing will populate form fields with values found in the CSS. 
                  Font family names will be extracted, but you may need to re-add font sources (Google Fonts URLs, Typekit, or custom files) if they weren't included in the export.
                </p>
              </div>
            </div>
          )}

          {/* Fonts Section */}
          {activeSection === 'fonts' && (
            <div>
              <h2 style={{ marginBottom: '16px', fontSize: '24px', color: '#333' }}>Font Management</h2>

              {/* Contextual Help Banner */}
              <div style={{
                background: '#EBF5FF',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid #2E6AB3',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#555'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '4px', color: '#1E4A7D' }}>💡 About Fonts</div>
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
                        background: '#3D57FF',
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
                            fontSize: '14px',
                        fontFamily: 'monospace'
                          }}
                        />
                        <small style={{ display: 'block', marginTop: '6px', color: '#666', fontSize: '12px' }}>
                          Get this from <a href="https://fonts.google.com" target="_blank" rel="noopener noreferrer" style={{ color: '#3D57FF' }}>fonts.google.com</a> - select "@import" and copy the URL from inside url('...')
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
                          <label style={{ fontWeight: '600', color: '#3D57FF' }}>
                            Font Families <span style={{ color: '#d32f2f' }}>*</span>
                          </label>
                          <button
                            onClick={() => {
                              const currentFamilies = font.googleFamilies || [];
                              updateFont(font.id, 'googleFamilies', [...currentFamilies, { name: '', fallback: 'Arial' }]);
                            }}
                            style={{
                              padding: '4px 12px',
                              background: 'white',
                              color: '#3D57FF',
                              border: '1px solid #3D57FF',
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
                                      border: '2px solid #3D57FF',
                                      borderRadius: '6px',
                                      fontSize: '14px',
                        fontFamily: 'monospace',
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
                                      {FALLBACK_FONT_OPTIONS.filter(f => f.generic === 'sans-serif' && f.value !== 'sans-serif').map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Serif">
                                      {FALLBACK_FONT_OPTIONS.filter(f => f.generic === 'serif' && f.value !== 'serif').map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Monospace">
                                      {FALLBACK_FONT_OPTIONS.filter(f => f.generic === 'monospace' && f.value !== 'monospace').map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Generic">
                                      {FALLBACK_FONT_OPTIONS.filter(f => f.value === f.generic || f.label.includes('generic')).map(option => (
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
                                    background: '#3D57FF',
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
                              border: '2px dashed #3D57FF',
                              borderRadius: '6px',
                              textAlign: 'center',
                              color: '#3D57FF',
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
                            fontSize: '14px',
                        fontFamily: 'monospace'
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
                          <label style={{ fontWeight: '600', color: '#3D57FF', fontSize: '14px' }}>
                            Font Families <span style={{ color: '#d32f2f' }}>*</span>
                          </label>
                          <button
                            onClick={() => {
                              const newFamilies = [...(font.typekitFamilies || []), { name: '', fallback: 'Arial' }];
                              updateFont(font.id, 'typekitFamilies', newFamilies);
                            }}
                            style={{
                              padding: '6px 12px',
                              background: 'white',
                              color: '#3D57FF',
                              border: '1px solid #3D57FF',
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
                                      border: '2px solid #3D57FF',
                                      borderRadius: '6px',
                                      fontSize: '14px',
                        fontFamily: 'monospace',
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
                                      {FALLBACK_FONT_OPTIONS.filter(f => f.generic === 'sans-serif' && f.value !== 'sans-serif').map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Serif">
                                      {FALLBACK_FONT_OPTIONS.filter(f => f.generic === 'serif' && f.value !== 'serif').map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Monospace">
                                      {FALLBACK_FONT_OPTIONS.filter(f => f.generic === 'monospace' && f.value !== 'monospace').map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Generic">
                                      {FALLBACK_FONT_OPTIONS.filter(f => f.value === f.generic || f.label.includes('generic')).map(option => (
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
                                    background: '#3D57FF',
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
                          fontSize: '14px',
                        fontFamily: 'monospace'
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
                            {FALLBACK_FONT_OPTIONS.filter(f => f.generic === 'sans-serif' && f.value !== 'sans-serif').map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Serif Fonts">
                            {FALLBACK_FONT_OPTIONS.filter(f => f.generic === 'serif' && f.value !== 'serif').map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Monospace Fonts">
                            {FALLBACK_FONT_OPTIONS.filter(f => f.generic === 'monospace' && f.value !== 'monospace').map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Generic Families">
                            {FALLBACK_FONT_OPTIONS.filter(f => f.value === f.generic || f.label.includes('generic')).map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </optgroup>
                        </select>
                        <button
                          onClick={() => updateFont(font.id, 'fallback', suggestFallback(font.name))}
                          style={{
                            padding: '10px 16px',
                            background: '#3D57FF',
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
                            background: 'white',
                            color: '#3D57FF',
                            border: '1px solid #3D57FF',
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
                        fontFamily: 'monospace', 
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
                      background: isDarkTheme ? '#3D57FF' : '#ddd',
                      borderRadius: '14px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.3s',
                      border: isDarkTheme ? '2px solid #3D57FF' : '2px solid #ccc'
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
                background: '#EBF5FF',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid #2E6AB3',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#555'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '4px', color: '#1E4A7D' }}>💡 About Colors</div>
                <div>These colors will be used across the entire booking experience. Leave fields blank to use plugin defaults.</div>
              </div>
              
              {/* Text Colors Group */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  color: '#3D57FF', 
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid #3D57FF'
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
                          value={colors.body && !isTransparent(colors.body) ? colors.body : '#000000'}
                          onChange={(e) => setColors({ ...colors, body: e.target.value })}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            opacity: colors.body && !isTransparent(colors.body) ? 1 : 0,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        {isTransparent(colors.body) && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            ...transparentCheckerboard,
                            pointerEvents: 'none'
                          }} />
                        )}
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
                        fontFamily: 'monospace',
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
                          value={colors.heading && !isTransparent(colors.heading) ? colors.heading : '#000000'}
                          onChange={(e) => setColors({ ...colors, heading: e.target.value })}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            opacity: colors.heading && !isTransparent(colors.heading) ? 1 : 0,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        {isTransparent(colors.heading) && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            ...transparentCheckerboard,
                            pointerEvents: 'none'
                          }} />
                        )}
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
                        fontFamily: 'monospace',
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
                  color: '#3D57FF', 
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid #3D57FF'
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
                            value={colors[key] && !isTransparent(colors[key]) ? colors[key] : '#000000'}
                            onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                            style={{
                              width: '100%',
                              height: '100%',
                              border: '2px solid #ddd',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              opacity: colors[key] && !isTransparent(colors[key]) ? 1 : 0,
                              position: 'absolute',
                              top: 0,
                              left: 0
                            }}
                          />
                          {isTransparent(colors[key]) && (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              border: '2px solid #ddd',
                              borderRadius: '8px',
                              ...transparentCheckerboard,
                              pointerEvents: 'none'
                            }} />
                          )}
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
                        fontFamily: 'monospace',
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
                          value={colors.titleOverride && !isTransparent(colors.titleOverride) ? colors.titleOverride : '#000000'}
                          onChange={(e) => setColors({ ...colors, titleOverride: e.target.value })}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            opacity: colors.titleOverride && !isTransparent(colors.titleOverride) ? 1 : 0,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        {isTransparent(colors.titleOverride) && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            ...transparentCheckerboard,
                            pointerEvents: 'none'
                          }} />
                        )}
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
                        placeholder="#000000"
                        style={{
                          flex: 1,
                         minWidth: 0,
                          minWidth: 0,
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                        fontFamily: 'monospace',
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
                          value={colors.subtitleOverride && !isTransparent(colors.subtitleOverride) ? colors.subtitleOverride : '#000000'}
                          onChange={(e) => setColors({ ...colors, subtitleOverride: e.target.value })}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            opacity: colors.subtitleOverride && !isTransparent(colors.subtitleOverride) ? 1 : 0,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        {isTransparent(colors.subtitleOverride) && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            ...transparentCheckerboard,
                            pointerEvents: 'none'
                          }} />
                        )}
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
                        placeholder="#000000"
                        style={{
                          flex: 1,
                         minWidth: 0,
                          minWidth: 0,
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                        fontFamily: 'monospace',
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
                background: '#EBF5FF',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid #2E6AB3',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#555'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '4px', color: '#1E4A7D' }}>💡 Size Fields</div>
                <div>Leave size fields blank to use plugin defaults.</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#333333' }}>Headings</h3>
                  
                  {/* 1. Font Family */}
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
                      <optgroup label="Sans-serif Fonts">
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Helvetica Neue">Helvetica Neue</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Tahoma">Tahoma</option>
                        <option value="Trebuchet MS">Trebuchet MS</option>
                        <option value="Segoe UI">Segoe UI</option>
                      </optgroup>
                      <optgroup label="Serif Fonts">
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Times">Times</option>
                        <option value="Garamond">Garamond</option>
                      </optgroup>
                      <optgroup label="Monospace Fonts">
                        <option value="Courier New">Courier New</option>
                        <option value="Courier">Courier</option>
                        <option value="Monaco">Monaco</option>
                        <option value="Consolas">Consolas</option>
                      </optgroup>
                      <optgroup label="Generic Families">
                        <option value="sans-serif">Sans-serif (generic)</option>
                        <option value="serif">Serif (generic)</option>
                        <option value="monospace">Monospace (generic)</option>
                        <option value="cursive">Cursive (generic)</option>
                        <option value="fantasy">Fantasy (generic)</option>
                        <option value="system-ui">System UI</option>
                      </optgroup>
                    </select>
                    {getAllFontFamilies().length === 0 && (
                      <small style={{ display: 'block', marginTop: '6px', color: '#888', fontSize: '12px' }}>
                        Add fonts in <span style={{ color: '#3D57FF', cursor: 'pointer' }} onClick={() => setActiveSection('fonts')}>Font Management</span> to see options here
                      </small>
                    )}
                  </div>

                  {/* 2. Font Weight */}
                  <div style={{ marginBottom: '16px' }}>
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

                  {/* 3. Text Transform */}
                  <div style={{ marginBottom: '16px' }}>
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

                  {/* 4. Font Size - Title Size */}
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
                            fontSize: '14px',
                        fontFamily: 'monospace'
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
                            fontSize: '14px',
                        fontFamily: 'monospace'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4b. Font Size - Subtitle Size */}
                  <div style={{ marginBottom: '16px' }}>
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
                            fontSize: '14px',
                        fontFamily: 'monospace'
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
                            fontSize: '14px',
                        fontFamily: 'monospace'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5. Line Height */}
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
                        fontSize: '14px',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>

                  {/* 6. Letter Spacing */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Letter Spacing
                    </label>
                    <input
                      type="text"
                      value={typography.headingLetterSpacing}
                      onChange={(e) => setTypography({ ...typography, headingLetterSpacing: e.target.value })}
                      placeholder="e.g., 0.05em or 1px"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>


                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#333333' }}>Body Text</h3>
                  
                  {/* 1. Font Family */}
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
                      <optgroup label="Sans-serif Fonts">
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Helvetica Neue">Helvetica Neue</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Tahoma">Tahoma</option>
                        <option value="Trebuchet MS">Trebuchet MS</option>
                        <option value="Segoe UI">Segoe UI</option>
                      </optgroup>
                      <optgroup label="Serif Fonts">
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Times">Times</option>
                        <option value="Garamond">Garamond</option>
                      </optgroup>
                      <optgroup label="Monospace Fonts">
                        <option value="Courier New">Courier New</option>
                        <option value="Courier">Courier</option>
                        <option value="Monaco">Monaco</option>
                        <option value="Consolas">Consolas</option>
                      </optgroup>
                      <optgroup label="Generic Families">
                        <option value="sans-serif">Sans-serif (generic)</option>
                        <option value="serif">Serif (generic)</option>
                        <option value="monospace">Monospace (generic)</option>
                        <option value="cursive">Cursive (generic)</option>
                        <option value="fantasy">Fantasy (generic)</option>
                        <option value="system-ui">System UI</option>
                      </optgroup>
                    </select>
                    {getAllFontFamilies().length === 0 && (
                      <small style={{ display: 'block', marginTop: '6px', color: '#888', fontSize: '12px' }}>
                        Add fonts in <span style={{ color: '#3D57FF', cursor: 'pointer' }} onClick={() => setActiveSection('fonts')}>Font Management</span> to see options here
                      </small>
                    )}
                  </div>

                  {/* 2. Font Weight */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Font Weight
                    </label>
                    <select
                      value={typography.bodyFontWeight}
                      onChange={(e) => setTypography({ ...typography, bodyFontWeight: e.target.value })}
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

                  {/* 3. Text Transform */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Text Transform
                    </label>
                    <select
                      value={typography.bodyTextTransform}
                      onChange={(e) => setTypography({ ...typography, bodyTextTransform: e.target.value })}
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

                  {/* 4. Font Size & Line Height */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
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
                          fontSize: '14px',
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                        Line Height
                      </label>
                      <input
                        type="text"
                        value={typography.bodyLineHeight}
                        onChange={(e) => setTypography({ ...typography, bodyLineHeight: e.target.value })}
                        placeholder="1.5"
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
                  </div>
                </div>


                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#333333' }}>Buttons</h3>
                  
                  {/* 1. Font Family */}
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
                      <optgroup label="Sans-serif Fonts">
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Helvetica Neue">Helvetica Neue</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Tahoma">Tahoma</option>
                        <option value="Trebuchet MS">Trebuchet MS</option>
                        <option value="Segoe UI">Segoe UI</option>
                      </optgroup>
                      <optgroup label="Serif Fonts">
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Times">Times</option>
                        <option value="Garamond">Garamond</option>
                      </optgroup>
                      <optgroup label="Monospace Fonts">
                        <option value="Courier New">Courier New</option>
                        <option value="Courier">Courier</option>
                        <option value="Monaco">Monaco</option>
                        <option value="Consolas">Consolas</option>
                      </optgroup>
                      <optgroup label="Generic Families">
                        <option value="sans-serif">Sans-serif (generic)</option>
                        <option value="serif">Serif (generic)</option>
                        <option value="monospace">Monospace (generic)</option>
                        <option value="cursive">Cursive (generic)</option>
                        <option value="fantasy">Fantasy (generic)</option>
                        <option value="system-ui">System UI</option>
                      </optgroup>
                    </select>
                    {getAllFontFamilies().length === 0 && (
                      <small style={{ display: 'block', marginTop: '6px', color: '#888', fontSize: '12px' }}>
                        Add fonts in <span style={{ color: '#3D57FF', cursor: 'pointer' }} onClick={() => setActiveSection('fonts')}>Font Management</span> to see options here
                      </small>
                    )}
                  </div>

                  {/* 2. Font Weight */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Font Weight
                    </label>
                    <select
                      value={typography.buttonFontWeight}
                      onChange={(e) => setTypography({ ...typography, buttonFontWeight: e.target.value })}
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

                  {/* 3. Text Transform */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Text Transform
                    </label>
                    <select
                      value={typography.textTransform}
                      onChange={(e) => setTypography({ ...typography, textTransform: e.target.value })}
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

                  {/* 4. Font Size & Line Height */}
                  <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                        Font Size
                      </label>
                      <input
                        type="text"
                        value={typography.buttonFontSize}
                        onChange={(e) => setTypography({ ...typography, buttonFontSize: e.target.value })}
                        placeholder="14px"
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

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                        Line Height
                      </label>
                      <input
                        type="text"
                        value={typography.buttonLineHeight}
                        onChange={(e) => setTypography({ ...typography, buttonLineHeight: e.target.value })}
                        placeholder="1"
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
                  </div>

                  {/* 5. Letter Spacing */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Letter Spacing
                    </label>
                    <input
                      type="text"
                      value={typography.buttonLetterSpacing}
                      onChange={(e) => setTypography({ ...typography, buttonLetterSpacing: e.target.value })}
                      placeholder="e.g., 0.1em or 2px"
                      style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
              </div>

                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#333333' }}>Links</h3>
                  
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

                {/* Checkout H2 Font Size - Advanced Setting */}
                <div style={{
                  background: '#EEEAF7',
                  border: '2px solid #2D1D81',
                  borderRadius: '12px',
                  padding: '24px',
                  marginTop: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <span style={{ fontSize: '20px' }}>⚙️</span>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#2D1D81', fontWeight: '600' }}>
                      Checkout H2 Font Size (Advanced)
                    </h3>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#2D1D81',
                    marginBottom: '16px',
                    lineHeight: '1.6'
                  }}>
                    Configure the font size for H2 headings specifically on checkout pages. This setting only affects checkout pages and does not impact other H2 headings.
                  </div>
                  <div style={{ 
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #B8B0D1'
                  }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Font Size
                    </label>
                    <input
                      type="text"
                      value={typography.checkoutH2FontSize}
                      onChange={(e) => setTypography({ ...typography, checkoutH2FontSize: e.target.value })}
                      placeholder="e.g., 24px"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
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
          )}

          {/* Buttons Section */}
          {activeSection === 'buttons' && (
            <div>
              <h2 style={{ marginBottom: '24px', fontSize: '24px', color: '#333' }}>Button Styles</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#333333' }}>Primary Button</h3>
                  
                  {/* Live Preview */}
                  <div style={{ 
                    marginBottom: '24px', 
                    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                    borderRadius: '16px',
                    padding: '4px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset'
                  }}>
                    {/* Browser-like header */}
                    <div style={{
                      background: 'linear-gradient(180deg, #2d2d44 0%, #252538 100%)',
                      borderRadius: '12px 12px 0 0',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28ca42' }} />
                      </div>
                      <div style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        color: '#888',
                        fontFamily: 'monospace',
                        marginLeft: '8px'
                      }}>
                        booking.anyroad.com/checkout
                      </div>
                    </div>
                    {/* Preview content area */}
                    <div style={{ 
                      background: colors.background || '#ffffff',
                      borderRadius: '0 0 12px 12px',
                      padding: '32px',
                      minHeight: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px'
                    }}>
                      <div style={{ 
                        fontSize: '11px', 
                        fontWeight: '600', 
                        color: colors.body || '#666', 
                        textTransform: 'uppercase', 
                        letterSpacing: '1.5px',
                        opacity: 0.6
                      }}>
                        Primary Button Preview
                      </div>
                      <button
                        style={{
                          fontFamily: typography.buttonFont ? buildFontStack(typography.buttonFont, getFontFallback(typography.buttonFont)) : 'inherit',
                          fontWeight: typography.buttonFontWeight || 'normal',
                          color: elementStyles.buttons.primaryType === 'outlined' ? (elementStyles.buttons.primaryColor || (colors.button ? colors.button : '#3D57FF')) : (elementStyles.buttons.primaryColor || '#ffffff'),
                          background: elementStyles.buttons.primaryType === 'outlined' ? 'transparent' : (colors.button || '#3D57FF'),
                          borderRadius: elementStyles.buttons.primaryBorderRadius || '8px',
                          textTransform: typography.textTransform !== 'none' ? typography.textTransform : 'none',
                          lineHeight: typography.buttonLineHeight || 'normal',
                          fontSize: typography.buttonFontSize || '14px',
                          letterSpacing: typography.buttonLetterSpacing || 'normal',
                          border: elementStyles.buttons.primaryType === 'solid' ? `1px solid ${colors.button || '#3D57FF'}` : `${elementStyles.buttons.primaryBorderWidth} ${elementStyles.buttons.primaryBorderStyle} ${elementStyles.buttons.primaryBorderColor === 'button' ? (colors.button || '#3D57FF') : elementStyles.buttons.primaryBorderColor}`,
                          padding: '12px 32px',
                          cursor: 'pointer',
                          ...(elementStyles.buttons.primaryTransition && elementStyles.buttons.primaryTransition !== 'none' ? { transition: elementStyles.buttons.primaryTransition } : {})
                        }}
                        onMouseEnter={(e) => {
                          if (elementStyles.buttons.primaryHoverType === 'outlined' && colors.button) {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = elementStyles.buttons.hoverColor || (colors.button || '#3D57FF');
                            e.target.style.border = `${elementStyles.buttons.primaryHoverBorderWidth} ${elementStyles.buttons.primaryHoverBorderStyle} ${elementStyles.buttons.primaryHoverBorderColor === 'button' ? (colors.button || '#3D57FF') : elementStyles.buttons.primaryHoverBorderColor}`;
                          } else if (elementStyles.buttons.primaryHoverType === 'solid' && colors.hover) {
                            e.target.style.backgroundColor = colors.hover || '#3D57FF';
                            e.target.style.color = elementStyles.buttons.hoverColor || '#ffffff';
                            e.target.style.border = `1px solid ${colors.hover}`;
                          } else {
                            if (elementStyles.buttons.hoverBg) {
                              e.target.style.backgroundColor = elementStyles.buttons.hoverBg;
                            }
                            if (elementStyles.buttons.hoverColor) {
                              e.target.style.color = elementStyles.buttons.hoverColor;
                            }
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = elementStyles.buttons.primaryType === 'outlined' ? (elementStyles.buttons.primaryColor || (colors.button ? colors.button : '#3D57FF')) : (elementStyles.buttons.primaryColor || '#ffffff');
                          e.target.style.backgroundColor = elementStyles.buttons.primaryType === 'outlined' ? 'transparent' : (colors.button || '#3D57FF');
                          e.target.style.border = elementStyles.buttons.primaryType === 'solid' ? `1px solid ${colors.button || '#3D57FF'}` : `${elementStyles.buttons.primaryBorderWidth} ${elementStyles.buttons.primaryBorderStyle} ${elementStyles.buttons.primaryBorderColor === 'button' ? (colors.button || '#3D57FF') : elementStyles.buttons.primaryBorderColor}`;
                        }}
                      >
                        Book Now
                      </button>
                      <span style={{ fontSize: '11px', color: colors.body || '#999', opacity: 0.5 }}>Hover to preview hover state</span>
                    </div>
                  </div>
                  
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
                          background: elementStyles.buttons.primaryType === 'solid' ? '#3D57FF' : 'transparent',
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
                          background: elementStyles.buttons.primaryType === 'outlined' ? '#3D57FF' : 'transparent',
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
                          value={elementStyles.buttons.primaryColor && !isTransparent(elementStyles.buttons.primaryColor) ? elementStyles.buttons.primaryColor : '#000000'}
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
                            opacity: elementStyles.buttons.primaryColor && !isTransparent(elementStyles.buttons.primaryColor) ? 1 : 0,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        {isTransparent(elementStyles.buttons.primaryColor) && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            ...transparentCheckerboard,
                            pointerEvents: 'none'
                          }} />
                        )}
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
                          fontSize: '14px',
                        fontFamily: 'monospace'
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
                            color: '#3D57FF',
                            border: '1px solid #3D57FF',
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
                              fontSize: '14px',
                        fontFamily: 'monospace'
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
                              color: '#3D57FF',
                              border: '1px solid #3D57FF',
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

                  {/* Hover State Configuration */}
                  <div style={{ 
                    marginTop: '32px', 
                    padding: '20px', 
                    background: 'linear-gradient(135deg, #EEEAF7 0%, #F5F3FA 100%)', 
                    borderRadius: '12px',
                    border: '2px solid #2D1D81'
                  }}>
                    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>✨</span>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#2D1D81', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Hover State
                      </h4>
                    </div>

                    {/* Hover Type Selector */}
                    <div style={{ marginBottom: '24px' }}>
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
                            background: elementStyles.buttons.primaryHoverType === 'solid' ? '#3D57FF' : 'transparent',
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
                            background: elementStyles.buttons.primaryHoverType === 'outlined' ? '#3D57FF' : 'transparent',
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
                          value={elementStyles.buttons.hoverColor && !isTransparent(elementStyles.buttons.hoverColor) ? elementStyles.buttons.hoverColor : '#000000'}
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
                            opacity: elementStyles.buttons.hoverColor && !isTransparent(elementStyles.buttons.hoverColor) ? 1 : 0,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        {isTransparent(elementStyles.buttons.hoverColor) && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            ...transparentCheckerboard,
                            pointerEvents: 'none'
                          }} />
                        )}
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
                          fontSize: '14px',
                        fontFamily: 'monospace'
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
                            color: '#3D57FF',
                            border: '1px solid #3D57FF',
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
                              fontSize: '14px',
                        fontFamily: 'monospace'
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
                              color: '#3D57FF',
                              border: '1px solid #3D57FF',
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

                  {/* Hover Transition */}
                  <div style={{ marginTop: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Hover Transition
                    </label>
                    <select
                      value={elementStyles.buttons.primaryTransition}
                      onChange={(e) => setElementStyles({
                        ...elementStyles,
                        buttons: { ...elementStyles.buttons, primaryTransition: e.target.value }
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
                  </div>{/* End Hover State Container */}
                </div>

                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#333333' }}>Secondary Button</h3>
                  
                  {/* Live Preview */}
                  <div style={{ 
                    marginBottom: '24px', 
                    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                    borderRadius: '16px',
                    padding: '4px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset'
                  }}>
                    {/* Browser-like header */}
                    <div style={{
                      background: 'linear-gradient(180deg, #2d2d44 0%, #252538 100%)',
                      borderRadius: '12px 12px 0 0',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28ca42' }} />
                      </div>
                      <div style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        color: '#888',
                        fontFamily: 'monospace',
                        marginLeft: '8px'
                      }}>
                        booking.anyroad.com/experiences
                      </div>
                    </div>
                    {/* Preview content area */}
                    <div style={{ 
                      background: colors.background || '#ffffff',
                      borderRadius: '0 0 12px 12px',
                      padding: '32px',
                      minHeight: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px'
                    }}>
                      <div style={{ 
                        fontSize: '11px', 
                        fontWeight: '600', 
                        color: colors.body || '#666', 
                        textTransform: 'uppercase', 
                        letterSpacing: '1.5px',
                        opacity: 0.6
                      }}>
                        Secondary Button Preview
                      </div>
                      <button
                        style={{
                          fontFamily: typography.buttonFont ? buildFontStack(typography.buttonFont, getFontFallback(typography.buttonFont)) : 'inherit',
                          fontWeight: typography.buttonFontWeight || 'normal',
                          color: elementStyles.buttons.secondaryType === 'solid' ? (elementStyles.buttons.secondaryColor || '#ffffff') : (elementStyles.buttons.secondaryColor || (colors.button ? colors.button : '#3D57FF')),
                          background: elementStyles.buttons.secondaryType === 'solid' ? (elementStyles.buttons.secondaryBg || colors.button || '#3D57FF') : (colors.background || 'transparent'),
                          borderRadius: elementStyles.buttons.secondaryBorderRadius || '8px',
                          textTransform: typography.textTransform !== 'none' ? typography.textTransform : 'none',
                          lineHeight: typography.buttonLineHeight || 'normal',
                          fontSize: typography.buttonFontSize || '14px',
                          letterSpacing: typography.buttonLetterSpacing || 'normal',
                          border: elementStyles.buttons.secondaryType === 'solid' ? `1px solid ${elementStyles.buttons.secondaryBg || colors.button || '#3D57FF'}` : `${elementStyles.buttons.secondaryBorderWidth} ${elementStyles.buttons.secondaryBorderStyle} ${elementStyles.buttons.secondaryBorderColor || (colors.button ? colors.button : '#3D57FF')}`,
                          padding: '12px 32px',
                          cursor: 'pointer',
                          ...(elementStyles.buttons.secondaryTransition && elementStyles.buttons.secondaryTransition !== 'none' ? { transition: elementStyles.buttons.secondaryTransition } : {})
                        }}
                        onMouseEnter={(e) => {
                          if (elementStyles.buttons.secondaryHoverType === 'solid' && (colors.button || colors.hover)) {
                            e.target.style.backgroundColor = elementStyles.buttons.secondaryHoverBg || colors.button || '#3D57FF';
                            e.target.style.color = elementStyles.buttons.secondaryHoverColor || '#ffffff';
                            e.target.style.border = `1px solid ${elementStyles.buttons.secondaryHoverBg || colors.button || colors.hover || '#3D57FF'}`;
                          } else if (elementStyles.buttons.secondaryHoverType === 'outlined' && colors.button) {
                            e.target.style.color = elementStyles.buttons.secondaryHoverColor || (colors.button || '#3D57FF');
                            e.target.style.border = `${elementStyles.buttons.secondaryHoverBorderWidth} ${elementStyles.buttons.secondaryHoverBorderStyle} ${colors.button}`;
                          } else {
                            if (elementStyles.buttons.secondaryHoverBg) {
                              e.target.style.backgroundColor = elementStyles.buttons.secondaryHoverBg;
                            }
                            if (elementStyles.buttons.secondaryHoverColor) {
                              e.target.style.color = elementStyles.buttons.secondaryHoverColor;
                            }
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = elementStyles.buttons.secondaryType === 'solid' ? (elementStyles.buttons.secondaryColor || '#ffffff') : (elementStyles.buttons.secondaryColor || (colors.button ? colors.button : '#3D57FF'));
                          e.target.style.backgroundColor = elementStyles.buttons.secondaryType === 'solid' ? (elementStyles.buttons.secondaryBg || colors.button || '#3D57FF') : (colors.background || 'transparent');
                          e.target.style.border = elementStyles.buttons.secondaryType === 'solid' ? `1px solid ${elementStyles.buttons.secondaryBg || colors.button || '#3D57FF'}` : `${elementStyles.buttons.secondaryBorderWidth} ${elementStyles.buttons.secondaryBorderStyle} ${elementStyles.buttons.secondaryBorderColor || (colors.button ? colors.button : '#3D57FF')}`;
                        }}
                      >
                        View Details
                      </button>
                      <span style={{ fontSize: '11px', color: colors.body || '#999', opacity: 0.5 }}>Hover to preview hover state</span>
                    </div>
                  </div>
                  
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
                          background: elementStyles.buttons.secondaryType === 'solid' ? '#3D57FF' : 'transparent',
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
                          background: elementStyles.buttons.secondaryType === 'outlined' ? '#3D57FF' : 'transparent',
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
                          value={(() => {
                            const val = elementStyles.buttons.secondaryColor || (elementStyles.buttons.secondaryType === 'solid' ? '#ffffff' : colors.button) || '#000000';
                            return isTransparent(val) ? '#000000' : val;
                          })()}
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
                            opacity: (elementStyles.buttons.secondaryColor || elementStyles.buttons.secondaryType === 'solid' || colors.button) && !isTransparent(elementStyles.buttons.secondaryColor) ? 1 : 0,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        {isTransparent(elementStyles.buttons.secondaryColor) && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            ...transparentCheckerboard,
                            pointerEvents: 'none'
                          }} />
                        )}
                        {!(elementStyles.buttons.secondaryColor || elementStyles.buttons.secondaryType === 'solid' || colors.button) && (
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
                          placeholder={elementStyles.buttons.secondaryType === 'solid' ? '#ffffff' : (colors.button || '#000000')}
                          style={{
                            width: '100%',
                            minWidth: 0,
                            boxSizing: 'border-box',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px',
                        fontFamily: 'monospace',
                            fontFamily: 'monospace'
                          }}
                        />
                        <div style={{
                          fontSize: '11px',
                          color: '#999',
                          marginTop: '4px'
                        }}>
                          {elementStyles.buttons.secondaryColor ? 'Custom override' : `Default: ${elementStyles.buttons.secondaryType === 'solid' ? '#ffffff' : (colors.button || 'button color')}`}
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
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                          <input
                            type="color"
                            value={(() => {
                              const val = elementStyles.buttons.secondaryBg || colors.button || '#000000';
                              return isTransparent(val) ? '#000000' : val;
                            })()}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              buttons: { ...elementStyles.buttons, secondaryBg: e.target.value }
                            })}
                            style={{
                              width: '100%',
                              height: '100%',
                              border: '2px solid #ddd',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              opacity: (elementStyles.buttons.secondaryBg || colors.button) && !isTransparent(elementStyles.buttons.secondaryBg) ? 1 : 0,
                              position: 'absolute',
                              top: 0,
                              left: 0
                            }}
                          />
                          {isTransparent(elementStyles.buttons.secondaryBg) && (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              border: '2px solid #ddd',
                              borderRadius: '6px',
                              ...transparentCheckerboard,
                              pointerEvents: 'none'
                            }} />
                          )}
                          {!(elementStyles.buttons.secondaryBg || colors.button) && (
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
                            value={elementStyles.buttons.secondaryBg}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              buttons: { ...elementStyles.buttons, secondaryBg: e.target.value }
                            })}
                            placeholder={colors.button || 'var(--color-button)'}
                            style={{
                              width: '100%',
                              minWidth: 0,
                              boxSizing: 'border-box',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px',
                        fontFamily: 'monospace',
                              fontFamily: 'monospace'
                            }}
                          />
                          <div style={{
                            fontSize: '11px',
                            color: '#999',
                            marginTop: '4px'
                          }}>
                            {elementStyles.buttons.secondaryBg ? 'Custom override' : `Default: ${colors.button || 'button color'}`}
                          </div>
                        </div>
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
                              fontSize: '14px',
                        fontFamily: 'monospace'
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
                              value={(() => {
                                const val = elementStyles.buttons.secondaryBorderColor || colors.button || '#000000';
                                return isTransparent(val) ? '#000000' : val;
                              })()}
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
                                opacity: (elementStyles.buttons.secondaryBorderColor || colors.button) && !isTransparent(elementStyles.buttons.secondaryBorderColor) ? 1 : 0,
                                position: 'absolute',
                                top: 0,
                                left: 0
                              }}
                            />
                            {isTransparent(elementStyles.buttons.secondaryBorderColor) && (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                border: '2px solid #ddd',
                                borderRadius: '6px',
                                ...transparentCheckerboard,
                                pointerEvents: 'none'
                              }} />
                            )}
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
                                minWidth: 0,
                                boxSizing: 'border-box',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '14px',
                        fontFamily: 'monospace',
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

                  {/* Hover State Configuration */}
                  <div style={{ 
                    marginTop: '32px', 
                    padding: '20px', 
                    background: 'linear-gradient(135deg, #EEEAF7 0%, #F5F3FA 100%)', 
                    borderRadius: '12px',
                    border: '2px solid #2D1D81'
                  }}>
                    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>✨</span>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#2D1D81', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Hover State
                      </h4>
                    </div>

                    {/* Hover Type Selector */}
                    <div style={{ marginBottom: '24px' }}>
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
                            background: elementStyles.buttons.secondaryHoverType === 'solid' ? '#3D57FF' : 'transparent',
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
                            background: elementStyles.buttons.secondaryHoverType === 'outlined' ? '#3D57FF' : 'transparent',
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
                          value={(() => {
                            const val = elementStyles.buttons.secondaryHoverColor || (elementStyles.buttons.secondaryHoverType === 'solid' ? '#ffffff' : (colors.button || '#000000'));
                            return isTransparent(val) ? '#000000' : val;
                          })()}
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
                            opacity: (elementStyles.buttons.secondaryHoverColor || elementStyles.buttons.secondaryHoverType === 'solid' || colors.button) && !isTransparent(elementStyles.buttons.secondaryHoverColor) ? 1 : 0,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        {isTransparent(elementStyles.buttons.secondaryHoverColor) && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            ...transparentCheckerboard,
                            pointerEvents: 'none'
                          }} />
                        )}
                        {!(elementStyles.buttons.secondaryHoverColor || elementStyles.buttons.secondaryHoverType === 'solid' || colors.button) && (
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
                          value={elementStyles.buttons.secondaryHoverColor}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            buttons: { ...elementStyles.buttons, secondaryHoverColor: e.target.value }
                          })}
                          placeholder={elementStyles.buttons.secondaryHoverType === 'solid' ? '#ffffff' : (colors.button || '#000000')}
                          style={{
                            width: '100%',
                            minWidth: 0,
                            boxSizing: 'border-box',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px',
                        fontFamily: 'monospace',
                            fontFamily: 'monospace'
                          }}
                        />
                        <div style={{
                          fontSize: '11px',
                          color: '#999',
                          marginTop: '4px'
                        }}>
                          {elementStyles.buttons.secondaryHoverColor ? 'Custom override' : elementStyles.buttons.secondaryHoverType === 'solid' ? 'Default: #ffffff' : `Default: ${colors.button || 'button color'}`}
                        </div>
                      </div>
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
                            value={(() => {
                              const val = elementStyles.buttons.secondaryHoverBg || colors.button || '#000000';
                              return isTransparent(val) ? '#000000' : val;
                            })()}
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
                              opacity: (elementStyles.buttons.secondaryHoverBg || colors.button) && !isTransparent(elementStyles.buttons.secondaryHoverBg) ? 1 : 0,
                              position: 'absolute',
                              top: 0,
                              left: 0
                            }}
                          />
                          {isTransparent(elementStyles.buttons.secondaryHoverBg) && (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              border: '2px solid #ddd',
                              borderRadius: '6px',
                              ...transparentCheckerboard,
                              pointerEvents: 'none'
                            }} />
                          )}
                          {!(elementStyles.buttons.secondaryHoverBg || colors.button) && (
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
                            value={elementStyles.buttons.secondaryHoverBg}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              buttons: { ...elementStyles.buttons, secondaryHoverBg: e.target.value }
                            })}
                            placeholder={colors.button || 'var(--color-button)'}
                            style={{
                              width: '100%',
                              minWidth: 0,
                              boxSizing: 'border-box',
                              padding: '10px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '14px',
                        fontFamily: 'monospace',
                              fontFamily: 'monospace'
                            }}
                          />
                          <div style={{
                            fontSize: '11px',
                            color: '#999',
                            marginTop: '4px'
                          }}>
                            {elementStyles.buttons.secondaryHoverBg ? 'Custom override' : `Default: ${colors.button || 'button color'}`}
                          </div>
                        </div>
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
                              fontSize: '14px',
                        fontFamily: 'monospace'
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
                              color: '#3D57FF',
                              border: '1px solid #3D57FF',
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

                  {/* Hover Transition */}
                  <div style={{ marginTop: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Hover Transition
                    </label>
                    <select
                      value={elementStyles.buttons.secondaryTransition}
                      onChange={(e) => setElementStyles({
                        ...elementStyles,
                        buttons: { ...elementStyles.buttons, secondaryTransition: e.target.value }
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
                  </div>{/* End Hover State Container */}
                </div>
              </div>

              {/* ============================================ */}
              {/* ADVANCED BUTTON SETTINGS - COLLAPSIBLE */}
              {/* ============================================ */}
              <div style={{
                background: '#EEEAF7',
                border: '2px solid #2D1D81',
                borderRadius: '16px',
                marginTop: '32px',
                overflow: 'hidden'
              }}>
                {/* Collapsible Header */}
                <div 
                  onClick={() => setAdvancedButtonsExpanded(!advancedButtonsExpanded)}
                  style={{
                    padding: '24px 32px',
                    cursor: 'pointer',
                    background: advancedButtonsExpanded ? '#E4DFF2' : '#EEEAF7',
                    borderBottom: advancedButtonsExpanded ? '2px solid #2D1D81' : 'none',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '24px', lineHeight: '1' }}>⚙️</div>
                    <div>
                      <h3 style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: '20px', 
                        color: '#2D1D81', 
                        fontWeight: '700'
                      }}>
                        Advanced Button Settings
                      </h3>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '14px', 
                        color: '#2D1D81', 
                        lineHeight: '1.4' 
                      }}>
                        Optional fine-tuning for mobile buttons and purchase CTA
                      </p>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '24px',
                    color: '#2D1D81',
                    transform: advancedButtonsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}>
                    ▼
                  </div>
                </div>

                {/* Collapsible Content */}
                {advancedButtonsExpanded && (
                  <div style={{ padding: '32px' }}>
                    
                    {/* Mobile Experience List Button */}
                    <div style={{
                      background: '#ffffff',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '24px',
                      marginBottom: '24px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        marginBottom: '20px'
                      }}>
                        <div style={{ fontSize: '20px', lineHeight: '1' }}>📱</div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ 
                            margin: '0 0 8px 0', 
                            fontSize: '18px', 
                            color: '#333', 
                            fontWeight: '600'
                          }}>
                            Mobile Experience List Button
                          </h4>
                          <p style={{ 
                            margin: 0, 
                            fontSize: '13px', 
                            color: '#666', 
                            lineHeight: '1.6' 
                          }}>
                            Fine-tune the "Book Now" button dimensions on the Experience List page for mobile devices (600px and below). 
                            These settings only apply to mobile view and don't affect other button styles.
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                        {[
                          { key: 'mobileListButtonWidth', label: 'Width', placeholder: '250px' },
                          { key: 'mobileListButtonHeight', label: 'Height', placeholder: '50px' },
                          { key: 'mobileListButtonMarginTop', label: 'Margin Top', placeholder: '16px' },
                          { key: 'mobileListButtonMarginLeft', label: 'Margin Left', placeholder: '-2px' },
                          { key: 'mobileListButtonPaddingTop', label: 'Padding Top', placeholder: '10px' }
                        ].map(field => (
                          <div key={field.key} style={{ 
                            background: '#f9f9f9', 
                            padding: '16px', 
                            borderRadius: '8px',
                            border: '1px solid #ddd'
                          }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555', fontSize: '13px' }}>
                              {field.label}
                            </label>
                            <input
                              type="text"
                              value={elementStyles.buttons[field.key]}
                              onChange={(e) => setElementStyles({
                                ...elementStyles,
                                buttons: { ...elementStyles.buttons, [field.key]: e.target.value }
                              })}
                              placeholder={field.placeholder}
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
                        ))}
                      </div>
                    </div>

                    {/* Purchase CTA Button */}
                    <div style={{
                      background: '#ffffff',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '24px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        marginBottom: '20px'
                      }}>
                        <div style={{ fontSize: '20px', lineHeight: '1' }}>🛒</div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ 
                            margin: '0 0 8px 0', 
                            fontSize: '18px', 
                            color: '#333', 
                            fontWeight: '600'
                          }}>
                            Purchase CTA Button
                          </h4>
                          <p style={{ 
                            margin: 0, 
                            fontSize: '13px', 
                            color: '#666', 
                            lineHeight: '1.6' 
                          }}>
                            Fine-tune the purchase/confirmation CTA for guest checkout.
                          </p>
                        </div>
                      </div>

                      <div style={{ 
                        background: '#f9f9f9', 
                        padding: '20px', 
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        maxWidth: '250px'
                      }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555', fontSize: '14px' }}>
                          Button Height
                        </label>
                        <input
                          type="text"
                          value={elementStyles.buttons.purchaseButtonHeight}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            buttons: { ...elementStyles.buttons, purchaseButtonHeight: e.target.value }
                          })}
                          placeholder="e.g., 50px"
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
                    </div>

                  </div>
                )}
              </div>
            </div>
          )}

          {/* Elements Section */}
          {activeSection === 'elements' && (
            <div>
              <h2 style={{ marginBottom: '32px', fontSize: '24px', color: '#333' }}>Element Styles</h2>
              
              {/* ============================================ */}
              {/* INPUT FIELDS SECTION */}
              {/* ============================================ */}
              <div style={{
                background: '#ffffff',
                border: '2px solid #e0e0e0',
                borderRadius: '16px',
                padding: '32px',
                marginBottom: '32px'
              }}>
                <h3 style={{ 
                  margin: '0 0 24px 0', 
                  fontSize: '20px', 
                  color: '#333', 
                  fontWeight: '600',
                  paddingBottom: '16px',
                  borderBottom: '2px solid #f0f0f0'
                }}>
                  📋 Input Fields
                </h3>
                
                {/* Accessibility Warning */}
                <div style={{
                  background: '#fff3cd',
                  border: '2px solid #ffc107',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <div style={{ fontSize: '24px', lineHeight: '1' }}>⚠️</div>
                    <div>
                      <div style={{
                        fontWeight: '700',
                        fontSize: '16px',
                        color: '#856404',
                        marginBottom: '8px'
                      }}>
                        Accessibility Notice
                      </div>
                      <div style={{
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#856404'
                      }}>
                        Customizing input fields is generally not recommended to ensure accessibility compliance. 
                        Only customize these fields if completely necessary. Default browser styles provide the 
                        best accessibility and user experience across different assistive technologies.
                      </div>
                    </div>
                  </div>
                </div>

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
                            value={elementStyles.inputs[field.key] && !isTransparent(elementStyles.inputs[field.key]) ? elementStyles.inputs[field.key] : '#000000'}
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
                              opacity: elementStyles.inputs[field.key] && !isTransparent(elementStyles.inputs[field.key]) ? 1 : 0,
                              position: 'absolute',
                              top: 0,
                              left: 0
                            }}
                          />
                          {isTransparent(elementStyles.inputs[field.key]) && (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              border: '2px solid #ddd',
                              borderRadius: '8px',
                              ...transparentCheckerboard,
                              pointerEvents: 'none'
                            }} />
                          )}
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
                            fontSize: '14px',
                        fontFamily: 'monospace'
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
                        placeholder="e.g., 4px"
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
                    )}
                  </div>
                ))}
              </div>
              </div>

              {/* ============================================ */}
              {/* LISTS SECTION */}
              {/* ============================================ */}
              <div style={{
                background: '#ffffff',
                border: '2px solid #e0e0e0',
                borderRadius: '16px',
                padding: '32px',
                marginBottom: '32px'
              }}>
                <h3 style={{ 
                  margin: '0 0 24px 0', 
                  fontSize: '20px', 
                  color: '#333', 
                  fontWeight: '600',
                  paddingBottom: '16px',
                  borderBottom: '2px solid #f0f0f0'
                }}>
                  📄 Lists
                </h3>
                
                {/* Background Color - special two-input component */}
              <div style={{ 
                background: '#f9f9f9', 
                padding: '20px', 
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                marginBottom: '20px'
              }}>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#555' }}>
                  Background Color
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                    <input
                      type="color"
                      value={(() => {
                        const val = elementStyles.lists.backgroundColor || colors.background || '#FFFFFF';
                        return isTransparent(val) ? '#000000' : val;
                      })()}
                      onChange={(e) => setElementStyles({
                        ...elementStyles,
                        lists: { ...elementStyles.lists, backgroundColor: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: '2px solid #ddd',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        opacity: (elementStyles.lists.backgroundColor || colors.background) && !isTransparent(elementStyles.lists.backgroundColor) ? 1 : 0,
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                    />
                    {isTransparent(elementStyles.lists.backgroundColor) && (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        border: '2px solid #ddd',
                        borderRadius: '6px',
                        ...transparentCheckerboard,
                        pointerEvents: 'none'
                      }} />
                    )}
                    {!(elementStyles.lists.backgroundColor || colors.background) && (
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
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      value={elementStyles.lists.backgroundColor}
                      onChange={(e) => setElementStyles({
                        ...elementStyles,
                        lists: { ...elementStyles.lists, backgroundColor: e.target.value }
                      })}
                      placeholder={colors.background || 'var(--color-background)'}
                      style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        fontFamily: 'monospace'
                      }}
                    />
                    <small style={{ fontSize: '12px', color: '#888' }}>
                      {elementStyles.lists.backgroundColor ? 'Custom override' : `Default: ${colors.background || 'background color'}`}
                    </small>
                  </div>
                </div>
              </div>

              {/* Padding, Margin, List Style row */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ 
                  flex: 1,
                  background: '#f9f9f9', 
                  padding: '20px', 
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#555' }}>
                    Padding
                  </label>
                  <input
                    type="text"
                    value={elementStyles.lists.padding}
                    onChange={(e) => setElementStyles({
                      ...elementStyles,
                      lists: { ...elementStyles.lists, padding: e.target.value }
                    })}
                    placeholder="e.g., 4px 8px"
                    style={{
                      width: '100%',
                      minWidth: 0,
                      boxSizing: 'border-box',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                        fontFamily: 'monospace',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <div style={{ 
                  flex: 1,
                  background: '#f9f9f9', 
                  padding: '20px', 
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#555' }}>
                    Margin
                  </label>
                  <input
                    type="text"
                    value={elementStyles.lists.margin}
                    onChange={(e) => setElementStyles({
                      ...elementStyles,
                      lists: { ...elementStyles.lists, margin: e.target.value }
                    })}
                    placeholder="e.g., 4px 0"
                    style={{
                      width: '100%',
                      minWidth: 0,
                      boxSizing: 'border-box',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                        fontFamily: 'monospace',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <div style={{ 
                  flex: 1,
                  background: '#f9f9f9', 
                  padding: '20px', 
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#555' }}>
                    List Style
                  </label>
                  <select
                    value={elementStyles.lists.listStyle}
                    onChange={(e) => setElementStyles({
                      ...elementStyles,
                      lists: { ...elementStyles.lists, listStyle: e.target.value }
                    })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'white'
                    }}
                  >
                    <option value="Default">Default</option>
                    <option value="none">None</option>
                    <option value="disc">Disc</option>
                    <option value="circle">Circle</option>
                    <option value="square">Square</option>
                    <option value="decimal">Decimal</option>
                  </select>
                </div>
              </div>
              </div>

              {/* ============================================ */}
              {/* EXPERIENCE LIST CARD SECTION */}
              {/* ============================================ */}
              <div style={{
                background: '#ffffff',
                border: '2px solid #e0e0e0',
                borderRadius: '16px',
                padding: '32px',
                marginBottom: '32px'
              }}>
                <h3 style={{ 
                  margin: '0 0 24px 0', 
                  fontSize: '20px', 
                  color: '#333', 
                  fontWeight: '600',
                  paddingBottom: '16px',
                  borderBottom: '2px solid #f0f0f0'
                }}>
                  🎫 Experience List Card
                </h3>
                
                <div style={{ 
                background: '#f9f9f9', 
                padding: '20px', 
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                marginBottom: '20px'
              }}>
                <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                  <div style={{ flex: '0 0 140px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Border Width
                    </label>
                    <input
                      type="text"
                      value={elementStyles.experienceCard.borderWidth}
                      onChange={(e) => setElementStyles({
                        ...elementStyles,
                        experienceCard: { ...elementStyles.experienceCard, borderWidth: e.target.value }
                      })}
                      placeholder="1px"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Border Style
                    </label>
                    <select
                      value={elementStyles.experienceCard.borderStyle}
                      onChange={(e) => setElementStyles({
                        ...elementStyles,
                        experienceCard: { ...elementStyles.experienceCard, borderStyle: e.target.value }
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
                      <option value="none">None</option>
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
                        value={(() => {
                          const val = elementStyles.experienceCard.borderColor || colors.button || '#000000';
                          return isTransparent(val) ? '#000000' : val;
                        })()}
                        onChange={(e) => setElementStyles({
                          ...elementStyles,
                          experienceCard: { ...elementStyles.experienceCard, borderColor: e.target.value }
                        })}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: '2px solid #ddd',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          opacity: (elementStyles.experienceCard.borderColor || colors.button) && !isTransparent(elementStyles.experienceCard.borderColor) ? 1 : 0,
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                      />
                      {isTransparent(elementStyles.experienceCard.borderColor) && (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          border: '2px solid #ddd',
                          borderRadius: '6px',
                          ...transparentCheckerboard,
                          pointerEvents: 'none'
                        }} />
                      )}
                      {!(elementStyles.experienceCard.borderColor || colors.button) && (
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
                        value={elementStyles.experienceCard.borderColor}
                        onChange={(e) => setElementStyles({
                          ...elementStyles,
                          experienceCard: { ...elementStyles.experienceCard, borderColor: e.target.value }
                        })}
                        placeholder={colors.button || 'var(--color-button)'}
                        style={{
                          width: '100%',
                          minWidth: 0,
                          boxSizing: 'border-box',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                        fontFamily: 'monospace',
                          fontFamily: 'monospace'
                        }}
                      />
                      <div style={{
                        fontSize: '11px',
                        color: '#999',
                        marginTop: '4px'
                      }}>
                        {elementStyles.experienceCard.borderColor ? 'Custom override' : `Default: ${colors.button || 'button color'}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>

              {/* ============================================ */}
              {/* AT A GLANCE SECTION */}
              {/* ============================================ */}
              <div style={{
                background: '#ffffff',
                border: '2px solid #e0e0e0',
                borderRadius: '16px',
                padding: '32px',
                marginBottom: '32px'
              }}>
                <h3 style={{ 
                  margin: '0 0 24px 0', 
                  fontSize: '20px', 
                  color: '#333', 
                  fontWeight: '600',
                  paddingBottom: '16px',
                  borderBottom: '2px solid #f0f0f0'
                }}>
                  👁️ At A Glance
                </h3>
                
                <div style={{ 
                  background: '#f9f9f9', 
                  padding: '20px', 
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#555' }}>
                    Zebra Striping Background Color
                  </label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                      <input
                        type="color"
                        value={elementStyles.atAGlance.zebraStripingColor && !isTransparent(elementStyles.atAGlance.zebraStripingColor) ? elementStyles.atAGlance.zebraStripingColor : '#f6f6f6'}
                        onChange={(e) => setElementStyles({
                          ...elementStyles,
                          atAGlance: { ...elementStyles.atAGlance, zebraStripingColor: e.target.value }
                        })}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: '2px solid #ddd',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          opacity: elementStyles.atAGlance.zebraStripingColor && !isTransparent(elementStyles.atAGlance.zebraStripingColor) ? 1 : 0,
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                      />
                      {isTransparent(elementStyles.atAGlance.zebraStripingColor) && (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          border: '2px solid #ddd',
                          borderRadius: '6px',
                          ...transparentCheckerboard,
                          pointerEvents: 'none'
                        }} />
                      )}
                      {!elementStyles.atAGlance.zebraStripingColor && (
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
                      value={elementStyles.atAGlance.zebraStripingColor}
                      onChange={(e) => setElementStyles({
                        ...elementStyles,
                        atAGlance: { ...elementStyles.atAGlance, zebraStripingColor: e.target.value }
                      })}
                      placeholder="e.g., #f6f6f6"
                      style={{
                        flex: 1,
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

              {/* ============================================ */}
              {/* DIVIDERS SECTION */}
              {/* ============================================ */}
              <div style={{
                background: '#ffffff',
                border: '2px solid #e0e0e0',
                borderRadius: '16px',
                padding: '32px',
                marginBottom: '32px'
              }}>
                <h3 style={{ 
                  margin: '0 0 24px 0', 
                  fontSize: '20px', 
                  color: '#333', 
                  fontWeight: '600',
                  paddingBottom: '16px',
                  borderBottom: '2px solid #f0f0f0'
                }}>
                  ➖ Dividers
                </h3>
                
                <div style={{ marginBottom: '16px', padding: '16px', background: '#EBF5FF', border: '1px solid #2E6AB3', borderRadius: '8px' }}>
                  <div style={{ fontSize: '13px', color: '#1E4A7D', lineHeight: '1.6' }}>
                    Configure the appearance of horizontal divider lines used throughout the booking experience to separate sections.
                  </div>
                </div>

                <div style={{ 
                  background: '#f9f9f9', 
                  padding: '20px', 
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  marginBottom: '20px'
                }}>
                  <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                    <div style={{ flex: '0 0 140px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                        Thickness
                      </label>
                      <input
                        type="text"
                        value={elementStyles.dividers.thickness}
                        onChange={(e) => setElementStyles({
                          ...elementStyles,
                          dividers: { ...elementStyles.dividers, thickness: e.target.value }
                        })}
                        placeholder="1px"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                        Style
                      </label>
                      <select
                        value={elementStyles.dividers.style}
                        onChange={(e) => setElementStyles({
                          ...elementStyles,
                          dividers: { ...elementStyles.dividers, style: e.target.value }
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
                      Color
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                        <input
                          type="color"
                          value={elementStyles.dividers.color && !isTransparent(elementStyles.dividers.color) ? elementStyles.dividers.color : '#e6e6e6'}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            dividers: { ...elementStyles.dividers, color: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            opacity: elementStyles.dividers.color && !isTransparent(elementStyles.dividers.color) ? 1 : 0,
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                        />
                        {isTransparent(elementStyles.dividers.color) && (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            ...transparentCheckerboard,
                            pointerEvents: 'none'
                          }} />
                        )}
                        {!elementStyles.dividers.color && (
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
                          value={elementStyles.dividers.color}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            dividers: { ...elementStyles.dividers, color: e.target.value }
                          })}
                          placeholder="e.g., #e6e6e6"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
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
              </div>

              {/* ============================================ */}
              {/* CHECKOUT SUMMARY SECTION */}
              {/* ============================================ */}
              <div style={{
                background: '#ffffff',
                border: '2px solid #e0e0e0',
                borderRadius: '16px',
                padding: '32px',
                marginBottom: '32px'
              }}>
                <h3 style={{ 
                  margin: '0 0 24px 0', 
                  fontSize: '20px', 
                  color: '#333', 
                  fontWeight: '600',
                  paddingBottom: '16px',
                  borderBottom: '2px solid #f0f0f0'
                }}>
                  🧾 Checkout Summary
                </h3>
                
                <div style={{ marginBottom: '16px', padding: '16px', background: '#EBF5FF', border: '1px solid #2E6AB3', borderRadius: '8px' }}>
                  <div style={{ fontSize: '13px', color: '#1E4A7D', lineHeight: '1.6' }}>
                    Configure the background color of the checkout summary section (order details, pricing breakdown).
                  </div>
                </div>

                <div style={{ 
                  background: '#f9f9f9', 
                  padding: '20px', 
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#555' }}>
                    Background Color
                  </label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                      <input
                        type="color"
                        value={elementStyles.checkoutSummary.backgroundColor && !isTransparent(elementStyles.checkoutSummary.backgroundColor) ? elementStyles.checkoutSummary.backgroundColor : '#f2f2f2'}
                        onChange={(e) => setElementStyles({
                          ...elementStyles,
                          checkoutSummary: { ...elementStyles.checkoutSummary, backgroundColor: e.target.value }
                        })}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: '2px solid #ddd',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          opacity: elementStyles.checkoutSummary.backgroundColor && !isTransparent(elementStyles.checkoutSummary.backgroundColor) ? 1 : 0,
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                      />
                      {isTransparent(elementStyles.checkoutSummary.backgroundColor) && (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          border: '2px solid #ddd',
                          borderRadius: '6px',
                          ...transparentCheckerboard,
                          pointerEvents: 'none'
                        }} />
                      )}
                      {!elementStyles.checkoutSummary.backgroundColor && (
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
                      value={elementStyles.checkoutSummary.backgroundColor}
                      onChange={(e) => setElementStyles({
                        ...elementStyles,
                        checkoutSummary: { ...elementStyles.checkoutSummary, backgroundColor: e.target.value }
                      })}
                      placeholder="e.g., #f2f2f2"
                      style={{
                        flex: 1,
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

                {/* Divider Color */}
                <div style={{ 
                  background: '#f9f9f9', 
                  padding: '20px', 
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  marginTop: '16px'
                }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#555' }}>
                    Divider Color
                  </label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
                      <input
                        type="color"
                        value={elementStyles.checkoutSummary.dividerColor && !isTransparent(elementStyles.checkoutSummary.dividerColor) ? elementStyles.checkoutSummary.dividerColor : '#ccc'}
                        onChange={(e) => setElementStyles({
                          ...elementStyles,
                          checkoutSummary: { ...elementStyles.checkoutSummary, dividerColor: e.target.value }
                        })}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: '2px solid #ddd',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          opacity: elementStyles.checkoutSummary.dividerColor && !isTransparent(elementStyles.checkoutSummary.dividerColor) ? 1 : 0,
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                      />
                      {isTransparent(elementStyles.checkoutSummary.dividerColor) && (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          border: '2px solid #ddd',
                          borderRadius: '6px',
                          ...transparentCheckerboard,
                          pointerEvents: 'none'
                        }} />
                      )}
                      {!elementStyles.checkoutSummary.dividerColor && (
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
                      value={elementStyles.checkoutSummary.dividerColor}
                      onChange={(e) => setElementStyles({
                        ...elementStyles,
                        checkoutSummary: { ...elementStyles.checkoutSummary, dividerColor: e.target.value }
                      })}
                      placeholder="e.g., #ccc"
                      style={{
                        flex: 1,
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

              {/* Beta Warning */}
              <div style={{
                background: '#e0e7ff',
                border: '2px solid #6366f1',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '24px', lineHeight: '1' }}>🚧</div>
                  <div>
                    <div style={{
                      fontWeight: '700',
                      fontSize: '16px',
                      color: '#2D1D81',
                      marginBottom: '8px'
                    }}>
                      Beta Feature - Under Development
                    </div>
                    <div style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#2D1D81'
                    }}>
                      Modal customization is still in beta and partially under development. This feature is not production-ready. 
                      Test thoroughly before deploying to live environments.
                    </div>
                  </div>
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
                  { key: 'textColor', label: 'Text Color', type: 'color' },
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
                            value={elementStyles.modals[field.key] && !isTransparent(elementStyles.modals[field.key]) ? elementStyles.modals[field.key] : '#000000'}
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
                              opacity: elementStyles.modals[field.key] && !isTransparent(elementStyles.modals[field.key]) ? 1 : 0,
                              position: 'absolute',
                              top: 0,
                              left: 0
                            }}
                          />
                          {isTransparent(elementStyles.modals[field.key]) && (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              border: '2px solid #ddd',
                              borderRadius: '8px',
                              ...transparentCheckerboard,
                              pointerEvents: 'none'
                            }} />
                          )}
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
                            fontSize: '14px',
                        fontFamily: 'monospace'
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
                        placeholder={field.key === 'padding' ? 'e.g., 16px' : ''}
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
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Advanced CSS Section */}
          {activeSection === 'advanced' && (
            <div>
              <h2 style={{ marginBottom: '24px', fontSize: '24px', color: '#333' }}>Advanced CSS Options</h2>
              
              <div style={{
                background: '#EBF5FF',
                border: '2px solid #2E6AB3',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '24px', lineHeight: '1' }}>ℹ️</div>
                  <div>
                    <div style={{
                      fontWeight: '700',
                      fontSize: '16px',
                      color: '#1E4A7D',
                      marginBottom: '8px'
                    }}>
                      About Advanced CSS
                    </div>
                    <div style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#1E4A7D'
                    }}>
                      These are pre-configured CSS fixes for common styling issues. Enable only the fixes you need.
                    </div>
                  </div>
                </div>
              </div>

              {/* Plugin Margin Fix Toggle */}
              <div style={{
                background: '#f9f9f9',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333', fontWeight: '600' }}>
                      Plugin Margin Fix
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                      Fixes vertical spacing issue for the main plugin container. Redefines 14px top margin to close the visible gap.
                    </p>
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: '#f0f0f0',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#555'
                    }}>
                      <div style={{ marginBottom: '4px', fontWeight: '600' }}>Selector:</div>
                      <div style={{ color: '#3D57FF' }}>#plugins-wrapper&gt;div.ui.equal.height.grid.stackable.tour-page</div>
                      <div style={{ marginTop: '8px', marginBottom: '4px', fontWeight: '600' }}>Properties:</div>
                      <div style={{ color: '#3D57FF' }}>margin-top: 14px !important;</div>
                    </div>
                  </div>
                  <div style={{ marginLeft: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div onClick={() => setAdvancedCSS({ 
                      ...advancedCSS, 
                      pluginMarginFix: !advancedCSS.pluginMarginFix 
                    })}
                      style={{ 
                        width: '50px', 
                        height: '28px', 
                        background: advancedCSS.pluginMarginFix ? '#22c55e' : '#ddd',
                        borderRadius: '14px', 
                        position: 'relative', 
                        cursor: 'pointer', 
                        transition: 'background 0.3s' 
                      }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        background: 'white', 
                        borderRadius: '50%',
                        position: 'absolute', 
                        top: '4px', 
                        left: advancedCSS.pluginMarginFix ? '26px' : '4px',
                        transition: 'left 0.3s', 
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                      }} />
                    </div>
                    <span style={{ 
                      fontSize: '14px', 
                      color: advancedCSS.pluginMarginFix ? '#22c55e' : '#999', 
                      fontWeight: '600',
                      minWidth: '40px'
                    }}>
                      {advancedCSS.pluginMarginFix ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Auto-Expand Experience Description Toggle */}
              <div style={{
                background: '#f9f9f9',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333', fontWeight: '600' }}>
                      Auto-Expand Experience Description
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                      Removes the "more" link and automatically displays the full experience description on both desktop and mobile.
                    </p>
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: '#f0f0f0',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#555'
                    }}>
                      <div style={{ marginBottom: '4px', fontWeight: '600' }}>Selector:</div>
                      <div style={{ color: '#3D57FF' }}>.TourPage-About-description</div>
                      <div style={{ marginTop: '8px', marginBottom: '4px', fontWeight: '600' }}>Properties:</div>
                      <div style={{ color: '#3D57FF' }}>height: auto !important;</div>
                      <div style={{ marginTop: '8px', marginBottom: '4px', fontWeight: '600' }}>Also hides:</div>
                      <div style={{ color: '#3D57FF' }}>.TourPage-About-description:after, .TourPage-About-description-more</div>
                    </div>
                  </div>
                  <div style={{ marginLeft: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div onClick={() => setAdvancedCSS({ 
                      ...advancedCSS, 
                      autoExpandDescription: !advancedCSS.autoExpandDescription 
                    })}
                      style={{ 
                        width: '50px', 
                        height: '28px', 
                        background: advancedCSS.autoExpandDescription ? '#22c55e' : '#ddd',
                        borderRadius: '14px', 
                        position: 'relative', 
                        cursor: 'pointer', 
                        transition: 'background 0.3s' 
                      }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        background: 'white', 
                        borderRadius: '50%',
                        position: 'absolute', 
                        top: '4px', 
                        left: advancedCSS.autoExpandDescription ? '26px' : '4px',
                        transition: 'left 0.3s', 
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                      }} />
                    </div>
                    <span style={{ 
                      fontSize: '14px', 
                      color: advancedCSS.autoExpandDescription ? '#22c55e' : '#999', 
                      fontWeight: '600',
                      minWidth: '40px'
                    }}>
                      {advancedCSS.autoExpandDescription ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Guide Alignment Fix Toggle */}
              <div style={{
                background: '#f9f9f9',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333', fontWeight: '600' }}>
                      Contact Guide Button Alignment Fix
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                      Fixes alignment issue for the Contact Us button when using custom fonts. Ensures text displays inline properly.
                    </p>
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: '#f0f0f0',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#555'
                    }}>
                      <div style={{ marginBottom: '4px', fontWeight: '600' }}>Selector:</div>
                      <div style={{ color: '#3D57FF' }}>.TourPage-ContactGuide-link.ui.basic.button .ContactGuide-link-text</div>
                      <div style={{ marginTop: '8px', marginBottom: '4px', fontWeight: '600' }}>Properties:</div>
                      <div style={{ color: '#3D57FF' }}>display: inline !important;</div>
                    </div>
                  </div>
                  <div style={{ marginLeft: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div onClick={() => setAdvancedCSS({ 
                      ...advancedCSS, 
                      contactGuideAlignment: !advancedCSS.contactGuideAlignment 
                    })}
                      style={{ 
                        width: '50px', 
                        height: '28px', 
                        background: advancedCSS.contactGuideAlignment ? '#22c55e' : '#ddd',
                        borderRadius: '14px', 
                        position: 'relative', 
                        cursor: 'pointer', 
                        transition: 'background 0.3s' 
                      }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        background: 'white', 
                        borderRadius: '50%',
                        position: 'absolute', 
                        top: '4px', 
                        left: advancedCSS.contactGuideAlignment ? '26px' : '4px',
                        transition: 'left 0.3s', 
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                      }} />
                    </div>
                    <span style={{ 
                      fontSize: '14px', 
                      color: advancedCSS.contactGuideAlignment ? '#22c55e' : '#999', 
                      fontWeight: '600',
                      minWidth: '40px'
                    }}>
                      {advancedCSS.contactGuideAlignment ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Checkout Title Color Fix Toggle */}
              <div style={{
                background: '#f9f9f9',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333', fontWeight: '600' }}>
                      Mobile Checkout Title Color Fix
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                      Ensures the experience title remains legible on mobile checkout by forcing white color. Recommended when you have a custom heading color applied that may not contrast well with the cover photo.
                    </p>
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: '#f0f0f0',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#555'
                    }}>
                      <div style={{ marginBottom: '4px', fontWeight: '600' }}>Selector:</div>
                      <div style={{ color: '#3D57FF' }}>.MobileCheckout-CoverPhoto span.text .title .name</div>
                      <div style={{ marginTop: '8px', marginBottom: '4px', fontWeight: '600' }}>Properties:</div>
                      <div style={{ color: '#3D57FF' }}>color: #ffffff !important;</div>
                    </div>
                  </div>
                  <div style={{ marginLeft: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div onClick={() => setAdvancedCSS({ 
                      ...advancedCSS, 
                      mobileCheckoutTitleColor: !advancedCSS.mobileCheckoutTitleColor 
                    })}
                      style={{ 
                        width: '50px', 
                        height: '28px', 
                        background: advancedCSS.mobileCheckoutTitleColor ? '#22c55e' : '#ddd',
                        borderRadius: '14px', 
                        position: 'relative', 
                        cursor: 'pointer', 
                        transition: 'background 0.3s' 
                      }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        background: 'white', 
                        borderRadius: '50%',
                        position: 'absolute', 
                        top: '4px', 
                        left: advancedCSS.mobileCheckoutTitleColor ? '26px' : '4px',
                        transition: 'left 0.3s', 
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                      }} />
                    </div>
                    <span style={{
                      fontWeight: '600',
                      fontSize: '14px',
                      color: advancedCSS.mobileCheckoutTitleColor ? '#22c55e' : '#999', 
                      transition: 'color 0.3s',
                      textAlign: 'right',
                      minWidth: '40px'
                    }}>
                      {advancedCSS.mobileCheckoutTitleColor ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Discount Code Button Height Fix Toggle */}
              <div style={{
                background: '#f9f9f9',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333', fontWeight: '600' }}>
                      Discount Code Button Height Fix
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '16px' }}>
                      Fixes the promo code button height that becomes too tall when a custom font is configured. Sets height to 47px.
                    </p>
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: '#f0f0f0',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#555'
                    }}>
                      <div style={{ marginBottom: '4px', fontWeight: '600' }}>Selector:</div>
                      <div style={{ color: '#3D57FF' }}>.DiscountCodeContainer .DiscountCode-Input .ui.button</div>
                      <div style={{ marginTop: '8px', marginBottom: '4px', fontWeight: '600' }}>Properties:</div>
                      <div style={{ color: '#3D57FF' }}>height: 47px !important;</div>
                    </div>
                    
                    {/* Font Size Override */}
                    <div style={{ marginTop: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555', fontSize: '14px' }}>
                        Font Size Override (Optional)
                      </label>
                      <input
                        type="text"
                        value={advancedCSS.discountCodeButtonFontSize}
                        onChange={(e) => setAdvancedCSS({
                          ...advancedCSS,
                          discountCodeButtonFontSize: e.target.value
                        })}
                        placeholder="e.g., 14px"
                        style={{
                          width: '100%',
                          maxWidth: '200px',
                          boxSizing: 'border-box',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>

                    {/* Padding Top Override */}
                    <div style={{ marginTop: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555', fontSize: '14px' }}>
                        Padding Top Override (Optional)
                      </label>
                      <input
                        type="text"
                        value={advancedCSS.discountCodeButtonPaddingTop}
                        onChange={(e) => setAdvancedCSS({
                          ...advancedCSS,
                          discountCodeButtonPaddingTop: e.target.value
                        })}
                        placeholder="e.g., 10px"
                        style={{
                          width: '100%',
                          maxWidth: '200px',
                          boxSizing: 'border-box',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ marginLeft: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div onClick={() => setAdvancedCSS({ 
                      ...advancedCSS, 
                      discountCodeButtonHeight: !advancedCSS.discountCodeButtonHeight 
                    })}
                      style={{ 
                        width: '50px', 
                        height: '28px', 
                        background: advancedCSS.discountCodeButtonHeight ? '#22c55e' : '#ddd',
                        borderRadius: '14px', 
                        position: 'relative', 
                        cursor: 'pointer', 
                        transition: 'background 0.3s' 
                      }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        background: 'white', 
                        borderRadius: '50%',
                        position: 'absolute', 
                        top: '4px', 
                        left: advancedCSS.discountCodeButtonHeight ? '26px' : '4px',
                        transition: 'left 0.3s', 
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                      }} />
                    </div>
                    <span style={{
                      fontWeight: '600',
                      fontSize: '14px',
                      color: advancedCSS.discountCodeButtonHeight ? '#22c55e' : '#999', 
                      transition: 'color 0.3s',
                      textAlign: 'right',
                      minWidth: '40px'
                    }}>
                      {advancedCSS.discountCodeButtonHeight ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
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
                    background: '#3D57FF',
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

              {/* Warning Notice */}
              <div style={{
                background: '#fee2e2',
                border: '2px solid #ef4444',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '24px', lineHeight: '1' }}>⚠️</div>
                  <div>
                    <div style={{
                      fontWeight: '700',
                      fontSize: '16px',
                      color: '#991b1b',
                      marginBottom: '8px'
                    }}>
                      Advanced Users Only
                    </div>
                    <div style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#991b1b'
                    }}>
                      Custom CSS snippets are for advanced users who understand CSS selectors and properties. 
                      Incorrect CSS can easily break the styling of your booking pages. Only use this feature 
                      if you know what you're doing.
                    </div>
                  </div>
                </div>
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
                        fontSize: '14px',
                        fontFamily: 'monospace'
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
                        fontFamily: 'monospace',
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
                  color: '#1E4A7D',
                  padding: '8px',
                  background: '#EBF5FF',
                  borderRadius: '6px',
                  border: '1px solid #2E6AB3'
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
                    background: '#3D57FF',
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
                    background: copied ? '#22c55e' : 'white',
                    color: copied ? 'white' : '#3D57FF',
                    border: copied ? 'none' : '2px solid #3D57FF',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s'
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
                  {generatedCSS}
                </pre>
              </div>
            </div>
          </div>
        </div>
    </div>
    </>
  );
};

export default CSSCustomizer;
