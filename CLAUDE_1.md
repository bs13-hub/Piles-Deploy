# Piles

A session planner for people who think in piles, not projects.

Your calendar tells you when. Your list tells you what. Piles tells you what
actually fits in the time you have.

This file is the product's constitution. Read it before changing anything.

## Current state

`index.html` is a complete, working, single-file prototype (v1.3.1). No build
step, no dependencies, no server, no accounts. It has been verified end to end
in a headless browser. It is not production code and does not need to be.

The question this prototype exists to answer is **"does this interaction feel
compelling?"** Not "is this well architected." Optimize accordingly.

## The loop (do not break it)

messy pile → bounded session → capacity-aware selection → sequencing with
reasons → guided one-at-a-time execution → learned estimates

Every stage feeds the next. Execution generates the actual-duration data that
makes future selection smarter. That closed loop is the entire product thesis;
no competitor closes it. If a change would break a link in that chain, it is
the wrong change.

## Locked product decisions

These were each decided deliberately, several after a failed alternative.
Do not relitigate them without a stated reason.

- **A task is barely an object.** Name, estimated duration, optional deadline,
  learned actuals. Nothing else. Intelligence must work on a bare name.
- **A pile needs only a name.** No colors, icons, ordering, settings, or rules.
- **A session needs only** name, duration, start time, and the pile it draws from.
- **Auto-fill reserves a transition buffer** (14% of the session, clamped to
  5–7 minutes). It never packs to capacity. Overfilling triggers a blunt
  warning plus a one-tap fix, never a silent accept.
- **Every stated reason must be arithmetically true.** The sequencer computes a
  real timeline. If the washer is not done, it shows an explicit wait row rather
  than inventing a justification. Never display a sequencing reason that is false.
- **Auto-fill draws only from the session's own pile.** Cross-pile tasks with
  deadlines appear as an explicit "urgent exception" the user accepts or declines.
- **Capture defaults to one loose dump.** Sorting into piles is optional, after
  capture, never required upfront.
- **Learning is consent-gated.** Completion records time but learns nothing.
  The recap opens a review where actuals are editable and excludable, and
  suspicious overruns (2x planned, or +12 min) are flagged before anything
  updates an estimate. A forgotten timer must never poison the data.
- **Suggestions never act.** Recommended piles and calendar-window sessions
  both require an explicit tap. Nothing is ever auto-filed, auto-scheduled,
  or auto-started. Dismissals are permanent.
- **Wait time: active at plan time, passive during execution.** The planner may
  offer to fill a gap. Execution mode is a locked playlist; no new decisions
  mid-run.

## Never add

Projects. Tags. Priorities. Statuses. Kanban. Dashboards. Goals or OKRs.
Productivity scoring or streaks. Nested hierarchy. Custom fields. Team or
collaboration features. Accounts. Notifications. Payments. Autonomous
scheduling. Real calendar writes.

The competitive research was unambiguous: every incumbent that lost this
audience lost it by adding exactly these. Restraint is the product.

## Working agreements

- **Keep it one file.** Single self-contained `index.html`. No build step, no
  framework, no package.json. Portability is a feature.
- **Verify before claiming done.** Load it in a headless browser, click the
  actual flow, confirm zero console errors. Do not report a change as working
  without exercising it.
- **The demo must stay demoable.** The simulated clock (6:10 PM), the seeded
  House Reset scenario, Fast-forward, and the deliberate 26-minute "forgotten
  timer" on Wipe counters exist so the whole loop can be felt in 90 seconds.
  Preserve them.
- **State persists in localStorage** with a double-tap "Reset demo data" under
  the Piles tab. Keep the reset.
- **Small diffs.** This is a prototype under active feel-testing, not a refactor
  target. Change what was asked; leave the rest alone.

## Known open questions

- Do piles beat a single inbox, or are they friction dressed as relief?
- Does the recommended-pile suggestion survive real vocabulary? Keyword
  matching is the weakest part of the build and the best candidate for a real
  model call.
- Container terminology: the product is Piles, but a time container is still
  called a "session" in-app. Unresolved.
- The "avoided ×N" badge is seeded data with no real counter behind it. Wire it
  honestly or cut it.
- The task sheet's pile picker drifts toward a "move to folder" dialog as piles
  multiply. Watch it.

## Context

Formerly codenamed "Sprints" (dropped: Zoho collision, agile baggage).
Independent competitor research in August 2026 found no shipping product that
closes the full loop, and zero products anywhere that do dependency- and
parallel-aware sequencing with stated reasons. Realistic ceiling is a strong
indie product, not a venture outcome. Trademark search on "Piles" is still
outstanding; app-store-level collision checks are clear.
