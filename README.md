# UI Fidelity Checker

A screenshot-based visual regression tool that compares design mockups with implementation screenshots and generates prioritized mismatch reports with a bold **Precision Studio** aesthetic.

![UI Fidelity Checker](https://img.shields.io/badge/Next.js-16.1.3-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Playwright](https://img.shields.io/badge/Playwright-1.57-green) ![Sharp](https://img.shields.io/badge/Sharp-0.34-red)

## ✨ Features

- **Visual Comparison**: Upload design mockups and implementation screenshots for pixel-perfect comparison
- **URL Screenshot Capture**: Enter a URL and capture screenshots with Desktop or Mobile viewport presets  
- **Viewport & Size Normalization**: Automatic size matching with 3 intelligent sizing modes to eliminate false positives from viewport mismatches
- **Design-Size Screenshot Capture**: URL screenshots automatically use design dimensions for accurate comparisons
- **Viewport Mismatch Detection**: Pre-check warnings guide you when dimension mismatches are detected
- **Automated Diff Generation**: Highlights visual differences with red overlay using Pixelmatch algorithm
- **Smart Categorization**: Automatically categorizes mismatches into Color, Typography, Spacing, or Component State
- **Priority Ranking**: Assigns High/Medium/Low priority based on area and visibility
- **Interactive Selection**: Check/uncheck mismatches to include in report
- **One-Click Ticket Creation**: Generate ready-to-use tickets in multiple formats:
  - Generic Markdown
  - GitHub Issue Markdown (with direct issue creation link)
  - Jira-style text
  - JSON export with schema validation
- **Flexible Ticket Granularity**: Create single bundled ticket or one ticket per mismatch
- **Customizable Metadata**: Add project name, environment, assignee, labels, and severity mappings
- **Markdown Ticket Export**: Copy-paste ready tickets for issue tracking with visual feedback
- **JSON Report Export**: Downloadable structured reports with all mismatch data
- **Transparent Results**: See original dimensions, normalization applied, and screenshot viewport used
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
3. **Choose Sizing Mode**: Select how to handle dimension mismatches (default: Match width, crop)
4. **Add Metadata** (Optional): Enter screen name and platform
5. **Click Compare**: Wait for processing (usually 5-10 seconds)
6. **Review Results**: See similarity score, diff image, normalization info, and mismatch list
7. **Export**: Select mismatches and copy as Markdown ticket or download JSON

### Option 2: Use URL Capture (Recommended)

1. **Upload Design Mockup**: Upload your design image (automatically extracts dimensions)
2. **Select "URL" Tab**: Switch to URL mode in Implementation section
3. **Enter URL**: Type the implementation URL (e.g., `https://example.com`)
4. **Use Design Viewport** (Default ON): Screenshot will be captured at design dimensions for accurate comparison
   - Turn OFF to use preset viewports (Desktop/Mobile)
5. **Choose Sizing Mode**: Select normalization strategy
6. **Click Compare**: Screenshot captured and normalized automatically
7. **Check Warnings**: If viewport mismatch detected, review suggestion banner
8. **Review & Export**: Same as Option 1

---

## 📐 Viewport & Size Normalization

### Why Normalization Matters

When comparing a design mockup (e.g., 1920x1080) with a URL screenshot (e.g., 1440x900), dimension differences cause false positives. The tool now automatically normalizes both images to the same dimensions before comparison.

### Sizing Modes

Choose how to handle dimension mismatches:

1. **Match Width, Crop** (Default)
   - Resizes implementation to match design width
   - Crops excess height from center (or extends with black if shorter)
   - **Use when**: Design and implementation have similar aspect ratios
   - **Best for**: Desktop layouts, hero sections

2. **Match Width, Letterbox**
   - Resizes implementation to match design width
   - Adds black bars (letterbox) top/bottom to reach design height
   - **Use when**: You want to see the full implementation without cropping
   - **Best for**: Mobile layouts, scrollable pages

3. **Fit Inside**
   - Scales implementation to fit entirely within design canvas
   - Pads remaining space with black background
   - **Use when**: Aspect ratios differ significantly
   - **Best for**: Cross-platform comparisons (desktop design vs mobile screenshot)

### Viewport Mismatch Warnings

The tool detects likely viewport mismatches by comparing:
- **Width ratio**: Flags if implementation width differs by >5% from design
- **Aspect ratio delta**: Flags if aspect ratios differ by >0.1

**Warning Example**:
```
⚠️ Viewport Mismatch Detected
Viewport mismatch detected. Enable 'Use design size as viewport' to capture 
screenshot at design dimensions. Aspect ratios differ significantly - 
consider 'Fit inside' mode.

Width ratio: 0.75x | Aspect delta: 0.15
```

### Normalization Metadata

After comparison, see exactly what happened:
- **Design Size**: Original design dimensions (e.g., 1920x1080)
- **Implementation Size**: Original screenshot dimensions (e.g., 1440x900)
- **Sizing Mode**: Normalization strategy applied
- **Screenshot Viewport**: Viewport used for URL capture

---

## 🎫 Ticket Creation

After running a comparison, use the **CREATE TICKETS** section to generate ready-to-use tickets:

### 1. Select Format
- **Generic Markdown** - Universal format for any issue tracker
- **GitHub Issue Markdown** - Optimized for GitHub with tables and checkboxes
- **Jira Text** - Plain text compatible with Jira
- **JSON** - Structured export with JSON Schema validation

### 2. Choose Granularity
- **Single Bundled Ticket** - All selected findings in one ticket
- **One Ticket Per Mismatch** - Separate tickets for each finding

### 3. Add Metadata (Optional)
- Project/Repo Name
- Environment (local/staging/production)
- Assignee username
- Labels/Tags (comma-separated)
- Severity Mapping (priority → severity conversion)

### 4. Actions
- **COPY TICKET(S)** - Copy to clipboard (multiple tickets concatenated)
- **DOWNLOAD FILE(S)** - Save as .md, .txt, or .json files
- **OPEN IN GITHUB** - (GitHub format only) Opens pre-filled issue creation page

**Tip**: If no mismatches are selected, the tool automatically includes the top 3 by priority.

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
│   │   ├── compare/route.ts           # Main comparison endpoint with normalization
│   │   ├── screenshot/route.ts        # URL screenshot capture with custom viewports
│   │   └── extract-dimensions/route.ts # Design dimension extraction
│   ├── components/
│   │   └── TicketBuilder.tsx          # Ticket creation UI
│   ├── page.tsx                       # Main UI component with viewport controls
│   ├── layout.tsx                     # Root layout
│   ├── globals.css                    # Precision Studio styles
│   └── icon.svg                       # Precision targeting favicon
├── lib/
│   ├── types.ts                       # TypeScript definitions
│   ├── imageProcessor.ts              # Sharp normalization (legacy)
│   ├── sizeNormalizer.ts             # NEW: Intelligent size normalization engine
│   ├── dimensionExtractor.ts         # NEW: Image dimension extraction
│   ├── viewportChecker.ts            # NEW: Viewport mismatch detection
│   ├── diffGenerator.ts               # Pixelmatch diff
│   ├── regionExtractor.ts             # Mismatch region detection
│   ├── categorizer.ts                 # Smart categorization
│   ├── reportGenerator.ts             # MD/JSON exports
│   └── ticketTemplates.ts             # Ticket generation
├── __tests__/
│   ├── diffPipeline.test.ts          # Diff pipeline tests
│   ├── sizeNormalizer.test.ts        # NEW: Normalization tests (10 tests)
│   └── ticketTemplates.test.ts       # Ticket generation tests
├── public/                            # Static assets
├── package.json                       # Dependencies
└── README.md                          # This file
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

### Viewport & Dimension Issues

#### "Viewport mismatch detected" warning appears
**Cause**: Design and implementation have different dimensions or aspect ratios.

**Solutions**:
1. **Enable "Use design size as viewport"** (default ON for URL mode)
   - Captures screenshot at exact design dimensions
   - Eliminates most viewport mismatches
2. **Try a different sizing mode**:
   - Use "Fit inside" for cross-platform comparisons (desktop → mobile)
   - Use "Match width, letterbox" to see full page without cropping
3. **Upload matching screenshots**:
   - Ensure both images are from the same viewport/device

#### Many false positives in results
**Cause**: Dimension mismatch causing layout shifts.

**Solutions**:
1. Use "Use design size as viewport" for URL screenshots
2. Switch sizing mode to "Fit inside" if aspect ratios differ significantly
3. Verify design dimensions are extracted correctly (shown in normalization details)

#### Design dimensions not detected
**Cause**: Image upload failed or dimensions couldn't be extracted.

**Solution**:
- Re-upload the design image
- Check console for errors
- Ensure image is valid PNG/JPG format

#### Screenshot doesn't match design at all
**Cause**: Website is responsive and looks different at design dimensions.

**Solutions**:
1. Check normalization details to see what viewport was used
2. Turn OFF "Use design size as viewport" and try preset (Desktop/Mobile)
3. Verify the URL loads the correct page
4. Check if website requires authentication (not supported)

### General Issues

### "URL not reachable"
- Ensure the URL is publicly accessible
- Check if the website blocks headless browsers
- Try with a different URL

### "Images are too large"
- Tool automatically caps to 3000px max dimension
- For very large images (>4000px), downscale before upload for faster processing

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
