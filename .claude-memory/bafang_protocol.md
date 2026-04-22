---
name: Bafang UART Protocol Details
description: Complete Bafang UART protocol including torque block layout confirmed from real save file
type: reference
originSessionId: 207f01e4-2475-419c-930d-903c213e385b
---
## Bafang UART Protocol
- Baud: 1200 bps, 8N1
- Read: `0x11 [block] 0x00`
- Write: `0x16 [block] [len] [...data...] [checksum]`
- Response: `0x06 [block] [len] [...data...] [checksum]`
- Checksum: XOR of data bytes only

## Block Codes
| Code | Block | Data Length |
|------|-------|-------------|
| 0x52 | Basic Parameters | ~24 bytes |
| 0x53 | Pedal Assist | ~11 bytes |
| 0x54 | Throttle Handle | ~6 bytes |
| 0x55 | Torque READ | 71 bytes |
| 0x56 | Torque WRITE | ~71 bytes |

## Torque 71-byte Layout (CONFIRMED from karlsspecialsauceludicrous.el)
Layout: 23 bytes calibration + 6×8 bytes speed profiles = 71 bytes exactly.
No "About Tq" section in this block.

```
[0-1]   BaseVoltage H+L (BV)
[2-3]   ErrorVoltage Min H+L (EV0)
[4-5]   ErrorVoltage Max H+L (EV1)
[6-21]  DeltaV 0-5kg through 50-60kg H+L (DV0-DV7, 8 pairs)
[22]    0-Speed Boost Time (SBT)
--- 6 speed profiles × 8 bytes each ---
[+0] StartKg (SS), [+1] FullKg (FS), [+2] ReturnKg (RS)
[+3] MinCur% (MIS), [+4] MaxCur% (MAS), [+5] KeepCur% (KS)
[+6] CurDecay (CS), [+7] SpdDnStop (SDS)
Spd0@[23], Spd20@[31], Spd40@[39], Spd60@[47], Spd80@[55], Spd100@[63]
```

**Key discovery:** The save file karlsspecialsauceludicrous.el confirmed 8 bytes per speed profile (not 7 as originally estimated). The 8th byte is SDS (SpeedDownStop), all=1 in the reference file. This leaves no room for "About Tq" params — those may be read-only or a separate block.

CAUTION: Byte ORDER still needs validation on real motor. The layout keys (field names → byte positions) are confirmed but the actual protocol byte ordering needs serial capture confirmation.
