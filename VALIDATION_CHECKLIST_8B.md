# VALIDATION CHECKLIST: Phase 8B Zero-Crossing Fix

**Status**: Ready for visual inspection  
**Location**: http://localhost:8082/stats  
**Data**: 13 seeded trades with multiple zero crossings  

---

## Quick Visual Checks

### ✅ Chart Rendering
- [ ] Chart loads without errors
- [ ] Both tabs visible: "Overview" and "Equity Curve"
- [ ] Both show Running P&L charts

### ✅ Color Semantics (CRITICAL)
When viewing the seeded data:
- [ ] **NO red visible above the zero line** (green territory only)
- [ ] **NO green visible below the zero line** (red territory only)
- [ ] **Clean transition at zero** (no spikes or artifacts)
- [ ] Entire chart feels visually honest

### ✅ Zero Crossings
With 13 seeded trades, expect ~3-4 zero crossings:
- [ ] Each crossing shows smooth color transition
- [ ] No fill discontinuity or jumps
- [ ] No vertical artifacts or spikes
- [ ] No "ghost" fill remnants

### ✅ Tooltip Behavior
Hover over data points:
- [ ] Tooltip always shows `balance_total` (source of truth)
- [ ] Format: `$XXX.XX` with green/red color
- [ ] Return percent shows correctly
- [ ] Synthetic points show "(interpolated)" label

### ✅ Legend Control
Check legend on chart:
- [ ] Only shows "Running P&L" (the line)
- [ ] Does NOT show "Profit Zone" or "Loss Zone" as separate items
- [ ] Prevents confusion about data sources

### ✅ Line and Area Hierarchy
- [ ] **Line dominates visually** (bold, prominent color)
- [ ] **Areas are subtle** (low opacity, secondary role)
- [ ] Line and fills never conflict visually
- [ ] Terminal point (last trade) is emphasized with larger dot

---

## Detailed Inspection (Trade-by-Trade)

Using the 13 seeded trades:

```
Trade # | Entry | Exit | P&L   | Status
--------|-------|------|-------|------------------
1       | ...   | ...  | +$... | Profit (green)
2       | ...   | ...  | +$... | Profit (green)
3       | ...   | ...  | -$... | Loss (red)
4       | ...   | ...  | +$... | Crossing up ← synthetic point here
...     | ...   | ...  | ...   | ...
```

### Per-Trade Verification
1. Go to Trades page, identify all 13 trades
2. Note where drawdowns exceed profits
3. Identify zero-crossing points in the chart
4. Verify:
   - Chart accurately reflects cumulative P&L
   - Colors change EXACTLY at zero crossings
   - No color leakage into opposite zones
   - Terminal (last) dot is emphasized

---

## Synthetic Point Verification

Synthetic points are injected where balance_total crosses zero.

### How to Spot Them
- Hover over the chart at zero-crossing boundaries
- Tooltip should show: "$(timestamp) (interpolated)"
- balance_total will be exactly 0.00 or very close
- return_percent will be near 0%

### Expected Count
With 13 trades showing multiple zero crossings:
- Seeded data likely has 2-4 synthetic points
- Original 13 points + 2-4 synthetic = 15-17 total points
- All should render smoothly in both red and green fills

---

## Performance Validation

### Rendering Speed
- [ ] Chart renders instantly (< 500ms)
- [ ] No lag when hovering/scrolling
- [ ] Smooth animation when switching tabs
- [ ] Terminal point emphasizes correctly

### Browser Console
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] **No errors** should appear
- [ ] **No warnings** about Recharts or data types

### Memory Usage
- [ ] Chart doesn't consume excessive memory
- [ ] Switching between tabs is fast
- [ ] No memory leaks (DevTools → Memory tab)

---

## Institutional Standards Checklist

Does the chart meet professional standards?

- [ ] **Financial Correctness**: Colors match actual P&L (no inversions)
- [ ] **Visual Integrity**: No artifacts, spikes, or discontinuities
- [ ] **Transparency**: Synthetic points explicitly marked
- [ ] **Auditability**: Tooltip shows source of truth
- [ ] **Scalability**: Works with 13 trades, should work with 1000+
- [ ] **Professionalismm**: Looks like Bloomberg Terminal, TradingView, etc.

---

## Known Behaviors (Expected)

### Zero Point Rendering
- Synthetic points appear as smooth transitions in the fill
- Both profit and loss areas briefly touch at zero
- This is **correct and intentional**

### Tooltip on Synthetic Points
- Shows "(interpolated)" label
- balance_total = 0.00 or very close
- Not associated with any trade event
- This is **correct and informative**

### Dense Datasets (>100 points)
- Dots disappear from line (rendering optimization)
- Areas become more transparent (12% opacity)
- Terminal point still emphasized
- This is **correct and intentional**

---

## Failure Scenarios (DO NOT EXPECT)

Red flags that would indicate a problem:

❌ **Red visible above zero line** (semantic inversion)  
❌ **Green visible below zero line** (semantic inversion)  
❌ **Vertical spikes at zero crossings** (fill artifacts)  
❌ **Orphaned color zones** (disconnected renders)  
❌ **Tooltip hiding true values** (authority violation)  
❌ **Legend showing "Profit Zone" separately** (detail leakage)  
❌ **Console errors** (runtime failures)  
❌ **Lag or stuttering** (performance issues)  

**If any of these occur, chart needs immediate review.**

---

## Comparison to Previous Version

### Before Phase 8B
- Zero crossings showed fill spikes
- baseLine tricks created visual artifacts
- Color zones sometimes inverted
- Professional appearance questionable

### After Phase 8B
- Zero crossings smooth and artifact-free
- Null masking prevents artificial geometry
- Color zones always correct semantically
- Professional, institutional appearance

---

## Sign-Off

✅ **Phase 8B is ready for production when:**
1. All visual checks pass
2. No errors in browser console
3. Chart looks professional and honest
4. Tooltip always reflects true values
5. Synthetic points clearly marked

**Validated by**: [Your Name]  
**Date**: January 4, 2026  
**Commit**: 23624fc (Frontend) + a4a3c92 (Backend docs)  

---

**Questions?** Check [PHASE_8B_ZERO_CROSSING_PRECISION.md](PHASE_8B_ZERO_CROSSING_PRECISION.md) for technical details.
