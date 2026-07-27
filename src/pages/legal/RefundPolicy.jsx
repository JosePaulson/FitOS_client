import LegalPageShell, { H2, P, Ul } from '../../components/legal/LegalPageShell'

export default function RefundPolicy() {
  return (
    <LegalPageShell title="Refund Policy" updated="26 July 2026">
      <P>
        This policy covers subscription payments made by your gym for the FitOS
        platform, and any member-facing payments (plans/PT sessions) processed through
        FitOS on your behalf.
      </P>

      <H2>All payments are final — no refunds</H2>
      <P>
        Once a subscription payment is successfully processed, it is{' '}
        <strong>final and non-refundable</strong>. This applies regardless of the
        reason, including but not limited to:
      </P>
      <Ul>
        <li>Deciding to stop using the Service partway through a billing period.</li>
        <li>Not using, or under-using, the plan you subscribed to.</li>
        <li>Downgrading to a lower-priced plan mid-cycle.</li>
        <li>Dissatisfaction with a feature, integration, or third-party provider (Razorpay, WATI, Cloudinary, AI providers).</li>
        <li>Suspension of your account for violating our Terms & Conditions.</li>
      </Ul>
      <P>
        We don't offer partial refunds, credits, or pro-rated adjustments for unused
        portions of a billing period.
      </P>

      <H2>Free trial</H2>
      <P>
        The 7-day free trial requires no payment method, so there's nothing to refund
        during the trial. If you subscribe before the trial ends, billing (and this
        no-refund policy) begins from your first paid charge.
      </P>

      <H2>Cancellations</H2>
      <P>
        You can cancel your subscription anytime from the dashboard. Cancelling stops
        future renewals, but doesn't refund the current billing period you've already
        paid for — your access continues until that period ends (unless you request
        immediate cancellation, in which case access ends immediately with no refund of
        the unused portion).
      </P>

      <H2>Narrow exceptions</H2>
      <P>We will investigate and correct, where applicable, cases of:</P>
      <Ul>
        <li><strong>Duplicate charges</strong> — you were charged more than once for the same billing period.</li>
        <li><strong>Erroneous charges</strong> — a technical error resulted in an incorrect amount being charged.</li>
      </Ul>
      <P>
        To report either, contact us within 7 days of the charge at{' '}
        <a href="mailto:info@f8os.in" className="underline">info@f8os.in</a> with your
        invoice number. Verified duplicate/erroneous charges will be reversed to your
        original payment method — this is a correction of an error, not a discretionary
        refund.
      </P>

      <H2>Member-facing payments</H2>
      <P>
        Where you enable in-app payments for your members (e.g. plan or PT session
        purchases), those payments are likewise final and non-refundable through
        FitOS's payment flow, in line with the Member Portal's own Refund Policy. Any
        refund arrangement you choose to offer a member directly (e.g. a goodwill
        credit toward a future invoice) is between you and your member, and is handled
        outside the FitOS payment system.
      </P>

      <H2>Failed or incomplete transactions</H2>
      <P>
        If a payment fails or is left incomplete, any amount deducted by your bank that
        doesn't reach us is typically auto-reversed by your bank/Razorpay within their
        standard timelines (usually 5–7 business days) — this isn't a refund from us,
        it's your bank completing a transaction that never succeeded on our end.
      </P>

      <H2>Contact</H2>
      <P>
        Questions about a specific invoice? Email{' '}
        <a href="mailto:info@f8os.in" className="underline">info@f8os.in</a> or call
        +91 82779 03670 (Mon–Sat, 9 AM–7 PM IST) with your invoice number.
      </P>
    </LegalPageShell>
  )
}
