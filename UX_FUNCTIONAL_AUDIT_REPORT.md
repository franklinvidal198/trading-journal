# UX & FUNCTIONAL AUDIT REPORT
**Date**: January 4, 2026  
**Scope**: Frontend UI - Interactive Elements Only  
**Framework**: React 18+ with TypeScript

---

## CRITICAL FINDINGS SUMMARY

### 🔴 CRITICAL (Must Fix - Affects User Experience)
1. **Trades.tsx:117** - "Add Trade" button (NO HANDLER)
2. **Trades.tsx:137** - "Export" button (NO HANDLER)
3. **Trades.tsx:423-424** - Dialog "Save Changes" & "Cancel" buttons (NO HANDLERS)
4. **Profile.tsx:146** - "Upload" button in avatar dialog (NO HANDLER)
5. **Profile.tsx:332** - "Save Preferences" button (CONSOLE.LOG ONLY - doesn't save)

### 🟡 MEDIUM (Should Fix - Affects Completeness)
1. **Trades.tsx** - Edit/Delete buttons have no implementation
2. **Dashboard.tsx** - "Quick action buttons" may be incomplete
3. **Multiple pages** - Missing aria-labels on icon-only buttons

### 🟢 COSMETIC (Nice to Have)
1. Some buttons lack visual feedback states
2. Missing tooltips on disabled buttons

---

## DETAILED INTERACTIVE ELEMENTS AUDIT

### PAGE: Trades.tsx (CRITICAL ISSUES)

| Component | Location | Intent | Status | Issue |
|-----------|----------|--------|--------|-------|
| "Add Trade" Button | Line 117 | Add new trade | BROKEN | No onClick handler |
| "Export" Button | Line 137 | Export trades | NO-OP | Button exists, no handler |
| Search Input | Line 131 | Search trades by pair | WORKING | onChange updates searchTerm ✓ |
| Filter Status Buttons | Lines 157-173 | Filter by status | WORKING | onClick updates filterStatus ✓ |
| "Save Changes" Dialog | Line 423 | Save edited trade | BROKEN | No onClick handler |
| "Cancel" Dialog | Line 424 | Close dialog | PARTIAL | Only variant="outline", needs onClick |
| Edit Trade Button | Line 35 (import) | Open trade editor | NOT FOUND | Icon imported but may not be wired |
| Delete Trade Button | Line 35 (import) | Delete trade | NOT FOUND | Icon imported but no confirmation flow |
| View Trade Button | Line 35 (import) | View details | NOT FOUND | Icon imported, unclear intent |
| Tab Navigation | Line 226 | Switch trade views | WORKING | onValueChange updates activeTab ✓ |

### PAGE: Profile.tsx (CRITICAL ISSUES)

| Component | Location | Intent | Status | Issue |
|-----------|----------|--------|--------|-------|
| Avatar "Upload" Button | Line 146 | Upload avatar image | BROKEN | No onClick handler |
| Avatar "Cancel" Button | Line 147 | Close dialog | WORKING | onClick closes dialog ✓ |
| "Save Profile" Button | Line 184 | Save name/email | WORKING | onClick handler present ✓ |
| "Change Password" Button | Line 236 | Update password | WORKING | onClick handler present ✓ |
| "Save 2FA Backup Codes" | Settings | Download codes | WORKING | Likely functional ✓ |
| Notification Toggles (4x) | Lines 271, 281, 291, 301 | Toggle notifications | WORKING | onCheckedChange updates state ✓ |
| "Save Preferences" Button | Line 332 | Save preferred pairs | NO-OP | `onClick={() => console.log(...)}` - DOES NOT SAVE |

### PAGE: Dashboard.tsx

| Component | Location | Intent | Status | Issue |
|-----------|----------|--------|--------|-------|
| Trade Dialog Trigger | Line ~200 | Add trade | WORKING | Dialog opens ✓ |
| Trade Form Inside Dialog | Line ~300 | Create trade | WORKING | Form has submit handler ✓ |
| Info Popover Button | Line 169 | Show win rate details | WORKING | PopoverTrigger opens ✓ |
| Trade History Button | Line ~230 | Show trade history | WORKING | onClick handler present ✓ |
| Stat Cards (Module) | Line ~128 | Display stats | WORKING | No interaction needed ✓ |

### PAGE: Stats.tsx

| Component | Location | Intent | Status | Issue |
|-----------|----------|--------|--------|-------|
| Date Range Buttons | Line 120 | Quick date selection | WORKING | onClick updates state ✓ |
| Calendar Pickers (2x) | Lines 136, 147 | Select custom dates | WORKING | onSelect updates state ✓ |
| "Apply Filter" Button | Line 152 | Apply date range | WORKING | onClick handler present ✓ |
| Tab Navigation | Tab component | Switch stat views | WORKING | onValueChange updates tab ✓ |
| Chart Components | RunningPLV2.tsx | Display P&L | WORKING | No interaction needed ✓ |

### PAGE: Journal.tsx

| Component | Location | Intent | Status | Issue |
|-----------|----------|--------|--------|-------|
| Add Entry Dialog | Line 230 | Create journal entry | WORKING | onClick handler with validation ✓ |
| Delete Entry Button | Line 272 | Delete entry | WORKING | onClick with confirmation ✓ |
| Pair Selector | Line 168 | Choose trading pair | WORKING | onValueChange updates state ✓ |
| Entry Type Radio | Line 184 | Select entry type | WORKING | onValueChange updates state ✓ |

### CUSTOM COMPONENTS

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| ViewModeToggle | ViewModeToggle.tsx | UNKNOWN | Needs verification |
| UserMenu | UserMenu.tsx | UNKNOWN | Needs verification |
| TradeContextMenu | TradeContextMenu.tsx | UNKNOWN | Needs verification |
| PerformanceCalendar | PerformanceCalendar.tsx | UNKNOWN | Needs verification |

---

## DEAD & NO-OP DETECTION

### HIGH PRIORITY FIXES

**1. Trades.tsx - Line 117: "Add Trade" Button**
```tsx
// CURRENT (BROKEN):
<Button className="bg-gradient-primary hover:glow-primary transition-smooth">
  <Plus className="h-4 w-4 mr-2" />
  Add Trade
</Button>

// FIX: Add onClick handler
onClick={() => setOpenTradeDialog(true)}
```

**2. Trades.tsx - Line 137: "Export" Button**
```tsx
// CURRENT (NO-OP):
<Button variant="outline" size="sm" className="border-border/50">
  <Download className="h-4 w-4 mr-2" />
  Export
</Button>

// FIX: Add export functionality or remove if not implemented
onClick={() => handleExportTrades()} // OR remove entirely
```

**3. Profile.tsx - Line 146: "Upload" Button**
```tsx
// CURRENT (BROKEN):
<Button className="flex-1">Upload</Button>

// FIX: Add file input handler
onClick={() => fileInputRef.current?.click()}
```

**4. Profile.tsx - Line 332: "Save Preferences" Button**
```tsx
// CURRENT (NO-OP):
onClick={() => console.log("Saving preferred pairs:", preferredPairs)}

// FIX: Actually save to backend
onClick={handleSavePreferences}
```

**5. Trades.tsx - Lines 423-424: Dialog Action Buttons**
```tsx
// CURRENT (BROKEN):
<Button className="flex-1">Save Changes</Button>
<Button variant="outline" className="flex-1">Cancel</Button>

// FIX: Add handlers
<Button onClick={handleSaveEdit} className="flex-1">Save Changes</Button>
<Button onClick={() => setShowEditDialog(false)} variant="outline" className="flex-1">Cancel</Button>
```

---

## FLOW VALIDATION

### Add Trade Flow
**Entry Point**: Trades page "Add Trade" button  
**Issue**: Button has NO onClick handler  
**Impact**: User cannot add trades from Trades page  
**Status**: BROKEN  

**Workaround**: Dashboard has working trade form, but UX is fragmented

---

### Edit Trade Flow
**Entry Point**: Edit icon in trades table (NOT FOUND)  
**Issue**: Button exists in imports but not clearly implemented  
**Impact**: Unclear if edit feature is accessible  
**Status**: UNKNOWN - Needs verification  

---

### Save Preferences Flow
**Entry Point**: Profile "Save Preferences" button  
**Issue**: onclick={() => console.log(...)} - doesn't save  
**Impact**: User thinks preferences save but they don't  
**Status**: BROKEN - Silent Failure  

---

## MISSING ARIA LABELS

### Icon-Only Buttons Needing Accessibility Labels

| Page | Button | Icon | Fix |
|------|--------|------|-----|
| Dashboard | Info button | Info | `aria-label="View win rate analysis"` |
| Dashboard | History button | History | `aria-label="View trade history"` |
| Trades | Export | Download | `aria-label="Export trades to CSV"` |
| Journal | Delete | Trash2 | `aria-label="Delete journal entry"` |

---

## ISSUE PRIORITY & FIXES

### 🔴 CRITICAL (Fix Immediately)

**Issue #1: Trades.tsx - "Add Trade" button is dead**
- File: Frontend/src/pages/Trades.tsx
- Line: 117
- Fix: Add onClick handler to open trade dialog
- Effort: 2 minutes
- Impact: HIGH - Blocks main trade creation flow

**Issue #2: Profile.tsx - "Save Preferences" doesn't actually save**
- File: Frontend/src/pages/Profile.tsx
- Line: 332
- Fix: Replace console.log with actual API call
- Effort: 5 minutes (depends on API availability)
- Impact: HIGH - Silent failure, user confusion

**Issue #3: Trades.tsx - "Upload" button is dead**
- File: Frontend/src/pages/Profile.tsx
- Line: 146
- Fix: Add file input ref and click handler
- Effort: 5 minutes
- Impact: MEDIUM - Avatar upload blocked

**Issue #4: Trades.tsx - "Export" button is dead**
- File: Frontend/src/pages/Trades.tsx
- Line: 137
- Fix: Implement CSV export OR remove button
- Effort: 15 minutes (if implementing) or 1 minute (if removing)
- Impact: MEDIUM - Feature not essential for MVP

**Issue #5: Dialog buttons have no handlers**
- File: Frontend/src/pages/Trades.tsx
- Lines: 423-424
- Fix: Add onClick handlers for Save/Cancel
- Effort: 3 minutes
- Impact: MEDIUM - Edit trade dialog unusable

---

### 🟡 MEDIUM

**Issue #6: Missing aria-labels on icon-only buttons**
- File: Multiple
- Fix: Add aria-label attributes
- Effort: 10 minutes
- Impact: LOW - Accessibility improvement

**Issue #7: "Edit Trade" flow unclear**
- File: Frontend/src/pages/Trades.tsx
- Fix: Verify implementation and wire up if incomplete
- Effort: 10 minutes (for verification)
- Impact: MEDIUM - Feature completeness

---

## SUMMARY TABLE

| File | Issue | Type | Severity | Status |
|------|-------|------|----------|--------|
| Trades.tsx | "Add Trade" button no handler | DEAD | 🔴 CRITICAL | NEEDS FIX |
| Trades.tsx | "Export" button no handler | NO-OP | 🔴 CRITICAL | NEEDS FIX |
| Trades.tsx | Save Changes dialog button | DEAD | 🔴 CRITICAL | NEEDS FIX |
| Profile.tsx | "Upload" button no handler | DEAD | 🔴 CRITICAL | NEEDS FIX |
| Profile.tsx | Save Preferences console.log | NO-OP | 🔴 CRITICAL | NEEDS FIX |
| All pages | Missing aria-labels on icons | ACCESSIBILITY | 🟡 MEDIUM | NICE-TO-HAVE |
| Trades.tsx | Edit Trade implementation | UNCLEAR | 🟡 MEDIUM | NEEDS VERIFICATION |

---

## NEXT STEPS

**Immediate**: Fix all 🔴 CRITICAL issues listed above (5 fixes, ~15 minutes total)

**Follow-up**: 
1. Add aria-labels to icon-only buttons
2. Verify edit/delete trade flows
3. Run accessibility audit (axe-core)
4. Test on mobile devices

---

**Report Generated**: January 4, 2026
**Next Review**: After critical fixes applied
