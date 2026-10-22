# Adapter Icons

Each Adapter owns its optional root image:

```text
adapters/example.com/
  manifest.json
  icon.svg
  extension/commands/...
```

Use `icon.svg` or `icon.png`, up to 512 KiB per image. SVG takes precedence if both exist. SVG files must be self-contained, without scripts, event handlers, foreign objects or external references. Prefer a vector image or a PNG with at least 80 pixels on its longest edge for the desktop welcome grid.

Root icons pass both package validators, participate in the package content digest, and travel through installation, export and the standard desktop build. Built-in output is `weworker/build/builtin-adapters/<id>/icon.*`; Electron installs it as `resources/adapters/<id>/icon.*`.

The desktop catalog reads the selected, validated package and exposes its image as `iconUrl` in the authenticated `/sites` response. This is a data URL so `<img>` requires neither an unauthenticated file route nor an HTTP token in a URL. `manifest.icon` remains the optional semantic icon key. Sites with no image or semantic icon use a deterministic monogram; failed images fall back using the same rule.

There is no renderer image map to maintain. Public and private repositories maintain their own `adapters/` trees. Overwrite the appropriate Adapter directories and configure the build's Adapter list before running the standard build command. A private Adapter's image belongs only in the private repository. Existing public image provenance is recorded in [adapter-icon-sources.md](adapter-icon-sources.md).

Existing installed packages without root images remain supported. Adding or changing an image changes the package digest, so distribute it through the normal package/build flow instead of modifying an installed snapshot in place.
