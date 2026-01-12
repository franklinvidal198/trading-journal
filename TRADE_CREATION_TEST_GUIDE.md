# Trade Creation - Quick Testing Guide

## 🚀 Start Here

### Prerequisites
- [ ] Backend running (FastAPI server started)
- [ ] Frontend running (Vite dev server started)
- [ ] You're logged in as a user (JWT token in localStorage)

---

## 📋 Test Cases

### Test 1: Open Trade Form
**Expected:** Dialog opens with empty form, all fields visible

```
1. Navigate to Trades page
2. Click "Add Trade" button (blue gradient button with + icon)
3. Verify dialog opens with title "Record a New Trade"
4. Verify all 9 form fields are visible:
   - Pair
   - Direction (BUY/SELL select)
   - Entry Price
   - Exit Price (optional)
   - Stop Loss
   - Take Profit
   - Position Size
   - Notes (optional)
   - Screenshot URL (optional)
5. Verify "Save Trade" button is visible
6. Verify button is DISABLED until form is filled
```

---

### Test 2: Required Field Validation
**Expected:** Cannot save without required fields, error messages appear

```
1. Click "Save Trade" button with empty form
2. Verify error message: "Please fix the validation errors below"
3. Verify red error message below "Pair" field
4. Fill in: Pair = "EUR/USD"
5. Click "Save Trade"
6. Verify error for Entry Price appears
7. Continue this process for all required fields
8. Error messages should disappear as valid values are entered
```

**Required Fields to Test:**
- Pair (text) - try: empty, then "EUR/USD"
- Entry Price (number) - try: empty, then "1.05", then "0" (should show error)
- Stop Loss (number) - try: empty, then "1.04"
- Take Profit (number) - try: empty, then "1.06"
- Position Size (number) - try: empty, then "1.0"

---

### Test 3: Price Range Validation
**Expected:** Fields must be greater than 0

```
1. Fill form with:
   - Pair: "EUR/USD"
   - Direction: "BUY"
   - Entry Price: "0"  ← ZERO (invalid)
   - Stop Loss: "1.04"
   - Take Profit: "1.06"
   - Position Size: "1.0"

2. Verify error: "Entry price must be greater than 0"
3. Verify "Save Trade" button is disabled
4. Change Entry Price to "1.05"
5. Verify error disappears
6. Verify button becomes enabled

Repeat for:
- Entry Price = 0 or negative
- Stop Loss = 0 or negative
- Take Profit = 0 or negative
- Position Size = 0 or negative
```

---

### Test 4: Price Logic Validation (BUY)
**Expected:** For BUY trades: stop_loss < entry_price < take_profit

```
1. Fill form with:
   - Pair: "EUR/USD"
   - Direction: "BUY"  ← Important!
   - Entry Price: "1.05"
   - Stop Loss: "1.06"  ← WRONG (should be below entry)
   - Take Profit: "1.07"
   - Position Size: "1.0"

2. Verify error: "Stop loss must be below entry price for BUY trades"
3. Change Stop Loss to "1.04"
4. Verify error disappears for Stop Loss
5. Now change Take Profit to "1.03"
6. Verify error: "Take profit must be above entry price for BUY trades"
7. Change Take Profit to "1.06"
8. Verify all errors gone and button enabled
```

---

### Test 5: Price Logic Validation (SELL)
**Expected:** For SELL trades: take_profit < entry_price < stop_loss

```
1. Fill form with:
   - Pair: "EUR/USD"
   - Direction: "SELL"  ← Different from BUY!
   - Entry Price: "1.05"
   - Stop Loss: "1.04"  ← WRONG (should be above entry for SELL)
   - Take Profit: "1.06"  ← WRONG (should be below entry for SELL)
   - Position Size: "1.0"

2. Verify error for Stop Loss: "Stop loss must be above entry price for SELL trades"
3. Verify error for Take Profit: "Take profit must be below entry price for SELL trades"
4. Change to correct values:
   - Stop Loss: "1.06"
   - Take Profit: "1.04"
5. Verify all errors gone
6. Button should be enabled
```

---

### Test 6: Optional Fields
**Expected:** Can save with optional fields empty

```
1. Fill REQUIRED fields only:
   - Pair: "EUR/USD"
   - Direction: "BUY"
   - Entry Price: "1.05"
   - Stop Loss: "1.04"
   - Take Profit: "1.06"
   - Position Size: "1.0"

2. Leave OPTIONAL fields empty:
   - Exit Price: (empty)
   - Notes: (empty)
   - Screenshot URL: (empty)

3. Verify button is ENABLED
4. Verify no errors
5. Click "Save Trade"
6. (See Test 7 for what happens next)
```

---

### Test 7: Successful Trade Creation
**Expected:** Trade created, dialog closes, success notification, list updates

```
1. Fill form with valid data:
   - Pair: "EUR/USD"
   - Direction: "BUY"
   - Entry Price: "1.05"
   - Stop Loss: "1.04"
   - Take Profit: "1.06"
   - Position Size: "1.0"
   - Notes: "Test trade from form"

2. Click "Save Trade"
3. Verify button text changes to "Saving..."
4. Verify button is disabled during save
5. Wait 1-2 seconds
6. EXPECTED RESULTS:
   ✓ Dialog closes automatically
   ✓ Success toast appears: "Trade created successfully!"
   ✓ Toast auto-dismisses after 3 seconds
   ✓ Trades list visible with new trade at top
   ✓ New trade shows:
     - Pair: "EUR/USD"
     - Direction: "BUY" (with up arrow icon)
     - Entry: "1.05"
     - Status: "OPEN"
     - Risk: "0.01" (calculated as stop_loss - entry_price)
     - etc.
```

