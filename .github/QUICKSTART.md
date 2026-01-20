# Quick Start: Building Your First APK

Follow these steps to get your first APK built via GitHub Actions.

## Prerequisites

- GitHub repository with this code
- Access to repository settings (admin/owner)

## Step 1: Generate Android Keystore

Run this command on your local machine:

```bash
keytool -genkey -v -keystore hungrr-release.keystore -alias hungrr -keyalg RSA -keysize 2048 -validity 10000
```

When prompted:
- **Keystore password**: Choose a strong password (save it!)
- **Key password**: Choose a strong password (save it!)
- **Name**: Your name or company name
- **Organization**: Your organization
- **City, State, Country**: Your location details

## Step 2: Convert Keystore to Base64

```bash
# On Linux/Mac
base64 hungrr-release.keystore > keystore-base64.txt

# On Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("hungrr-release.keystore")) > keystore-base64.txt
```

## Step 3: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of these:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `STAGING_API_BASE_URL` | Your staging API URL | `https://api-staging.hungrr.com/v1` |
| `PROD_API_BASE_URL` | Your production API URL | `https://api.hungrr.com/v1` |
| `ANDROID_SIGNING_KEY` | Contents of `keystore-base64.txt` | (long base64 string) |
| `ANDROID_KEY_ALIAS` | Keystore alias | `hungrr` |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password | (your password) |
| `ANDROID_KEY_PASSWORD` | Key password | (your password) |

## Step 4: Create Your First Release

### Option A: Via GitHub UI

1. Go to your repository on GitHub
2. Click **Releases** → **Create a new release**
3. Click **Choose a tag** → Type `v1.0.0` → **Create new tag**
4. **Release title**: `v1.0.0 - Initial Release`
5. **Description**: Add release notes
6. For staging: ✅ Check **"This is a pre-release"**
7. For production: ⬜ Leave unchecked
8. Click **Publish release**

### Option B: Via Command Line

```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0

# Then create the release on GitHub UI
```

## Step 5: Monitor the Build

1. Go to **Actions** tab in your repository
2. You'll see "Build Android APK" workflow running
3. Click on it to see progress
4. Build takes ~10-15 minutes

## Step 6: Download Your APK

Once the build completes:

1. Go back to **Releases**
2. Find your release
3. Under **Assets**, you'll see: `hungrr-staging-v1.0.0.apk` or `hungrr-production-v1.0.0.apk`
4. Download it!

## Step 7: Install on Your Phone

### Enable Installation from Unknown Sources

**Android 8.0+:**
1. Go to **Settings** → **Apps & notifications**
2. Tap **Advanced** → **Special app access**
3. Tap **Install unknown apps**
4. Select your browser or file manager
5. Enable **Allow from this source**

### Install the APK

1. Transfer the APK to your phone (via USB, email, cloud storage, etc.)
2. Open the APK file
3. Tap **Install**
4. Open the app!

## Testing Different Environments

### Staging Build (Pre-release)
- ✅ Check "This is a pre-release" when creating release
- Uses `STAGING_API_BASE_URL`
- Good for testing before production

### Production Build (Full release)
- ⬜ Leave "This is a pre-release" unchecked
- Uses `PROD_API_BASE_URL`
- For end users

## Manual Build (Without Release)

Want to build without creating a release?

1. Go to **Actions** tab
2. Select **Build Android APK**
3. Click **Run workflow**
4. Choose **staging** or **production**
5. Click **Run workflow**
6. Download from **Artifacts** (available for 30 days)

## Troubleshooting

### "Keystore not found" Error
- Double-check all 4 Android secrets are set correctly
- Ensure `ANDROID_SIGNING_KEY` is the full base64 content

### Build Fails
- Check the Actions logs for specific errors
- Ensure all secrets are set
- Verify your API URLs are correct

### APK Won't Install
- Enable "Install from unknown sources"
- If updating, ensure the signing key matches the previous version

### App Can't Connect to API
- Verify the API URL in GitHub secrets
- Check that your API server is accessible from the internet
- Test the API URL in a browser

## Next Steps

- Set up automatic builds on every push to `main` branch
- Add iOS build workflow
- Set up Expo EAS for over-the-air updates
- Configure app versioning automation

## Security Reminders

🔒 **Never commit these files:**
- `hungrr-release.keystore`
- `keystore-base64.txt`
- `.env` files with real API URLs

🔒 **Keep your secrets secure:**
- Don't share keystore passwords
- Rotate keys if compromised
- Use different keystores for staging/production

---

Need help? Check the full [SETUP.md](./SETUP.md) guide or open an issue!
