import LegalPageShell, { H2, P, Ul } from '../../components/legal/LegalPageShell'

export default function CookiePolicy() {
  return (
    <LegalPageShell title="Cookie Policy" updated="26 July 2026">
      <P>
        This Cookie Policy explains how FitOS uses cookies and similar technologies
        (like browser local storage) across our marketing site and gym dashboard.
      </P>

      <H2>What we use, and why</H2>
      <Ul>
        <li><strong>Strictly necessary</strong> — sign-in session tokens for staff accounts, so you stay logged into the dashboard. The dashboard can't function without these.</li>
        <li><strong>Functional</strong> — preferences like your chosen theme or dismissed banners, so the site remembers your choices between visits.</li>
        <li><strong>Cookie consent</strong> — a small entry recording whether you've accepted or limited cookies, so we don't ask again every visit.</li>
      </Ul>
      <P>
        We do <strong>not</strong> currently use third-party advertising or analytics
        cookies/trackers on the site or dashboard. If that ever changes, we'll update
        this policy and ask for your consent via the banner before any optional
        cookies are set.
      </P>

      <H2>Your choices</H2>
      <P>
        When you first visit, you'll see a banner letting you choose "Essential only"
        or "Accept all." Since we don't use optional cookies today, both choices
        currently behave the same way — but your preference is saved so we can honor it
        automatically if optional cookies are introduced later. You can clear cookies
        and local storage anytime via your browser's site settings; doing so will sign
        you out of the dashboard.
      </P>

      <H2>Changes to this policy</H2>
      <P>
        We may update this Cookie Policy from time to time; material changes will be
        reflected by an updated "Last updated" date above.
      </P>

      <H2>Contact</H2>
      <P>
        Questions? Email{' '}
        <a href="mailto:info@f8os.in" className="underline">info@f8os.in</a>.
      </P>
    </LegalPageShell>
  )
}
