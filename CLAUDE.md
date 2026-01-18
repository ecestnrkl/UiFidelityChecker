# UIFidelityChecker - Project Context & Developer Guide

## Project Overview

**UIFidelityChecker** is a screenshot-based visual regression tool that compares a design mockup against an implemented UI (screenshot or live URL) and generates a detailed mismatch report with prioritized action items.

### What Problem It Solves

- **Manual QA bottleneck**: Designers and QA teams spend hours manually comparing mockups to implementations
- **Inconsistent feedback**: Visual discrepancies are reported inconsistently without structured categorization
- **No actionable output**: Teams lack ready-to-use tickets for fixing UI mismatches

UIFidelityChecker automates visual comparison and generates developer-ready tickets.

---

## Scope and Non-Goals

### In Scope ✅
- Screenshot-based comparison (uploaded images or URL capture)
- Pixel-level diff visualization
- Heuristic-based mismatch categorization (Color, Typography, Spacing, Component State)
- Prioritized mismatch checklist with bounding box regions
- Markdown ticket export (copyable)
- JSON report export (downloadable)
- Viewport presets for consistent URL screenshots
- Single-page web app demo

### Non-Goals ❌
- HTML/CSS parsing or DOM diffing
- Semantic code analysis or AST comparison
- Browser extension or IDE plugin
- Multi-page comparison workflows
- Real-time monitoring or CI/CD integration
- OCR-based text extraction (used only as optional hint)
- Authentication handling for protected URLs
- Cross-browser testing

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Upload    │  │  URL Input   │  │  Viewport Preset │   │
│  │   Design    │  │  + Capture   │  │   Selector       │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Compare Button → API Call                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Results: Diff Image + Mismatch List + Export       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Next.js API Routes)              │
│                                                              │
│  POST /api/screenshot    →   Playwright screenshot capture  │
│  POST /api/compare       →   Image diff pipeline            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Image Processing Pipeline                         │    │
│  │  1. Normalize dimensions (Sharp)                   │    │
│  │  2. Generate diff (Pixelmatch)                     │    │
│  │  3. Extract mismatch regions (connected components)│    │
│  │  4. Categorize (Color/Typography/Spacing/State)    │    │
│  │  5. Rank by priority (area + intensity)            │    │
│  │  6. Generate Markdown + JSON reports               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
UiFidelityChecker/
├── README.md                    # User-facing run instructions
├── CLAUDE.md                    # This file - developer guide
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── .gitignore
│
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Main comparison UI page
│   │   ├── globals.css          # Tailwind CSS
│   │   └── api/
│   │       ├── screenshot/
│   │       │   └── route.ts     # Playwright screenshot endpoint
│   │       └── compare/
│   │           └── route.ts     # Image comparison endpoint
│   │
│   ├── components/
│   │   ├── ImageUpload.tsx      # Design + Implementation upload UI
│   │   ├── UrlInput.tsx         # URL input with viewport selector
│   │   ├── ComparisonResults.tsx # Diff + mismatch list display
│   │   └── ExportButtons.tsx    # Markdown + JSON export controls
│   │
│   ├── lib/
│   │   ├── imageProcessor.ts    # Sharp normalization, resizing
│   │   ├── diffGenerator.ts     # Pixelmatch diff generation
│   │   ├── regionExtractor.ts   # Connected components, bounding boxes
│   │   ├── categorizer.ts       # Heuristic categorization logic
│   │   ├── reportGenerator.ts   # Markdown + JSON report builders
│   │   └── types.ts             # TypeScript interfaces
│   │
│   └── __tests__/
│       └── diffPipeline.test.ts # Unit tests for diff logic
│
└── public/                      # Static assets (if needed)
```

---

## Run Commands

### First Time Setup
```bash
npm install
npx playwright install chromium
```

### Development
```bash
npm run dev
# Open http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

### Run Tests
```bash
npm test
```

---

## Key Implementation Notes

### Screenshot Capture
- **Playwright** runs server-side in API routes (no browser extension needed)
- Viewport presets: Desktop (1440x900), Mobile (390x844)
- `waitUntil: 'networkidle'` ensures page is fully loaded
- Device scale factor set to 1 for consistency
- Animation disabling via `prefers-reduced-motion: reduce`

### Image Normalization
- **Sharp** handles image loading, resizing, color space conversion
- Both images resized to match dimensions of the smaller image
- Downscaling to max 2000px width for performance (maintains aspect ratio)
- Convert to raw pixel buffer for Pixelmatch

### Diff Generation
- **Pixelmatch** performs pixel-by-pixel comparison
- Outputs diff image with red highlights on mismatches
- Returns mismatch pixel count and similarity percentage
- Threshold tuned to ~0.1 for visible differences

