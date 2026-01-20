# GitHub Actions Setup Guide

This guide explains how to set up the GitHub Actions workflow for building Android APKs.

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

### API Configuration

1. **STAGING_API_BASE_URL**
   - Description: API base URL for staging environment
   - Example: `https://api-staging.hungrr.com/v1`

2. **PROD_API_BASE_URL**
   - Description: API base URL for production environment
   - Example: `https://api.hungrr.com/v1`

### Android Signing Configuration

To sign your APK, you need to create a keystore and configure these secrets:

#### Step 1: Generate a Keystore (if you don't have one)

```bash
keytool -genkey -v -keystore hungrr-release.keystore -alias hungrr -keyalg RSA -keysize 2048 -validity 10000
```

Follow the prompts to set:
- Keystore password
- Key password
- Your name and organization details

#### Step 2: Convert Keystore to Base64

```bash
base64 hungrr-release.keystore > keystore-base64.txt
```

#### Step 3: Configure GitHub Secrets

3. **ANDROID_SIGNING_KEY**
   - Description: Base64 encoded keystore file
   - Value: Contents of `keystore-base64.txt`

4. **ANDROID_KEY_ALIAS**
   - Description: Keystore alias
   - Example: `hungrr`

5. **ANDROID_KEYSTORE_PASSWORD**
   - Description: Keystore password
   - Value: The password you set when creating the keystore

6. **ANDROID_KEY_PASSWORD**
   - Description: Key password
   - Value: The key password you set when creating the keystore

## How to Use

### Automatic Build on Release

1. Go to your GitHub repository
2. Click on "Releases" → "Create a new release"
3. Create a tag (e.g., `v1.0.0`)
4. Fill in release details
5. Check "This is a pre-release" for staging builds
6. Click "Publish release"

The workflow will automatically:
- Build the APK
- Use **staging** API URL for pre-releases
- Use **production** API URL for full releases
- Sign the APK
- Upload it to the release assets

### Manual Build

1. Go to "Actions" tab in your repository
2. Select "Build Android APK" workflow
3. Click "Run workflow"
4. Choose environment (staging or production)
5. Click "Run workflow"

The APK will be available in the workflow artifacts for 30 days.

## Environment Variables

The build process uses the following environment variable:

- `EXPO_PUBLIC_API_BASE_URL`: Set automatically based on the environment (staging/production)

## Local Development

For local development, the app defaults to:
```
http://10.0.2.2:4000/v1
```

This is the Android emulator's way of accessing `localhost:4000` on your development machine.

To override this locally, create a `.env` file:

```bash
EXPO_PUBLIC_API_BASE_URL=https://api-staging.hungrr.com/v1
```

## Troubleshooting

### Build Fails with "Keystore not found"

Make sure you've correctly set up all Android signing secrets.

### APK Won't Install

- Check that the APK is properly signed
- Ensure your device allows installation from unknown sources
- Verify the signing key matches if you're updating an existing installation

### API Connection Issues

- Verify the API URL is correct in the GitHub secrets
- Check that the API server is accessible from the internet
- Ensure CORS is properly configured on your API server

## Testing the APK

1. Download the APK from the release assets or workflow artifacts
2. Transfer it to your Android device
3. Enable "Install from unknown sources" in your device settings
4. Open the APK file and install
5. The app will connect to the configured API URL

## Security Notes

- **Never commit** your keystore file to the repository
- **Keep your secrets secure** - they have access to sign your app
- **Rotate keys** if they are ever compromised
- **Use different keystores** for staging and production if possible
