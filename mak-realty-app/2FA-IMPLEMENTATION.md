# Two-Factor Authentication (2FA) Implementation

## Overview

The application now supports **Time-based One-Time Password (TOTP)** authentication, compatible with all major authenticator apps.

## Supported Authenticator Apps

- **Google Authenticator** (iOS, Android)
- **Microsoft Authenticator** (iOS, Android, Windows)
- **Authy** (iOS, Android, Desktop)
- **1Password** (Cross-platform)
- **LastPass Authenticator**
- **Any TOTP-compatible authenticator app**

## Features

### Backend Features
- ✅ TOTP secret generation using Speakeasy
- ✅ QR code generation for easy setup
- ✅ Manual entry key support for devices that can't scan QR codes
- ✅ Token verification with clock skew tolerance (±2 time steps)
- ✅ Secure storage of 2FA secrets in database
- ✅ Enable/disable 2FA with verification
- ✅ Protected endpoints requiring authentication

### Frontend Features
- ✅ Dedicated 2FA settings page
- ✅ QR code display for easy scanning
- ✅ Manual entry key with copy-to-clipboard
- ✅ Step-by-step setup instructions
- ✅ Status indicator (enabled/disabled)
- ✅ Login flow integration
- ✅ Modern, responsive UI

## User Flow

### Setting Up 2FA

1. User logs in and goes to Dashboard
2. Clicks on "Two-Factor Authentication" card
3. Clicks "Setup 2FA" button
4. Backend generates a unique TOTP secret
5. Frontend displays:
   - QR code to scan with authenticator app
   - Manual entry key for copy-paste
   - Setup instructions
6. User scans QR code or manually enters key in their authenticator app
7. User enters the 6-digit code from the app to verify setup
8. 2FA is enabled successfully
9. User is logged out and required to log in again with 2FA

### Logging In with 2FA

1. User enters email and password
2. If 2FA is enabled, system prompts for authentication code
3. User opens their authenticator app and gets the 6-digit code
4. User enters the code
5. System verifies the code
6. User is logged in successfully

### Disabling 2FA

1. User goes to 2FA settings page
2. Clicks "Disable 2FA" button
3. System prompts for current 6-digit code
4. User enters code from authenticator app
5. 2FA is disabled
6. User is logged out and must log in again

## API Endpoints

### POST /api/auth/setup-2fa
**Description:** Generate TOTP secret and QR code
**Authentication:** Required
**Request:** None
**Response:**
```json
{
  "message": "2FA setup initiated",
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "manualEntryKey": "JBSWY3DPEHPK3PXP"
}
```

### POST /api/auth/enable-2fa
**Description:** Enable 2FA after verification
**Authentication:** Required
**Request:**
```json
{
  "token": "123456"
}
```
**Response:**
```json
{
  "message": "2FA enabled successfully",
  "two_factor_enabled": true
}
```

### POST /api/auth/disable-2fa
**Description:** Disable 2FA with verification
**Authentication:** Required
**Request:**
```json
{
  "token": "123456"
}
```
**Response:**
```json
{
  "message": "2FA disabled successfully",
  "two_factor_enabled": false
}
```

### POST /api/auth/verify-totp
**Description:** Verify TOTP token during login
**Authentication:** None (used during login)
**Request:**
```json
{
  "userId": 1,
  "token": "123456"
}
```
**Response:**
```json
{
  "message": "Authentication successful",
  "user": {...},
  "token": "jwt_token_here"
}
```

## Database Schema

### users table
```sql
two_factor_enabled BOOLEAN DEFAULT false
two_factor_secret VARCHAR(255)  -- Stores base32 encoded TOTP secret
```

## Security Features

1. **Secret Security:**
   - TOTP secrets stored securely in database
   - Secrets are base32 encoded
   - Each user has unique secret

2. **Clock Skew Tolerance:**
   - Accepts codes from ±2 time steps (±60 seconds)
   - Prevents false rejections due to time synchronization issues