---

### Test 8: Consecutive Trades
**Expected:** Can create multiple trades in a row

```
1. Click "Add Trade" button
2. Fill form with: EUR/USD, BUY, 1.05, 1.04, 1.06, 1.0
3. Click "Save Trade"
4. Wait for success notification
5. Immediately click "Add Trade" again
6. Verify form is EMPTY (reset from previous trade)
7. Fill form with: GBP/USD, SELL, 1.25, 1.26, 1.24, 2.0
8. Click "Save Trade"
9. Verify new trade created
10. Verify BOTH trades in the list
11. Verify counts updated (should show 2 open trades)
```

---

### Test 9: Error Recovery
**Expected:** Can fix errors and resubmit

```
1. Fill form with:
   - Pair: "EUR/USD"
   - Direction: "BUY"
   - Entry Price: "1.05"
   - Stop Loss: "1.04"
   - Take Profit: "1.06"
   - Position Size: "1.0"

2. Click "Save Trade"
3. Assume backend error (network down, invalid data, etc.)
4. EXPECTED: 
   ✓ Error message appears in red alert box
   ✓ Toast notification shows error
   ✓ Dialog STAYS OPEN (not closed)
   ✓ Form values ARE PRESERVED
   ✓ Button returns to "Save Trade" (not "Saving...")

5. Modify one field and retry
6. Should succeed second time
```

---

### Test 10: Stats Update
**Expected:** Stats page updates with new trade

```
1. Navigate to Trades page
2. Create a new trade (see Test 7)
3. Navigate to Stats page (or Dashboard)
4. Verify equity curve updated with new trade point
5. Verify summary stats changed:
   - Total Trades: increased by 1
   - Equity: changed (depends on trade P&L)
   - Open Trades: increased by 1
6. Come back to Trades page
7. Verify same trade still appears in list
```

---

## 🔍 Debug Checklist

If something isn't working:

### Form Fields Not Displaying
- [ ] Check browser console for JavaScript errors
- [ ] Verify imports in TradeForm:
  ```
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  ```
- [ ] Verify components are installed: `npm ls shadcn-ui`

### Dialog Not Opening
- [ ] Check browser console for errors
- [ ] Verify Dialog component imported: `import { Dialog, DialogTrigger, DialogContent, ... } from "@/components/ui/dialog"`
- [ ] Check `showCreateDialog` state in Trades.tsx

### Validation Not Working
- [ ] Check browser console - should see validation errors logged
- [ ] Try entering a value and pressing Tab to trigger blur event
- [ ] Check form field `onChange={handleChange}` is wired

### Success Toast Not Showing
- [ ] Check browser console for errors
- [ ] Verify sonner is installed: `npm ls sonner`
- [ ] Verify Sonner provider exists in App.tsx
- [ ] Check browser notification settings

### New Trade Not Appearing
- [ ] Check browser Network tab:
  - Should see POST /api/v1/trades/ request with 201 status
  - Should see GET /trades/ request after creation
- [ ] Check trade list is actually empty or trade is outside visible viewport
- [ ] Try scrolling to top of table
- [ ] Refresh page manually (F5)

### Backend Not Responding
- [ ] Verify FastAPI server is running
- [ ] Check backend console for errors
- [ ] Check Network tab: what status code is returned?
  - 401: Authentication error (token expired)
  - 422: Validation error (bad data)
  - 500: Server error (check backend logs)
  - Other: Check response body

---

## 📊 Expected Data Structure

### Trade Created Should Look Like:
```json
{
  "id": 123,
  "user_id": "user@example.com",
  "pair": "EUR/USD",
  "direction": "BUY",
  "entry_price": 1.05,
  "exit_price": null,
  "stop_loss": 1.04,
  "take_profit": 1.06,
  "position_size": 1.0,
  "status": "OPEN",
  "notes": "Test trade from form",
  "screenshot_url": null,
  "created_at": "2024-01-15T10:30:45.123Z",
  "updated_at": "2024-01-15T10:30:45.123Z"
}
```

### Trade In List Should Display:
| Column | Value | Notes |
|--------|-------|-------|
| Pair | EUR/USD | |
| Direction | BUY | Green upward arrow |
| Entry | 1.0500 | |
| Stop Loss | 1.0400 | |
| Take Profit | 1.0600 | |
| Risk (calculated) | 0.0100 | entry - stop_loss |
| Reward (calculated) | 0.0100 | profit - entry |
| Position Size | 1.0 | |
| Status | OPEN | Blue badge |
| Actions | Edit, Close, Delete | Icons/buttons |

---

## ✅ Sign-Off

Once all 10 tests pass:
- [ ] Trade creation feature is WORKING
- [ ] Ready for production deployment
- [ ] Safe to close this issue

If any test fails:
- [ ] Note which test failed
- [ ] Check Debug Checklist
- [ ] Review implementation in TRADE_CREATION_IMPLEMENTATION_COMPLETE.md
- [ ] Check browser console and network tab for errors
- [ ] Contact dev team with error details
