# GalleryApp

A React Native (Expo SDK 57 + TypeScript) internship assignment app: user registration/login with local session persistence, an infinite-scrolling image gallery backed by the [Picsum Photos](https://picsum.photos) API, search & filter, favorites, image details with save-to-device, and an editable profile.

## Overview

GalleryApp demonstrates a modular, production-style React Native architecture:

- Email/password authentication with local (AsyncStorage) account storage — no backend server.
- Session persistence across app restarts.
- A paginated, searchable, filterable image gallery consuming `https://picsum.photos/v2/list`.
- Favorites that persist locally and are searchable in their own screen.
- A full-screen image details view with "download to device gallery" support.
- An editable user profile.

## Features

### Authentication
- **Register**: Full Name, Email, Gender (radio buttons), Mobile Number, Address, City (dropdown), Password, Confirm Password — all fields validated (required fields, valid email, 10-digit numeric mobile, 6+ char password, matching confirm password).
- **Login**: Email + password checked against locally registered accounts, with clear error messages for invalid credentials.
- **Session persistence**: the authenticated session is stored in AsyncStorage; on app relaunch the session is restored automatically and the user is taken straight to the main app (or the auth flow if no valid session exists).
- **Logout**: clears the session and returns to the auth flow while preserving the registered account and favorites data.

### Gallery (Home)
- Fetches images from `GET https://picsum.photos/v2/list?page=<n>&limit=<n>` via a dedicated API service (`src/api/picsumApi.ts`).
- FlatList-based grid with thumbnail, author name, image ID, and a favorite (heart) button per row.
- Loading state, empty state, and API error state (with retry) are all handled explicitly.
- Pull-to-refresh resets pagination and replaces the dataset without triggering duplicate requests.
- Infinite scroll via `onEndReached`, guarded against duplicate/concurrent requests, requests while refreshing, and further requests after reaching the end or hitting an error.

### Search & Filter
- Real-time, case-insensitive search by author name, debounced (350ms) to avoid excessive re-filtering while typing.
- Filter tabs: **All Images**, **Author A–M**, **Author N–Z** (based on the first letter of the author's name).
- Search and filter compose together (e.g. searching "john" while filtering "A–M" only shows authors that match both).

### Favorites
- Tap the heart icon to favorite/unfavorite an image from **Home**, **Favorites**, or **Image Details**.
- Favorites are held in a centralized Zustand store and persisted to AsyncStorage, surviving navigation, logout/login, and app restarts.
- Dedicated **Favorites** screen with its own search-by-author box, a remove action per item, and an empty state.

### Image Details
- Tapping an image opens a full-screen details view with the full-resolution image, author, image ID, and dimensions.
- A favorite/unfavorite heart button is available directly on this screen, backed by the same shared favorites store as Home and Favorites.
- **Download to Gallery** button downloads the image (via `expo-file-system`) and saves it to the device's photo library (via `expo-media-library`), into a "GalleryApp" album.
- Handles permission requests/denials, download failures, and save failures, with success/error alerts.

### Profile
- Displays Full Name, Email, Mobile Number, Gender, Address, and City for the logged-in user.
- **Edit Profile** lets the user update all fields except email; saving validates the form, persists the change to AsyncStorage, and immediately reflects the update across the app (email/password are never touched by profile edits).

## Prerequisites

- This project targets **Expo SDK 57**.
- [Node.js](https://nodejs.org/) 18 or newer (tested with Node 24)
- npm 10+
- [Expo CLI](https://docs.expo.dev/more/expo-cli/) (invoked via `npx`, no global install required)
- For Android: Android Studio with an emulator, or a physical Android device with [Expo Go](https://expo.dev/go) / USB debugging enabled
- For iOS (macOS only): Xcode with a simulator, or a physical device with Expo Go

## Installation

```bash
git clone <repository-url>
cd GalleryApp
npm install
```

## Running the App

Start the Metro bundler:

```bash
npx expo start
```

Then:
- Press `a` to open on a connected Android emulator/device
- Press `i` to open on an iOS simulator (macOS only)
- Scan the QR code with the [Expo Go](https://expo.dev/go) app on a physical device

> **Note on `expo-media-library`:** Expo Go no longer bundles the media library native module. The download-to-gallery feature on Home → Image Details requires a **development build** (see below) or a full native build — it will show a native-module error inside Expo Go itself. Every other feature works fine in Expo Go.

### Android — running a full native build

Because this app uses `expo-media-library` (a native module not included in Expo Go), the recommended way to test the complete feature set on Android is a debug native build:

```bash
npx expo run:android
```

This generates the native `android/` project (via Expo prebuild) and installs a debug build on the currently connected/booted device or emulator. Subsequent runs reuse the generated project and are much faster.

### Building an installable debug APK directly

```bash
cd android
./gradlew assembleDebug
```

The APK is produced at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Install it manually with:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Building a release APK

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk` (unsigned unless you configure a signing key in `android/app/build.gradle` / `gradle.properties`).

For a production-ready signed build, use [EAS Build](https://docs.expo.dev/build/introduction/) instead:

```bash
npx eas-cli build -p android --profile preview
```

## Libraries & Dependencies

| Package | Purpose |
|---|---|
| `expo` | Managed React Native runtime/tooling |
| `react`, `react-native` | Core framework |
| `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs` | Navigation (auth stack, root stack, bottom tabs) |
| `react-native-screens`, `react-native-safe-area-context`, `react-native-gesture-handler` | Required native dependencies for React Navigation |
| `zustand` | Centralized state management (auth + gallery/favorites) |
| `@react-native-async-storage/async-storage` | Local persistence (accounts, session, favorites) |
| `expo-image` | Efficient, cached image rendering (thumbnails + full-size) |
| `expo-media-library` | Saving downloaded images to the device's photo gallery |
| `expo-file-system` | Downloading remote images to local storage before saving |
| `@react-native-picker/picker` | Native dropdown used for the City field |
| `@expo/vector-icons` | Icons (search, favorite heart, tab bar icons) |

Dev tooling: `typescript`, `eslint` + `eslint-config-expo` (via `npx expo lint`).

No state-management, HTTP-client, or UI-kit libraries beyond the above were added — `fetch` is used directly inside a dedicated API service module, and all UI components are hand-built to keep the dependency surface minimal and justified.

## Architecture

```
src/
  api/            Dedicated Picsum API client (fetch wrapper, error handling, URL builders)
  assets/
    images/       Reserved for local image assets (currently empty — the app only uses
                  remote Picsum URLs plus Expo's top-level /assets for app icons)
  components/     Reusable, mostly memoized UI building blocks (Button, InputField, Dropdown,
                  RadioGroup, ImageCard, SearchBar, FilterTabs, LoadingSpinner, EmptyState)
  hooks/          Custom hooks (useFetchImages — pagination/refresh logic, useDebounce, useAuth)
  navigation/     AuthNavigator, MainTabNavigator, RootNavigator (session-driven switch)
  screens/
    Auth/         LoginScreen, RegisterScreen
    Main/         HomeScreen, FavoritesScreen, ImageDetailScreen, ProfileScreen
  store/          Zustand stores: useAuthStore (session/user), useGalleryStore (favorites, search/filter)
  types/          Shared TypeScript types (auth, gallery, navigation)
  utils/          storage.ts (AsyncStorage access layer), validation.ts, theme.ts, constants.ts
```

Screens never call AsyncStorage or `fetch` directly — they go through the store/hook/API layers, which keeps the UI components thin and the persistence/networking logic testable and centralized.

### State Management (Zustand)

- **`useAuthStore`**: holds `isInitializing`, `isAuthenticated`, and the current `user` profile. Exposes `initialize` (restores session on boot), `register`, `login`, `logout`, and `updateProfile`. All AsyncStorage reads/writes go through `src/utils/storage.ts`.
- **`useGalleryStore`**: holds `favorites`, `searchQuery`/`filter` (Home screen) and `favoritesSearchQuery` (Favorites screen), plus actions to load/toggle/remove favorites. Favorites are lazy-loaded once (`favoritesLoaded` guard) to avoid redundant AsyncStorage reads, and every mutation writes the full favorites array back in one `setItem` call.

`RootNavigator` subscribes to `useAuthStore` and renders the `Auth` stack or the authenticated `Main`/`ImageDetail` stack accordingly — no prop drilling of auth state through navigators or screens.

### AsyncStorage Persistence

All persistence goes through `src/utils/storage.ts`, which exposes typed helper functions (`getRegisteredUsers`, `saveRegisteredUser`, `updateRegisteredUser`, `findUserByEmail`, `getSession`, `saveSession`, `clearSession`, `getFavorites`, `saveFavorites`). Three keys are used:

- `@gallery_app/users` — array of registered accounts (including password; this is a local-only demo app with no backend, so credentials are stored as-is rather than hashed — see Assumptions).
- `@gallery_app/session` — the currently authenticated session (email + timestamp).
- `@gallery_app/favorites` — the shared favorites array.

### API Layer

`src/api/picsumApi.ts` wraps `fetch` against `https://picsum.photos/v2/list`, and:
- Throws a typed `PicsumApiError` for non-OK HTTP responses, network failures, and malformed JSON.
- Validates the response shape at runtime (filters out any entries missing the expected fields) rather than trusting the API blindly.
- Exposes `buildThumbnailUrl`/`buildFullImageUrl` helpers that construct sized image URLs from an image's `id` (Picsum supports `/id/{id}/{width}/{height}`).

### Search & Filter Behavior

Search and filter are applied together, in-memory, over the currently loaded page(s) of images (`HomeScreen`'s `useMemo`-derived `filteredImages`): the search term must match (case-insensitive substring of the author name) **and** the selected filter's letter range must match. An empty search always shows all currently loaded images (subject to the active filter). The Favorites screen has its own independent search field that only searches within the favorited images.

### Pagination Behavior

`useFetchImages` (src/hooks/useFetchImages.ts) manages all pagination state:
- Loads page 1 (limit 20) on mount.
- `loadMore()` (wired to `FlatList`'s `onEndReached`) increments the page and appends new, de-duplicated results — it's a no-op while a request is already in flight, while refreshing, once `hasMore` is false, or while an error is active (preventing repeated failing requests).
- `refresh()` (wired to pull-to-refresh) resets to page 1 and **replaces** the dataset, then re-enables pagination from a clean state; it will not fire while another request is already in flight.
- An `isFetchingRef` lock (rather than only React state) guarantees at most one network request is ever in flight at a time, even across rapid successive calls in the same tick.

## Assumptions

- No backend exists; "registration" and "login" are simulated entirely against AsyncStorage on-device. Passwords are stored in plain text locally for the purposes of this assignment (not hashed/encrypted) — this would need a real backend + hashing for production use.
- Favorites are a single, shared list scoped to the device (not partitioned per-account), since the assignment only requires favorites to survive navigation/logout-login/restart, not to be account-specific.
- The City dropdown uses a fixed, representative list of major cities (see `src/utils/constants.ts`) since the assignment doesn't specify a source for city data.
- "Author A–M" / "Author N–Z" filters are based on the first letter of the author's display name (case-insensitive).
- Picsum's `id` field does not always correspond to a valid `download_url` at odd sizes for every id/size combination on the public API; the app builds thumbnail/full URLs from `id` + requested dimensions per Picsum's documented URL scheme.

## Testing / Verification

Static checks:

```bash
npx tsc --noEmit      # TypeScript type-checking — passes with no errors
npx expo lint         # ESLint (eslint-config-expo) — passes with no errors or warnings
npx expo export --platform android   # Bundles the app end-to-end to catch import/compile errors
```

Manual verification performed during development (Android emulator, native debug build):
- Registration form validation (empty fields, invalid email, non-numeric/short mobile number, short/mismatched passwords) and successful registration writing to AsyncStorage.
- Login with correct/incorrect credentials, and the auth error message.
- Session restore on app relaunch (killed and relaunched with an active session) and rejection of a stale session for a since-removed account.
- Logout clearing the session and returning to the Login screen.
- Gallery loading, error, and empty states; pull-to-refresh; infinite scroll via `onEndReached`; no duplicate/overlapping network calls under rapid scroll or rapid pull-to-refresh.
- Search by author name (case-insensitive, debounced) combined with the A–M / N–Z filters.
- Favoriting/unfavoriting from Home and Favorites, persistence across a restart, and the Favorites search box.
- Image details screen, full-size image rendering, and the download-to-gallery flow (permission prompt, success alert) on a native debug build.
- Profile view and edit flow, including that email/password remain unchanged after an unrelated field edit.

If you add automated tests (e.g. with `jest` + `@testing-library/react-native`), good first targets are `src/utils/validation.ts` (pure functions) and the pagination/dedup logic in `src/hooks/useFetchImages.ts`, since both are fully deterministic and don't require rendering.

## APK / Build Instructions

See [Android — running a full native build](#android--running-a-full-native-build) above. Summary:

```bash
npx expo run:android          # generates android/ and installs a debug build on a device/emulator
cd android && ./gradlew assembleDebug     # produces android/app/build/outputs/apk/debug/app-debug.apk
```

For a distributable, signed release build, use `npx eas-cli build -p android` (requires a free Expo account; no secrets are required in this repository for that step).