3. **Verification Required:**
   - Users must verify with a code before enabling 2FA
   - Users must verify with a code before disabling 2FA
   - Prevents accidental changes

4. **Session Management:**
   - Users logged out after enabling/disabling 2FA
   - Forces re-authentication with new settings

5. **JWT Token:**
   - 24-hour expiration
   - Includes user ID and role

## Frontend Pages

### 1. Dashboard (/dashboard)
- New card: "Two-Factor Authentication"
- Accessible to all users
- Link to 2FA settings page

### 2. Two-Factor Settings (/2fa)
- **Status Card:** Shows current 2FA status
- **Setup Card:** QR code and instructions (shown when setting up)
- **Info Card:** Explains what 2FA is
- **Enable/Disable Buttons:** Manage 2FA status

### 3. Login Page (/login)
- Step 1: Email + Password
- Step 2: Authentication code (if 2FA enabled)
- Updated messaging: "Enter the code from your authenticator app"

## Testing 2FA

### Test Setup Process
1. Register/login as a user
2. Go to Dashboard → "Two-Factor Authentication"
3. Click "Setup 2FA"
4. Use Google Authenticator or any TOTP app to scan the QR code
5. Enter the 6-digit code shown in the app
6. Verify "2FA enabled successfully" message

### Test Login Process
1. Logout
2. Login with email and password
3. Verify you're prompted for authentication code
4. Open authenticator app and get code
5. Enter code
6. Verify successful login

### Test Disable Process
1. Go to 2FA settings
2. Click "Disable 2FA"
3. Enter authentication code when prompted
4. Verify "2FA disabled successfully" message

## Troubleshooting

### "Invalid authentication code" Error
**Causes:**
- Time on device is not synchronized
- Wrong code entered
- Code expired (codes change every 30 seconds)

**Solutions:**
- Ensure device time is synchronized
- Try the next code that appears
- Check that you're looking at the correct account in authenticator app

### QR Code Not Scanning
**Solution:**
- Use the manual entry key displayed below the QR code
- Copy the key and manually add it to authenticator app

### Lost Access to Authenticator App
**Solution:**
- Database admin can disable 2FA by running:
  ```sql
  UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL WHERE email = 'user@example.com';
  ```

## Migration from Email OTP

The system has been fully migrated from email-based OTP to TOTP:

**Changed:**
- ❌ Email OTP system (removed)
- ✅ TOTP with authenticator apps

**Removed:**
- `otp_codes` table (no longer needed)
- Email sending functionality for OTP
- `generateOTP()` function
- `/api/auth/verify-otp` endpoint

**Added:**
- Speakeasy TOTP library
- QR code generation
- `/api/auth/setup-2fa` endpoint
- `/api/auth/enable-2fa` endpoint
- `/api/auth/disable-2fa` endpoint
- `/api/auth/verify-totp` endpoint
- TwoFactorPage component

## Dependencies

### Backend
```json
{
  "speakeasy": "^2.0.0",  // TOTP generation and verification
  "qrcode": "^1.5.4"      // QR code generation
}
```

### Frontend
- No additional dependencies required
- Uses built-in Clipboard API for copy functionality

## Best Practices

1. **Backup Codes:** Consider implementing backup codes for account recovery
2. **Rate Limiting:** Implement rate limiting on TOTP verification endpoint
3. **Audit Logging:** Log 2FA enable/disable events
4. **User Education:** Provide clear instructions and FAQs
5. **Time Sync:** Remind users to keep device time synchronized

## Future Enhancements

- [ ] Backup codes for account recovery
- [ ] Remember device for 30 days option
- [ ] SMS fallback option
- [ ] 2FA enforcement for admin accounts
- [ ] Audit log for 2FA events
- [ ] Email notifications on 2FA changes

---

**Implementation Date:** December 2024
**Compatible With:** Google Authenticator, Microsoft Authenticator, Authy, and all TOTP apps
