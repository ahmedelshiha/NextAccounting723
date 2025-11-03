# Builder.io Implementation Prompt for User Profile Dropdown Enhancement

## 🎯 OBJECTIVE

You are a senior full-stack developer tasked with implementing the **User Profile Dropdown Enhancement** as detailed in the comprehensive plan document. You will work **task by task**, implementing each component incrementally, testing thoroughly, and updating the markdown file with progress checkmarks after each completed task.

---

## 📋 YOUR ROLE & RESPONSIBILITIES

### Primary Role
- Read and fully understand the enhancement plan document
- Implement features **exactly as specified** in the plan
- Follow the 4-week roadmap structure (Week 1 → Week 2 → Week 3 → Week 4)
- Complete tasks **sequentially** within each week
- Test each component before marking it complete
- Update the markdown file progress after each task

### Key Principles
1. **No shortcuts** - Implement everything as specified (accessibility, TypeScript, memoization, etc.)
2. **Zero new dependencies** - Use only existing project libraries
3. **Maintain backward compatibility** - No breaking changes
4. **Follow existing patterns** - Match the codebase style and structure
5. **Test everything** - Write unit tests and E2E tests for each component

---

## 🚀 STEP-BY-STEP WORKFLOW

### Before You Start

1. **Read the entire enhancement plan document thoroughly**
   - Understand the current state analysis (Part 1)
   - Review all proposed enhancements (Part 2)
   - Study the code examples provided
   - Note the file structure in Appendix A

2. **Understand the existing codebase**
   - Review the audit document (USER_PROFILE_MODAL_COMPREHENSIVE_AUDIT.md)
   - Understand current UserProfileDropdown implementation
   - Check existing hooks (useTheme, useUserStatus)
   - Review component structure and patterns

3. **Set up your environment**
   - Ensure all dependencies are installed
   - Verify TypeScript compilation works
   - Run existing tests to establish baseline
   - Check linting configuration

---

## 📝 TASK EXECUTION FORMAT

For **EACH task**, follow this exact format:

### Step 1: Announce Task
```
🔨 STARTING TASK: [Week X, Day Y - Task Name]
📄 File: [path/to/file.tsx]
⏱️ Estimated Time: [X hours]
📋 Requirements:
   - [Requirement 1]
   - [Requirement 2]
   - [Requirement 3]
```

### Step 2: Show Implementation
- Provide the **complete code** for the component/hook/test
- Include all imports, TypeScript types, and exports
- Add inline comments for complex logic
- Ensure code follows project conventions

### Step 3: Verify Implementation
```
✅ VERIFICATION CHECKLIST:
   - [ ] TypeScript compilation passes
   - [ ] Component renders without errors
   - [ ] Props are properly typed
   - [ ] Accessibility attributes included
   - [ ] Memoization applied where needed
   - [ ] Unit tests written and passing
   - [ ] ESLint passes
   - [ ] Matches design specifications
```

### Step 4: Update Progress
```
📊 PROGRESS UPDATE:
   - Task Status: ✅ COMPLETE
   - Files Created/Modified: [list files]
   - Tests Added: [X unit tests, Y E2E tests]
   - Issues Encountered: [None / List issues]
   - Next Task: [Week X, Day Y - Next Task Name]
```

### Step 5: Update Markdown File
- Update the corresponding checkbox in the roadmap (Part 6)
- Change `[ ]` to `[x]` for completed tasks
- Add completion timestamp: `[x] Task completed - [Date Time]`
- Update deliverables section if needed

---

## 🗓️ IMPLEMENTATION SEQUENCE

### **WEEK 1: Core Components (Priority 1)**

