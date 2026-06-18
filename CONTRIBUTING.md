# Contributing

1. Add or update a complete skill folder containing `SKILL.md`.
2. Keep secrets, runtime state, caches, generated reports, and private customer data out of the repository.
3. Record upstream source and license details in `THIRD_PARTY_NOTICES.md`.
4. Run:

```powershell
.\scripts\build-manifest.ps1
.\scripts\validate.ps1
```

5. Commit generated `MANIFEST.json` and `INVENTORY.md` with the source change.

For third-party material without an explicit redistribution license, add an entry to `external-skills.json` instead of copying the source.

