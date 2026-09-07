/**
 * Handles post-login routing for vendors based on OTP verification response data.
 * @param {Object} verifyOtpResponse - Response object returned from POST /api/v1/auth/verify-otp
 * @param {Function} navigate - react-router-dom navigate function
 */
export const handlePostLoginRedirect = (verifyOtpResponse, navigate) => {
  const data = verifyOtpResponse?.data || verifyOtpResponse || {};
  const { isProfileComplete, profileStep, hasSelectedPackage, redirectUrl } = data;

  if (redirectUrl) {
    navigate(redirectUrl);
  } else if (!isProfileComplete) {
    if (profileStep === 2) {
      navigate('/create-business-profile/step-2');
    } else {
      navigate('/create-business-profile/step-1');
    }
  } else if (!hasSelectedPackage) {
    navigate('/choose-package');
  } else {
    navigate('/vendor/dashboard');
  }
};

export default handlePostLoginRedirect;
