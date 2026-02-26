/// <reference types="vite/client" />

export const loadRazorpay = (options: any) => {
  return new Promise((resolve, reject) => {
    if (!(window as any).Razorpay) {
      reject(new Error("Razorpay SDK not loaded. Please check your internet connection or ad-blocker."));
      return;
    }
    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(`Payment Failed: ${response.error.description || 'Unknown error'}`);
        console.error("Payment failed details:", response.error);
      });
      rzp.open();
      resolve(rzp);
    } catch (err) {
      reject(err);
    }
  });
};

export const initiateUpgrade = async (plan: 'pro' | 'agency', onSuccess: (credits: number) => void) => {
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
  
  // MOCK MODE: If key is missing or set to 'MOCK', provide a simulated success path for testing
  if (!key || key === 'MOCK') {
    console.warn("Razorpay Key missing or set to MOCK. Entering simulated payment mode.");
    const confirmMock = window.confirm(`[TEST MODE] Simulate successful ${plan.toUpperCase()} payment? \n\n(To use real Razorpay, set VITE_RAZORPAY_KEY_ID in environment variables)`);
    
    if (confirmMock) {
      const credits = plan === 'pro' ? 50 : 250;
      try {
        const res = await fetch("/api/user/upgrade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            paymentId: "pay_mock_" + Math.random().toString(36).substring(7),
            plan: plan
          })
        });
        const data = await res.json();
        onSuccess(data.credits);
      } catch (e) {
        alert("Mock upgrade failed to sync with server.");
      }
    }
    return;
  }

  const amount = plan === 'pro' ? 249900 : 799900; // In paise (e.g., 2499 INR)
  const credits = plan === 'pro' ? 50 : 250;

  const options = {
    key: key,
    amount: amount,
    currency: "INR", // Changed to INR for maximum compatibility with Razorpay accounts
    name: "ViralClips AI",
    description: `${plan.toUpperCase()} Plan Upgrade`,
    image: `${window.location.origin}/favicon.ico`,
    handler: async function (response: any) {
      console.log("Razorpay payment successful", response.razorpay_payment_id);
      
      try {
        const res = await fetch("/api/user/upgrade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            paymentId: response.razorpay_payment_id,
            plan: plan
          })
        });
        const data = await res.json();
        onSuccess(data.credits);
      } catch (e) {
        alert("Payment successful but failed to sync credits. Please contact support with ID: " + response.razorpay_payment_id);
      }
    },
    prefill: {
      name: "Elite Creator",
      email: "creator@viralclips.ai",
    },
    theme: {
      color: "#2563eb"
    },
    modal: {
      ondismiss: function() {
        console.log("Payment modal closed by user");
      }
    }
  };

  try {
    await loadRazorpay(options);
  } catch (err: any) {
    alert(err.message || "Failed to initialize Razorpay.");
  }
};
