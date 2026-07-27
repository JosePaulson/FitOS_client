import LegalPageShell, { H2, P, Ul } from '../../components/legal/LegalPageShell'

export default function PrivacyPolicy() {
  return (
    <LegalPageShell title="Privacy Policy" updated="26 July 2026">
      <P>
        This Privacy Policy explains how Kerasoft India ("FitOS", "we") handles
        personal data collected through the FitOS platform — both the gym dashboard
        used by your staff, and, where you enable it, the member-facing app used by
        your gym's members.
      </P>

      <H2>1. Two roles: controller & processor</H2>
      <P>
        For your gym's own account and staff data, FitOS is the data controller. For
        the personal data of your gym's members (which you collect and manage through
        the platform), your gym is the data controller and FitOS acts as a data
        processor, handling that data only on your instructions to provide the
        Service.
      </P>

      <H2>2. Information we collect</H2>
      <Ul>
        <li><strong>Gym account & staff data</strong> — business name, subdomain, staff names, phone numbers, roles, and login credentials.</li>
        <li><strong>Member data (on your behalf)</strong> — names, phone numbers, membership plans, attendance, billing/invoices, PT sessions, workout logs, body-metric history, and, if you enable them, food-scan photos and AI chat messages.</li>
        <li><strong>Billing data</strong> — your subscription plan, invoices, and GST details; payment card/UPI details are handled directly by Razorpay, not stored by us.</li>
        <li><strong>Usage data</strong> — log-in activity, device/browser information, and diagnostic data needed to operate and secure the platform.</li>
      </Ul>

      <H2>3. How we use it</H2>
      <Ul>
        <li>To provide, maintain, and improve the Service for you and your members.</li>
        <li>To process your subscription payments and send GST invoices.</li>
        <li>To send member notifications you've configured (e.g. renewal reminders, birthday greetings) via WhatsApp.</li>
        <li>To provide customer support and respond to inquiries.</li>
        <li>To detect, prevent, and address technical issues, fraud, or abuse.</li>
      </Ul>

      <H2>4. Who we share it with</H2>
      <P>We don't sell personal data. We share it only as needed to operate the Service:</P>
      <Ul>
        <li><strong>Razorpay</strong> — processes your subscription payments and any member payments you enable.</li>
        <li><strong>WATI</strong> — delivers WhatsApp notifications to your members' phone numbers.</li>
        <li><strong>Cloudinary</strong> — stores media (member/equipment photos, workout videos, food-scan images).</li>
        <li><strong>AI providers (OpenAI, Anthropic, Google)</strong> — process AI Coach messages and food-scan photos, only for gyms that enable these features for their members.</li>
        <li><strong>Legal requirements</strong> — where required to comply with law or protect rights and safety.</li>
      </Ul>

      <H2>5. Data retention</H2>
      <P>
        We retain data for as long as your account is active. If your trial lapses
        without a subscription, or your subscription is cancelled, we retain data for
        30 days in case you resubscribe, after which it may be permanently deleted. We
        may retain billing records longer where required for tax/accounting law.
      </P>

      <H2>6. Security</H2>
      <P>
        We use industry-standard safeguards — encrypted connections, access controls,
        and hashed credentials — to protect data on the platform. No system is
        completely secure, and we encourage you to use strong, unique passwords and
        limit staff account permissions to what each role needs.
      </P>

      <H2>7. Your rights & your members' rights</H2>
      <P>
        You can access, export, or delete your gym's data from the dashboard, or by
        contacting us. Since you're the controller for your members' data, requests
        from members about their own data should generally be handled by you as their
        gym — we'll assist you in fulfilling such requests where needed.
      </P>

      <H2>8. Cookies</H2>
      <P>
        See our <a href="/cookie-policy" className="underline">Cookie Policy</a> for
        details on the local storage and cookies used across the site and dashboard.
      </P>

      <H2>9. Changes to this policy</H2>
      <P>
        We may update this Privacy Policy from time to time; material changes will be
        reflected by an updated "Last updated" date above.
      </P>

      <H2>10. Contact</H2>
      <P>
        Kerasoft India — <a href="mailto:info@f8os.in" className="underline">info@f8os.in</a>{' '}
        · +91 82779 03670 · Bengaluru, Karnataka, India.
      </P>
    </LegalPageShell>
  )
}