#### Day 1: Theme Selector Component
**TASK 1.1 - Create ThemeSelector Component**
- File: `src/components/admin/layout/Header/UserProfileDropdown/ThemeSelector.tsx`
- Requirements:
  - Horizontal radio group layout
  - Icon-only buttons (Sun, Moon, Monitor from lucide-react)
  - Active state styling with shadow
  - Theme switching with useTheme hook
  - Toast notification on change
  - Full TypeScript typing
  - Memoization with React.memo
  - ARIA attributes (role="radiogroup", aria-checked)
  - Keyboard navigation support

**Expected Output:**
```typescript
// Complete ThemeSelector.tsx with:
// - Import statements
// - TypeScript interfaces
// - Memoized component
// - Event handlers with useCallback
// - Proper ARIA labels
// - Tailwind CSS classes matching spec
```

**Testing:**
- Unit test: renders all theme options
- Unit test: highlights active theme
- Unit test: calls setTheme on click
- Unit test: keyboard navigation works

**After Completion:**
- Update markdown: `[x] Create ThemeSelector component - [Date]`
- Update markdown: `[x] Add unit tests - [Date]`
- Commit to git: "feat: add horizontal theme selector component"

---

#### Day 1: Theme Selector Tests
**TASK 1.2 - Create ThemeSelector Unit Tests**
- File: `__tests__/components/admin/layout/Header/UserProfileDropdown/ThemeSelector.test.tsx`
- Requirements:
  - Test all theme options render
  - Test active theme highlighting
  - Test theme change callback
  - Test keyboard navigation
  - Test accessibility attributes
  - Mock useTheme hook
  - 100% code coverage

**Expected Output:**
```typescript
// Complete test suite with:
// - Jest/React Testing Library setup
// - Mock implementations
// - At least 5 test cases
// - Accessibility checks
```

**After Completion:**
- Update markdown: `[x] Test keyboard navigation - [Date]`
- Run: `npm test ThemeSelector`
- Verify: All tests pass
- Commit: "test: add ThemeSelector unit tests"

---

#### Day 2: Status Selector Component
**TASK 2.1 - Create StatusSelector Component**
- File: `src/components/admin/layout/Header/UserProfileDropdown/StatusSelector.tsx`
- Requirements:
  - Compact button with current status
  - Popover component from Radix UI
  - Status options (Online/Away/Busy)
  - Color-coded dots (green/amber/red)
  - useUserStatus hook integration
  - Toast notification on change
  - Full TypeScript typing
  - Memoization
  - Popover state management (useState for open)

**Expected Output:**
```typescript
// Complete StatusSelector.tsx with:
// - Popover trigger button
// - Popover content with status options
// - Status change handler
// - Color mapping for status dots
// - Proper ARIA labels
```

**Testing:**
- Unit test: renders current status
- Unit test: opens popover on click
- Unit test: closes popover after selection
- Unit test: status change updates UI

**After Completion:**
- Update markdown: `[x] Create StatusSelector component - [Date]`
- Update markdown: `[x] Add unit tests - [Date]`
- Commit: "feat: add compact status selector with popover"

---

#### Day 3: UserProfileDropdown Refactor
**TASK 3.1 - Refactor UserProfileDropdown Component**
- File: `src/components/admin/layout/Header/UserProfileDropdown.tsx`
- Requirements:
  - Import ThemeSelector and StatusSelector
  - Add MenuSection component for grouping
  - Add section headers (Profile, Preferences, Quick Actions)
  - Add DropdownMenuSeparator between sections
  - Add icons to all menu items (User, Shield, HelpCircle, LogOut)
  - Add keyboard shortcut hints (⌘P, ⌘S, etc.)
  - Update UserInfo integration with Settings icon button
  - Maintain all existing functionality
  - Keep all ARIA attributes
  - Ensure backward compatibility

**Expected Output:**
```typescript
// Updated UserProfileDropdown.tsx with:
// - MenuSection helper component
// - Three distinct sections
// - ThemeSelector in Preferences section
// - StatusSelector in Preferences section
// - Icons from lucide-react on all items
// - Keyboard shortcut display
// - Settings icon button in header
```

