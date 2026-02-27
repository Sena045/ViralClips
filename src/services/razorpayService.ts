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

export const initiateUpgrade = async (plan: 'pro' | 'agency', token: string, onSuccess: (credits: number) => void) => {
  const rawKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const key = rawKey && rawKey !== 'undefined' && rawKey !== 'null' ? rawKey.trim() : null;
  
  console.log("ViralClips AI: Initializing Upgrade Pipeline...");
  console.log("Plan:", plan);
  console.log("Key Detected:", key ? "YES (starts with " + key.substring(0, 8) + "...)" : "NO");
  console.log("Raw Key Value:", rawKey); 

  // MOCK MODE: If key is missing or set to 'MOCK', provide a simulated success path for testing
  if (!key || key === 'MOCK' || key === 'rzp_test_placeholder') {
    console.warn("Razorpay Key missing or set to MOCK. Entering simulated payment mode.");
    
    const confirmMock = window.confirm(
      `[SIMULATED PAYMENT MODE]\n\n` +
      `No valid Razorpay Key detected (VITE_RAZORPAY_KEY_ID).\n` +
      `Would you like to simulate a successful ${plan.toUpperCase()} upgrade for testing?\n\n` +
      `Note: To use real Razorpay, add VITE_RAZORPAY_KEY_ID to your environment variables.`
    );
    
    if (confirmMock) {
      console.log("User confirmed mock payment. Syncing with server...");
      const credits = plan === 'pro' ? 50 : 250;
      try {
        const res = await fetch("/api/user/upgrade", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            paymentId: "pay_mock_" + Math.random().toString(36).substring(7),
            plan: plan
          })
        });
        const data = await res.json();
        console.log("Server response for mock upgrade:", data);
        if (res.ok) {
          onSuccess(data.credits);
        } else {
          console.error("Server rejected mock upgrade:", data);
          alert(`Mock upgrade failed: ${data.error || 'Unknown error'}`);
        }
      } catch (e) {
        alert("Mock upgrade failed to sync with server. Check console for errors.");
        console.error("Mock upgrade error:", e);
      }
    } else {
      console.log("User cancelled mock payment.");
    }
    return;
  }

  const amount = plan === 'pro' ? 249900 : 799900; // In paise (e.g., 2499 INR)
  
  const options = {
    key: key,
    amount: amount,
    currency: "INR",
    name: "ViralClips AI",
    description: `${plan.toUpperCase()} Plan Upgrade`,
    // Use a reliable placeholder image if favicon is missing
    image: "https://cdn-icons-png.flaticon.com/512/1162/1162456.png", 
    handler: async function (response: any) {
      console.log("Razorpay payment successful", response.razorpay_payment_id);
      
      try {
        const res = await fetch("/api/user/upgrade", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            paymentId: response.razorpay_payment_id,
            plan: plan
          })
        });
        const data = await res.json();
        if (res.ok) {
          onSuccess(data.credits);
        } else {
          alert(`Payment successful but failed to sync credits: ${data.error || 'Unknown error'}`);
        }
      } catch (e) {
        alert("Payment successful but failed to sync credits. Please contact support with ID: " + response.razorpay_payment_id);
        console.error("Sync error:", e);
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
    console.error("Razorpay Initialization Error:", err);
    alert(`Failed to initialize Razorpay: ${err.message}\n\nCheck console for more details.`);
  }
};
