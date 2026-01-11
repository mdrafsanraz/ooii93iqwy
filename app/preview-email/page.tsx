'use client'

export default function PreviewEmail() {
  const name = "John Doe"
  const planName = "Artist"
  const entityName = "John Music"
  const amount = 5
  const freeTrial = false

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#0f172a",
      padding: "40px 20px",
      margin: 0,
      minHeight: "100vh"
    }}>
      <div style={{ maxWidth: "520px", margin: "0 auto" }}>
        <div style={{
          background: "#ffffff",
          borderRadius: "24px",
          padding: "40px 32px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "80px", height: "80px", margin: "0 auto", display: "block" }}>
              <defs>
                <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: "#00d4ff", stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: "#5b21b6", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#ff6b35", stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <g transform="translate(20, 30)">
                <rect x="0" y="15" width="4" height="30" fill="url(#waveGrad)" rx="2"/>
                <rect x="10" y="10" width="4" height="40" fill="url(#waveGrad)" rx="2"/>
                <rect x="20" y="5" width="4" height="50" fill="url(#waveGrad)" rx="2"/>
                <rect x="30" y="12" width="4" height="36" fill="url(#waveGrad)" rx="2"/>
                <rect x="40" y="8" width="4" height="44" fill="url(#waveGrad)" rx="2"/>
                <path d="M52 22 L62 17 L60 19.5 L68 19.5 L68 27.5 L60 27.5 L62 30 Z" fill="url(#waveGrad)" opacity="0.9"/>
                <path d="M52 35 L62 30 L60 32.5 L68 32.5 L68 40.5 L60 40.5 L62 43 Z" fill="url(#waveGrad)" opacity="0.7"/>
              </g>
              <circle cx="82" cy="32" r="3" fill="#8b5cf6" opacity="0.7"/>
              <circle cx="88" cy="48" r="2" fill="#ec4899" opacity="0.5"/>
              <circle cx="92" cy="38" r="1.5" fill="#6366f1" opacity="0.6"/>
            </svg>
            <div style={{
              fontSize: "28px",
              fontWeight: 800,
              background: "linear-gradient(135deg, #00d4ff, #5b21b6, #ff6b35)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginTop: "12px",
              letterSpacing: "-0.5px"
            }}>RDistro</div>
          </div>

          {/* Badge */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <span style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "white",
              padding: "10px 24px",
              borderRadius: "50px",
              fontWeight: 600,
              fontSize: "14px",
              letterSpacing: "0.5px"
            }}>
              {freeTrial ? '🎁 FREE TRIAL ACTIVATED' : '🎉 REGISTRATION SUCCESSFUL'}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "26px",
            fontWeight: 800,
            textAlign: "center",
            marginBottom: "8px",
            color: "#0f172a",
            lineHeight: 1.3
          }}>
            {freeTrial ? 'Your Free Trial Has Started!' : 'Welcome to RDistro!'}
          </h1>
          <p style={{ textAlign: "center", color: "#64748b", fontSize: "15px", marginBottom: "32px" }}>
            Your music distribution journey begins now
          </p>

          {/* Greeting */}
          <p style={{ color: "#374151", lineHeight: 1.8, fontSize: "16px", marginBottom: "20px" }}>
            Hi <strong>{name}</strong>,
          </p>

          <p style={{ color: "#374151", lineHeight: 1.8, fontSize: "15px", marginBottom: "16px" }}>
            {freeTrial
              ? "Congratulations! Your 1-month free trial is now active. Your payment method has been securely saved for when the trial ends."
              : "Thank you for choosing RDistro! We've received your registration and payment. Our team is now setting up your account."
            }
          </p>

          {/* Info Card */}
          <div style={{
            borderRadius: "16px",
            padding: "20px",
            margin: "24px 0",
            background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
            border: "1px solid #7dd3fc"
          }}>
            <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "8px", fontSize: "15px" }}>
              📧 What Happens Next?
            </div>
            <div style={{ color: "#475569", fontSize: "14px", lineHeight: 1.6 }}>
              Your account is being prepared. You&apos;ll receive your <strong>login credentials</strong> and access details via email within <strong>24-48 hours</strong>.
            </div>
          </div>

          {/* Order Summary */}
          <div style={{
            background: "#f8fafc",
            borderRadius: "16px",
            padding: "24px",
            margin: "24px 0",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: "16px",
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}>📋 Order Summary</div>
            
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: "15px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ color: "#64748b" }}>Plan</span>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>{planName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: "15px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ color: "#64748b" }}>Artist Name</span>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>{entityName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: "15px" }}>
              <span style={{ color: "#64748b" }}>Amount Paid</span>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>${amount}/year</span>
            </div>
          </div>

          {/* Success Card */}
          <div style={{
            borderRadius: "16px",
            padding: "20px",
            margin: "24px 0",
            background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
            border: "1px solid #a7f3d0"
          }}>
            <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "8px", fontSize: "15px" }}>
              🚀 Get Ready to Distribute
            </div>
            <div style={{ color: "#475569", fontSize: "14px", lineHeight: 1.6 }}>
              Once your account is ready, you can distribute your music to all major streaming platforms worldwide.
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginTop: "16px" }}>
              {["Spotify", "Apple Music", "YouTube Music", "Amazon", "+150 more"].map(p => (
                <span key={p} style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 500
                }}>{p}</span>
              ))}
            </div>
          </div>

          {/* Signature */}
          <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #e2e8f0" }}>
            <p style={{ color: "#374151", fontSize: "15px", lineHeight: 1.6 }}>
              We&apos;re excited to have you on board! If you have any questions, feel free to reach out.
            </p>
            <p style={{ fontWeight: 700, color: "#0f172a", marginTop: "8px" }}>
              🎵 The RDistro Team
            </p>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#7c3aed", marginBottom: "8px" }}>RDistro</div>
            <p style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.8 }}>
              Music Distribution Made Simple<br />
              <a href="https://rdistro.net" style={{ color: "#7c3aed", textDecoration: "none", fontWeight: 500 }}>rdistro.net</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