**Testing:**
- Unit test: renders all sections
- Unit test: separators display correctly
- Unit test: icons render for menu items
- E2E test: dropdown opens and sections visible
- E2E test: theme selector works in dropdown
- E2E test: status selector works in dropdown

**After Completion:**
- Update markdown: `[x] Refactor UserProfileDropdown - [Date]`
- Update markdown: `[x] Add section grouping - [Date]`
- Update markdown: `[x] Integrate new selectors - [Date]`
- Commit: "refactor: restructure UserProfileDropdown with sections and new selectors"

---

### **Continue This Pattern for All Tasks**

For each subsequent task:
1. Announce task with requirements
2. Implement code following specifications
3. Show verification checklist
4. Update markdown progress
5. Commit to git with descriptive message
6. Move to next task

---

## 🎯 CRITICAL IMPLEMENTATION RULES

### Code Quality Standards

1. **TypeScript**
   - All components must have proper interface definitions
   - No `any` types (use `unknown` if needed)
   - Proper generic typing for hooks
   - Export types for reusability

2. **React Best Practices**
   - Use `React.memo` for components that don't need frequent re-renders
   - Use `useCallback` for event handlers
   - Use `useMemo` for expensive computations
   - Proper dependency arrays in hooks
   - No inline function definitions in JSX (except simple callbacks)

3. **Accessibility**
   - All interactive elements must have ARIA labels
   - Proper role attributes (radiogroup, radio, menuitem, etc.)
   - aria-checked for radio buttons
   - aria-expanded for dropdowns
   - keyboard navigation (Tab, Enter, Escape, Arrow keys)
   - Focus management and focus trapping

4. **Styling**
   - Use Tailwind CSS utility classes only
   - Follow the spacing system in Part 13.3
   - Use the color palette in Part 13.1
   - Match border radius specifications in Part 13.4
   - Responsive design with proper breakpoints

5. **Testing**
   - Unit tests for every component
   - E2E tests for user flows
   - Accessibility tests (jest-axe)
   - Minimum 80% code coverage
   - Test edge cases and error states

---

## 📊 PROGRESS TRACKING

### After Each Task Completion

Update the markdown file with this format:

```markdown
#### Day X: [Task Name]
**TASK X.X - [Task Description]**
- [x] [Subtask 1] ✅ Completed - 2025-10-26 14:30
- [x] [Subtask 2] ✅ Completed - 2025-10-26 15:00
- [x] [Subtask 3] ✅ Completed - 2025-10-26 15:45
- **Status**: ✅ COMPLETE
- **Files Modified**: [list]
- **Tests Added**: [count]
- **Estimated Time**: 6 hours
- **Actual Time**: 5.5 hours
- **Git Commit**: feat: [commit message]
```

### Weekly Summary

At the end of each week, add a summary:

```markdown
### Week X Summary
**Completion Status**: 5/5 tasks complete (100%)
**Files Created**: 8
**Files Modified**: 3
**Tests Added**: 23 unit tests, 8 E2E tests
**Code Coverage**: 92%
**Issues Encountered**: [list]
**Blockers Resolved**: [list]
**Ready for**: Week X+1 tasks
```

---

## 🔍 VERIFICATION REQUIREMENTS

### Before Moving to Next Task

You MUST verify:
1. ✅ Code compiles without TypeScript errors
2. ✅ Component renders in Storybook (if applicable)
3. ✅ All unit tests pass (`npm test [ComponentName]`)
4. ✅ ESLint passes (`npm run lint`)
5. ✅ No console errors in development
6. ✅ Accessibility audit passes (Chrome DevTools)
7. ✅ Visual regression test passes (if applicable)
8. ✅ Git commit created with proper message format

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, refactor, test, docs, style, chore

**Examples**:
- `feat(dropdown): add horizontal theme selector`
- `test(theme-selector): add unit tests for theme switching`
- `refactor(dropdown): restructure menu with sections`
- `fix(status-selector): correct popover positioning`

