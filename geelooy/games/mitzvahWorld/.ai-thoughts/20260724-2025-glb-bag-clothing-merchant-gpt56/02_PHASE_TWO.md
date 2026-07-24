# B"H
# Phase Two — Inventory, Appearance, and Stats

Expand the inventory schema without breaking legacy damage/defense/focus consumers. Every garment receives the ten inspectable attributes: chochmah, binah, daas, chesed, gevurah, tiferes, netzach, hod, yesod, and malchus. Derived totals aggregate both legacy and spiritual stats.

Persist appearance separately by item ID. Color and fabric choices must be validated against a garment-specific palette and reusable fabric preset catalog. The equipment runtime applies changes once on inventory publication or model binding, never per frame. Shared material records must be isolated before mutation.
