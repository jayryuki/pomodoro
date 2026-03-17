# Pomodoro PWA - Design Specification

**Date:** 2026-03-17  
**Status:** Draft

## Core Concept

A minimalist PWA pomodoro app where phone rotation selects timer presets. The rotation wheel cycles through presets, landing in a zone activates it, and rotating to the next preset after alarm stops the alert and auto-starts the next timer.

## Architecture

- Single-page PWA with offline support (service worker + manifest)
- Vanilla JS or lightweight framework
- LocalStorage for persisting custom presets and sprite assets

## Rotation Detection

- Use `DeviceOrientationEvent` API to track phone orientation
- Accumulate rotation delta to create a continuous wheel (no max)
- Zone calculation: `zone = Math.floor(accumulatedRotation / 90) % 4` (0-90° = zone 0, 90-180° = zone 1, etc., then wraps)
- Zone activates instantly when entering a new zone
- **During normal use (timer running or stopped):** rotating to a new zone activates that preset and resets the timer to the new preset duration (timer stays stopped, user must press start)
- **After alarm (timer = 0):** rotating to a new zone activates the preset, resets timer, and auto-starts the countdown

## Timer Logic

- **On preset activation (normal):** Reset timer to preset duration (timer stays stopped)
- **On Start:** Lock rotation detection — rotation events continue to be tracked but zone changes are ignored. Timer begins countdown.
- **On Timer = 0:** Play alarm sound. Rotation is now UNLOCKED (zone changes are detected).
- **On Rotation after alarm:** Stop alarm, activate new preset, reset timer to new preset duration, auto-start countdown
- Rotation lock only applies while timer is actively counting down (timer > 0 and not alarm state)

## Settings

- Toggle to force unlock rotation (allows zone changes even while timer is counting down)
- Edit preset durations (list of 4 values: 5, 10, 30, 60 minutes)
- Debug toggle to show rotation values

## Sprite System (User-Requested)

- Base interface for swapping UI elements (companion, icons, timer display)
- Users can add their own sprites to have a pomodoro companion
- Stored in LocalStorage as base64 or external URLs
- Asset manifest defines swap points: `companion_sprite`, `timer_bg`, etc.

## UI Components

- Large timer display (current time remaining)
- Current preset indicator
- Start/Stop button
- Settings icon

## Default Presets

| Preset | Duration |
|--------|----------|
| 1      | 5 min    |
| 2      | 10 min   |
| 3      | 30 min   |
| 4      | 60 min   |
