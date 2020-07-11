# EnhancedDiscord Theme
A theme created for [EnhancedDiscord](https://github.com/joe27g/EnhancedDiscord). The goal behind it is to add some custom colors, a background and a few other improvements over the vanilla theme. If used with an up-to-date version of ED, there will be a "Theme Settings" tab to customize it. Otherwise, you can use variables (see below.)

### Variables:
See [the first few lines of the theme](/theme.css#L4-L16) for a list of CSS variables used in this theme.

To use this theme, import it with
```css
@import url(https://enhanceddiscord.com/theme.css);
```
This will fetch the latest version from this repo (with a `Content-Type: text/css` header that allows it to load normally.)

### CSS Updater
The CSS Updater plugin ([css_updater.js](./css_updater.js)) can find outdated or flawed class names in this theme using the included comments for finding classes via webpack modules. It's intended for development/debugging and has no purpose for most users.