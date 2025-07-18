const { v4: uuidv4 } = require('uuid')

class OtpManager {
  constructor(retentionPeriod = 25000) {
    // Default 25 seconds
    this.otps = new Map()
    this.retentionPeriod = retentionPeriod
    this.startCleanupTimer()
  }

  generateOtp() {
    const otp = {
      key: uuidv4(),
      createdAt: new Date(),
    }

    this.otps.set(otp.key, otp)
    console.log(`Generated OTP: ${otp.key}`)
    return otp.key
  }

  verifyOtp(otpKey) {
    if (!otpKey) {
      return false
    }

    const otp = this.otps.get(otpKey)
    if (!otp) {
      console.log(`OTP verification failed: OTP not found - ${otpKey}`)
      return false
    }

    // Check if OTP has expired
    const now = new Date()
    const expirationTime = new Date(otp.createdAt.getTime() + this.retentionPeriod)

    if (now > expirationTime) {
      console.log(`OTP verification failed: OTP expired - ${otpKey}`)
      this.otps.delete(otpKey)
      return false
    }

    // OTP is valid, remove it (one-time use)
    this.otps.delete(otpKey)
    console.log(`OTP verified and consumed: ${otpKey}`)
    return true
  }

  checkOtp(otpKey) {
    if (!otpKey) {
      return false
    }

    const otp = this.otps.get(otpKey)
    if (!otp) {
      return false
    }

    // Check if OTP has expired
    const now = new Date()
    const expirationTime = new Date(otp.createdAt.getTime() + this.retentionPeriod)

    if (now > expirationTime) {
      this.otps.delete(otpKey)
      return false
    }

    return true
  }

  startCleanupTimer() {
    // Clean up expired OTPs every 400ms (similar to Go version)
    setInterval(() => {
      const now = new Date()

      for (const [key, otp] of this.otps.entries()) {
        const expirationTime = new Date(otp.createdAt.getTime() + this.retentionPeriod)

        if (now > expirationTime) {
          this.otps.delete(key)
          console.log(`Expired OTP cleaned up: ${key}`)
        }
      }
    }, 400)
  }

  // Get current OTP count (for debugging)
  getOtpCount() {
    return this.otps.size
  }
}

module.exports = OtpManager