### Region Extraction
- Flood-fill algorithm finds connected mismatch components
- Bounding boxes computed for each region
- Regions filtered by minimum area (e.g., > 100px²) to ignore noise
- Top 10 regions selected by area × average intensity

### Categorization Heuristics
1. **Color**: Average LAB ΔE > threshold in region
2. **Typography**: Edge density changes (Sobel filter) + text-like aspect ratio
3. **Spacing**: Horizontal/vertical shift in edge alignment
4. **Component State**: Fallback for regions with mixed signals

### Priority Assignment
- **High**: Area > 5000px² or intensity > 50%
- **Medium**: Area 1000-5000px² or intensity 30-50%
- **Low**: Everything else

### Report Generation
- Markdown template includes optional screen name and platform
- Each mismatch formatted as checklist item with bbox
- JSON includes all data + base64 diff image + similarity metric

---

## Assumptions and Limitations

### Assumptions
- Both images represent the same UI at similar viewport sizes
- URLs are publicly accessible (no auth required)
- Design mockups are provided as PNG/JPG
- Users run the app locally (no cloud deployment configured)

### Limitations
- **No semantic understanding**: Cannot detect "OK" spacing vs "broken" spacing without manual thresholds
- **Heuristics are approximate**: Categorization may misclassify edge cases
- **Single-page comparison**: No multi-screen workflows
- **Manual region interpretation**: User must validate if detected regions are true issues
- **No historical tracking**: Each comparison is stateless
- **Limited to static pages**: No interaction simulation (clicks, scrolls)

### Performance Notes
- Large images (>4000px) are downscaled for performance
- Screenshot timeout set to 30 seconds
- Diff generation is CPU-intensive (runs synchronously in API route)
- In production, consider queueing or worker threads for concurrent requests

---

## Demo Flow

1. **Upload design mockup** (PNG/JPG)
2. **Choose implementation input**:
   - Option A: Upload implementation screenshot
   - Option B: Enter URL + select viewport preset
3. **(Optional)** Add screen name and platform metadata
4. Click **Compare**
5. View **side-by-side preview** + **diff image**
6. Review **prioritized mismatch checklist**
7. Select relevant mismatches
8. Click **Copy as Markdown Ticket**
9. Paste into issue tracker
10. **(Optional)** Download JSON report

---

## Tech Stack Justification

**Next.js 14** with App Router chosen for:
- ✅ Single repository, single `npm run dev` command
- ✅ API routes for Playwright and image processing (no separate backend)
- ✅ Server-side screenshot capture (no CORS issues)
- ✅ TypeScript support out of the box
- ✅ Tailwind CSS for rapid UI prototyping
- ✅ Fast iteration for course demo

**Playwright**: Industry-standard headless browser automation  
**Sharp**: High-performance Node.js image processing  
**Pixelmatch**: Battle-tested pixel diff library  

**Alternatives Considered**:
- Vite + Express: Requires two dev commands (frontend + backend)
- Pure client-side: Cannot run Playwright in browser
- Python + Flask: Slower prototyping, frontend integration more complex

---

## Development Tips

### Adding New Viewport Presets
Edit `src/lib/types.ts` and `src/components/UrlInput.tsx`:
```typescript
export const VIEWPORT_PRESETS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 }, // NEW
};
```

### Tuning Categorization Heuristics
Adjust thresholds in `src/lib/categorizer.ts`:
```typescript
const COLOR_DELTA_THRESHOLD = 10; // LAB color difference
const EDGE_DENSITY_THRESHOLD = 0.3; // Typography detection
```

### Debugging Diff Output
Enable debug mode in API route to save intermediate images:
```typescript
await sharp(diffBuffer).toFile('debug-diff.png');
```

### Extending Report Format
Modify `src/lib/reportGenerator.ts` to add custom fields or styling.

---

## Known Issues & Future Enhancements

### Known Issues
- Very large images (>10MB) may cause memory issues
- Some URLs block headless browsers (Cloudflare, etc.)
- Gradient backgrounds may produce noisy diffs

### Future Enhancements
- Mask regions to ignore (logos, dates, dynamic content)
- Before/After slider for diff visualization
- Batch comparison mode (multiple screens)
- Integration with Figma API for direct mockup import
- Confidence scores for categorization
- Historical comparison database

---

## Support & Feedback

For questions or issues during development:
1. Check error logs in terminal console
2. Verify Playwright installed: `npx playwright --version`
3. Test image processing: `npm test`
4. Review API route responses in Network tab

---

**Last Updated**: January 2026  
**Project Status**: MVP Demo Ready