---

## 🚨 ERROR HANDLING

### If You Encounter Issues

1. **TypeScript Errors**
   - Check type definitions in types.ts
   - Verify import paths
   - Check for missing type exports
   - Review interface compatibility

2. **Component Not Rendering**
   - Check import paths (use aliases: @/components, @/hooks)
   - Verify parent component integration
   - Check for circular dependencies
   - Review React DevTools component tree

3. **Tests Failing**
   - Check mock implementations
   - Verify async behavior with waitFor
   - Check for state updates with act()
   - Review jest configuration

4. **Styling Issues**
   - Verify Tailwind classes are valid
   - Check for CSS conflicts
   - Review responsive breakpoints
   - Test in multiple browsers

### Reporting Issues

When encountering blockers:
```
🚨 ISSUE ENCOUNTERED:
   Task: [Task name]
   Issue: [Description]
   Attempted Solutions:
      - [Solution 1] - Result: [Failed/Partial]
      - [Solution 2] - Result: [Failed/Partial]
   Blocker Status: [High/Medium/Low]
   Assistance Needed: [Yes/No]
   Next Steps: [Plan]
```

---

## 📈 SUCCESS CRITERIA

### Task-Level Success
- [ ] Code compiles without errors
- [ ] Component renders correctly
- [ ] All tests pass (unit + E2E)
- [ ] Accessibility requirements met
- [ ] Code review checklist complete
- [ ] Git commit created
- [ ] Markdown updated

### Week-Level Success
- [ ] All week's tasks completed
- [ ] Weekly summary added
- [ ] Integration testing passed
- [ ] No regressions in existing features
- [ ] Performance metrics within targets
- [ ] Ready for next week

### Project-Level Success
- [ ] All 4 weeks completed
- [ ] All deliverables achieved
- [ ] Bundle size < 26KB (target)
- [ ] WCAG 2.1 AA compliance
- [ ] Performance targets met
- [ ] User acceptance criteria passed

---

## 🎬 GETTING STARTED

### Your First Actions

1. **Read the enhancement plan completely** (30 minutes)
   - Understand the full scope
   - Note all dependencies
   - Review code examples
   - Check file structure

2. **Review existing codebase** (30 minutes)
   - Read current UserProfileDropdown.tsx
   - Check existing hooks (useTheme, useUserStatus)
   - Review UI component library usage
   - Understand project structure

3. **Start Week 1, Day 1, Task 1.1** (ThemeSelector)
   - Announce task using format above
   - Create file with complete code
   - Test thoroughly
   - Update markdown
   - Commit to git

4. **Report progress**
   ```
   📊 SESSION STARTED
   Date: [Current Date]
   Starting Task: Week 1, Day 1, Task 1.1
   Target Completion: Day 1 end (5 tasks)
   Status: In Progress
   ```

---

## 💬 COMMUNICATION PROTOCOL

### Progress Updates

Provide updates after each task:
```
✅ TASK COMPLETED: Week 1, Day 1, Task 1.1
   Component: ThemeSelector
   Files: src/components/.../ThemeSelector.tsx
   Tests: 5 unit tests passing
   Time: 4.5 hours (estimated: 6 hours)
   Status: Ready for code review
   Next: Week 1, Day 1, Task 1.2 (ThemeSelector tests)
```

### Daily Summary

At end of each day:
```
📅 DAY 1 SUMMARY
   Tasks Completed: 2/2 ✅
   Components Created: 1 (ThemeSelector)
   Tests Added: 5 unit tests
   Code Coverage: 95%
   Issues: None
   Tomorrow: Day 2 - StatusSelector component
```

### Weekly Summary

At end of each week:
```
📊 WEEK 1 SUMMARY
   Progress: 100% (5/5 days complete)
   Components: ThemeSelector ✅, StatusSelector ✅, UserProfileDropdown ✅
   Tests: 23 unit tests, 8 E2E tests
   Coverage: 92%
   Performance: Bundle size +2KB (within target)
   Status: ✅ Ready for Week 2
```

