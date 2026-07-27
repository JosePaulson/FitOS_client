import LegalPageShell, { H2, P, Ul } from '../../components/legal/LegalPageShell'

export default function TermsOfService() {
  return (
    <LegalPageShell title="Terms & Conditions" updated="26 July 2026">
      <P>
        These Terms & Conditions ("Terms") are a binding agreement between Kerasoft
        India ("FitOS", "we", "us") and the gym, studio, or fitness business ("you",
        "your gym") that registers for the FitOS gym-management platform (the
        "Service"). By creating an account, starting a free trial, or subscribing to a
        plan, you agree to these Terms on behalf of your business.
      </P>

      <H2>1. The Service</H2>
      <P>
        FitOS is software-as-a-service for managing gym members, staff, billing,
        attendance, personal training, and a member-facing app. We license you the
        right to use the Service; we don't take any ownership interest in your
        business or your member data.
      </P>

      <H2>2. Accounts & eligibility</H2>
      <Ul>
        <li>You must be authorized to bind your gym business to these Terms.</li>
        <li>You're responsible for the accuracy of information you enter and for all activity under your gym's account, including actions by staff accounts you create (managers, trainers, receptionists).</li>
        <li>You're responsible for keeping login credentials confidential and for promptly deactivating staff accounts when someone leaves.</li>
      </Ul>

      <H2>3. Free trial</H2>
      <P>
        New accounts get a 7-day free trial with no credit card required. If you don't
        add a payment method and choose a plan before the trial ends, your account is
        paused — your data is retained for 30 days in case you decide to subscribe, and
        may be deleted after that.
      </P>

      <H2>4. Subscriptions & billing</H2>
      <Ul>
        <li>Paid plans are billed on a recurring (monthly or annual) basis via our payment processor, Razorpay.</li>
        <li>All displayed prices are GST-inclusive (18% GST) unless stated otherwise; you'll receive a GST invoice for each payment.</li>
        <li>You can cancel anytime from your dashboard. Cancelling stops future renewals; unless you request immediate cancellation, your existing paid period continues until it ends.</li>
        <li>If a renewal payment fails, we'll retry and notify you; continued failure may result in your account being paused (member-facing features may be limited) until payment succeeds.</li>
        <li>Fees are billed per your selected plan's terms (e.g. per active member, per location) as shown at checkout — changing your usage may change your bill at the next cycle.</li>
      </Ul>
      <P>
        All fees are non-refundable — see our{' '}
        <a href="/refund-policy" className="underline">Refund Policy</a> for details.
      </P>

      <H2>5. Your data & your members' data</H2>
      <P>
        As between you and FitOS, you own the data you and your members put into the
        Service (member profiles, attendance, workout logs, billing records, etc.). You
        act as the data controller for your members' personal data, and FitOS acts as a
        data processor providing the platform on your instructions — see our{' '}
        <a href="/privacy" className="underline">Privacy Policy</a>. You're responsible
        for having a lawful basis (e.g. your members' consent, per your own membership
        agreement) to collect and process their data through the Service, including any
        AI features (chat, food scanning) you choose to enable for your members.
      </P>

      <H2>6. Acceptable use</H2>
      <P>You agree not to:</P>
      <Ul>
        <li>Use the Service for any unlawful purpose, or to store/transmit content that infringes others' rights.</li>
        <li>Attempt to breach the Service's security, reverse-engineer it, or access data outside your own gym's account.</li>
        <li>Resell or white-label the Service without a separate written agreement with us.</li>
        <li>Use the Service to send unsolicited bulk messages that violate applicable telecom/WhatsApp messaging regulations.</li>
      </Ul>

      <H2>7. Third-party services</H2>
      <P>
        The Service integrates third-party providers to deliver certain features —
        payments (Razorpay), WhatsApp messaging (WATI), media storage (Cloudinary), and
        optional AI features (OpenAI, Anthropic, or Google, depending on what you
        configure). Your use of features built on these providers is also subject to
        their respective terms.
      </P>

      <H2>8. Availability, support & changes</H2>
      <P>
        We aim for high availability but don't guarantee the Service will be
        uninterrupted or error-free. We may modify or discontinue features with
        reasonable notice where practical. Support is available Mon–Sat, 9 AM–7 PM IST.
      </P>

      <H2>9. Termination</H2>
      <P>
        Either party may terminate for the other's material breach if uncured within 14
        days of notice. We may also suspend accounts that violate these Terms, pose a
        security risk, or have significantly overdue payment. On termination, we'll
        provide a reasonable window to export your data before deletion, except where
        legal obligations require otherwise.
      </P>

      <H2>10. Limitation of liability</H2>
      <P>
        To the fullest extent permitted by law, FitOS's total liability arising from
        the Service is limited to the fees you paid us in the 3 months preceding the
        claim. Neither party is liable for indirect, incidental, or consequential
        damages. Nothing here limits liability that can't be limited under Indian law.
      </P>

      <H2>11. Governing law</H2>
      <P>
        These Terms are governed by the laws of India. Disputes are subject to the
        exclusive jurisdiction of the courts of Bengaluru, Karnataka.
      </P>

      <H2>12. Contact</H2>
      <P>
        Kerasoft India — <a href="mailto:info@f8os.in" className="underline">info@f8os.in</a>{' '}
        · +91 82779 03670 · Bengaluru, Karnataka, India.
      </P>
    </LegalPageShell>
  )
}
