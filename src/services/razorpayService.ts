/// <reference types="vite/client" />

export const loadRazorpay = (options: any) => {
  return new Promise((resolve) => {
    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      console.error("Payment failed", response.error);
    });
    rzp.open();
    resolve(rzp);
  });
};

export const initiateUpgrade = async (plan: 'pro' | 'agency', onSuccess: (credits: number) => void) => {
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!key) {
    alert("Razorpay Key ID is missing. Please set VITE_RAZORPAY_KEY_ID in your environment variables.");
    return;
  }

  const amount = plan === 'pro' ? 2900 : 9900; // In paise
  const credits = plan === 'pro' ? 50 : 250;

  const options = {
    key: key,
    amount: amount,
    currency: "USD",
    name: "ViralClips AI",
    description: `${plan.toUpperCase()} Plan Upgrade`,
    image: `${window.location.origin}/favicon.ico`,
    handler: async function (response: any) {
      // In a real app, you would verify the payment on the server
      console.log("Payment successful", response.razorpay_payment_id);
      
      // Simulate server-side credit update
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
        console.error("Failed to sync upgrade with server");
      }
    },
    prefill: {
      name: "Demo Creator",
      email: "demo@viralclips.ai",
      contact: "9999999999"
    },
    theme: {
      color: "#2563eb"
    }
  };

  await loadRazorpay(options);
};
