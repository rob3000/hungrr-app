# CI/CD Documentation

This directory contains GitHub Actions workflows and documentation for automated builds.

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Step-by-step guide to build your first APK (START HERE!)
- **[SETUP.md](./SETUP.md)** - Detailed setup guide and troubleshooting
- **[workflows/build-apk.yml](./workflows/build-apk.yml)** - GitHub Actions workflow file

## 🚀 Quick Links

### For First-Time Setup
👉 Read [QUICKSTART.md](./QUICKSTART.md)

### For Detailed Configuration
👉 Read [SETUP.md](./SETUP.md)

## 🏗️ What's Included

### Automated APK Builds
- ✅ Builds on every release (automatic)
- ✅ Manual builds via workflow dispatch
- ✅ Separate staging and production environments
- ✅ Automatic APK signing
- ✅ Upload to release assets

### Environment Configuration
- 🌍 Staging environment (pre-releases)
- 🌍 Production environment (full releases)
- 🔧 Configurable API URLs via GitHub secrets

### Build Artifacts
- 📦 Signed APK files
- 📝 Named with environment and version
- ⬇️ Downloadable from releases or artifacts

## 🎯 Workflow Triggers

### Automatic (On Release)
```
Release created → Build APK → Upload to release
```

- **Pre-release** → Uses staging API URL
- **Full release** → Uses production API URL

### Manual (Workflow Dispatch)
```
Actions → Run workflow → Choose environment → Build
```

- Download from workflow artifacts
- Available for 30 days

## 📋 Required Secrets

| Secret | Purpose |
|--------|---------|
| `STAGING_API_BASE_URL` | Staging API endpoint |
| `PROD_API_BASE_URL` | Production API endpoint |
| `ANDROID_SIGNING_KEY` | Base64 keystore |
| `ANDROID_KEY_ALIAS` | Keystore alias |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_PASSWORD` | Key password |

## 🔄 Typical Workflow

1. **Develop** → Make changes locally
2. **Commit** → Push to GitHub
3. **Release** → Create a release (tag)
4. **Build** → GitHub Actions builds APK automatically
5. **Download** → Get APK from release assets
6. **Test** → Install on device and test
7. **Deploy** → Share with testers or users

## 🛠️ Local Development

The app uses environment variables for configuration:

```bash
# Copy example file
cp .env.example .env

# Edit .env with your local API URL
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:4000/v1
```

**Default URLs:**
- Android Emulator: `http://10.0.2.2:4000/v1`
- iOS Simulator: `http://localhost:4000/v1`

## 📱 Testing APKs

### On Physical Device
1. Enable "Install from unknown sources"
2. Transfer APK to device
3. Install and test

### On Emulator
1. Drag APK onto emulator
2. Or use: `adb install hungrr-staging-v1.0.0.apk`

## 🔐 Security Best Practices

- ✅ Never commit keystore files
- ✅ Never commit `.env` files with real URLs
- ✅ Use different keystores for staging/production
- ✅ Rotate keys if compromised
- ✅ Keep GitHub secrets secure

## 🐛 Common Issues

### Build Fails
- Check all secrets are set
- Verify keystore is valid base64
- Check Actions logs for details

### APK Won't Install
- Enable unknown sources
- Check signing key matches (for updates)
- Verify APK is not corrupted

### Can't Connect to API
- Verify API URL in secrets
- Check API server is accessible
- Test URL in browser

## 📞 Support

- Check [SETUP.md](./SETUP.md) for detailed troubleshooting
- Review GitHub Actions logs for build errors
- Open an issue if you need help

---

**Ready to build?** Start with [QUICKSTART.md](./QUICKSTART.md)! 🚀