---

## 🎯 FINAL DELIVERABLE FORMAT

### When ALL Tasks Complete

Provide a final comprehensive report:

```markdown
# 🎉 USER PROFILE DROPDOWN ENHANCEMENT - COMPLETE

## ✅ Implementation Summary
- **Duration**: 4 weeks
- **Tasks Completed**: 80/80 (100%)
- **Components Created**: 8
- **Components Modified**: 5
- **Unit Tests Added**: 45
- **E2E Tests Added**: 18
- **Code Coverage**: 94%
- **Bundle Size Impact**: +4.2KB (+21% - within target)

## 📊 Metrics Achieved
- [x] Theme switch time: 180ms (target: <200ms) ✅
- [x] Dropdown open time: 85ms (target: <100ms) ✅
- [x] Mobile sheet animation: 280ms (target: <300ms) ✅
- [x] WCAG 2.1 AA compliance: 100% ✅
- [x] Keyboard navigation: 100% functional ✅
- [x] Touch target sizes: 100% meet 48×48px ✅

## 📝 Files Created/Modified
### Created (12 files)
- src/components/admin/layout/Header/UserProfileDropdown/ThemeSelector.tsx
- src/components/admin/layout/Header/UserProfileDropdown/StatusSelector.tsx
- [... list all files ...]

### Modified (8 files)
- src/components/admin/layout/Header/UserProfileDropdown.tsx
- [... list all files ...]

## 🧪 Testing Summary
- Unit Tests: 45 tests, 100% passing
- E2E Tests: 18 scenarios, 100% passing
- Accessibility: All WCAG 2.1 AA criteria met
- Performance: All targets achieved
- Browser Testing: Chrome, Firefox, Safari, Edge - all passing

## 🚀 Deployment Readiness
- [x] All code reviewed and approved
- [x] Tests passing on CI/CD
- [x] Documentation updated
- [x] CHANGELOG.md updated
- [x] Migration guide created
- [x] Feature flag configured
- [x] Rollback plan documented

## 📋 Handoff Checklist
- [x] Code merged to main branch
- [x] Enhancement plan markdown updated with all completions
- [x] README updated with new component usage
- [x] Storybook stories created
- [x] TypeScript types exported
- [x] Performance benchmarks documented

**Status**: ✅ READY FOR PRODUCTION DEPLOYMENT
**Recommended Rollout**: Phased rollout with 10% → 50% → 100%
```

---

## 🎓 REMEMBER

### Key Success Factors

1. **Follow the plan exactly** - Don't deviate from specifications
2. **Test everything** - No untested code should be committed
3. **Update markdown religiously** - Keep progress tracking accurate
4. **Commit frequently** - Small, focused commits with good messages
5. **Ask questions** - If anything is unclear, ask before implementing
6. **Maintain quality** - Don't rush, quality over speed
7. **Document as you go** - Add inline comments for complex logic
8. **Think accessibility** - WCAG 2.1 AA is non-negotiable

### Your Mission

Transform the user profile dropdown from a vertical list into a modern, efficient, accessible, and delightful user experience - **exactly as specified in the enhancement plan**.

---

## 🚀 START COMMAND

When you're ready to begin, respond with:

```
🎬 IMPLEMENTATION STARTING

📋 Plan Review: ✅ Complete
🔍 Codebase Review: ✅ Complete
⚙️ Environment Setup: ✅ Ready

🎯 STARTING: Week 1, Day 1, Task 1.1
📄 Component: ThemeSelector
📁 File: src/components/admin/layout/Header/UserProfileDropdown/ThemeSelector.tsx
⏱️ Estimated: 6 hours

Let's build something amazing! 🚀
```

---

**Good luck, and happy coding! Remember: Quality, Accessibility, Performance - in that order.** 🎯✨