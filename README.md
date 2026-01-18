# UI Fidelity Checker

A screenshot-based visual regression tool that compares design mockups with implementation screenshots and generates prioritized mismatch reports.

![UI Fidelity Checker](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Playwright](https://img.shields.io/badge/Playwright-Latest-green)

## Features

- **Visual Comparison**: Upload design mockups and implementation screenshots for pixel-perfect comparison
- **URL Screenshot Capture**: Enter a URL and capture screenshots with Desktop or Mobile viewport presets
- **Automated Diff Generation**: Highlights visual differences with red overlay
- **Smart Categorization**: Automatically categorizes mismatches into Color, Typography, Spacing, or Component State
- **Priority Ranking**: Assigns High/Medium/Low priority based on area and visibility
- **Markdown Ticket Export**: Copy-paste ready tickets for issue tracking
- **JSON Report Export**: Downloadable structured reports with all mismatch data

---

## Quick Start

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
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Use

### Option 1: Upload Both Images

1. **Upload Design Mockup**: Click the design upload area and select your mockup image (PNG/JPG)
2. **Upload Implementation**: Select "Upload Image" and upload your implementation screenshot
3. **Add Metadata** (Optional): Enter screen name and platform
4. **Click Compare**: Wait for processing (usually 5-10 seconds)
5. **Review Results**: See diff image and mismatch list
6. **Export**: Select mismatches and copy as Markdown ticket or download JSON

### Option 2: Use URL Capture

1. **Upload Design Mockup**: Upload your design image
2. **Select "Enter URL"**: Switch to URL mode
3. **Enter URL**: Type the implementation URL (e.g., `https://example.com`)
4. **Select Viewport**: Choose Desktop (1440x900) or Mobile (390x844)
5. **Click Compare**: Screenshot will be captured automatically
6. **Review & Export**: Same as Option 1

---

## Demo Flow

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
