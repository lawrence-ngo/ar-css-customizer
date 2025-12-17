import React, { useState } from 'react';
import { Download, Plus, Trash2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

const CSSCustomizer = () => {
  const [activeSection, setActiveSection] = useState('fonts');
  const [copied, setCopied] = useState(false);

  // Font State
  const [fonts, setFonts] = useState([
    {
      id: 1,
      name: 'SweetSans',
      type: 'custom',
      files: [
        { url: 'https://external-stylesheets.s3.us-east-1.amazonaws.com/fonts/sirdavis/SweetSans-Regular.otf', weight: 'normal', style: 'normal' },
        { url: 'https://external-stylesheets.s3.us-east-1.amazonaws.com/fonts/sirdavis/SweetSans-Bold.otf', weight: 'bold', style: 'normal' }
      ]
    }
  ]);

  // Colors State
  const [colors, setColors] = useState({
    body: '#F2E9DB',
    heading: '#F2E9DB',
    button: '#F2E9DB',
    hover: '#ffffff',
    brand: '#F2E9DB',
    background: '#000000'
  });

  // Dark theme toggle
  const [isDarkTheme, setIsDarkTheme] = useState(false);

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
    bodyFont: 'SweetSans',
    bodyFallback: 'Arial',
    headingFont: 'SweetSans',
    headingFallback: 'Arial',
    buttonFont: 'SweetSans',
    buttonFallback: 'Arial',
    bodySize: '14px',
    h1Size: '36px',
    h1LineHeight: '1',
    h1SizeMobile: '20px',
    textTransform: 'uppercase'
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

  // Element-specific styles
  const [elementStyles, setElementStyles] = useState({
    buttons: {
      borderRadius: '0px',
      border: '1px solid var(--color-button)',
      primaryColor: '#F2E9DB',
      primaryBg: 'var(--color-background)',
      hoverColor: '#000000',
      hoverBg: 'var(--color-hover)',
      secondaryColor: '#ffffff',
      secondaryBg: 'var(--color-background)',
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
      padding: '16px'
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

  // Add new font
  const addFont = () => {
    setFonts([...fonts, {
      id: Date.now(),
      name: '',
      type: 'google',
      googleLink: '',
      typekitUrl: '',
      files: [{ url: '', weight: 'normal', style: 'normal' }]
    }]);
  };

  // Update font
  const updateFont = (id, field, value) => {
    setFonts(fonts.map(font => {
      if (font.id === id) {
        const updates = { ...font, [field]: value };
        
        // If updating Google Font link, try to extract the font family name
        if (field === 'googleLink' && value) {
          const match = value.match(/family=([^:&]+)/);
          if (match) {
            const extractedName = match[1].replace(/\+/g, ' ');
            updates.name = extractedName;
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

    // CSS Variables
    css += `/* Variables */
:root {
  --color-body: ${colors.body};
  --color-heading: ${colors.heading};
  --color-button: ${colors.button};
  --color-hover: ${colors.hover};
  --color-brand: ${colors.brand};
  --color-background: ${colors.background};
  --font-body: ${buildFontStack(typography.bodyFont, typography.bodyFallback)};
  --font-heading: ${buildFontStack(typography.headingFont, typography.headingFallback)};
  --font-button: ${buildFontStack(typography.buttonFont, typography.buttonFallback)};
  --transition: ${elementStyles.buttons.transition};
  --text-transform: ${typography.textTransform};
}

`;

    // Dark Theme Styles
    if (isDarkTheme) {
      css += `/* Enable transparent plugin elements for dark mode */
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

`;
    }

    // Base Typography
    css += `/* Typography */
body {
  color: var(--color-body) !important;
  font-family: var(--font-body) !important;
  font-weight: normal !important;
  font-style: normal;
  background: var(--color-background);
  font-size: ${typography.bodySize} !important;
}

h1, h2, h3, h4, h5, h6, .infoPanel .tourName {
  font-family: var(--font-heading) !important;
  font-weight: bold !important;
  color: var(--color-heading) !important;
  text-transform: var(--text-transform) !important;
}

.tour-title, .TourPage-About-title {
  font-size: ${typography.h1Size} !important;
  line-height: ${typography.h1LineHeight} !important;
}

`;

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

    // Buttons
    css += `/* Buttons */
.button, .ui.anygreen.button, .TourPage-ContactGuide-submit-button.ui.large.button,
#request-booking-mobile .ui.button, .ConfirmationContainer .ButtonContainer .ui.button,
.CheckoutNavigationController button.BookingRequest-submit, [data-testid="update-email-btn"],
.rescheduleModal .modalActions .submitButton, .contactModal .modalActions .submitButton, .ConfirmationDefault .GoGAdditionalInfoButton, [data-testid="apply-filter"] {
  font-family: var(--font-button) !important;
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
.TourPage-ContactGuide-link.ui.basic.button {
  font-family: var(--font-button) !important;
  font-weight: normal !important;
  color: ${elementStyles.buttons.secondaryColor} !important;
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
    css += `/* Mobile Styles */
@media (max-width: 600px) {
  .tour-title, .TourPage-About-title {
    font-size: ${typography.h1SizeMobile} !important;
  }
}

`;

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

  const sections = [
    { id: 'fonts', label: 'Fonts', icon: '🔤' },
    { id: 'colors', label: 'Colors', icon: '🎨' },
    { id: 'typography', label: 'Typography', icon: '📝' },
    { id: 'buttons', label: 'Buttons', icon: '🔘' },
    { id: 'inputs', label: 'Input Fields', icon: '📋' },
    { id: 'modals', label: 'Modals', icon: '🪟' },
    { id: 'lists', label: 'Lists', icon: '📄' },
    { id: 'custom', label: 'Custom CSS', icon: '⚙️' },
    { id: 'preview', label: 'Preview & Export', icon: '👁️' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '32px 16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
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
          }}>CSS Customization Tool</h1>
          <p style={{
            margin: 0,
            fontSize: '16px',
            opacity: 0.9
          }}>Design your custom stylesheet with precision and ease</p>
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
              onClick={() => setActiveSection(section.id)}
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

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Fonts Section */}
          {activeSection === 'fonts' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>Font Management</h2>
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
                      
                      <div style={{ 
                        background: '#fff3cd', 
                        border: '1px solid #ffc107', 
                        borderRadius: '6px', 
                        padding: '12px',
                        marginBottom: '16px'
                      }}>
                        <div style={{ fontWeight: '600', color: '#856404', marginBottom: '6px', fontSize: '13px' }}>
                          ⚠️ Important: Font Family Name
                        </div>
                        <div style={{ color: '#856404', fontSize: '12px', lineHeight: '1.5' }}>
                          The "Font Family Name" below must match exactly what Google Fonts uses. 
                          {font.googleLink && font.name && (
                            <span style={{ display: 'block', marginTop: '6px' }}>
                              ✓ Auto-detected: <strong>"{font.name}"</strong>
                            </span>
                          )}
                          {font.googleLink && !font.name && (
                            <span style={{ display: 'block', marginTop: '6px', color: '#d32f2f' }}>
                              Could not auto-detect font name. Please enter it manually below.
                            </span>
                          )}
                        </div>
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
                          ℹ️ Font Family Name Required
                        </div>
                        <div style={{ color: '#1565c0', fontSize: '12px', lineHeight: '1.5' }}>
                          Enter the exact font family name below as specified in your Adobe Fonts project (e.g., "proxima-nova", "futura-pt").
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: (font.type === 'google' || font.type === 'typekit') ? '#667eea' : '#555'
                    }}>
                      Font Family Name {(font.type === 'google' || font.type === 'typekit') && <span style={{ color: '#d32f2f' }}>*</span>}
                    </label>
                    <input
                      type="text"
                      value={font.name}
                      onChange={(e) => updateFont(font.id, 'name', e.target.value)}
                      placeholder={font.type === 'google' ? 'e.g., Chakra Petch' : font.type === 'typekit' ? 'e.g., proxima-nova' : 'e.g., SweetSans'}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: (font.type === 'google' || font.type === 'typekit') ? '2px solid #667eea' : '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: (font.type === 'google' && font.googleLink && font.name) || (font.type === 'typekit' && font.typekitUrl && font.name) ? '#e8f5e9' : 'white'
                      }}
                    />
                    {font.type === 'google' && (
                      <small style={{ display: 'block', marginTop: '6px', color: '#667eea', fontSize: '11px', fontWeight: '500' }}>
                        Must match Google's exact font family name
                      </small>
                    )}
                    {font.type === 'typekit' && (
                      <small style={{ display: 'block', marginTop: '6px', color: '#667eea', fontSize: '11px', fontWeight: '500' }}>
                        Must match Adobe Typekit's exact font family name
                      </small>
                    )}
                  </div>

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
                    onClick={() => setIsDarkTheme(!isDarkTheme)}
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
                      <input
                        type="color"
                        value={colors.body}
                        onChange={(e) => setColors({ ...colors, body: e.target.value })}
                        style={{
                          width: '60px',
                          height: '60px',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      />
                      <input
                        type="text"
                        value={colors.body}
                        onChange={(e) => setColors({ ...colors, body: e.target.value })}
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
                      <input
                        type="color"
                        value={colors.heading}
                        onChange={(e) => setColors({ ...colors, heading: e.target.value })}
                        style={{
                          width: '60px',
                          height: '60px',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      />
                      <input
                        type="text"
                        value={colors.heading}
                        onChange={(e) => setColors({ ...colors, heading: e.target.value })}
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
                        <input
                          type="color"
                          value={colors[key]}
                          onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                          style={{
                            width: '60px',
                            height: '60px',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        />
                        <input
                          type="text"
                          value={colors[key]}
                          onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
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
                      <input
                        type="color"
                        value={colors.titleOverride || colors.heading}
                        onChange={(e) => setColors({ ...colors, titleOverride: e.target.value })}
                        style={{
                          width: '60px',
                          height: '60px',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      />
                      <input
                        type="text"
                        value={colors.titleOverride || ''}
                        onChange={(e) => setColors({ ...colors, titleOverride: e.target.value })}
                        placeholder="Leave empty to use heading color"
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
                      <input
                        type="color"
                        value={colors.subtitleOverride || colors.heading}
                        onChange={(e) => setColors({ ...colors, subtitleOverride: e.target.value })}
                        style={{
                          width: '60px',
                          height: '60px',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      />
                      <input
                        type="text"
                        value={colors.subtitleOverride || ''}
                        onChange={(e) => setColors({ ...colors, subtitleOverride: e.target.value })}
                        placeholder="Leave empty to use heading color"
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
              <h2 style={{ marginBottom: '24px', fontSize: '24px', color: '#333' }}>Typography Settings</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
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
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      {fonts.map(font => (
                        <option key={font.id} value={font.name}>{font.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Fallback Font
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                      <select
                        value={typography.bodyFallback}
                        onChange={(e) => setTypography({ ...typography, bodyFallback: e.target.value })}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
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
                        onClick={() => setTypography({ ...typography, bodyFallback: suggestFallback(typography.bodyFont) })}
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
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
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
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      {fonts.map(font => (
                        <option key={font.id} value={font.name}>{font.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Fallback Font
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                      <select
                        value={typography.headingFallback}
                        onChange={(e) => setTypography({ ...typography, headingFallback: e.target.value })}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
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
                        onClick={() => setTypography({ ...typography, headingFallback: suggestFallback(typography.headingFont) })}
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
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      H1 Size (Desktop)
                    </label>
                    <input
                      type="text"
                      value={typography.h1Size}
                      onChange={(e) => setTypography({ ...typography, h1Size: e.target.value })}
                      placeholder="36px"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      H1 Size (Mobile)
                    </label>
                    <input
                      type="text"
                      value={typography.h1SizeMobile}
                      onChange={(e) => setTypography({ ...typography, h1SizeMobile: e.target.value })}
                      placeholder="20px"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Line Height
                    </label>
                    <input
                      type="text"
                      value={typography.h1LineHeight}
                      onChange={(e) => setTypography({ ...typography, h1LineHeight: e.target.value })}
                      placeholder="1"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
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
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      {fonts.map(font => (
                        <option key={font.id} value={font.name}>{font.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Fallback Font
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                      <select
                        value={typography.buttonFallback}
                        onChange={(e) => setTypography({ ...typography, buttonFallback: e.target.value })}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '14px'
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
                        onClick={() => setTypography({ ...typography, buttonFallback: suggestFallback(typography.buttonFont) })}
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
                </div>
            </div>
          )}

          {/* Buttons Section */}
          {activeSection === 'buttons' && (
            <div>
              <h2 style={{ marginBottom: '24px', fontSize: '24px', color: '#333' }}>Button Styles</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#667eea' }}>Primary Button</h3>
                  
                  {[
                    { key: 'primaryColor', label: 'Text Color', type: 'color' },
                    { key: 'primaryBg', label: 'Background', type: 'text' },
                    { key: 'hoverColor', label: 'Hover Text Color', type: 'color' },
                    { key: 'hoverBg', label: 'Hover Background', type: 'text' }
                  ].map(field => (
                    <div key={field.key} style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                        {field.label}
                      </label>
                      {field.type === 'color' ? (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={elementStyles.buttons[field.key].startsWith('#') ? elementStyles.buttons[field.key] : '#000000'}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              buttons: { ...elementStyles.buttons, [field.key]: e.target.value }
                            })}
                            style={{
                              width: '50px',
                              height: '50px',
                              border: '2px solid #ddd',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          />
                          <input
                            type="text"
                            value={elementStyles.buttons[field.key]}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              buttons: { ...elementStyles.buttons, [field.key]: e.target.value }
                            })}
                            style={{
                              flex: 1,
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
                          value={elementStyles.buttons[field.key]}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            buttons: { ...elementStyles.buttons, [field.key]: e.target.value }
                          })}
                          style={{
                            width: '100%',
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

                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#667eea' }}>Secondary Button</h3>
                  
                  {[
                    { key: 'secondaryColor', label: 'Text Color', type: 'color' },
                    { key: 'secondaryBg', label: 'Background', type: 'text' }
                  ].map(field => (
                    <div key={field.key} style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                        {field.label}
                      </label>
                      {field.type === 'color' ? (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={elementStyles.buttons[field.key].startsWith('#') ? elementStyles.buttons[field.key] : '#ffffff'}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              buttons: { ...elementStyles.buttons, [field.key]: e.target.value }
                            })}
                            style={{
                              width: '50px',
                              height: '50px',
                              border: '2px solid #ddd',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          />
                          <input
                            type="text"
                            value={elementStyles.buttons[field.key]}
                            onChange={(e) => setElementStyles({
                              ...elementStyles,
                              buttons: { ...elementStyles.buttons, [field.key]: e.target.value }
                            })}
                            style={{
                              flex: 1,
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
                          value={elementStyles.buttons[field.key]}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            buttons: { ...elementStyles.buttons, [field.key]: e.target.value }
                          })}
                          style={{
                            width: '100%',
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

                <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#667eea' }}>Border & Shape</h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Border Radius
                    </label>
                    <input
                      type="text"
                      value={elementStyles.buttons.borderRadius}
                      onChange={(e) => setElementStyles({
                        ...elementStyles,
                        buttons: { ...elementStyles.buttons, borderRadius: e.target.value }
                      })}
                      placeholder="0px"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#555' }}>
                      Border
                    </label>
                    <input
                      type="text"
                      value={elementStyles.buttons.border}
                      onChange={(e) => setElementStyles({
                        ...elementStyles,
                        buttons: { ...elementStyles.buttons, border: e.target.value }
                      })}
                      placeholder="1px solid var(--color-button)"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

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
                        <input
                          type="color"
                          value={elementStyles.inputs[field.key]}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            inputs: { ...elementStyles.inputs, [field.key]: e.target.value }
                          })}
                          style={{
                            width: '60px',
                            height: '60px',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        />
                        <input
                          type="text"
                          value={elementStyles.inputs[field.key]}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            inputs: { ...elementStyles.inputs, [field.key]: e.target.value }
                          })}
                          style={{
                            flex: 1,
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
              <h2 style={{ marginBottom: '24px', fontSize: '24px', color: '#333' }}>Modal Styles</h2>
              
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
                        <input
                          type="color"
                          value={elementStyles.modals[field.key].startsWith('#') ? elementStyles.modals[field.key] : '#000000'}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            modals: { ...elementStyles.modals, [field.key]: e.target.value }
                          })}
                          style={{
                            width: '60px',
                            height: '60px',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        />
                        <input
                          type="text"
                          value={elementStyles.modals[field.key]}
                          onChange={(e) => setElementStyles({
                            ...elementStyles,
                            modals: { ...elementStyles.modals, [field.key]: e.target.value }
                          })}
                          style={{
                            flex: 1,
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
          {activeSection === 'preview' && (
            <div>
              <h2 style={{ marginBottom: '24px', fontSize: '24px', color: '#333' }}>Preview & Export</h2>
              
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginBottom: '24px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={exportCSS}
                  style={{
                    padding: '12px 24px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}
                >
                  <Download size={18} /> Download CSS File
                </button>

                <button
                  onClick={copyCSS}
                  style={{
                    padding: '12px 24px',
                    background: copied ? '#22c55e' : '#764ba2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    fontSize: '16px',
                    transition: 'background 0.2s'
                  }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>

              <div style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '24px',
                borderRadius: '12px',
                fontSize: '13px',
                fontFamily: 'Monaco, Consolas, monospace',
                maxHeight: '600px',
                overflow: 'auto',
                border: '1px solid #333'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {generateCSS()}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSSCustomizer;
