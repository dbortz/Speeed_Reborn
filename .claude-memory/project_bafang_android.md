---
name: BafangAndroid Project Context
description: Android app to program Bafang e-bike motor controllers via USB OTG - main project goals and status
type: project
originSessionId: 207f01e4-2475-419c-930d-903c213e385b
---
Building an Android app (React + Ionic + Capacitor) to replace the Windows-only OpenBafangTool. User has a Bafang G510 motor (UART version, not CAN). The main motivation is the Torque sensor section which only exists in Controllerst_torque.exe (no open source equivalent).

**Why:** User wants to program their e-bike from their phone/tablet, mainly to configure the torque sensor (Spd0-Spd100 columns). Without torque section, user said they'll stick with the existing speeed app.

**How to apply:** App is complete and APK is built. Validate on real motor when accessible.

**Status (2026-04-20): COMPLETE — APK built**
All 15 tasks finished. APK at: `J:/Bafangtool/BafangAndroid/android/app/build/outputs/apk/debug/app-debug.apk`

Tech stack: React 18 + TypeScript + Ionic 8 + Capacitor 8 + Zustand + `@adeunis/capacitor-serial`

**USB Serial plugin:** `@adeunis/capacitor-serial` v1.0.6 (NOT @adeuros which 404s). Uses writeHexadecimal() + registerReadRawCallback() for binary data.

Key discovery: Torque block codes are 0x55 (read) and 0x56 (write), response is 71 bytes. Byte layout is APPROXIMATE (inferred from UI strings, not confirmed by serial capture).

**Known limitations:**
- Torque byte layout unvalidated — needs real motor test
- speedmeter_magnets not encoded in Basic write (protocol byte layout approximate)
- Basic params: encode layout was changed from plan due to byte collision (non-interleaved: speed_limits bytes 3-12, current_limits bytes 13-22)

Project files:
- CLAUDE.md at J:/Bafangtool/CLAUDE.md - full technical details
- App at J:/Bafangtool/BafangAndroid/
- Reference: J:/Bafangtool/Example/OpenBafangTool-master/ (original Electron app)
