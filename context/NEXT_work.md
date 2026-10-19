# Next Feature Intake

Use this file as a scratchpad for the next Vidora feature. The text can be rough, incomplete, or non-technical.

## Rough Idea

<!-- Describe the problem or feature in your own words. Do not worry about exact implementation. -->

## Why It Matters

<!-- Who benefits? What should become easier, safer, faster, or clearer? -->

## Known Constraints

<!-- Mention existing pages, APIs, design references, deadlines, or things that must not change. -->

## Questions to Discuss

- Which users and routes are affected?
- Is this UI-only, backend behavior, or both?
- What is the smallest useful first version?
- What should happen on loading, empty, error, unauthorized, and mobile states?
- Does it require new data, endpoint changes, or model changes?
- How will success be tested?

## After Discussion

Do not implement directly from this file. Once the idea is agreed:

1. Create `context/features/<feature_name>.md`.
2. Include the finalized scope, affected files, data/API contract, UX states, acceptance criteria, and validation commands.
3. Update `build-plan.md` with the active feature.
4. Implement the feature only after the prompt is reviewed.
