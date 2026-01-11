'use client'

export default function PreviewEmail() {
  const name = "John Doe"
  const planName = "Artist"
  const entityName = "John Music"
  const amount = 5
  const freeTrial = false

  return (
    <div style={{
      margin: 0,
      padding: 0,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
      backgroundColor: "#f3f4f6",
      minHeight: "100vh"
    }}>
      <table role="presentation" width="100%" cellSpacing={0} cellPadding={0} style={{ backgroundColor: "#f3f4f6", padding: "40px 20px" }}>
        <tbody>
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellSpacing={0} cellPadding={0} style={{ maxWidth: "560px", backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }}>
                <tbody>
                  {/* Header with Logo */}
                  <tr>
                    <td style={{ backgroundColor: "#1f2937", padding: "32px 40px", textAlign: "center" }}>
                      <img src="/logo.jpg" alt="RDistro" width="120" height="120" style={{ display: "block", margin: "0 auto 16px", borderRadius: "8px" }} />
                      <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.5px" }}>RDistro</h1>
                      <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#9ca3af" }}>Music Distribution</p>
                    </td>
                  </tr>
                  
                  {/* Status Badge */}
                  <tr>
                    <td style={{ padding: "32px 40px 0", textAlign: "center" }}>
                      <table role="presentation" cellSpacing={0} cellPadding={0} align="center">
                        <tbody>
                          <tr>
                            <td style={{ backgroundColor: freeTrial ? "#059669" : "#7c3aed", color: "#ffffff", padding: "10px 24px", borderRadius: "50px", fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
                              {freeTrial ? 'Free Trial Activated' : 'Registration Successful'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  
                  {/* Main Content */}
                  <tr>
                    <td style={{ padding: "32px 40px" }}>
                      <h2 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: 700, color: "#1f2937", textAlign: "center" }}>
                        {freeTrial ? 'Your Free Trial Has Started' : 'Welcome to RDistro'}
                      </h2>
                      <p style={{ margin: "0 0 24px", fontSize: "15px", color: "#6b7280", textAlign: "center" }}>
                        Your music distribution journey begins now
                      </p>
                      
                      <p style={{ margin: "0 0 16px", fontSize: "15px", color: "#374151", lineHeight: 1.7 }}>
                        Hi <strong style={{ color: "#1f2937" }}>{name}</strong>,
                      </p>
                      
                      <p style={{ margin: "0 0 24px", fontSize: "15px", color: "#374151", lineHeight: 1.7 }}>
                        {freeTrial 
                          ? 'Your 1-month free trial is now active. Your payment method has been securely saved and will be charged automatically when the trial ends.'
                          : 'Thank you for choosing RDistro. We have received your registration and payment. Our team is now setting up your account.'
                        }
                      </p>
                      
                      {/* What&apos;s Next Box */}
                      <table role="presentation" width="100%" cellSpacing={0} cellPadding={0} style={{ marginBottom: "20px" }}>
                        <tbody>
                          <tr>
                            <td style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px", padding: "20px" }}>
                              <p style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 700, color: "#1e40af" }}>What Happens Next</p>
                              <p style={{ margin: 0, fontSize: "14px", color: "#1e3a8a", lineHeight: 1.6 }}>
                                Your account is being prepared. You will receive your login credentials and access details via email within <strong>24-48 hours</strong>.
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                      {/* Order Summary */}
                      <table role="presentation" width="100%" cellSpacing={0} cellPadding={0} style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", marginBottom: "20px" }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: "20px" }}>
                              <p style={{ margin: "0 0 16px", fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px" }}>Order Summary</p>
                              
                              <table role="presentation" width="100%" cellSpacing={0} cellPadding={0}>
                                <tbody>
                                  <tr>
                                    <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}>
                                      <span style={{ fontSize: "14px", color: "#6b7280" }}>Plan</span>
                                    </td>
                                    <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", textAlign: "right" }}>
                                      <span style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937" }}>{planName}</span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}>
                                      <span style={{ fontSize: "14px", color: "#6b7280" }}>Artist Name</span>
                                    </td>
                                    <td style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", textAlign: "right" }}>
                                      <span style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937" }}>{entityName}</span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style={{ padding: "12px 0" }}>
                                      <span style={{ fontSize: "14px", color: "#6b7280" }}>Amount Paid</span>
                                    </td>
                                    <td style={{ padding: "12px 0", textAlign: "right" }}>
                                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937" }}>${amount}/year</span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                      {/* Platforms Box */}
                      <table role="presentation" width="100%" cellSpacing={0} cellPadding={0} style={{ marginBottom: "24px" }}>
                        <tbody>
                          <tr>
                            <td style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "12px", padding: "20px" }}>
                              <p style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 700, color: "#166534" }}>Ready to Distribute</p>
                              <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#15803d", lineHeight: 1.6 }}>
                                Once your account is ready, you can distribute your music to all major streaming platforms worldwide.
                              </p>
                              <p style={{ margin: 0, fontSize: "13px", color: "#166534" }}>
                                Spotify, Apple Music, YouTube Music, Amazon Music, Deezer, Tidal, and 450+ more platforms
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                    </td>
                  </tr>
                  
                  {/* Footer */}
                  <tr>
                    <td style={{ padding: "24px 40px", borderTop: "1px solid #e5e7eb" }}>
                      <p style={{ margin: "0 0 16px", fontSize: "15px", color: "#374151", lineHeight: 1.6 }}>
                        We are excited to have you on board. If you have any questions, feel free to reach out to our support team.
                      </p>
                      <p style={{ margin: 0, fontSize: "15px", color: "#1f2937", fontWeight: 600 }}>
                        The RDistro Team
                      </p>
                    </td>
                  </tr>
                  
                  {/* Bottom Footer */}
                  <tr>
                    <td style={{ backgroundColor: "#f9fafb", padding: "24px 40px", textAlign: "center", borderTop: "1px solid #e5e7eb" }}>
                      <p style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>RDistro</p>
                      <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                        Music Distribution Made Simple<br />
                        <a href="https://rdistro.net" style={{ color: "#7c3aed", textDecoration: "none" }}>rdistro.net</a>
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
