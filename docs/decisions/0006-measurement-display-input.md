# ADR0006 - Measurement display and input

2026-10-08. Manager decision within R009/R010, implementation in progress.

Canonical centimeter values retain full floating precision. Metric display uses two decimal places. Imperial display uses feet and fractional inches rounded to1/16inch with reduced fractions/carry. This is a product default, not a universal architectural standard. Explicit cm/mm/m/in/ft or feet/inches/fractions override the active preference; bare imperial values mean inches. Coordinates may be signed, dimensions must be positive, offsets use their own constraints.

Display units are view preferences. Changing units and untouched field focus/blur must never create commands, history or provenance conversion. Fields retain their canonical input separately from rounded display, track actual edits, localize invalid input, and reveal proposed values before acceptance. Save/reopen and repeated unit toggles need exact value/history witnesses. Consumer traversal and closure repairs remain required beyond this increment.

Cancel retains draft text, explicitly labeled unapplied, while accepted geometry/history remain unchanged. Two consecutive ArrowUp and ArrowDown operations in each display mode must retain canonical residual precision. A narrow valid room whose default furniture does not fit remains usable; placement suggestions run before React state updaters and failures show nonblocking guidance.
