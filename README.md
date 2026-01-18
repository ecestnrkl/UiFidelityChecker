# UI Fidelity Checker

A screenshot-based visual regression tool that compares design mockups with implementation screenshots and generates prioritized mismatch reports with a bold **Precision Studio** aesthetic.

![UI Fidelity Checker](https://img.shields.io/badge/Next.js-16.1.3-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Playwright](https://img.shields.io/badge/Playwright-1.57-green) ![Sharp](https://img.shields.io/badge/Sharp-0.34-red)

## ✨ Features

- **Visual Comparison**: Upload design mockups and implementation screenshots for pixel-perfect comparison
- **URL Screenshot Capture**: Enter a URL and capture screenshots with Desktop or Mobile viewport presets  
- **Automated Diff Generation**: Highlights visual differences with red overlay using Pixelmatch algorithm
- **Smart Categorization**: Automatically categorizes mismatches into Color, Typography, Spacing, or Component State
- **Priority Ranking**: Assigns High/Medium/Low priority based on area and visibility
- **Interactive Selection**: Check/uncheck mismatches to include in report
- **Markdown Ticket Export**: Copy-paste ready tickets for issue tracking with visual feedback
- **JSON Report Export**: Downloadable structured reports with all mismatch data
- **Modern UI**: Black background with neon green/cyan accents, Orbitron font, and dramatic visual effects
- **Performance Optimized**: React hooks (useMemo, useCallback) for optimal rendering

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ecestnrkl/UiFidelityChecker.git
cd UiFidelityChecker

# Install dependencies
npm install

# Install Playwright browser
npx playwright install chromium
```

### Run Locally

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Tests

```bash
npm test
```

---

## 📖 How to Use

### Option 1: Upload Both Images

1. **Upload Design Mockup**: Click the design upload area and select your mockup image (PNG/JPG)
2. **Upload Implementation**: Select "Upload" tab and upload your implementation screenshot
3. **Add Metadata** (Optional): Enter screen name and platform
4. **Click Compare**: Wait for processing (usually 5-10 seconds)
5. **Review Results**: See similarity score, diff image and mismatch list
6. **Export**: Select mismatches and copy as Markdown ticket or download JSON

### Option 2: Use URL Capture

1. **Upload Design Mockup**: Upload your design image
2. **Select "URL" Tab**: Switch to URL mode in Implementation section
3. **Enter URL**: Type the implementation URL (e.g., `https://example.com`)
4. **Select Viewport**: Choose Desktop (1440x900) or Mobile (390x844)
5. **Click Compare**: Screenshot will be captured automatically via Playwright
6. **Review & Export**: Same as Option 1

---

## 🎨 Tech Stack

- **Frontend**: Next.js 16.1.3 (App Router, Turbopack), React 19, TypeScript 5.9
- **Styling**: Tailwind CSS 4.x, Custom CSS with neon effects
- **Fonts**: Orbitron (display), JetBrains Mono (monospace), Inter (body)
- **Image Processing**: Sharp (normalization), Pixelmatch (diff generation)
- **Screenshot**: Playwright (Chromium headless browser)
- **Testing**: tsx with custom test suite

---

## 📦 Project Structure

```
UiFidelityChecker/
├── app/
│   ├── api/
│   │   ├── compare/route.ts      # Main comparison endpoint
│   │   └── screenshot/route.ts   # URL screenshot capture
│   ├── page.tsx                  # Main UI component
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Precision Studio styles
├── lib/
│   ├── types.ts                  # TypeScript definitions
│   ├── imageProcessor.ts         # Sharp normalization
│   ├── diffGenerator.ts          # Pixelmatch diff
│   ├── regionExtractor.ts        # Mismatch region detection
│   ├── categorizer.ts            # Smart categorization
│   └── reportGenerator.ts        # MD/JSON exports
├── __tests__/
│   └── diffPipeline.test.ts      # Test suite
├── public/                       # Static assets
├── package.json                  # Dependencies
└── README.md                     # This file
```

---

## 🔧 Configuration

### Viewport Presets

Edit [lib/types.ts](lib/types.ts) to add custom viewports:

```typescript
export const VIEWPORT_PRESETS = {
  desktop: { width: 1440, height: 900, label: "Desktop (1440x900)" },
  mobile: { width: 390, height: 844, label: "Mobile (390x844)" },
  // Add your own:
  tablet: { width: 768, height: 1024, label: "Tablet (768x1024)" },
};
```

### Categorization Heuristics

Modify [lib/categorizer.ts](lib/categorizer.ts) to adjust mismatch detection:

- **Typography**: Aspect ratio 3:1 to 15:1, area < 10000px²
- **Spacing**: Thin strips (< 20px thick)
- **Component State**: Square-ish (0.5-2.0 ratio), medium size
- **Color**: Large areas (> 20000px²)

---

## 🧪 Demo Flow

### Example Comparison

**Scenario**: Compare a design mockup with a live website

1. Upload `design-homepage.png`
2. Enter URL: `https://yourwebsite.com`
3. Select viewport: Desktop
4. Add screen name: "Homepage Hero"
5. Click Compare

**Expected Output**:
- Similarity score (e.g., 94.2%)
- Diff image with red highlights
- Mismatch list with categories and priorities
- Example mismatch:
  ```
  [HIGH] Color mismatch #1 - color
  Location: x:120, y:340, 450×80px
  Issue: A high priority color difference detected...
  Fix: Verify the color values match the design spec...
  ```

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Screenshot Capture**: Playwright (Chromium)
- **Image Processing**: Sharp, Pixelmatch
- **Language**: TypeScript

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── compare/route.ts      # Image comparison endpoint
│   │   └── screenshot/route.ts   # URL screenshot endpoint
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main UI
│   └── globals.css               # Tailwind styles
├── lib/
│   ├── imageProcessor.ts         # Image normalization
│   ├── diffGenerator.ts          # Diff generation
│   ├── regionExtractor.ts        # Mismatch region detection
│   ├── categorizer.ts            # Heuristic categorization
│   ├── reportGenerator.ts        # Markdown/JSON reports
│   └── types.ts                  # TypeScript types
├── CLAUDE.md                     # Developer guide
└── README.md                     # This file
```

---

## Categorization Logic

The tool uses heuristics to categorize mismatches:

| Category | Heuristic |
|----------|-----------|
| **Color** | Large regions (>20,000px²) or background-like areas |
| **Typography** | Text-like aspect ratios (3:1 to 15:1) and small size (<10,000px²) |
| **Spacing** | Thin horizontal/vertical strips (width or height <20px) |
| **Component State** | Square-ish regions (0.5-2.0 aspect ratio) with medium size |

---

## Priority Assignment

| Priority | Criteria |
|----------|----------|
| **High** | Area > 5,000px² OR intensity > 50% |
| **Medium** | Area 1,000-5,000px² OR intensity 30-50% |
| **Low** | Area < 1,000px² OR intensity < 30% |

---

## Limitations

- **Screenshot-based only**: No HTML/CSS parsing or DOM analysis
- **Heuristic categorization**: May misclassify edge cases
- **Single-page comparison**: No multi-screen workflows
- **No authentication**: URLs must be publicly accessible
- **Performance**: Large images (>4000px) are downscaled for speed

---

## Troubleshooting

### "URL not reachable"
- Ensure the URL is publicly accessible
- Check if the website blocks headless browsers
- Try with a different URL

### "Images are too large"
- Resize images to max 4000px width before uploading
- Use smaller viewport presets

### "Screenshot timeout"
- Website took too long to load (>25 seconds)
- Try again or use a faster URL

### "No differences found"
- Images are nearly identical (>99.5% similar)
- This is expected if design matches implementation perfectly

---

## Development

### Run Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
npm start
```

### Add New Viewport Preset
Edit `lib/types.ts`:
```typescript
export const VIEWPORT_PRESETS = {
  desktop: { width: 1440, height: 900, label: "Desktop (1440x900)" },
  mobile: { width: 390, height: 844, label: "Mobile (390x844)" },
  tablet: { width: 768, height: 1024, label: "Tablet (768x1024)" }, // NEW
};
```

---

## Contributing

This is a course demo project. For questions or suggestions:
1. Open an issue on GitHub
2. Review `CLAUDE.md` for developer context

---

## License

MIT License - See LICENSE file for details

---

## Acknowledgments

- Built with Next.js, Playwright, Sharp, and Pixelmatch
- Inspired by visual regression testing tools
- Created as a course project demo

---

**Made with ❤️ for designers and developers**
